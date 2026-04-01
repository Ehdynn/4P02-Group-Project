import base64

from dotenv import load_dotenv
import asyncio
import os
from pathlib import Path
from supabase import create_client, Client
from realtime import AsyncRealtimeClient, RealtimePostgresChangesListenEvent
from py4j.java_gateway import JavaGateway
import io
import json
import zipfile

comparison_queue = asyncio.Queue()
submission_queue = asyncio.Queue()

submission_state = {}
submission_state_lock = asyncio.Lock()

# Setting Up Supabase Client
env_path = Path(__file__).with_name(".env.local")
load_dotenv(env_path)

url = os.getenv("URL")
key = os.getenv("SECRET_KEY")

supabase: Client = create_client(url, key)

# Connect to the Java Gateway Server (default port is 25333)
gateway = JavaGateway()

# Access the entry point object exposed by the Java application
entry_point = gateway.entry_point

def make_assignment_state():
    return {
        "submitted": 0,
        "completed": 0,
        "condition": asyncio.Condition(),
        "lock": asyncio.Lock(),
    }

async def get_assignment_state(assignment_id):
    async with submission_state_lock:
        state = submission_state.get(assignment_id)
        if state is None:
            state = make_assignment_state()
            submission_state[assignment_id] = state
        return state

async def register_submission_event(assignment_id):
    state = await get_assignment_state(assignment_id)
    async with state["condition"]:
        state["submitted"] += 1

async def enqueue_comparison_event(comparison_id, assignment_id):
    target_count = await register_comparison_snapshot(assignment_id)
    comparison_queue.put_nowait(
        {
            "comparison_id": comparison_id,
            "assignment_id": assignment_id,
            "target_submission_count": target_count,
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
    
async def register_comparison_snapshot(assignment_id):
    state = await get_assignment_state(assignment_id)
    async with state["condition"]:
        return state["submitted"]

'''
Extracts the concatenated submission file from the zip wrapper
returns either the file read, or None if it fails.
'''
def extract_submission(zip_bytes, submission_id):
    file_name = f"{submission_id}.txt"
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zip:
        try:
            with zip.open(file_name) as file:
                return file.read()
        except KeyError:
            print(f"Missing {file_name} inside submission zip")
            return None




'''
Get all of the ids from submissions
TODO only get the most recent submission from each student
'''
def get_submission_ids_for_assignment(assignment_id):
    response = (
        supabase.table("File_Submissions_New")
        .select("id")
        .eq("assignment_id", assignment_id)
        .execute()
    )

    return [row.get("id") for row in (response.data or []) if row.get("id") is not None]

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
            file=json.dumps(result),
            path=f"{comparison_id}/{submission_id}.json",
            file_options={
                "cache-control": "3600",
                "upsert": "false",
                "content-type": "application/json",
            },
        )

'''
Handles each comparison request.
'''
async def consume_comparison():
    while True:
        comparison_event = await comparison_queue.get()
        assignment_id = comparison_event["assignment_id"]
        comparison_id = comparison_event["comparison_id"]
        target_count = comparison_event["target_submission_count"]
        state = await get_assignment_state(assignment_id)
        
        try:
            # Wait until all submissions for an assignment that were submitted before the comparison was called have been processed
            async with state["condition"]:
                await state["condition"].wait_for(
                    lambda: state["completed"] >= target_count
                )
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
                
                submission_ids = await asyncio.to_thread(get_submission_ids_for_assignment,assignment_id,)
                print(f"{len(submission_ids)} submission(s) where found for assignment {assignment_id}: ")
                
                token_csvs = await asyncio.to_thread(
                    download_token_csvs_for_assignment,
                    assignment_id,
                    submission_ids,
                )
                print(f"Downloaded {len(token_csvs)} token csv file(s) for assignment {assignment_id}")

                
                encoded_bytes_csv = encode_bytes(token_csvs)
                
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
                # TODO Update Table to reflect either error state or ready state
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
        state = await get_assignment_state(assignment_id)
        try:
            async with state["lock"]:
                submission_id = submission_event["submission_id"]
            
                print(f"Processing submission with id: {submission_id}")
                path = f"{assignment_id}/{submission_id}/{submission_id}.zip"
                file_bytes = await asyncio.to_thread(
                    supabase.storage.from_("Submissions").download,
                    path,
                )
                print(f"Downloaded submission file for submission id: {submission_id}")
                extracted_file_bytes = extract_submission(file_bytes, submission_id)
                if extracted_file_bytes is not None:
                    # TODO Call the java code and upload the results.
                    token_csv = entry_point.tokenizeCondensed(extracted_file_bytes)
                    print(f"Received token csv for submission: {submission_id}")
                    response = (
                        supabase.storage
                        .from_("Tokens")
                        .upload(
                            token_csv,
                            path=(assignment_id + "/" + submission_id + ".csv"),
                            file_options={"cache-control": "3600", "upsert": "false"}
                        )
                    )
                    # TODO Handle any errors if the tokens fail to upload
        except Exception as e:
            print(f"Error processing submission event {submission_event}: {e}")
        finally:
            async with state["condition"]:
                state["completed"] += 1
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
