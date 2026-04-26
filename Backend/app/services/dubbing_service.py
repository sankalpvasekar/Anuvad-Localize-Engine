import os
import asyncio
import logging
import torch
import soundfile as sf
from typing import List, Dict, Any
from pathlib import Path
from engine import NeuralSyncEngine, ScholarShield
from app.services.rag_service import rag_service
from app.core.config import settings

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
            
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.output_dir = Path("static/dubbed_audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Models
        self.translator = None
        self.shield = ScholarShield()
        self.tts_model = None
        self.tts_tokenizer = None
        
        self._initialized = True

    def _load_translator(self):
        if self.translator is None:
            logger.info("Loading IndicTrans2 Translator Engine...")
            self.translator = NeuralSyncEngine()

    def _load_tts(self, lang: str = "hi"):
        """Dynamically load the appropriate TTS model for the target language."""
        lang_model_map = {
            "hi": "facebook/mms-tts-hin",
            "mr": "facebook/mms-tts-mar",
            "ta": "facebook/mms-tts-tam",
            "gu": "facebook/mms-tts-guj",
            "te": "facebook/mms-tts-tel",
            "kn": "facebook/mms-tts-kan"
        }
        model_id = lang_model_map.get(lang, "facebook/mms-tts-hin")
        
        # If model is already loaded and is the right one, skip
        if hasattr(self, '_current_model_id') and self._current_model_id == model_id and self.tts_model:
            return

        from transformers import VitsModel, AutoTokenizer
        logger.info(f"Loading/Switching TTS Model: {model_id}...")
        self.tts_tokenizer = AutoTokenizer.from_pretrained(model_id)
        self.tts_model = VitsModel.from_pretrained(model_id).to(self.device)
        self._current_model_id = model_id

    async def translate_and_dub_parallel(
        self, segments: List[Dict[str, Any]], target_languages: List[str]
    ) -> Dict[str, Any]:
        """
        Translates and generates audio for multiple languages in parallel.
        Returns: { lang_code: { "audio_path": str, "transcript": str } }
        """
        self._load_translator()
        
        loop = asyncio.get_event_loop()
        
        # 1. OPTIMIZATION: Extract texts and run RAG & Shielding ONLY ONCE for the original source!
        texts = [seg["text"] for seg in segments]
        source_blob = " ".join(texts)
        
        # Retrieval & Refinement (Contextual Intelligence)
        context = await loop.run_in_executor(None, rag_service.retrieve_context, source_blob)
        refined_source = await loop.run_in_executor(None, rag_service.refine_with_granite, source_blob, context)
        
        # Transcript-Driven Self-Knowledge Retrieval: Store for future context
        await loop.run_in_executor(None, rag_service.store_transcript_context, refined_source)
        
        # Shielding Math/STEM Phonics
        masked_text, shield_mapping = getattr(self.shield, "shield_text")(refined_source)
        
        # Parallel execution across languages
        tasks = []
        for lang in target_languages:
            tasks.append(self._process_single_language(segments, lang, masked_text, shield_mapping))
        
        results = await asyncio.gather(*tasks)
        
        # Map results back to language codes
        return {
            lang: res 
            for lang, res in zip(target_languages, results) 
            if res and res.get("audio_path")
        }

    def _clean_hallucinations(self, text: str) -> str:
        """Removes repetitive noise loops (e.g. S.S.S...) while preserving valid sentences."""
        if not text: return ""
        import re
        # Target: Multiple repetitions of the sibilant "एस" or "स" or "S"
        # We look for something like "एस. " repeating 5+ times
        pattern = r"((?:एस|स|S|s)\.?\s*){5,}"
        cleaned = re.sub(pattern, " ", text, flags=re.IGNORECASE)
        # Target: any word repeating more than 6 times consecutively
        cleaned = re.sub(r"(\b\w+\b\s*)\1{6,}", r"\1", cleaned, flags=re.IGNORECASE)
        return cleaned.strip()

    async def _process_single_language(self, segments: List[Dict[str, Any]], target_lang: str, masked_text: str, shield_mapping: dict) -> Dict[str, str]:
        """Process translation and TTS for a single target language."""
        try:
            logger.info(f"Processing language: {target_lang}")
            loop = asyncio.get_event_loop()
            
            # Map target_lang to IndicTrans2 language code format
            it2_lang = "hin_Deva" # Defaults to Hindi if map lacks it
            lang_map = {
                "hi": "hin_Deva", "mr": "mar_Deva", " gu": "guj_Gujr", 
                "ta": "tam_Taml", "te": "tel_Telu", "kn": "kan_Knda"
            }
            if target_lang in lang_map:
                it2_lang = lang_map[target_lang]
            
            # 1. RAG-Enhanced Translation
            # Step C: Translation (Optimized Phonics) - run in executor to prevent blocking
            from functools import partial
            translate_fn = partial(self.translator.translate_batch, [masked_text], src_lang="eng_Latn", tgt_lang=it2_lang)
            raw_translated_blob = await loop.run_in_executor(None, translate_fn)
            raw_translated_blob = raw_translated_blob[0]
            
            # Step D: Unshielding
            final_translated_blob = getattr(self.shield, "unshield_text")(raw_translated_blob, shield_mapping)
            
            # Split back into segments (approximate for dubbing)
            texts = [seg["text"] for seg in segments]
            translated_texts = [final_translated_blob] if len(texts) == 1 else final_translated_blob.split(". ")
            if len(translated_texts) < len(texts):
                translated_texts.extend([""] * (len(texts) - len(translated_texts)))
            translated_texts = translated_texts[:len(texts)]
            
            # Clean hallucinations from every translated segment
            cleaned_texts = []
            
            from indic_transliteration import sanscript
            transliteration_map = {
                "ta": sanscript.TAMIL,
                "gu": sanscript.GUJARATI,
                "te": sanscript.TELUGU,
                "kn": sanscript.KANNADA
            }
            
            for t in translated_texts:
                cleaned = self._clean_hallucinations(t)
                
                # Transliterate to native script if necessary so MMS TTS can read it
                if target_lang in transliteration_map and len(cleaned) > 1:
                    cleaned = sanscript.transliterate(cleaned, sanscript.DEVANAGARI, transliteration_map[target_lang])
                
                cleaned_texts.append(cleaned if len(cleaned) > 1 else "")
                
            # Combine into a full transcript string
            full_translated_transcript = " ".join([t for t in cleaned_texts if t.strip()])
            
            # 2. Sequential TTS for segments
            self._load_tts(target_lang)
            
            seg_info = []
            for idx, text in enumerate(cleaned_texts):
                if not text.strip():
                    continue
                start = segments[idx].get("start", 0)
                audio_path = await self._generate_tts(text, target_lang, f"seg_{idx}")
                seg_info.append({"path": audio_path, "start": start})
            
            # 3. Concatenate and align audio using FFmpeg
            final_audio_path = self.output_dir / f"final_{target_lang}_{os.urandom(4).hex()}.wav"
            duration = segments[-1].get("end", 60) if segments else 60
            
            success = await self._merge_segments_to_final_track(seg_info, str(final_audio_path), duration)
            
            if success:
                logger.info(f"Completed dubbing for {target_lang}")
                return {
                    "audio_path": str(final_audio_path),
                    "transcript": full_translated_transcript
                }
            return None
            
        except Exception as e:
            logger.error(f"Failed to process language {target_lang}: {e}")
            return None

    async def _generate_tts(self, text: str, lang: str, label: str) -> str:
        """Generates TTS for a single piece of text."""
        output_file = self.output_dir / f"{lang}_{label}.wav"
        try:
            if not text.strip():
                sf.write(str(output_file), np.zeros(8000), 16000)
                return str(output_file)

            from transformers import VitsModel, AutoTokenizer
            import torch
            import numpy as np

            inputs = self.tts_tokenizer(text, return_tensors="pt").to(self.device)
            with torch.no_grad():
                output = self.tts_model(**inputs).waveform

            wav_data = output.cpu().numpy().squeeze()
            target_sr = 22050
            if self.tts_model.config.sampling_rate != target_sr:
                import librosa
                wav_data = librosa.resample(wav_data, orig_sr=self.tts_model.config.sampling_rate, target_sr=target_sr)
            
            sf.write(str(output_file), wav_data, target_sr)
            return str(output_file)
        except Exception as e:
            logger.error(f"TTS generation failed for {label}: {e}")
            sf.write(str(output_file), np.zeros(8000), 16000)
            return str(output_file)

    async def _get_audio_duration(self, path: str) -> float:
        """Get the duration of an audio file using ffprobe."""
        import subprocess
        try:
            cmd = [
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return float(result.stdout.strip())
        except Exception as e:
            logger.error(f"Failed to probe duration for {path}: {e}")
            return 0.0

    async def _merge_segments_to_final_track(self, seg_info: List[Dict], output_path: str, total_duration: float) -> bool:
        """Align multiple audio segments to their timestamps with SERIAL concatenation (Zero Overlap)."""
        import subprocess
        import os
        
        if not seg_info:
            cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=22050:cl=mono", "-t", str(total_duration), output_path]
            subprocess.run(cmd, check=True, capture_output=True)
            return True

        try:
            inputs = []
            filter_chains = []
            concat_inputs = []
            last_end_time = 0.0
            
            for i, seg in enumerate(seg_info):
                if not seg["path"] or not os.path.exists(seg["path"]):
                    continue
                
                inputs.append("-i")
                inputs.append(seg["path"])
                input_idx = len(inputs) // 2 - 1 
                
                start_time = seg["start"]
                next_start = seg_info[i+1]["start"] if i < len(seg_info)-1 else total_duration
                allowed_window = max(0.1, next_start - start_time)
                
                gen_dur = await self._get_audio_duration(seg["path"])
                scale = gen_dur / allowed_window
                tempo = 1.0 / scale
                tempo = max(0.7, min(1.7, tempo))
                
                # 1. Add silence from last_end_time to this start_time
                silence_dur = max(0, start_time - last_end_time)
                if silence_dur > 0.001:
                    sil_label = f"sil{i}"
                    filter_chains.append(f"anullsrc=r=22050:cl=mono:d={silence_dur:.3f}[{sil_label}]")
                    concat_inputs.append(f"[{sil_label}]")
                
                # 2. Add the stretched segment
                seg_label = f"v{i}"
                filter_chains.append(f"[{input_idx}:a]atempo={tempo:.2f},volume=3.5[{seg_label}]")
                concat_inputs.append(f"[{seg_label}]")
                
                last_end_time = start_time + (gen_dur / tempo)
            
            # Final silence padding
            remaining = total_duration - last_end_time
            if remaining > 0.001:
                 fin_sil = "finsil"
                 filter_chains.append(f"anullsrc=r=22050:cl=mono:d={remaining:.3f}[{fin_sil}]")
                 concat_inputs.append(f"[{fin_sil}]")

            # Final concat
            concat_str = f"{''.join(concat_inputs)}concat=n={len(concat_inputs)}:v=0:a=1[out]"
            full_filter = f"{';'.join(filter_chains)};{concat_str}"

            command = ["ffmpeg", "-y"] + inputs + ["-filter_complex", full_filter, "-map", "[out]", "-c:a", "pcm_s16le", output_path]
            
            logger.info(f"Running Serial Sequencer: {' '.join(command)}")
            subprocess.run(command, check=True, capture_output=True, text=True)
            return True
        except Exception as e:
            logger.error(f"Failed to merge audio segments (Serial): {e}")
            if hasattr(e, 'stderr'):
                logger.error(f"FFmpeg stderr: {e.stderr}")
            return False

dubbing_service = DubbingService()
