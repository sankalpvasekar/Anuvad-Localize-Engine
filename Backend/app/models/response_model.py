from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class GoogleLoginRequest(BaseModel):
    id_token: str = Field(min_length=16)


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    provider: str
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ProjectBase(BaseModel):
    title: str
    lang: str
    type: str = "Dubbing"
    size: str = "0 MB"
    status: str = "Processing"
    progress: int = 0
    timeRemaining: str = "TBD"
    stage: str = "Initializing"
    preview: str | None = None
    is_community: bool = False
    target_languages: list[str] | None = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: str | None = None
    status: str | None = None
    progress: int | None = None
    timeRemaining: str | None = None
    stage: str | None = None
    is_community: bool | None = None
    target_languages: list[str] | None = None

class ProjectOut(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    audio_url: str | None = None
    detected_language: str | None = None
    transcript: str | None = None
    target_languages: list[str] | None = None


class TranscriptionResponse(BaseModel):
    detected_language: str
    confidence: float
    transcript: str
    processing_time: float
    audio_url: str | None = None


class TranslationResponse(TranscriptionResponse):
    target_language: str = "en"


class ErrorResponse(BaseModel):
    detail: str
    status_code: int = 400
