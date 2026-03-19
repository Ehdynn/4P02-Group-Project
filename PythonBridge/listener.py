from dotenv import load_dotenv
import asyncio
import os
from pathlib import Path
from supabase import create_client, Client
from realtime import AsyncRealtimeClient, RealtimePostgresChangesListenEvent

env_path = Path(__file__).with_name(".env.local")
load_dotenv(env_path)

url = os.getenv("URL")
key = os.getenv("SECRET_KEY")

supabase: Client = create_client(url, key)

def handle_update(payload):
    record = payload.get("data", {}).get("record", {})
    print("New comparison row:", record)

async def main():
    """
    Main asynchronous function to set up and maintain the connection.
    """
    try:
        websocket_url = f"wss://{url.split('//')[1]}/realtime/v1/websocket"
        client = AsyncRealtimeClient(websocket_url, token=key, params={"apikey": key})
        await client.connect()

        comparison_channel = client.channel("realtime:public:Comparisons")
        comparison_channel.on_postgres_changes(
            RealtimePostgresChangesListenEvent.Insert,
            handle_update,
            schema="public",
            table="Comparisons",
        )
        await comparison_channel.subscribe()
        print(f"Subscribed to inserts on 'Comparisons'. Listening for changes...")

        submissions_channel = client.channel("realtime:public:Comparisons")
        submissions_channel.on_postgres_changes(
            RealtimePostgresChangesListenEvent.Insert,
            handle_update,
            schema="public",
            table="File_Submissions_New",
        )
        await submissions_channel.subscribe()
        print(f"Subscribed to inserts on 'Submissions'. Listening for changes...")

        await asyncio.Event().wait()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
