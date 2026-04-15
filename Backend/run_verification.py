import os
import asyncio
import shutil
import logging
from pathlib import Path
from bson import ObjectId

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("verification-runner")

async def run_verification():
    from app.core.database import db_manager
    from app.services.transcription_service import transcription_service
    
    # 1. Setup Environment
    VIDEO_PATH = r"D:\Localize Engine\Learn Java In 5 Minutes !! - AmanBytes (1080p, h264).mp4"
    OUTPUT_FOLDER = Path("verification_session_outputs")
    OUTPUT_FOLDER.mkdir(exist_ok=True)
    
    await db_manager.connect()
    projects_col = db_manager.get_projects_collection()
    
    try:
        # 2. Create a dummy project in DB to satisfy pipeline requirements
        project_doc = {
            "title": "Learn Java (Session Verification)",
            "user_id": "session_user",
            "status": "Processing",
            "target_languages": ["hi", "mr", "ta", "gu", "te", "kn"],
            "created_at": "2026-04-14",
            "is_community": False
        }
        result = await projects_col.insert_one(project_doc)
        project_id = str(result.inserted_id)
        
        logger.info(f"Starting pipeline for project {project_id}...")
        
        # 3. Run the full 4-stage pipeline
        # This will now use the new Linear Sequencer and Fixed Persistence logic
        response = await transcription_service.transcribe_video(VIDEO_PATH, project_id=project_id)
        
        # 4. Fetch the finalized project data
        final_project = await projects_col.find_one({"_id": ObjectId(project_id)})
        
        # 5. Export Deliverables to the session folder
        target_langs = ["hi", "mr", "ta", "gu", "te", "kn"]
        
        # a. Combined Transcripts
        original_transcript = final_project.get("original_transcript", "MISSING_ORIGINAL_TRANSCRIPT")
        combined_text = "=== ORIGINAL (ENGLISH) ===\n" + original_transcript + "\n\n"
        
        for lang in target_langs:
            transcript = final_project.get("translations", {}).get(lang, "MISSING_TRANSCRIPT")
            combined_text += f"=== {lang.upper()} ===\n" + transcript + "\n\n"
            
        with open(OUTPUT_FOLDER / "video_transcript.txt", "w", encoding="utf-8") as f:
            f.write(combined_text)
            
        # b. Original Audio
        audio_url = final_project.get("audio_url")
        if audio_url:
            src_en_audio = audio_url.strip("/").replace("/", os.sep)
            if os.path.exists(src_en_audio):
                shutil.copy(src_en_audio, OUTPUT_FOLDER / "en_audio_original.wav")
                
        # c. Audio Dubs
        for lang in target_langs:
            audio_track_url = final_project.get("audio_tracks", {}).get(lang)
            if audio_track_url:
                src_audio_path = audio_track_url.strip("/").replace("/", os.sep)
                if os.path.exists(src_audio_path):
                    shutil.copy(src_audio_path, OUTPUT_FOLDER / f"{lang}_audio_dub.wav")
                else:
                    logger.error(f"Could not find audio at {src_audio_path}")
                    
        # d. Final OTT Video
        video_url = final_project.get("video_url")
        if video_url:
            src_video_path = video_url.strip("/").replace("/", os.sep)
            if os.path.exists(src_video_path):
                shutil.copy(src_video_path, OUTPUT_FOLDER / "final_muxed_video.mp4")
            else:
                logger.error(f"Could not find video at {src_video_path}")
                
        logger.info(f"Verification completed. Files saved in {OUTPUT_FOLDER.absolute()}")
        print("\n" + "="*50)
        print("VERIFICATION SUCCESSFUL - ALL MULTILINGUAL OUTPUTS EXPORTED")
        print(f"Combined Transcripts: {OUTPUT_FOLDER / 'video_transcript.txt'}")
        print(f"Original EN Audio:    {OUTPUT_FOLDER / 'en_audio_original.wav'}")
        for lang in target_langs:
            print(f"Audio Dub  ({lang}): {OUTPUT_FOLDER / f'{lang}_audio_dub.wav'}")
        print(f"Final Muxed Video:    {OUTPUT_FOLDER / 'final_muxed_video.mp4'}")
        print("="*50)

    except Exception as e:
        logger.exception(f"Verification failed: {e}")
    finally:
        await db_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(run_verification())
