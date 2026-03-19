from dotenv import load_dotenv
import asyncio
import os
from pathlib import Path
from supabase import create_client, Client
from realtime import AsyncRealtimeClient, RealtimePostgresChangesListenEvent

comparison_queue = asyncio.Queue()
submission_queue = asyncio.Queue()

env_path = Path(__file__).with_name(".env.local")
load_dotenv(env_path)

url = os.getenv("URL")
key = os.getenv("SECRET_KEY")

supabase: Client = create_client(url, key)

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
Handles each comparison request.
'''
async def consume_comparison():
    while True:
        comparison_event = await comparison_queue.get()
        try:
            assignment_id = comparison_event.get("assignment_id")
            comparison_id = comparison_event.get("comparison_id")
            print(f"Processing comparison with id: {comparison_id}")
            # TODO: Download tokens for files being compared

            # TODO Handle Comparison Work

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
            file_text = file_bytes.decode("utf-8", errors="replace")
            print(f"Downloaded submission file for submission id: {submission_id}")
            print(file_text)
            # TODO Call the java code and upload the results.
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
