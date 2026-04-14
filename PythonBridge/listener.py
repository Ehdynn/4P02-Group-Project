from dotenv import load_dotenv
import asyncio
import os
from pathlib import Path
from supabase import create_client, Client
from realtime import AsyncRealtimeClient, RealtimePostgresChangesListenEvent
from py4j.java_gateway import JavaGateway
import base64
import json

env_path = Path(__file__).with_name(".env.local")
if env_path.exists():
    load_dotenv(env_path)

url = os.getenv("URL")
key = os.getenv("SECRET_KEY")

if not url or not key:
    raise RuntimeError("Missing required environment variables: URL and/or SECRET_KEY")

comparison_queue = asyncio.Queue()
submission_queue = asyncio.Queue()

submission_state = {}
submission_state_lock = asyncio.Lock()

# Setting Up Supabase Client
supabase: Client = create_client(url, key)

# Connect to the Java Gateway Server (default port is 25333)
gateway = JavaGateway()

# Access the entry point object exposed by the Java application
entry_point = gateway.entry_point

HEARTBEAT_INTERVAL_SECONDS = 15 * 60

def make_assignment_state():
    return {
        "condition": asyncio.Condition(),
        "lock": asyncio.Lock(),
        "completed_submission_ids": set(),
        "queued_submission_ids": set(),
    }

async def get_assignment_state(assignment_id):
    async with submission_state_lock:
        state = submission_state.get(assignment_id)
        if state is None:
            state = make_assignment_state()
            submission_state[assignment_id] = state
        return state

async def enqueue_comparison_event(comparison_id, assignment_id):
    comparison_queue.put_nowait(
        {
            "comparison_id": comparison_id,
            "assignment_id": assignment_id,
        }
    )

async def enqueue_submission_event(assignment_id, submission_id):
    state = await get_assignment_state(assignment_id)
    if not submission_id:
        return

    async with state["condition"]:
        if submission_id in state["queued_submission_ids"]:
            return
        state["queued_submission_ids"].add(submission_id)

    submission_queue.put_nowait(
        {
            "assignment_id": assignment_id,
            "submission_id": submission_id,
        }
    )
    print(f"@submission Queued submission {submission_id} for assignment {assignment_id}.")

def get_submission_ids_for_comparison(comparison_id):
    response = (
        supabase.table("Comparisons")
        .select("submissions_compared")
        .eq("id", comparison_id)
        .single()
        .execute()
    )

    comparison_row = response.data or {}
    submission_ids = comparison_row.get("submissions_compared") or []

    return [
        str(submission_id).strip()
        for submission_id in submission_ids
        if str(submission_id).strip()
    ]

def get_pending_comparisons():
    response = (
        supabase.table("Comparisons")
        .select("id, aid")
        .eq("status", "pending")
        .order("created_at", desc=False)
        .execute()
    )

    return response.data or []


def get_missing_token_submission_ids(assignment_id, submission_ids):
    missing_submission_ids = []

    for submission_id in submission_ids:
        if not token_csv_exists(assignment_id, submission_id):
            missing_submission_ids.append(str(submission_id))

    return missing_submission_ids


class MissingTokenCsvError(Exception):
    def __init__(self, submission_ids):
        self.submission_ids = submission_ids
        joined_ids = ", ".join(submission_ids)
        super().__init__(f"Missing token CSVs for submission(s): {joined_ids}")

def token_csv_exists(assignment_id, submission_id):
    path = f"{assignment_id}/{submission_id}.csv"

    try:
        supabase.storage.from_("Tokens").download(path)
        return True
    except Exception:
        return False

