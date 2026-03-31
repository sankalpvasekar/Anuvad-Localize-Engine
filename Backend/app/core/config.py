import whisper
import torch
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Anuvad AI Transcription Engine"
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "localize_engine"

    jwt_secret_key: str = Field(default="change-this-in-production-min-32chars-long", min_length=16)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    google_client_id: str | None = None
    
    # Transcription Settings
    # Model options (speed → accuracy): tiny → base → small → medium → large-v3
    # Recommendation: "medium" for CPU, "large-v3" for GPU with ≥8 GB VRAM
    whisper_model_name: str = "small"
    device: str = "cuda" if torch.cuda.is_available() else "cpu"

    # Optional override for ffmpeg path
    ffmpeg_dir: str | None = None

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()

# Global variable to store the whisper model
_model = None

def get_whisper_model():
    """Load the Whisper model once (singleton) and return it."""
    global _model
    if _model is None:
        import time
        t0 = time.monotonic()
        print(
            f"[Whisper] Loading model='{settings.whisper_model_name}' "
            f"on device='{settings.device}' …"
        )
        _model = whisper.load_model(settings.whisper_model_name, device=settings.device)
        elapsed = time.monotonic() - t0
        print(f"[Whisper] Model loaded in {elapsed:.2f}s")
    return _model
