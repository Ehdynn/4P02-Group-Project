import json
import os
from email.policy import default

from supabase import create_client, Client
from supabase.client import ClientOptions
import datetime
import uuid


url = "https://siozhcgesehtdelzuwct.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb3poY2dlc2VodGRlbHp1d2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjgzNDQsImV4cCI6MjA4NjUwNDM0NH0.s8oZ4FO9LwpC2k2BVW_KgWFbVlknxM0fc9pzIdvX5XI"
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

#print(response)