async def wait_for_comparison_submissions(assignment_id, submission_ids):
    if not submission_ids:
        print(f"@wait No submissions queued for assignment {assignment_id}; continuing to comparison.")
        return

    state = await get_assignment_state(assignment_id)
    pending_submission_ids = set(submission_ids)
    await requeue_missing_submissions(
        assignment_id,
        await asyncio.to_thread(
            get_missing_token_submission_ids,
            assignment_id,
            list(pending_submission_ids),
        ),
    )
    print(
        f"@wait Waiting for {len(pending_submission_ids)} submission token file(s) "
        f"for assignment {assignment_id}."
    )

    while pending_submission_ids:
        async with state["condition"]:
            pending_submission_ids = {
                submission_id
                for submission_id in pending_submission_ids
                if submission_id not in state["completed_submission_ids"]
            }

            if not pending_submission_ids:
                print(f"@wait All submission token files are ready for assignment {assignment_id}.")
                return

        resolved_submission_ids = {
            submission_id
            for submission_id in pending_submission_ids
            if await asyncio.to_thread(token_csv_exists, assignment_id, submission_id)
        }

        if resolved_submission_ids:
            async with state["condition"]:
                state["completed_submission_ids"].update(resolved_submission_ids)
                pending_submission_ids -= resolved_submission_ids
                print(
                    f"@wait Found {len(resolved_submission_ids)} existing token file(s) "
                    f"for assignment {assignment_id}. {len(pending_submission_ids)} remaining."
                )
                if not pending_submission_ids:
                    print(f"@wait All submission token files are ready for assignment {assignment_id}.")
                    return

        print(
            f"@wait Still waiting on {len(pending_submission_ids)} submission(s) for assignment "
            f"{assignment_id}: {sorted(pending_submission_ids)}"
        )
        async with state["condition"]:
            await state["condition"].wait()

'''
Download all of the csvs to be compared from the db
'''
def download_token_csvs_for_assignment(assignment_id, submission_ids):
    token_csvs = []
    missing_submission_ids = []

    for submission_id in submission_ids:
        path = f"{assignment_id}/{submission_id}.csv"
        try:
            file_bytes = supabase.storage.from_("Tokens").download(path)
        except Exception:
            missing_submission_ids.append(str(submission_id))
            continue

        token_csvs.append(
            {
                "submission_id": submission_id,
                "csv_bytes": file_bytes,
            }
        )

    if missing_submission_ids:
        raise MissingTokenCsvError(missing_submission_ids)

    return token_csvs


async def requeue_missing_submissions(assignment_id, submission_ids):
    if not submission_ids:
        return

    print(
        f"@requeue Re-queueing {len(submission_ids)} submission(s) with missing token CSVs "
        f"for assignment {assignment_id}: {submission_ids}"
    )
    for submission_id in submission_ids:
        await enqueue_submission_event(assignment_id, submission_id)


def get_queue_status_snapshot():
    return {
        "comparison_queue_size": comparison_queue.qsize(),
        "submission_queue_size": submission_queue.qsize(),
        "tracked_assignments": len(submission_state),
    }


async def heartbeat_monitor():
    while True:
        await asyncio.sleep(HEARTBEAT_INTERVAL_SECONDS)
        queue_status = get_queue_status_snapshot()
        print(
            "@health Listener is active and ready. "
            f"Comparison queue: {queue_status['comparison_queue_size']}, "
            f"submission queue: {queue_status['submission_queue_size']}, "
            f"tracked assignments: {queue_status['tracked_assignments']}."
        )

'''
Downloads the boiler plate file selected for a comparison, if one exists.
Returns file bytes or None when no boiler plate was selected.
'''
def download_boilerplate_for_comparison(comparison_id, assignment_id):
    comparison_response = (
        supabase.table("Comparisons")
        .select("boiler_plate_file")
        .eq("id", comparison_id)
        .single()
        .execute()
    )

    comparison_row = comparison_response.data or {}
    boiler_plate_file_id = comparison_row.get("boiler_plate_file")
    if boiler_plate_file_id is None:
        return None

    upload_response = (
        supabase.table("Boiler_Plate_Uploads")
        .select("id, file_name")
        .eq("id", boiler_plate_file_id)
        .single()
        .execute()
    )

    upload_row = upload_response.data or {}
    file_name = upload_row.get("file_name")
    if not file_name:
        raise ValueError(f"Boiler plate upload {boiler_plate_file_id} is missing a file name.")

    path = f"{assignment_id}/{boiler_plate_file_id}/{file_name}"
    return supabase.storage.from_("Boiler_Plate").download(path)


'''
Handles the insert event on the Comparisons table.
Takes the information and adds it to the queue to be handled by the consumer.
'''
def handle_comparison_update(payload):
    record = payload.get("data", {}).get("record", {})
    comparison_id = record.get("id")
    assignment_id = record.get("aid")
    if comparison_id is not None and assignment_id is not None:
        asyncio.create_task(
            enqueue_comparison_event(comparison_id, assignment_id)
        )

