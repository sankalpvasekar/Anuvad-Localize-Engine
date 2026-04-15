import os
import shutil
import asyncio
from pathlib import Path
from bson import ObjectId

async def export_deliverables():
    from app.core.database import db_manager
    from app.core.config import settings

    OUTPUT_FOLDER = Path("all langugae")
    OUTPUT_FOLDER.mkdir(exist_ok=True)
    
    await db_manager.connect()
    projects_col = db_manager.get_projects_collection()
    
    try:
        # Find the latest generated session
        project = await projects_col.find_one(
            {"title": "Learn Java (Session Verification)"},
            sort=[("created_at", -1)]
        )
        
        if not project:
            print("Could not find the 'Learn Java' project in the database. Has the pipeline finished?")
            return
            
        print(f"Exporting files for Project ID: {project['_id']}")
        
        # 1. Original English
        # Transcript
        en_transcript = project.get("original_transcript", "MISSING_ORIGINAL_TRANSCRIPT")
        with open(OUTPUT_FOLDER / "en_transcript.txt", "w", encoding="utf-8") as f:
            f.write(en_transcript)
        print("Exported: en_transcript.txt")
        
        # Original Audio
        audio_url = project.get("audio_url")
        if audio_url:
            src_audio_path = audio_url.strip("/").replace("/", os.sep)
            if os.path.exists(src_audio_path):
                shutil.copy(src_audio_path, OUTPUT_FOLDER / "en_audio.wav")
                print("Exported: en_audio.wav")
            else:
                print(f"Skipped Original Audio: Path not found {src_audio_path}")

        # 2. Translated Tracks & Transcripts
        target_langs = ["hi", "mr", "ta", "gu", "te", "kn"]
        translations = project.get("translations", {})
        audio_tracks = project.get("audio_tracks", {})
        
        for lang in target_langs:
            # Transcript
            transcript = translations.get(lang)
            if transcript:
                with open(OUTPUT_FOLDER / f"{lang}_transcript.txt", "w", encoding="utf-8") as f:
                    f.write(transcript)
                print(f"Exported: {lang}_transcript.txt")
            
            # Audio
            track_url = audio_tracks.get(lang)
            if track_url:
                local_path = track_url.strip("/").replace("/", os.sep)
                if os.path.exists(local_path):
                    shutil.copy(local_path, OUTPUT_FOLDER / f"{lang}_audio_dub.wav")
                    print(f"Exported: {lang}_audio_dub.wav")
                else:
                    print(f"Skipped {lang} Audio: Not found locally {local_path}")
        
        # 3. Final Muxed Video
        video_url = project.get("video_url")
        if video_url:
            src_video_path = video_url.strip("/").replace("/", os.sep)
            if os.path.exists(src_video_path):
                shutil.copy(src_video_path, OUTPUT_FOLDER / "final_muxed_video.mp4")
                print(f"Exported: final_muxed_video.mp4")
            else:
                print(f"Skipped Muxed Video: Not found {src_video_path}")
                
        print("\nExport completed successfully! Check the 'all langugae' directory.")

    except Exception as e:
        print(f"Export failed: {e}")
    finally:
        await db_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(export_deliverables())
