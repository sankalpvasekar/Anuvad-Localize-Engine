"""
Backward-compatibility proxy for app.utils.ffmpeg_utils.
All functionality has been consolidated under app.utils.ffmpeg_utils.
"""
from app.utils.ffmpeg_utils import (
    configure_ffmpeg_path,
    merge_to_ott_video,
    align_audio_to_timestamps,
)

__all__ = [
    "configure_ffmpeg_path",
    "merge_to_ott_video",
    "align_audio_to_timestamps",
]
