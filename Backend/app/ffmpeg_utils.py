from typing import Optional, List
import os
from pathlib import Path

from app.config import settings


def configure_ffmpeg_path() -> Optional[str]:
    """Configure PATH so ffmpeg binaries are reachable from backend processes."""
    candidates: list[Path] = []

    if settings.ffmpeg_dir:
        candidates.append(Path(settings.ffmpeg_dir).expanduser().resolve())

    workspace_root = Path(__file__).resolve().parents[2]
    candidates.append(workspace_root / "ffmpeg")
    candidates.append(workspace_root / "ffmpeg" / "bin")

    for candidate in candidates:
        ffmpeg_exe = candidate / "ffmpeg.exe"
        ffprobe_exe = candidate / "ffprobe.exe"
        if candidate.exists() and ffmpeg_exe.exists() and ffprobe_exe.exists():
            os.environ["PATH"] = f"{candidate}{os.pathsep}" + os.environ.get("PATH", "")
            return str(candidate)

    return None

import subprocess
import logging

logger = logging.getLogger("ffmpeg-utils")

def merge_to_ott_video(video_path: str, audio_tracks: dict, output_path: str) -> bool:
    """
    Merge original video with multiple audio tracks (OTT style).
    audio_tracks: { 'hi': 'path/to/hindi.wav', 'mr': 'path/to/marathi.wav' }
    """
    configure_ffmpeg_path()
    
    # Base command: input video
    command = ["ffmpeg", "-y", "-i", video_path]
    
    # Add input for each audio track
    for lang, path in audio_tracks.items():
        command.extend(["-i", path])
        
    # 1. Map video from first input
    command.extend(["-map", "0:v:0"])
    
    # 2. Map original audio from first input (use ? to ignore if missing, e.g. silent video)
    # We also explicitly set its title and language
    command.extend(["-map", "0:a?", "-metadata:s:a:0", "language=eng", "-metadata:s:a:0", "title=Original Audio (EN)"])
    
    # 3. Map each extra audio track (dubbed versions)
    for idx, (lang, path) in enumerate(audio_tracks.items()):
        # Audio inputs start from index 1 (one file per language)
        command.extend(["-map", f"{idx + 1}:a:0"])
        
        # ISO 639-2 lang mapping
        lang_map = {
            "hi": "hin", "mr": "mar", "ta": "tam", "gu": "guj", "te": "tel", "kn": "kan"
        }
        lang_iso = lang_map.get(lang.lower(), lang.lower())
        
        # Track index in the output: 0 is original audio, so extra tracks start at index 1
        track_idx = idx + 1
        command.extend([
            f"-metadata:s:a:{track_idx}", f"language={lang_iso}",
            f"-metadata:s:a:{track_idx}", f"title={lang.upper()} Neural Dub"
        ])
    
    # Copy video and encode audio (standard AAC for compatibility)
    command.extend([
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "256k", # Higher bitrate for 'high fidelity' sound
        "-ac", "2",     # Ensure stereo
        output_path
    ])
    
    try:
        logger.info(f"Muxing multi-track video: {' '.join(command)}")
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg muxing failed with exit code {e.returncode}")
        logger.error(f"FFmpeg stderr: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Failed to merge multi-track video: {e}")
        return False

def align_audio_to_timestamps(segments: list, output_path: str):
    """
    Aligns multiple audio segments to their timestamps by inserting silence.
    This ensures the dubbing matches the timing of the original speech.
    """
    # ... logic using FFmpeg 'adelay' and 'amix' filter complex ...
    # Simplified for the plan:
    pass
