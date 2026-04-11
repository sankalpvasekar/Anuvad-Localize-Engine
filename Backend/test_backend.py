import asyncio
import os
from pathlib import Path
from app.core.database import db_manager
from app.utils.audio_utils import configure_ffmpeg_path
from app.core.config import get_whisper_model

async def test_all():
    print("--- 🚀 Backend Connectivity Test ---")
    
    # 1. Test FFmpeg
    print("\n[1/3] Testing FFmpeg...")
    ffmpeg_path = configure_ffmpeg_path()
    if ffmpeg_path:
        print(f"✅ FFmpeg binaries found at: {ffmpeg_path}")
        # Verify execution
        import subprocess
        try:
            res = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
            print(f"✅ FFmpeg version check successful: {res.stdout.splitlines()[0]}")
        except Exception as e:
            print(f"❌ FFmpeg execution failed: {e}")
    else:
        print("❌ FFmpeg binaries NOT found in expected locations.")

    # 2. Test MongoDB
    print("\n[2/3] Testing MongoDB...")
    try:
        await db_manager.connect()
        projects_col = db_manager.get_projects_collection()
        count = await projects_col.count_documents({})
        print(f"✅ MongoDB connected successfully. Project count: {count}")
        await db_manager.disconnect()
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

    # 3. Test Whisper Model (Global Singleton)
    print("\n[3/3] Testing Whisper Model Interface...")
    try:
        # Just check the function exists and settings are ok
        from app.core.config import settings
        print(f"✅ Whisper model configured: {settings.whisper_model_name} (Device: {settings.device})")
        print("💡 Skipping full model load in this test to save time/memory.")
    except Exception as e:
        print(f"❌ Whisper configuration error: {e}")

    print("\n--- ✨ Test Summary Finished ---")

if __name__ == "__main__":
    asyncio.run(test_all())
