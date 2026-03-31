"""
Optimized Transcription Service
================================
Mirrors the Colab multimedia_pipeline.py logic for speed + accuracy:

1. Language detection on the FIRST 30-second clip only (fast spectral probe).
2. Short probe transcription (best_of=1, beam_size=3) for text-based fallback.
3. Final transcription with confirmed language (best_of=3, beam_size=5).
4. All CPU-bound work runs in a thread pool via run_in_executor.
5. Deterministic langdetect (seed=0).
"""

from __future__ import annotations

import os
import time
import uuid
import logging
import asyncio
from functools import partial
from typing import Any, Dict, Tuple

import numpy as np
import whisper
from bson import ObjectId
from langdetect import DetectorFactory, LangDetectException, detect

from app.utils.audio_utils import extract_audio
from app.models.response_model import TranscriptionResponse
from app.core.config import get_whisper_model
from app.core.database import db_manager

# Deterministic langdetect (matches Colab seed=0)
DetectorFactory.seed = 0

logger = logging.getLogger("transcription-service")

SUPPORTED_LANGUAGES = {"hi", "mr", "gu", "ta", "te", "kn", "en"}


# ---------------------------------------------------------------------------
# Helpers (pure, synchronous — safe to run in thread pool)
# ---------------------------------------------------------------------------

def _safe_text_language(sample_text: str) -> str | None:
    """Return langdetect result or None if text is too short / detection fails."""
    cleaned = sample_text.strip()
    if len(cleaned) < 10:
        return None
    try:
        return detect(cleaned)
    except LangDetectException:
        return None


