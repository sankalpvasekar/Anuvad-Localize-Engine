from datetime import datetime
from typing import Optional, Union

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
    progress: float = 0.0
    timeRemaining: str = "TBD"
    stage: str = "Initializing"
    preview: Optional[str] = None
    is_community: bool = False
    target_languages: Optional[list[str]] = None
    detected_language: Optional[str] = None
    domain: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[float] = None
    timeRemaining: Optional[str] = None
    stage: Optional[str] = None
    is_community: Optional[bool] = None
    target_languages: Optional[list[str]] = None

class ProjectOut(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    date: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    transcript: Optional[str] = None
    audio_tracks: Optional[dict[str, str]] = None
    translations: Optional[dict[str, str]] = None


class TranscriptionResponse(BaseModel):
    detected_language: str
    confidence: float
    transcript: str
    processing_time: float
    audio_url: Optional[str] = None


class TranslationResponse(TranscriptionResponse):
    target_language: str = "en"


class ErrorResponse(BaseModel):
    detail: str
    status_code: int = 400
