import logging
import asyncio
from typing import List, Dict, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger("sarvam-translate")

_SARVAM_TRANSLATE_URL = "https://api.sarvam.ai/translate"

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


class SarvamTranslate:
    """Wrapper for Sarvam AI Translation API (Mayura model)."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SarvamTranslate, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

    def _get_api_key(self) -> str:
        key = settings.sarvam_api_key
        if not key or key == "your_sarvam_api_key_here":
            raise RuntimeError(
                "SARVAM_API_KEY is not configured. Set it in Backend/.env"
            )
        return key

    async def translate_text(
        self,
        text: str,
        target_lang: str,
        source_lang: str = "en",
        mode: str = "formal",
    ) -> str:
        """
        Translate a single text string using Sarvam AI.
        """
        cleaned = text.strip()
        if not cleaned:
            return ""

        tgt_code = _LANG_MAP.get(target_lang.lower(), f"{target_lang}-IN")
        src_code = _LANG_MAP.get(source_lang.lower(), f"{source_lang}-IN")

        if tgt_code == src_code:
            return cleaned

        api_key = self._get_api_key()
        headers = {
            "api-subscription-key": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "input": cleaned,
            "source_language_code": src_code,
            "target_language_code": tgt_code,
            "mode": mode,
            "model": "mayura:v1",
        }

        retries = 4
        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(_SARVAM_TRANSLATE_URL, json=payload, headers=headers)
                    if resp.status_code == 429:
                        sleep_time = 1.5 * (attempt + 1)
                        logger.warning(f"Rate limited (429) on Sarvam translate, backing off {sleep_time:.1f}s...")
                        await asyncio.sleep(sleep_time)
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    translated = data.get("translated_text", "")
                    if translated:
                        return translated
            except Exception as e:
                logger.warning(
                    f"Sarvam translate attempt {attempt+1}/{retries} failed for '{cleaned[:30]}...': {e}"
                )
                if attempt < retries - 1:
                    await asyncio.sleep(1.0 * (attempt + 1))

        logger.error(f"Sarvam translate completely failed for '{cleaned[:40]}...', returning original.")
        return cleaned

    async def translate_batch(
        self,
        texts: List[str],
        target_lang: str,
        source_lang: str = "en",
        mode: str = "formal",
        concurrency: int = 2,
    ) -> List[str]:
        """
        Translate a list of text segments concurrently with a rate-safe semaphore limit.
        """
        if not texts:
            return []

        semaphore = asyncio.Semaphore(concurrency)

        async def _worker(idx: int, t: str):
            async with semaphore:
                res = await self.translate_text(t, target_lang, source_lang=source_lang, mode=mode)
                await asyncio.sleep(0.2)  # Pacing delay to respect API rate limits
                return idx, res

        tasks = [_worker(i, t) for i, t in enumerate(texts)]
        indexed_results = await asyncio.gather(*tasks)
        indexed_results.sort(key=lambda x: x[0])
        return [res for _, res in indexed_results]


sarvam_translate = SarvamTranslate()
