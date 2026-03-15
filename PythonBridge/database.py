import json
import os
from email.policy import default
from pathlib import Path
from dotenv import load_dotenv

from supabase import create_client, Client
from supabase.client import ClientOptions
import datetime
import uuid

env_path = Path(__file__).with_name(".env.local")
load_dotenv(env_path)

url = os.getenv("URL")
key = os.getenv("SECRET_KEY")

print(url + " " + str(key))
supabase: Client = create_client(
    url,
    key,
    options=ClientOptions(
        postgrest_client_timeout=10,
        storage_client_timeout=10,
        schema="public",
    )
)

# Define a custom function to serialize datetime objects
def serialize_datetime(obj):
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    raise TypeError("Type not serializable")

startdate = datetime.datetime(2020, 9, 1)
json_date = json.dumps(startdate, default=serialize_datetime)

response = (
    supabase.table("Courses")
    .upsert({"primary_instructor": uuid.UUID("857ef515-4f51-4515-91d1-d695e5365153").hex,"cid": 17, "start_date": json_date, "end_date": None, "name": "Python Upload", "join_code": "Successful"})
    .execute()
)

print(response)