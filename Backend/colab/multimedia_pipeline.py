"""
Google Colab multimedia pipeline:
video/audio -> optional extraction -> language detection -> transcription.
"""

from __future__ import annotations

import mimetypes
import os
import subprocess
from pathlib import Path
from typing import Any, Union, Optional

import whisper
from langdetect import DetectorFactory, LangDetectException, detect

try:
    from google.colab import files  # type: ignore
except ImportError:  # pragma: no cover
    files = None


SUPPORTED_LANGUAGES = ["hi", "mr", "gu", "ta", "te", "kn", "en"]
VIDEO_EXTENSIONS = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v"}
AUDIO_EXTENSIONS = {".wav", ".mp3", ".aac", ".flac", ".m4a", ".ogg", ".opus"}

DetectorFactory.seed = 0


def log_step(message: str) -> None:
    print(f"[PIPELINE] {message}")


def upload_file() -> dict[str, Any]:
    """Upload a single audio/video file from Colab UI and detect media type."""
    if files is None:
        raise RuntimeError("google.colab.files is unavailable. Run this in Google Colab.")

    log_step("Waiting for file upload...")
    uploaded = files.upload()

    if not uploaded:
        raise ValueError("No file uploaded")

    filename = next(iter(uploaded.keys()))
    path = Path(filename).resolve()

    ext = path.suffix.lower()
    mime, _ = mimetypes.guess_type(str(path))

    if ext in VIDEO_EXTENSIONS or (mime and mime.startswith("video/")):
        media_type = "video"
    elif ext in AUDIO_EXTENSIONS or (mime and mime.startswith("audio/")):
        media_type = "audio"
    else:
        raise ValueError(f"Unsupported file type: {path.name}")

    log_step(f"Uploaded: {path.name} ({media_type})")
    return {"path": path, "media_type": media_type, "mime": mime}


def extract_audio(input_path: Union[Path, str], output_path: Union[Path, str], ffmpeg_binary: str = "ffmpeg") -> Path:
    """Extract or normalize input media into mono 16kHz WAV."""
    source = Path(input_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        ffmpeg_binary,
        "-y",
        "-i",
        str(source),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        str(target),
    ]

    log_step(f"Running FFmpeg for audio conversion: {source.name}")
    process = subprocess.run(cmd, capture_output=True, text=True)
    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg failed: {process.stderr[-2000:]}")

    log_step(f"Audio ready: {target}")
    return target


def _safe_text_language(sample_text: str) -> Optional[str]:
    cleaned = sample_text.strip()
    if len(cleaned) < 10:
        return None
    try:
        return detect(cleaned)
    except LangDetectException:
        return None


def detect_language(audio_path: Union[Path, str], model: whisper.Whisper) -> dict[str, Any]:
    """
    Detect language using Whisper probabilities + langdetect text fallback.

    Rule:
    - If whisper confidence > 0.6, use whisper language.
    - Else fallback to text-based detection.
    - Restrict final language to SUPPORTED_LANGUAGES.
    """
    log_step("Running language detection")

    audio = whisper.load_audio(str(audio_path))
    audio = whisper.pad_or_trim(audio)

    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    _, probs = model.detect_language(mel)

    whisper_lang = max(probs, key=probs.get)
    whisper_confidence = float(probs[whisper_lang])

    probe = model.transcribe(
        str(audio_path),
        task="transcribe",
        fp16=(model.device.type == "cuda"),
        temperature=0,
        best_of=1,
        beam_size=3,
    )
    text_sample = str(probe.get("text", ""))
    text_lang = _safe_text_language(text_sample)

    if whisper_confidence > 0.6:
        final_lang = whisper_lang
        decision_reason = "whisper_confidence"
    else:
        final_lang = text_lang or whisper_lang
        decision_reason = "text_fallback"

    if final_lang not in SUPPORTED_LANGUAGES:
        if whisper_lang in SUPPORTED_LANGUAGES:
            final_lang = whisper_lang
            decision_reason += "_restricted_to_supported"
        elif text_lang in SUPPORTED_LANGUAGES:
            final_lang = text_lang
            decision_reason += "_restricted_to_supported"
        else:
            final_lang = "en"
            decision_reason += "_default_en"

    result = {
        "whisper_language": whisper_lang,
        "whisper_confidence": whisper_confidence,
        "text_language": text_lang,
        "final_language": final_lang,
        "decision_reason": decision_reason,
    }
    log_step(f"Language result: {result}")
    return result


def transcribe_audio(
    audio_path: Union[Path, str],
    model: whisper.Whisper,
    language: str,
) -> dict[str, Any]:
    """Run final stable transcription with chosen language."""
    log_step(f"Transcribing with language='{language}'")

    output = model.transcribe(
        str(audio_path),
        task="transcribe",
        language=language,
        fp16=(model.device.type == "cuda"),
        temperature=0,
        best_of=3,
        beam_size=5,
        condition_on_previous_text=True,
        verbose=False,
    )

    text = "\n".join(line.strip() for line in str(output.get("text", "")).splitlines() if line.strip())
    output["clean_text"] = text
    return output


def save_transcript(text: str, transcript_path: Union[Path, str]) -> Path:
    path = Path(transcript_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.strip() + "\n", encoding="utf-8")
    log_step(f"Transcript saved: {path}")
    return path


def run_pipeline(model_name: str = "medium") -> dict[str, Any]:
    """Execute complete pipeline in Colab."""
    if model_name not in {"tiny", "base", "small", "medium"}:
        raise ValueError("model_name must be one of: tiny, base, small, medium")

    media = upload_file()

    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)

    input_path: Path = media["path"]
    if media["media_type"] == "video":
        extracted_audio = output_dir / f"{input_path.stem}_audio_16k.wav"
        audio_path = extract_audio(input_path, extracted_audio)
    else:
        audio_path = output_dir / f"{input_path.stem}_normalized_16k.wav"
        audio_path = extract_audio(input_path, audio_path)

    log_step(f"Loading Whisper model: {model_name}")
    model = whisper.load_model(model_name)

    detection = detect_language(audio_path, model)
    transcript_result = transcribe_audio(audio_path, model, detection["final_language"])

    transcript_path = output_dir / f"{input_path.stem}_transcript.txt"
    save_transcript(transcript_result["clean_text"], transcript_path)

    summary = {
        "input": str(input_path),
        "audio": str(audio_path),
        "model": model_name,
        "language": detection,
        "transcript_path": str(transcript_path),
        "transcript": transcript_result["clean_text"],
    }

    print("\n=== PIPELINE OUTPUT ===")
    print(f"Whisper Language: {detection['whisper_language']} (conf={detection['whisper_confidence']:.4f})")
    print(f"Text Language: {detection['text_language']}")
    print(f"Final Language: {detection['final_language']} [{detection['decision_reason']}]")
    print("\nTranscript:\n")
    print(summary["transcript"])

    if files is not None:
        log_step("Downloading transcript file")
        files.download(str(transcript_path))

    return summary


if __name__ == "__main__":
    # In Colab, run: run_pipeline(model_name="medium")
    print("Import this module and run run_pipeline(model_name='medium').")