def _detect_language(audio_path: str, model: whisper.Whisper) -> Dict[str, Any]:
    """
    Detect source language using the user's robust two-pass method.
    1. Spectral Whisper probabilities.
    2. Full auto-detect transcription to extract a text sample.
    3. langdetect on the text sample.
    4. Combined decision for the most accurate language.
    """
    # Step 1: 30-second clip for fast spectral probabilities
    audio = whisper.load_audio(audio_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    mel_batched = mel.unsqueeze(0)

    _, probs_raw = model.detect_language(mel_batched)

    if isinstance(probs_raw, list) and len(probs_raw) > 0 and isinstance(probs_raw[0], dict):
        probs: Dict[str, float] = probs_raw[0]
    elif isinstance(probs_raw, list):
        probs = {lang: float(p) for lang, p in probs_raw}
    else:
        probs = probs_raw

    whisper_lang = max(probs, key=probs.get)
    whisper_conf = float(probs.get(whisper_lang, 0.0))
    logger.info(f"Whisper spectral: lang={whisper_lang} conf={whisper_conf:.4f}")

    # Step 2: Fast first-pass auto-detect transcription on the 30s padded chunk
    logger.info("Running 30s fast-pass auto-detect transcription for text sample...")
    result = model.transcribe(
        audio, 
        task="transcribe",
        temperature=0.0,
        condition_on_previous_text=False
    )
    text_sample = str(result.get("text", ""))[:500]

    # Step 3: Text-based langdetect
    try:
        text_lang = detect(text_sample)
    except:
        text_lang = "unknown"
    logger.info(f"Text-based lang: {text_lang}")

    # Step 4: Final Language Decision
    def final_language_decision(w_lang, t_lang, p):
        if p.get(w_lang, 0) > 0.6 and w_lang in SUPPORTED_LANGUAGES:
            return w_lang
        if t_lang in SUPPORTED_LANGUAGES:
            return t_lang
        return w_lang

    final_lang = final_language_decision(whisper_lang, text_lang, probs)
    logger.info(f"✅ FINAL DETECTED LANGUAGE: {final_lang}")

    return {
        "final_language": final_lang,
        "whisper_language": whisper_lang,
        "whisper_confidence": whisper_conf,
        "text_language": text_lang,
        "decision": "two_pass_robust",
    }


def _transcribe_audio(audio_path: str, language: str, model: whisper.Whisper) -> Dict[str, Any]:
    """
    Final full transcription constrained to the exact detected language,
    optimized for speed without losing core text accuracy.
    """
    result = model.transcribe(
        audio_path,
        language=language,
        task="transcribe",
        fp16=(str(model.device) != "cpu"),
        temperature=(0.0, 0.2),
        best_of=2,
        beam_size=2,
        condition_on_previous_text=False
    )
    # Clean up transcript (strip blank lines)
    raw = str(result.get("text", ""))
    clean = "\n".join(line.strip() for line in raw.splitlines() if line.strip())
    result["clean_text"] = clean
    return result


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------

class TranscriptionService:
    def __init__(self):
        self.model = get_whisper_model()
        logger.info(
            f"TranscriptionService ready — device={self.model.device}"
        )

    async def transcribe_video(
        self, video_path: str, project_id: str | None = None
    ) -> TranscriptionResponse:
        """
        Full pipeline (mirrors Colab run_pipeline):
          1. FFmpeg audio extraction
          2. Language detection (spectral + optional cheap probe)
          3. Full transcription with confirmed language
          4. DB progress updates at each stage
        """
        start_time = time.monotonic()
        projects_col = db_manager.get_projects_collection()
        loop = asyncio.get_event_loop()

        # Prepare unique audio path
        audio_id = str(uuid.uuid4())
        audio_filename = f"{audio_id}.wav"
        static_audio_dir = os.path.join("static", "audio")
        os.makedirs(static_audio_dir, exist_ok=True)
        audio_path = os.path.join(static_audio_dir, audio_filename)
        audio_url = f"/static/audio/{audio_filename}"

        try:
            # ── Stage 1: Audio Extraction ──────────────────────────────
            logger.info(f"[{project_id}] Extracting audio → {audio_path}")
            await loop.run_in_executor(None, extract_audio, video_path, audio_path)

            if project_id:
                await projects_col.update_one(
                    {"_id": ObjectId(project_id)},
                    {"$set": {
                        "audio_url": audio_url,
                        "progress": 25,
                        "stage": "Language Detection",
                        "timeRemaining": "Detecting language...",
                    }},
                )

            # ── Stage 2: Language Detection ────────────────────────────
            logger.info(f"[{project_id}] Detecting language")
            detect_fn = partial(_detect_language, audio_path, self.model)
            detection = await loop.run_in_executor(None, detect_fn)

            final_lang = detection["final_language"]
            whisper_conf = detection["whisper_confidence"]
            logger.info(
                f"[{project_id}] Language detected: {final_lang} "
                f"(decision={detection['decision']}, conf={whisper_conf:.4f})"
            )

            if project_id:
                await projects_col.update_one(
                    {"_id": ObjectId(project_id)},
                    {"$set": {
                        "lang": final_lang,
                        "detected_language": final_lang,
                        "progress": 60,
                        "stage": "Neural Transcription",
                        "timeRemaining": "Transcribing...",
                    }},
                )

            # ── Stage 3: Full Transcription ────────────────────────────
            logger.info(f"[{project_id}] Transcribing with language={final_lang}")
            transcribe_fn = partial(_transcribe_audio, audio_path, final_lang, self.model)
            result = await loop.run_in_executor(None, transcribe_fn)

            transcript_text = result.get("clean_text", result.get("text", "")).strip()
            processing_time = time.monotonic() - start_time

            if project_id:
                await projects_col.update_one(
                    {"_id": ObjectId(project_id)},
                    {"$set": {
                        "transcript": transcript_text,
                        "status": "Completed",
                        "progress": 100,
                        "stage": "Finalized",
                        "timeRemaining": "0s",
                    }},
                )

            logger.info(
                f"[{project_id}] Done in {processing_time:.2f}s | "
                f"lang={final_lang} | chars={len(transcript_text)}"
            )

            return TranscriptionResponse(
                detected_language=final_lang,
                confidence=round(whisper_conf, 3),
                transcript=transcript_text,
                processing_time=round(processing_time, 2),
                audio_url=audio_url,
            )

        except Exception as e:
            logger.exception(f"[{project_id}] Pipeline failed: {e}")
            if project_id:
                await projects_col.update_one(
                    {"_id": ObjectId(project_id)},
                    {"$set": {
                        "status": "Failed",
                        "stage": f"Error: {str(e)[:120]}",
                        "progress": 0,
                    }},
                )
            if os.path.exists(audio_path):
                try:
                    os.remove(audio_path)
                except OSError:
                    pass
            raise


transcription_service = TranscriptionService()
