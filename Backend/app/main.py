from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import db_manager
from app.ffmpeg_utils import configure_ffmpeg_path
from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    ffmpeg_path = configure_ffmpeg_path()
    if ffmpeg_path:
        print(f"[startup] FFmpeg path configured: {ffmpeg_path}")
    else:
        print("[startup] FFmpeg binaries not found. Set FFMPEG_DIR in .env if needed.")

    await db_manager.connect()
    print("[startup] MongoDB connected")

    try:
        yield
    finally:
        await db_manager.disconnect()
        print("[shutdown] MongoDB disconnected")


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
