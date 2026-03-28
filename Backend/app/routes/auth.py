from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database import db_manager
from app.schemas import AuthResponse, GoogleLoginRequest, UserCreate, UserLogin, UserPublic
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_public_user(user_doc: dict) -> UserPublic:
    return UserPublic(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        provider=user_doc.get("provider", "local"),
        created_at=user_doc["created_at"],
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate) -> AuthResponse:
    users = db_manager.get_users_collection()
    existing = await users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.now(tz=timezone.utc)
    user = {
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "provider": "local",
        "created_at": now,
    }

    try:
        result = await users.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email already registered") from exc

    user["_id"] = result.inserted_id
    token = create_access_token(subject=user["email"])
    return AuthResponse(access_token=token, user=_to_public_user(user))


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin) -> AuthResponse:
    users = db_manager.get_users_collection()
    user = await users.find_one({"email": payload.email.lower()})

    if not user or "password_hash" not in user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(subject=user["email"])
    return AuthResponse(access_token=token, user=_to_public_user(user))


@router.post("/google", response_model=AuthResponse)
async def login_with_google(payload: GoogleLoginRequest) -> AuthResponse:
    if not settings.google_client_id:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID is not set in backend environment",
        )

    try:
        id_info = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            settings.google_client_id,
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid Google token") from exc

    email = str(id_info.get("email", "")).lower()
    name = str(id_info.get("name", "Google User")).strip() or "Google User"

    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    users = db_manager.get_users_collection()
    user = await users.find_one({"email": email})

    if user is None:
        now = datetime.now(tz=timezone.utc)
        new_user = {
            "name": name,
            "email": email,
            "provider": "google",
            "google_sub": id_info.get("sub"),
            "created_at": now,
        }
        result = await users.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        user = new_user

    token = create_access_token(subject=email)
    return AuthResponse(access_token=token, user=_to_public_user(user))