'''
Handles the insert event on the File_Submissions_New table.
Takes the information and adds it to the queue to be handled by the consumer.
'''
def handle_submission_update(payload):
    record = payload.get("data", {}).get("record", {})
    submission_id = record.get("id")
    assignment_id = record.get("assignment_id")
    if submission_id is not None and assignment_id is not None:
        asyncio.create_task(
            enqueue_submission_event(assignment_id, submission_id)
        )

'''
Encodes file bytes to send as string
'''
def encode_bytes(token_csvs):
    encoded_bytes = []

    for submission in token_csvs:

        encoded = base64.b64encode(submission['csv_bytes']).decode('utf-8')

        encoded_bytes.append(
            {
                "submission_id": submission['submission_id'],
                "csv_bytes": encoded,
            }
        )

    return encoded_bytes

def upload_comparison_results(comparison_id, comparison_result_json):
    comparison_results = json.loads(comparison_result_json)
    if not isinstance(comparison_results, list):
        raise ValueError("Comparison results must be a JSON array.")

    for result in comparison_results:
        submission_id = result.get("submission_id")
        if not submission_id:
            raise ValueError("Comparison result is missing submission_id.")

        supabase.storage.from_("Comparisons").upload(
            path=f"{comparison_id}/{submission_id}.json",
            file=json.dumps(result).encode("utf-8"),
            file_options={
                "cache-control": "3600",
                "upsert": "false",
                "content-type": "application/json",
            },
        )
        print(f"@comparison Uploaded comparison result for: {comparison_id}")

async def download_submission_with_retry(assignment_id, submission_id, attempts=10, delay=2):
    path = f"{assignment_id}/{submission_id}/{submission_id}.zip"

    last_error = None
    for _ in range(attempts):
        try:
            return await asyncio.to_thread(
                supabase.storage.from_("Submissions").download,
                path,
            )
        except Exception as e:
            last_error = e
            await asyncio.sleep(delay)

    raise last_error


'''
Handles each comparison request.
'''
async def consume_comparison():
    while True:
        comparison_event = await comparison_queue.get()
        assignment_id = comparison_event["assignment_id"]
        comparison_id = comparison_event["comparison_id"]
        state = await get_assignment_state(assignment_id)
        
        try:
            submission_ids = await asyncio.to_thread(get_submission_ids_for_comparison, comparison_id)
            print(
                f"@comparison {len(submission_ids)} submission(s) were stored for comparison "
                f"{comparison_id}: {submission_ids}"
            )
            await wait_for_comparison_submissions(assignment_id, submission_ids)

            async with state["lock"]:
                print(f"@comparison Processing comparison with id: {comparison_id}")
                                    
                boilerplate_bytes = await asyncio.to_thread(
                    download_boilerplate_for_comparison,
                    comparison_id,
                    assignment_id,
                )
                if boilerplate_bytes is not None:
                    print(f"@comparison Downloaded boiler plate for comparison {comparison_id}")
                
                boilerplate_tokenized = None
                if boilerplate_bytes is not None:
                    boilerplate_tokenized = entry_point.tokenizeCondensed(boilerplate_bytes)
                
                # TODO Tokenize the repo (For each file check if it has already been tokenized, then tokenize any remaining, or just add an error for the ones that hadn't been tokenized prev)
                
                token_csvs = await asyncio.to_thread(
                    download_token_csvs_for_assignment,
                    assignment_id,
                    submission_ids,
                )
                print(f"@comparison Downloaded {len(token_csvs)} token csv file(s) for assignment {assignment_id}")
                
                encoded_bytes_csv = json.dumps(encode_bytes(token_csvs))
                
                # TODO Add the actual variable then add it to the function call.
                #encode_bytes_repo = encode_bytes() 
                comparison_result = entry_point.getComparisonData(
                    encoded_bytes_csv,
                    boilerplate_tokenized,
                )
                await asyncio.to_thread(
                    upload_comparison_results,
                    comparison_id,
                    comparison_result,
                )
                
                # TODO Handle Errors
                (
                    supabase.table("Comparisons")
                    .update({"status":"completed"})
                    .eq("id", comparison_id)
                    .execute()
                )
                print(f"@comparison Marked comparison {comparison_id} as completed.")
                # TODO Handle Update Error
        except MissingTokenCsvError as e:
            await requeue_missing_submissions(assignment_id, e.submission_ids)
            print(
                f"@comparison Comparison {comparison_id} is waiting for re-queued submission(s): "
                f"{e.submission_ids}"
            )
            await enqueue_comparison_event(comparison_id, assignment_id)
        except Exception as e:
            print(f"@comparison Error processing comparison {comparison_id}: {e}")
        finally:
            comparison_queue.task_done()


