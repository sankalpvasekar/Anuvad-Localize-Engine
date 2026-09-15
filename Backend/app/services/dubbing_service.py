import os
import re
import asyncio
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

import numpy as np
import soundfile as sf

from app.services.scholar_shield import NeuralSyncEngine, ScholarShield
from app.services.rag_service import rag_service
from app.services.sarvam_tts import sarvam_tts
from app.services.sarvam_translate import sarvam_translate
from app.ffmpeg_utils import configure_ffmpeg_path

logger = logging.getLogger("dubbing-service")


class DubbingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DubbingService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.output_dir = Path("static/dubbed_audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.translator = None
        self.shield = ScholarShield()
        configure_ffmpeg_path()

        self._initialized = True

    def _load_translator(self):
        if self.translator is None:
            logger.info("Loading IndicTrans2 Fallback Translator Engine...")
            self.translator = NeuralSyncEngine()

    async def translate_and_dub_parallel(
        self, segments: List[Dict[str, Any]], target_languages: List[str],
        audio_path: str = None,
        speaker_profiles: Optional[Dict[int, Dict[str, Any]]] = None,
        voice_gender: str = "male",
    ) -> Dict[str, Any]:
        """
        Translates and generates audio for multiple languages in parallel.
        Uses Sarvam AI API for both translation and TTS.
        """
        grouped_segments = self._group_segments_by_sentence(segments)
        logger.info(f"Grouped {len(segments)} segments into {len(grouped_segments)} sentence blocks.")

        loop = asyncio.get_event_loop()

        texts = [seg["text"] for seg in segments]
        source_blob = " ".join(texts)

        context = await loop.run_in_executor(None, rag_service.retrieve_context, source_blob)
        refined_source = await loop.run_in_executor(None, rag_service.refine_with_granite, source_blob, context)
        if not refined_source:
            refined_source = source_blob

        await loop.run_in_executor(None, rag_service.store_transcript_context, refined_source)

        masked_text, shield_mapping = getattr(self.shield, "shield_text")(refined_source)

        # Build speaker_id -> gender lookup
        speaker_gender_map = {}
        if speaker_profiles:
            for sid, profile in speaker_profiles.items():
                speaker_gender_map[sid] = profile.get("gender", "unknown")

        tasks = []
        for lang in target_languages:
            tasks.append(self._process_single_language(
                grouped_segments, lang, masked_text, shield_mapping,
                speaker_gender_map=speaker_gender_map,
                voice_gender=voice_gender,
            ))

        results = await asyncio.gather(*tasks)

        return {
            lang: res
            for lang, res in zip(target_languages, results)
            if res and res.get("audio_path")
        }

    def _clean_hallucinations(self, text: str) -> str:
        """Removes repetitive noise loops while preserving valid sentences."""
        if not text:
            return ""
        pattern = r"((?:एस|स|S|s)\.?\s*){5,}"
        cleaned = re.sub(pattern, " ", text, flags=re.IGNORECASE)
        cleaned = re.sub(r"(\b\w+\b\s*)\1{6,}", r"\1", cleaned, flags=re.IGNORECASE)
        return cleaned.strip()

    async def _process_single_language(
        self, segments: List[Dict[str, Any]], target_lang: str, masked_text: str,
        shield_mapping: dict, speaker_gender_map: Optional[Dict[int, str]] = None,
        voice_gender: str = "male",
    ) -> Optional[Dict[str, str]]:
        """Process translation and TTS for a single target language."""
        try:
            logger.info(f"Processing language: {target_lang}")

            # 1. Primary Translation via Sarvam AI API
            translated_texts = []
            try:
                raw_texts = [seg["text"] for seg in segments]
                logger.info(f"Translating {len(raw_texts)} segments with Sarvam AI ({target_lang})...")
                translated_texts = await sarvam_translate.translate_batch(
                    raw_texts, target_lang=target_lang, source_lang="en"
                )
            except Exception as e:
                logger.warning(f"Sarvam AI translation failed ({e}); attempting local fallback...")
                translated_texts = []

            # Fallback to local translation if Sarvam fails
            if not translated_texts or len(translated_texts) != len(segments):
                self._load_translator()
                it2_lang = "hin_Deva"
                lang_map = {
                    "hi": "hin_Deva", "mr": "mar_Deva", "gu": "guj_Gujr",
                    "ta": "tam_Taml", "te": "tel_Telu", "kn": "kan_Knda",
                    "bn": "ben_Beng", "ml": "mal_Mlym", "pa": "pan_Guru",
                    "or": "ory_Orya", "as": "asm_Beng",
                }
                if target_lang in lang_map:
                    it2_lang = lang_map[target_lang]

                masked_segments = []
                from app.services.sbert_service import domain_service
                project_domain = domain_service.detect_domain(" ".join([s["text"] for s in segments]))

                for seg in segments:
                    m_t, _ = getattr(self.shield, "shield_text")(seg["text"], domain=project_domain)
                    masked_segments.append(m_t)

                raw_translated_segments = await self.translator.translate_batch(
                    masked_segments, src_lang="eng_Latn", tgt_lang=it2_lang
                )

                translated_texts = []
                for raw_t in raw_translated_segments:
                    final_t = getattr(self.shield, "unshield_text")(raw_t, shield_mapping)
                    translated_texts.append(final_t)

            from indic_transliteration import sanscript
            transliteration_map = {
                "ta": sanscript.TAMIL, "gu": sanscript.GUJARATI,
                "te": sanscript.TELUGU, "kn": sanscript.KANNADA,
            }

            cleaned_texts = []
            for t in translated_texts:
                cleaned = self._clean_hallucinations(t)
                if target_lang in transliteration_map and len(cleaned) > 1:
                    try:
                        cleaned = sanscript.transliterate(
                            cleaned, sanscript.DEVANAGARI, transliteration_map[target_lang]
                        )
                    except Exception:
                        pass
                cleaned_texts.append(cleaned if len(cleaned) > 1 else "")

            full_translated_transcript = " ".join([t for t in cleaned_texts if t.strip()])

            # 2. TTS Generation via Sarvam AI API
            seg_info = []
            for idx, text in enumerate(cleaned_texts):
                if not text.strip():
                    continue
                start = segments[idx].get("start", 0.0)
                end = segments[idx].get("end", start + 2.0)

                # Determine gender for this segment
                speaker_id = segments[idx].get("speaker_id", 0)
                gender = voice_gender
                if speaker_gender_map and speaker_id in speaker_gender_map:
                    detected = speaker_gender_map[speaker_id]
                    if detected in ("male", "female"):
                        gender = detected

                audio_path, duration = await sarvam_tts.synthesize(text, target_lang, gender)
                seg_info.append({
                    "path": audio_path,
                    "start": start,
                    "end": end,
                    "duration": duration,
                })

            final_audio_path = self.output_dir / f"final_{target_lang}_{os.urandom(4).hex()}.wav"
            total_duration = segments[-1].get("end", 60.0) if segments else 60.0

            success = await self._merge_segments_to_final_track(seg_info, str(final_audio_path), total_duration)

            if success:
                logger.info(f"Completed dubbing for {target_lang}: {final_audio_path}")
                return {
                    "audio_path": str(final_audio_path),
                    "transcript": full_translated_transcript,
                }
            return None

        except Exception as e:
            logger.error(f"Failed to process language {target_lang}: {e}")
            return None

    async def _merge_segments_to_final_track(
        self, seg_info: List[Dict], output_path: str, total_duration: float
    ) -> bool:
        """
        High-precision audio alignment and mixing into full-length timeline.
        Uses pure numpy/soundfile overlay for exact timing and zero FFmpeg command-length bottlenecks.
        """
        configure_ffmpeg_path()
        sr = 22050
        total_samples = int((total_duration + 2.0) * sr)

        if not seg_info:
            silence = np.zeros(max(sr, total_samples), dtype=np.float32)
            sf.write(output_path, silence, sr)
            return True

        try:
            timeline = np.zeros(total_samples, dtype=np.float32)

            for seg in seg_info:
                path = seg.get("path")
                if not path or not os.path.exists(path):
                    continue

                data, seg_sr = sf.read(path)
                if seg_sr != sr:
                    import librosa
                    data = librosa.resample(data, orig_sr=seg_sr, target_sr=sr)

                if data.ndim > 1:
                    data = data.mean(axis=1)

                start_sec = float(seg.get("start", 0.0))
                target_dur = max(0.1, float(seg.get("end", start_sec + 2.0)) - start_sec)
                gen_dur = float(seg.get("duration", len(data) / sr))

                # Tempo adjustment if speech exceeds window by more than 20%
                if gen_dur > target_dur * 1.2 and gen_dur > 0.5:
                    tempo = min(1.8, gen_dur / target_dur)
                    try:
                        import librosa
                        data = librosa.effects.time_stretch(data, rate=tempo)
                    except Exception:
                        pass

                start_idx = int(start_sec * sr)
                end_idx = start_idx + len(data)

                if end_idx > len(timeline):
                    needed = end_idx - len(timeline)
                    timeline = np.pad(timeline, (0, needed))

                # Add smooth cross-fade at ends to prevent audio clicks
                fade_len = min(int(0.02 * sr), len(data) // 4)
                if fade_len > 0:
                    data[:fade_len] *= np.linspace(0, 1, fade_len)
                    data[-fade_len:] *= np.linspace(1, 0, fade_len)

                # Mix into master timeline
                timeline[start_idx:start_idx + len(data)] += data

            # Normalize volume and apply soft limiting to avoid clipping
            max_amp = np.max(np.abs(timeline))
            if max_amp > 0.95:
                timeline = timeline * (0.95 / max_amp)
            elif max_amp > 0.05 and max_amp < 0.6:
                timeline = timeline * (0.80 / max_amp)

            # Ensure file reaches at least total_duration
            min_samples = int(total_duration * sr)
            if len(timeline) < min_samples:
                timeline = np.pad(timeline, (0, min_samples - len(timeline)))
            else:
                timeline = timeline[:min_samples]

            sf.write(output_path, timeline, sr)
            logger.info(f"Successfully merged {len(seg_info)} segments to {output_path} ({len(timeline)/sr:.2f}s)")
            return True

        except Exception as e:
            logger.error(f"Failed to merge segments into timeline: {e}")
            return False

    def _group_segments_by_sentence(self, segments: List[Dict]) -> List[Dict]:
        """Merges chopped Whisper segments into complete sentence blocks for natural TTS flow."""
        grouped = []
        if not segments:
            return grouped

        current_group = segments[0].copy()

        for i in range(1, len(segments)):
            seg = segments[i]
            prev_text = current_group["text"].strip()
            is_consecutive = (seg["start"] - current_group["end"] < 0.5)
            is_fragment = not prev_text.endswith(('.', '?', '!', ':', ';'))

            if is_consecutive and is_fragment:
                current_group["text"] += " " + seg["text"]
                current_group["end"] = seg["end"]
            else:
                grouped.append(current_group)
                current_group = seg.copy()

        grouped.append(current_group)
        return grouped


dubbing_service = DubbingService()
