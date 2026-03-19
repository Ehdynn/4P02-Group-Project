# Python Bridge

## Quick Start

- First navigate into the PythonBridge directory.
- Then run "python -m venv .venv" and active it with one of the following
    - Windows powershell ".\.venv\Scripts\Activate.ps1"
    - Windows command prompt ".venv\Scripts\activate.bat
    - Mac / Linux source myenv/bin/activate
- Once the environment is activated run "pip install -r requirements.txt"
    - Note: this is only required the first time, or when the requirements are updated.
- Now you can run the files, for example python ./listener.py

## listener.py

This was put together using template code from the [supabase docs](https://supabase.com/docs/reference/python/subscribe) it listens for inserts on both "Comparisons" and "File_Submissions_New". When an insert is done, it prints the new row info to the console for now.
