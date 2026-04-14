import asyncio
import logging
import os
import sys
from pathlib import Path
from bson import ObjectId

# Add Backend to sys.path
sys.path.append(os.getcwd())

from app.services.transcription_service import transcription_service
from app.core.database import db_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("verify-pipeline")

async def run_verification(video_path: str):
    logger.info(f"Starting verification for {video_path}")
    
    # 1. Connect to Database
    await db_manager.connect()
    projects_col = db_manager.get_projects_collection()
    
    # 2. Create a dummy project for tracking
    project_id = str(ObjectId())
    project_data = {
        "_id": ObjectId(project_id),
        "title": "Verification Test (UPSC)",
        "status": "Initializing",
        "progress": 0,
        "type": "AI Dubbing",
        "target_languages": ["hi", "mr"]
    }
    await projects_col.insert_one(project_data)
    logger.info(f"Created test project: {project_id}")
    
    try:
        # 3. Run Pipeline
        logger.info("Triggering full pipeline...")
        response = await transcription_service.transcribe_video(video_path, project_id=project_id)
        
        logger.info("Pipeline completed successfully!")
        logger.info(f"Detected Language: {response.detected_language}")
        logger.info(f"Transcript Sample: {response.transcript[:100]}...")
        
        # 4. Final check of output file
        project_after = await projects_col.find_one({"_id": ObjectId(project_id)})
        video_url = project_after.get("video_url")
        if video_url:
            logger.info(f"Final Video URL: {video_url}")
            full_video_path = Path("static/videos") / os.path.basename(video_url)
            if full_video_path.exists():
                logger.info("VERIFICATION SUCCESS: Multi-track video file generated.")
            else:
                logger.error(f"VERIFICATION FAILURE: Video file not found at {full_video_path}")
        
    except Exception as e:
        logger.error(f"VERIFICATION FAILED: {e}")
    finally:
        await db_manager.disconnect()

if __name__ == "__main__":
    video_to_test = r"D:\Localize Engine\upsc.mp4"
    if not os.path.exists(video_to_test):
        logger.error(f"File not found: {video_to_test}")
    else:
        asyncio.run(run_verification(video_to_test))
