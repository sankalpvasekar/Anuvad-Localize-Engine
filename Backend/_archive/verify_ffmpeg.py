import os
from pathlib import Path
from app.utils.audio_utils import configure_ffmpeg_path
import subprocess

def test():
    print("--- FFmpeg Detection Test ---")
    path = configure_ffmpeg_path()
    if path:
        print(f"✅ Found FFmpeg path: {path}")
        try:
            res = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
            print(f"✅ Successfully executed ffmpeg: {res.stdout.splitlines()[0]}")
        except Exception as e:
            print(f"❌ Execution failed: {e}")
    else:
        print("❌ FFmpeg NOT found in project root or path.")

if __name__ == "__main__":
    test()
