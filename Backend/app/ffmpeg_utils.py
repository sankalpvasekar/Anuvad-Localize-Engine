import os
from pathlib import Path

from app.config import settings


def configure_ffmpeg_path() -> str | None:
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
