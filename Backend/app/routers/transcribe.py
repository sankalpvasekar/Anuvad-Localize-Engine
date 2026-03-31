import os
import json
import asyncio
import logging
import tempfile
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, UploadFile, HTTPException, status

from app.services.transcription_service import transcription_service
from app.models.response_model import TranscriptionResponse, ErrorResponse, ProjectOut
from app.core.database import db_manager

logger = logging.getLogger("transcription-router")
router = APIRouter(prefix="/transcribe", tags=["transcription"])

# Accepted MIME types (some browsers send generic octet-stream for .mkv / .webm)
ACCEPTED_CONTENT_TYPES = {
    "video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo",
    "video/x-matroska", "video/webm", "video/3gpp", "video/x-flv",
    "video/x-ms-wmv", "application/octet-stream",
}

# Accepted file extensions as a safety net
ACCEPTED_EXTENSIONS = {
    ".mp4", ".mkv", ".mov", ".avi", ".webm", ".flv", ".wmv", ".3gp", ".ts", ".m4v"
}

# 2 GB max upload size
MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024 * 1024


import shutil

async def _stream_upload_to_temp(file: UploadFile, suffix: str) -> str:
    """
    Stream UploadFile to a temp file highly efficiently.
    Uses shutil.copyfileobj in a background thread to prevent blocking
    the FastAPI event loop during large file dumps.
    """
    tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    tmp_path = tmp.name

    def write_to_disk() -> int:
        # Move back to start of file (Starlette may have read some metadata)
        file.file.seek(0)
        # Fast C-level file copy
        shutil.copyfileobj(file.file, tmp)
        tmp.flush()
        # Verify size limit
        size = os.path.getsize(tmp_path)
        tmp.close()
        return size

    try:
        loop = asyncio.get_running_loop()
        total_bytes = await loop.run_in_executor(None, write_to_disk)

        if total_bytes > MAX_UPLOAD_SIZE_BYTES:
            os.remove(tmp_path)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds the 2 GB upload limit.",
            )

        logger.info(f"Saved {file.filename!r} → {tmp_path} ({total_bytes / 1e6:.2f} MB)")
        return tmp_path
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=f"Failed to store upload: {e}")


async def _run_transcription_background(
    temp_video_path: str, project_id: str, filename: str
):
    """Background task: run the full transcription pipeline and clean up temp video."""
    try:
        logger.info(f"[{project_id}] Background pipeline starting for {filename!r}")
        await transcription_service.transcribe_video(temp_video_path, project_id=project_id)
        logger.info(f"[{project_id}] Background pipeline completed")
    except Exception:
        logger.exception(f"[{project_id}] Background pipeline failed")
    finally:
        try:
            if os.path.exists(temp_video_path):
                os.remove(temp_video_path)
                logger.debug(f"[{project_id}] Cleaned up temp file {temp_video_path}")
        except OSError as cleanup_err:
            logger.warning(f"[{project_id}] Temp file cleanup failed: {cleanup_err}")


@router.post("/", status_code=status.HTTP_202_ACCEPTED)
async def transcribe_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_languages: Optional[str] = Form(None),
):
    """
    Upload a video file and start async transcription.

    - Validates MIME type and file extension
    - Streams the upload in 1 MB chunks (supports large files efficiently)
    - Accepts an optional `target_languages` JSON array string (e.g. '["hi","en","ta"]')
    - Creates a project record immediately (clients can poll /projects/{id})
    - Returns project_id so the client can track progress
    """
    filename = file.filename or "upload"
    extension = os.path.splitext(filename)[1].lower()

    # Validate by MIME type + extension
    mime_ok = file.content_type in ACCEPTED_CONTENT_TYPES
    ext_ok = extension in ACCEPTED_EXTENSIONS

    if not (mime_ok or ext_ok):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type: content_type={file.content_type!r}, "
                f"extension={extension!r}. Please upload a valid video file."
            ),
        )

    suffix = extension if extension else ".mp4"

    # Parse target_languages JSON string => Python list
    parsed_target_languages: list[str] | None = None
    if target_languages:
        try:
            parsed = json.loads(target_languages)
            if isinstance(parsed, list) and all(isinstance(c, str) for c in parsed):
                parsed_target_languages = [c.strip().lower() for c in parsed if c.strip()]
        except (json.JSONDecodeError, ValueError):
            # Fallback: treat as comma-separated string
            parsed_target_languages = [c.strip().lower() for c in target_languages.split(',') if c.strip()]

    # Stream upload to temp file asynchronously
    temp_video_path = await _stream_upload_to_temp(file, suffix)

    # Create project record in MongoDB
    projects_col = db_manager.get_projects_collection()
    now = datetime.now(tz=timezone.utc)
    file_size_mb = os.path.getsize(temp_video_path) / (1024 * 1024)

    # lang field: human-readable summary for display
    lang_display = (
        ', '.join(parsed_target_languages)
        if parsed_target_languages
        else "Detecting..."
    )

    project_doc = {
        "user_id": "guest",
        "title": filename,
        "lang": lang_display,
        "type": "AI Dubbing",
        "size": f"{file_size_mb:.2f} MB",
        "status": "Processing",
        "progress": 5,
        "timeRemaining": "Calculating...",
        "stage": "Audio Extraction",
        "is_community": False,
        "created_at": now,
        "audio_url": None,
        "detected_language": None,
        "transcript": None,
        "target_languages": parsed_target_languages,
    }

    result = await projects_col.insert_one(project_doc)
    project_id = str(result.inserted_id)

    # Queue the background transcription task
    background_tasks.add_task(
        _run_transcription_background, temp_video_path, project_id, filename
    )

    logger.info(f"Project {project_id} created. Transcription queued for {filename!r}. Target langs: {parsed_target_languages}")
    return {
        "project_id": project_id,
        "status": "Processing",
        "message": "Upload received. Transcription started in background.",
        "filename": filename,
        "size_mb": round(file_size_mb, 2),
        "target_languages": parsed_target_languages,
    }


@router.get("/status")
async def get_system_status():
    """Health check for the transcription service."""
    from app.core.config import settings
    import torch
    return {
        "service": "Anuvad Transcription Engine",
        "status": "Online",
        "engine": f"Whisper {settings.whisper_model_name}",
        "device": settings.device,
        "cuda_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
    }
