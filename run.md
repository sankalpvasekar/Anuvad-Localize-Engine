# First-time setup + run
cd "D:\Localize Engine\Backend"
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# If already set up, just run
cd "D:\Localize Engine\Backend"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API will be available at:
http://127.0.0.1:8000/docs
