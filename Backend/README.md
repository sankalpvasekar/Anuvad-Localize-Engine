# Backend (FastAPI + MongoDB + FFmpeg + Colab Pipeline)

## 1) Environment setup

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

## 2) Run backend

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

## 3) FFmpeg path

The backend auto-detects FFmpeg from `../ffmpeg/bin`.
If needed, set `FFMPEG_DIR` in `.env`.

## 4) MongoDB

Set Mongo connection in `.env`:

- `MONGO_URI`
- `MONGO_DB_NAME`

## 5) Auth APIs

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google`
- `GET /health`

### Signup payload

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "yourPassword123"
}
```

### Login payload

```json
{
  "email": "user@example.com",
  "password": "yourPassword123"
}
```

### Google login payload

```json
{
  "id_token": "google_oauth_id_token"
}
```

## 6) Google Colab pipeline

Use `colab/multimedia_pipeline.py` in Colab.

Recommended Colab start cell:

```python
!pip install -q openai-whisper langdetect
!apt-get -qq update && apt-get -qq install ffmpeg

from colab.multimedia_pipeline import run_pipeline
result = run_pipeline(model_name="medium")  # tiny/base/small/medium
```