'''
Handles each submission.
'''
async def consume_submission():
    while True:
        submission_event = await submission_queue.get()
        assignment_id = submission_event["assignment_id"]
        submission_id = submission_event["submission_id"]
        state = await get_assignment_state(assignment_id)
        submission_processed = False
        try:
            async with state["lock"]:
                print(f"@submission Processing submission with id: {submission_id}")
                file_bytes = await download_submission_with_retry(assignment_id, submission_id)
                print(f"@submission Downloaded submission file for submission id: {submission_id}")
                if file_bytes is not None:
                    token_csv = entry_point.tokenizeCondensed(file_bytes)
                    token_csv_bytes = token_csv.encode("utf-8")
                    print(f"@submission Received token csv for submission: {submission_id}")
                    supabase.storage.from_("Tokens").upload(
                        path=f"{assignment_id}/{submission_id}.csv",
                        file=token_csv_bytes,
                        file_options={
                            "cache-control": "3600",
                            "upsert": "false",
                            "content-type": "text/csv",
                        },
                    )
                    print(f"@submission Uploaded tokens for submission: {submission_id}")
                    submission_processed = True
                    # TODO Handle any errors if the tokens fail to upload
        except Exception as e:
            print(f"@submission Error processing submission event {submission_event}: {e}")
        finally:
            async with state["condition"]:
                state["queued_submission_ids"].discard(submission_id)
                if submission_processed:
                    state["completed_submission_ids"].add(submission_id)
                state["condition"].notify_all()
            submission_queue.task_done()

async def main():
    """
    Main asynchronous function to set up and maintain the connection.
    """
    try:
        websocket_url = f"wss://{url.split('//')[1]}/realtime/v1/websocket"
        client = AsyncRealtimeClient(websocket_url, token=key, params={"apikey": key})
        await client.connect()
        asyncio.create_task(consume_comparison())
        asyncio.create_task(consume_submission())
        asyncio.create_task(heartbeat_monitor())

        pending_comparisons = await asyncio.to_thread(get_pending_comparisons)
        if pending_comparisons:
            print(f"@startup Re-queueing {len(pending_comparisons)} pending comparison(s) on startup.")
            for comparison in pending_comparisons:
                comparison_id = comparison.get("id")
                assignment_id = comparison.get("aid")
                if comparison_id is None or assignment_id is None:
                    continue
                submission_ids = await asyncio.to_thread(
                    get_submission_ids_for_comparison,
                    comparison_id,
                )
                missing_submission_ids = await asyncio.to_thread(
                    get_missing_token_submission_ids,
                    assignment_id,
                    submission_ids,
                )
                if missing_submission_ids:
                    print(
                        f"@startup Re-queueing {len(missing_submission_ids)} missing submission(s) "
                        f"for assignment {assignment_id}: {missing_submission_ids}"
                    )
                    await requeue_missing_submissions(assignment_id, missing_submission_ids)
                await enqueue_comparison_event(comparison_id, assignment_id)
                print(f"@startup Queued pending comparison {comparison_id} for assignment {assignment_id}.")
        else:
            print("@startup No pending comparisons found on startup.")

        # Comparison Listener
        comparison_channel = client.channel("realtime:public:Comparisons")
        comparison_channel.on_postgres_changes(
            RealtimePostgresChangesListenEvent.Insert,
            handle_comparison_update,
            schema="public",
            table="Comparisons",
        )
        await comparison_channel.subscribe()
        print(f"@startup Subscribed to inserts on 'Comparisons'. Listening for changes...")

        # Submission Listener
        submissions_channel = client.channel("realtime:public:File_Submissions_New")
        submissions_channel.on_postgres_changes(
            RealtimePostgresChangesListenEvent.Insert,
            handle_submission_update,
            schema="public",
            table="File_Submissions_New",
        )
        await submissions_channel.subscribe()
        print(f"@startup Subscribed to inserts on 'Submissions'. Listening for changes...")
        print("@startup Listener startup complete. Service is ready and active.")

        # Keep the program alive while waiting for events.
        await asyncio.Event().wait()
    except Exception as e:
        # TODO More verbose error msg
        print(f"@startup An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
