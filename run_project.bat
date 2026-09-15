@echo off
SET PYTHONUTF8=1
echo Starting Backend...
start cmd /k "cd Backend && .\.venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
echo Starting Frontend...
start cmd /k "cd Frontend && npm run dev"
echo Both servers starting. Visit http://localhost:5173 for Frontend and http://localhost:8000/docs for Backend API.
