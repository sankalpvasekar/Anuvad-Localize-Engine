from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form
import shutil
import os
from pathlib import Path
from pydantic import BaseModel

from app.core.database import db_manager
from app.models.response_model import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])

def map_project(doc: dict) -> ProjectOut:
    return ProjectOut(
        id=str(doc["_id"]),
        user_id=doc.get("user_id", "unknown"),
        title=doc["title"],
        lang=doc["lang"],
        type=doc.get("type", "Dubbing"),
        size=doc.get("size", "0 MB"),
        status=doc.get("status", "Processing"),
        progress=doc.get("progress", 0),
        timeRemaining=doc.get("timeRemaining", "TBD"),
        stage=doc.get("stage", "Initializing"),
        preview=doc.get("preview"),
        is_community=doc.get("is_community", False),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        audio_url=doc.get("audio_url"),
        detected_language=doc.get("detected_language"),
        transcript=doc.get("transcript"),
        target_languages=doc.get("target_languages"),
    )

@router.get("", response_model=List[ProjectOut])
async def get_projects(user_id: Optional[str] = None, is_community: Optional[bool] = None):
    try:
        query = {}
        if user_id:
            query["user_id"] = user_id
        if is_community is not None:
            query["is_community"] = is_community

        projects_col = db_manager.get_projects_collection()
        cursor = projects_col.find(query).sort("created_at", -1)
        projects = await cursor.to_list(length=100)
        return [map_project(p) for p in projects]
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str):
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID")
    projects_col = db_manager.get_projects_collection()
    doc = await projects_col.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return map_project(doc)

@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, user_id: str = "guest"):
    projects_col = db_manager.get_projects_collection()
    
    now = datetime.now(tz=timezone.utc)
    project_dict = project.model_dump()
    project_dict["user_id"] = user_id
    project_dict["created_at"] = now
    
    result = await projects_col.insert_one(project_dict)
    project_dict["_id"] = result.inserted_id
    
    return map_project(project_dict)

@router.post("/upload", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def upload_video(
    lang: str = Form(...),
    type: str = Form(...),
    title: str = Form(...),
    user_id: str = Form("guest"),
    file: UploadFile = File(...)
):
    projects_col = db_manager.get_projects_collection()
    
    # Ensure uploads directory exists
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Save file
    file_path = upload_dir / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    now = datetime.now(tz=timezone.utc)
    project_dict = {
        "user_id": user_id,
        "title": title,
        "lang": lang,
        "type": type,
        "size": f"{os.path.getsize(file_path) / (1024*1024):.1f} MB",
        "status": "Processing",
        "progress": 0,
        "timeRemaining": "Calculating...",
        "stage": "Initializing",
        "is_community": False,
        "created_at": now,
        "video_path": str(file_path)
    }
    
    result = await projects_col.insert_one(project_dict)
    project_dict["_id"] = result.inserted_id
    
    return map_project(project_dict)

@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, updates: ProjectUpdate):
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    projects_col = db_manager.get_projects_collection()
    existing = await projects_col.find_one({"_id": obj_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
        
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if update_data:
        await projects_col.update_one({"_id": obj_id}, {"$set": update_data})
        existing.update(update_data)
        
    return map_project(existing)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str):
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    projects_col = db_manager.get_projects_collection()
    result = await projects_col.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
