import base64
import hashlib

from dotenv import load_dotenv
import asyncio
import os
from pathlib import Path
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from supabase import create_client, Client
from realtime import AsyncRealtimeClient, RealtimePostgresChangesListenEvent
from py4j.java_gateway import JavaGateway
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
assignment_key_cache = {}

# Setting Up Supabase Client
supabase: Client = create_client(url, key)

# Connect to the Java Gateway Server (default port is 25333)
gateway = JavaGateway()

# Access the entry point object exposed by the Java application
entry_point = gateway.entry_point

def make_assignment_state():
    return {
        "condition": asyncio.Condition(),
        "lock": asyncio.Lock(),
        "completed_submission_ids": set(),
    }

async def get_assignment_state(assignment_id):
    async with submission_state_lock:
        state = submission_state.get(assignment_id)
        if state is None:
            state = make_assignment_state()
            submission_state[assignment_id] = state
        return state

async def register_submission_event(assignment_id):
    await get_assignment_state(assignment_id)

async def enqueue_comparison_event(comparison_id, assignment_id):
    comparison_queue.put_nowait(
        {
            "comparison_id": comparison_id,
            "assignment_id": assignment_id,
        }
    )

async def enqueue_submission_event(assignment_id, submission_id):
    await register_submission_event(assignment_id)
    submission_queue.put_nowait(
        {
            "assignment_id": assignment_id,
            "submission_id": submission_id,
        }
    )

def get_assignment_key(assignment_id):
    cached_key = assignment_key_cache.get(assignment_id)
    if cached_key is not None:
        return cached_key

    response = (
        supabase.table("Assignments")
        .select("key")
        .eq("id", assignment_id)
        .single()
        .execute()
    )

    assignment_row = response.data or {}
    assignment_key = assignment_row.get("key")
    if not assignment_key:
        raise ValueError(f"Assignment {assignment_id} is missing a key.")

    assignment_key_cache[assignment_id] = assignment_key
    return assignment_key

def decrypt_value(encrypted_value, assignment_key):
    if not encrypted_value:
        return ""

    iv_base64, ciphertext_base64 = encrypted_value.split(":", 1)
    secret_key = hashlib.sha256(assignment_key.encode("utf-8")).digest()
    iv = base64.b64decode(iv_base64)
    ciphertext = base64.b64decode(ciphertext_base64)
    cipher = AES.new(secret_key, AES.MODE_CBC, iv)
    decrypted_bytes = unpad(cipher.decrypt(ciphertext), AES.block_size)
    return decrypted_bytes.decode("utf-8")




'''
Get all of the ids from submissions
'''
def get_submission_ids_for_assignment(assignment_id):
    assignment_key = get_assignment_key(assignment_id)
    response = (
        supabase.table("File_Submissions_New")
        .select("id, created_at, student_info")
        .eq("assignment_id", assignment_id)
        .order("created_at", desc=True)
        .order("id", desc=True)
        .execute()
    )

    latest_by_student = {}

    for row in (response.data or []):
        submission_id = row.get("id")
        if submission_id is None:
            continue

        student_info = row.get("student_info") or {}
        encrypted_student_number = str(student_info.get("student_number") or "")
        student_number = decrypt_value(encrypted_student_number, assignment_key).strip()

        if student_number:
            student_key = f"number:{student_number}"
        else:
            student_key = f"submission:{submission_id}"

        if student_key not in latest_by_student:
            latest_by_student[student_key] = submission_id

    return list(latest_by_student.values())

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

def token_csv_exists(assignment_id, submission_id):
    path = f"{assignment_id}/{submission_id}.csv"

    try:
        supabase.storage.from_("Tokens").download(path)
        return True
    except Exception:
        return False

async def wait_for_comparison_submissions(assignment_id, submission_ids):
    if not submission_ids:
        return

    state = await get_assignment_state(assignment_id)
    pending_submission_ids = set(submission_ids)

    while pending_submission_ids:
        async with state["condition"]:
            pending_submission_ids = {
                submission_id
                for submission_id in pending_submission_ids
                if submission_id not in state["completed_submission_ids"]
            }

            if not pending_submission_ids:
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
                if not pending_submission_ids:
                    return

        async with state["condition"]:
            await state["condition"].wait()

