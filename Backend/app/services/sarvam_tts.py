import os
import base64
import logging
import asyncio
from pathlib import Path
from typing import Optional, Tuple

import httpx
import soundfile as sf
import numpy as np

from app.core.config import settings
from app.ffmpeg_utils import configure_ffmpeg_path
from app.utils.cache.cache_service import cache_manager

logger = logging.getLogger("sarvam-tts")

# Language code mapping: internal code -> Sarvam API code
_LANG_MAP = {
    "hi": "hi-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "pa": "pa-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "od": "od-IN",
    "or": "od-IN",
    "en": "en-IN",
}

# Speaker mapping by gender
_SPEAKER_MAP = {
    "male": "shubh",
    "female": "suhani",
}

_SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"


class SarvamTTS:
    """Wrapper for Sarvam AI text-to-speech API."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SarvamTTS, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        configure_ffmpeg_path()
        self._initialized = True

    def _get_api_key(self) -> str:
        key = settings.sarvam_api_key
        if not key or key == "your_sarvam_api_key_here":
            raise RuntimeError(
                "SARVAM_API_KEY is not configured. Set it in Backend/.env"
            )
        return key

    async def synthesize(
        self, text: str, lang: str, gender: str = "male",
    ) -> Tuple[str, float]:
        """
        Convert text to speech via Sarvam AI API, with caching.
        """
        # Check cache
        cached_result = cache_manager.get(text, lang, gender)
        if cached_result and os.path.exists(cached_result["path"]):
            logger.info(f"Returning cached audio for: {text[:20]}...")
            return cached_result["path"], cached_result["duration"]

        output_dir = Path("static/dubbed_audio")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"sarvam_{lang}_{os.urandom(4).hex()}.wav"

        cleaned_text = text.strip()
        if not cleaned_text:
            return self._create_silence(output_file, 0.5)

        api_lang = _LANG_MAP.get(lang.lower(), f"{lang}-IN")
        speaker = _SPEAKER_MAP.get(gender.lower(), "shubh")
        api_key = self._get_api_key()

        headers = {
            "api-subscription-key": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        # Handle long text (> 450 chars) by splitting into sentence parts if necessary
        chunks = self._chunk_text(cleaned_text, max_len=450)
        audio_segments = []

        for chunk in chunks:
            payload = {
                "text": chunk,
                "target_language_code": api_lang,
                "speaker": speaker,
                "model": "bulbul:v3",
                "speech_sample_rate": 22050,
            }

            retries = 3
            last_err = None
            for attempt in range(retries):
                try:
                    async with httpx.AsyncClient(timeout=45.0) as client:
                        resp = await client.post(_SARVAM_TTS_URL, json=payload, headers=headers)
                        if resp.status_code == 429:
                            sleep_time = 2.0 * (attempt + 1)
                            logger.warning(f"Rate limited (429) on Sarvam TTS, waiting {sleep_time:.1f}s...")
                            await asyncio.sleep(sleep_time)
                            continue
                        resp.raise_for_status()
                        data = resp.json()

                    audios = data.get("audios", [])
                    if not audios:
                        raise RuntimeError(f"Sarvam API returned no audio data: {data}")

                    # Decode base64 WAV directly
                    wav_bytes = base64.b64decode(audios[0])
                    audio_segments.append(wav_bytes)
                    break
                except httpx.HTTPStatusError as e:
                    last_err = e
                    logger.warning(
                        f"Sarvam API error (attempt {attempt+1}/{retries}): "
                        f"{e.response.status_code} {e.response.text[:200]}"
                    )
                    await asyncio.sleep(1.5 * (attempt + 1))
                except Exception as e:
                    last_err = e
                    logger.warning(f"Sarvam TTS attempt {attempt+1} failed: {e}")
                    await asyncio.sleep(1.5 * (attempt + 1))
            else:
                logger.error(f"Sarvam TTS failed for chunk '{chunk[:40]}...': {last_err}")

        if not audio_segments:
            logger.error(f"All Sarvam TTS attempts failed for text: {cleaned_text[:60]}")
            return self._create_silence(output_file, 1.0)

        # Concatenate audio segments and write out WAV
        if len(audio_segments) == 1:
            with open(output_file, "wb") as f:
                f.write(audio_segments[0])
        else:
            import io
            concatenated = []
            for b in audio_segments:
                d, sr = sf.read(io.BytesIO(b))
                concatenated.append(d)
            merged = np.concatenate(concatenated)
            sf.write(str(output_file), merged, 22050)

        duration = self._get_duration(str(output_file))
        logger.info(f"Sarvam TTS: {lang}/{speaker} -> {output_file} ({duration:.2f}s)")
        
        # Save to cache
        cache_manager.set((cleaned_text, lang, gender), {"path": str(output_file), "duration": duration})
        
        return str(output_file), duration

    def _chunk_text(self, text: str, max_len: int = 450) -> list[str]:
        """Split text into smaller chunks at sentence/clause boundaries if too long."""
        if len(text) <= max_len:
            return [text]

        import re
        parts = re.split(r'([।\.\?!,;:\n]+)', text)
        chunks = []
        cur = ""
        for i in range(0, len(parts), 2):
            piece = parts[i]
            delim = parts[i+1] if i+1 < len(parts) else ""
            combined = piece + delim
            if len(cur) + len(combined) <= max_len:
                cur += combined
            else:
                if cur.strip():
                    chunks.append(cur.strip())
                cur = combined
        if cur.strip():
            chunks.append(cur.strip())
        return chunks if chunks else [text]

    def _get_duration(self, path: str) -> float:
        try:
            info = sf.info(path)
            return float(info.duration)
        except Exception:
            return 1.0

    def _create_silence(self, output_file: Path, duration: float = 1.0) -> Tuple[str, float]:
        silence = np.zeros(int(22050 * max(0.2, duration)), dtype=np.float32)
        sf.write(str(output_file), silence, 22050)
        return str(output_file), duration


sarvam_tts = SarvamTTS()
