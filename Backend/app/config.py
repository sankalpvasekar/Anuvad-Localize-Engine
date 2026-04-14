from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Localize Engine Backend"
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "localize_engine"

    jwt_secret_key: str = Field(default="change-this-in-production", min_length=16)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    google_client_id: Optional[str] = None

    # Optional override. If empty, the app auto-detects ../ffmpeg/bin from workspace root.
    ffmpeg_dir: Optional[str] = None


settings = Settings()