'''
Download all of the csvs to be compared from the db
'''
def download_token_csvs_for_assignment(assignment_id, submission_ids):
    token_csvs = []

    for submission_id in submission_ids:
        path = f"{assignment_id}/{submission_id}.csv"
        file_bytes = supabase.storage.from_("Tokens").download(path)

        token_csvs.append(
            {
                "submission_id": submission_id,
                "csv_bytes": file_bytes,
            }
        )

    return token_csvs

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
        print(f"Uploaded comparison result for: {comparison_id}")

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
            print(f"{len(submission_ids)} submission(s) were stored for comparison {comparison_id}: ")
            await wait_for_comparison_submissions(assignment_id, submission_ids)

            async with state["lock"]:
                print(f"Processing comparison with id: {comparison_id}")
                                    
                boilerplate_bytes = await asyncio.to_thread(
                    download_boilerplate_for_comparison,
                    comparison_id,
                    assignment_id,
                )
                if boilerplate_bytes is not None:
                    print(f"Downloaded boiler plate for comparison {comparison_id}")
                
                boilerplate_tokenized = None
                if boilerplate_bytes is not None:
                    boilerplate_tokenized = entry_point.tokenizeCondensed(boilerplate_bytes)
                
                # TODO Tokenize the repo (For each file check if it has already been tokenized, then tokenize any remaining, or just add an error for the ones that hadn't been tokenized prev)
                
                token_csvs = await asyncio.to_thread(
                    download_token_csvs_for_assignment,
                    assignment_id,
                    submission_ids,
                )
                print(f"Downloaded {len(token_csvs)} token csv file(s) for assignment {assignment_id}")
                
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
                update_response = (
                    supabase.table("Comparisons")
                    .update({"status":"completed", "number_of_students": len(submission_ids)})
                    .eq("id", comparison_id)
                    .execute()
                )
                # TODO Handle Update Error
        except Exception as e:
            print(f"Error processing comparison {comparison_id}: {e}")
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
                print(f"Processing submission with id: {submission_id}")
                file_bytes = await download_submission_with_retry(assignment_id, submission_id)
                print(f"Downloaded submission file for submission id: {submission_id}")
                if file_bytes is not None:
                    token_csv = entry_point.tokenizeCondensed(file_bytes)
                    token_csv_bytes = token_csv.encode("utf-8")
                    print(f"Received token csv for submission: {submission_id}")
                    response = supabase.storage.from_("Tokens").upload(
                        path=f"{assignment_id}/{submission_id}.csv",
                        file=token_csv_bytes,
                        file_options={
                            "cache-control": "3600",
                            "upsert": "false",
                            "content-type": "text/csv",
                        },
                    )
                    print(f"Uploaded tokens for submission: {submission_id}")
                    submission_processed = True
                    # TODO Handle any errors if the tokens fail to upload
        except Exception as e:
            print(f"Error processing submission event {submission_event}: {e}")
        finally:
            async with state["condition"]:
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

        # Comparison Listener
        comparison_channel = client.channel("realtime:public:Comparisons")
        comparison_channel.on_postgres_changes(
            RealtimePostgresChangesListenEvent.Insert,
            handle_comparison_update,
            schema="public",
            table="Comparisons",
        )
        await comparison_channel.subscribe()
        print(f"Subscribed to inserts on 'Comparisons'. Listening for changes...")

        # Submission Listener
        submissions_channel = client.channel("realtime:public:File_Submissions_New")
        submissions_channel.on_postgres_changes(
            RealtimePostgresChangesListenEvent.Insert,
            handle_submission_update,
            schema="public",
            table="File_Submissions_New",
        )
        await submissions_channel.subscribe()
        print(f"Subscribed to inserts on 'Submissions'. Listening for changes...")

        # Keep the program alive while waiting for events.
        await asyncio.Event().wait()
    except Exception as e:
        # TODO More verbose error msg
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
