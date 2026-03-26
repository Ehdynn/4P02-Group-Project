import base64

from dotenv import load_dotenv
import asyncio
import os
from pathlib import Path
from supabase import create_client, Client
from realtime import AsyncRealtimeClient, RealtimePostgresChangesListenEvent
from py4j.java_gateway import JavaGateway
import json

comparison_queue = asyncio.Queue()
submission_queue = asyncio.Queue()

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
Checks to make sure that all of the tokens have been created for each submission to an assignment
'''
def has_pending_submission_for_assignment(assignment_id):
    queued_items = list(submission_queue._queue)
    return any(
        item.get("assignment_id") == assignment_id
        for item in queued_items
    )


'''
Handles the insert event on the Comparisons table.
Takes the information and adds it to the queue to be handled by the consumer.
'''
def handle_comparison_update(payload):
    record = payload.get("data", {}).get("record", {})
    comparison_id = record.get("id")
    assignment_id = record.get("aid")
    if comparison_id is not None and assignment_id is not None:
        comparison_queue.put_nowait(
            {
                "comparison_id": comparison_id,
                "assignment_id": assignment_id,
            }
        )

'''
Handles the insert event on the File_Submissions_New table.
Takes the information and adds it to the queue to be handled by the consumer.
'''
def handle_submission_update(payload):
    record = payload.get("data", {}).get("record", {})
    submission_id = record.get("id")
    assignment_id = record.get("assignment_id")
    file_name = record.get("file_name")
    if submission_id is not None and assignment_id is not None and file_name is not None:
        submission_queue.put_nowait(
            {
                "assignment_id": assignment_id,
                "submission_id": submission_id,
                "file_name": file_name,
            }
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

'''
Handles each comparison request.
'''
async def consume_comparison():
    while True:
        comparison_event = await comparison_queue.get()
        try:
            assignment_id = comparison_event.get("assignment_id")
            comparison_id = comparison_event.get("comparison_id")
            print(f"Processing comparison with id: {comparison_id}")

            while has_pending_submission_for_assignment(assignment_id):
                print(
                    f"Waiting for queued submissions to finish for assignment {assignment_id}"
                )
                await asyncio.sleep(10)
            
            submission_ids = await asyncio.to_thread(
                get_submission_ids_for_assignment,
                assignment_id,
            )
            print(f"{len(submission_ids)} submission(s) where found for assignment {assignment_id}: ")
            
            token_csvs = await asyncio.to_thread(
                download_token_csvs_for_assignment,
                assignment_id,
                submission_ids,
            )
            print(
                f"Downloaded {len(token_csvs)} token csv file(s) for assignment {assignment_id}"
            )

            encoded_bytes = encode_bytes(token_csvs)

            similarity_data = gateway.getComparisonData(encoded_bytes)

            # TODO Upload Comparisons

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
        try:
            assignment_id = submission_event.get("assignment_id")
            submission_id = submission_event.get("submission_id")
            file_name = submission_event.get("file_name")
            print(f"Processing submission with id: {submission_id}")
            path = f"{assignment_id}/{submission_id}/{file_name}"
            file_bytes = await asyncio.to_thread(
                supabase.storage.from_("Submissions").download,
                path,
            )
            print(f"Downloaded submission file for submission id: {submission_id}")
            # TODO Call the java code and upload the results.
            token_csv = entry_point.Proper_Function_Name_Here(file_bytes)
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
        except Exception as e:
            print(f"Error processing submission event {submission_event}: {e}")
        finally:
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
