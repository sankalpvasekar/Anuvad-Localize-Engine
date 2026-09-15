import os
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if sys.stderr.encoding != 'utf-8':
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import json
import time
import shutil
import asyncio
from pathlib import Path
import soundfile as sf
import numpy as np

# Ensure Backend is in Python path
workspace_dir = Path("d:/Anuvad/Localize Engine1/Localize Engine").resolve()
backend_dir = workspace_dir / "Backend"
sys.path.insert(0, str(backend_dir))
os.chdir(str(backend_dir))

from app.ffmpeg_utils import configure_ffmpeg_path
from app.services.sarvam_translate import sarvam_translate
from app.services.sarvam_tts import sarvam_tts
from app.services.dubbing_service import dubbing_service

INPUT_DIR = workspace_dir / "ipop"
INPUT_VIDEO = INPUT_DIR / "BASIC Math Calculus – Understand Simple Calculus with just Basic Math in 5 minutes!.mp4"
OUTPUT_VIDEO = INPUT_DIR / "BASIC_Math_Calculus_Dubbed_HI_MR.mp4"
EXTRACTED_AUDIO = backend_dir / "static/audio/e96afd06-609e-4c95-89a0-b9520e6595b9.wav"
SEGMENTS_CACHE = INPUT_DIR / "segments_cache.json"

async def preflight_verification():
    """Step 1: Check whether text really converts to audible speech using the new Sarvam API key."""
    print("=" * 60)
    print("STEP 1: PRE-FLIGHT VERIFICATION — TESTING SARVAM AI API KEY")
    print("=" * 60)

    test_samples = [
        ("hi", "यह सर्वम एआई का प्रत्यक्ष परीक्षण है। ध्वनि स्पष्ट रूप से सुनाई दे रही है।", "shubh"),
        ("mr", "हे सर्वम एआय चे प्रत्यक्ष चाचणी आहे. आवाज स्पष्टपणे ऐकू येत आहे.", "shubh"),
    ]

    for lang, sample_text, speaker in test_samples:
        print(f"\n[Testing {lang.upper()} Male Voice ('{speaker}')]")
        print(f"  Input Text: {sample_text}")
        t0 = time.time()
        wav_path, dur = await sarvam_tts.synthesize(sample_text, lang, gender="male")
        elapsed = time.time() - t0

        data, sr = sf.read(wav_path)
        max_amp = float(np.max(np.abs(data)))
        rms_amp = float(np.sqrt(np.mean(data**2)))
        non_zero = int(np.count_nonzero(data))

        print(f"  Generated File : {wav_path}")
        print(f"  Synthesis Time : {elapsed:.2f}s")
        print(f"  Sample Rate    : {sr} Hz")
        print(f"  Duration       : {dur:.2f}s ({len(data)} samples)")
        print(f"  Peak Amplitude : {max_amp:.4f} (Max possible: 1.0)")
        print(f"  RMS Amplitude  : {rms_amp:.4f} (Sound energy)")
        print(f"  Non-zero count : {non_zero} of {len(data)} samples")

        if max_amp > 0.1 and non_zero > 0:
            print(f"  VERIFICATION RESULT: ✅ PASS — Real audible speech generated! NOT silence!")
        else:
            print(f"  VERIFICATION RESULT: ❌ FAIL — Pure silence detected!")
            raise RuntimeError(f"Sarvam TTS failed to generate audible audio for {lang}")

    print("\n" + "=" * 60)
    print("✅ PRE-FLIGHT VERIFICATION COMPLETE: SARVAM API KEY FULLY FUNCTIONAL")
    print("=" * 60 + "\n")


async def get_or_extract_segments():
    """Get whisper segments from cache or transcribe from audio."""
    if SEGMENTS_CACHE.exists():
        print(f"[CACHE] Loading segments from {SEGMENTS_CACHE}")
        with open(SEGMENTS_CACHE, "r", encoding="utf-8") as f:
            return json.load(f)

    print("\n--- Transcribing audio with Whisper to extract sentence segments ---")
    import whisper
    model = whisper.load_model("base", device="cpu")
    transcription_result = model.transcribe(
        str(EXTRACTED_AUDIO),
        language="en",
        task="transcribe",
        fp16=False,
        temperature=(0.0, 0.2),
        best_of=2,
        beam_size=2,
        condition_on_previous_text=False
    )
    raw_segments = transcription_result.get("segments", [])
    grouped = dubbing_service._group_segments_by_sentence(raw_segments)
    print(f"Extracted {len(grouped)} sentence blocks.")

    # Cache segments
    clean_grouped = [
        {"id": i, "start": s["start"], "end": s["end"], "text": s["text"].strip()}
        for i, s in enumerate(grouped)
    ]
    with open(SEGMENTS_CACHE, "w", encoding="utf-8") as f:
        json.dump(clean_grouped, f, indent=2, ensure_ascii=False)
    print(f"Saved segments to {SEGMENTS_CACHE}")
    return clean_grouped


async def generate_dubbed_track(segments, lang, lang_name):
    """Translate and synthesize all segments into a full timeline track."""
    print(f"\n{'='*60}")
    print(f"GENERATING FULL {lang_name.upper()} NEURAL DUB (SARVAM AI MALE)")
    print(f"{'='*60}")

    output_track = INPUT_DIR / f"{lang}_dubbed_male.wav"

    # Step A: Translation
    print(f"[1/3] Translating {len(segments)} segments into {lang_name} via Sarvam Translate...")
    raw_texts = [s["text"] for s in segments]
    translated_texts = await sarvam_translate.translate_batch(
        raw_texts, target_lang=lang, source_lang="en", concurrency=2
    )
    print(f"  Translated {len(translated_texts)} segments successfully.")
    for idx in range(min(3, len(translated_texts))):
        print(f"  - [{segments[idx]['start']:.1f}s -> {segments[idx]['end']:.1f}s] {raw_texts[idx][:40]}... -> {translated_texts[idx][:40]}...")

    # Step B: Voice Synthesis with Sarvam TTS
    print(f"\n[2/3] Synthesizing speech via Sarvam TTS (male voice 'shubh', {lang})...")
    seg_info = []
    total_segments = len(segments)

    for i, (seg, trans_text) in enumerate(zip(segments, translated_texts)):
        if not trans_text.strip():
            continue
        start = float(seg["start"])
        end = float(seg["end"])

        path, dur = await sarvam_tts.synthesize(trans_text, lang, gender="male")
        seg_info.append({
            "path": path,
            "start": start,
            "end": end,
            "duration": dur,
        })
        if (i + 1) % 10 == 0 or (i + 1) == total_segments:
            print(f"  Progress: {i + 1}/{total_segments} segments synthesized...")

    # Step C: Timeline Audio Alignment
    total_duration = float(segments[-1]["end"]) if segments else 499.36
    print(f"\n[3/3] Aligning {len(seg_info)} audio segments into full track: {output_track}...")
    success = await dubbing_service._merge_segments_to_final_track(
        seg_info, str(output_track), total_duration
    )
    if not success or not output_track.exists():
        raise RuntimeError(f"Failed to merge {lang_name} audio track!")

    data, sr = sf.read(str(output_track))
    max_amp = float(np.max(np.abs(data)))
    rms_amp = float(np.sqrt(np.mean(data**2)))
    non_zero = int(np.count_nonzero(data))

    print(f"\n✅ {lang_name.upper()} TRACK COMPLETE: {output_track}")
    print(f"   Duration       : {len(data)/sr:.2f}s")
    print(f"   Sample Rate    : {sr} Hz")
    print(f"   Peak Amplitude : {max_amp:.4f} (audible: {max_amp > 0.1})")
    print(f"   RMS Amplitude  : {rms_amp:.4f}")
    print(f"   Non-zero Samples: {non_zero:,} of {len(data):,}")

    return str(output_track)


def mux_video_with_audio_tracks(video_path, hi_audio, mr_audio, output_path):
    """Mux the original video with Hindi and Marathi audio tracks using FFmpeg."""
    print(f"\n{'='*60}")
    print("STEP 3: MUXING MULTI-TRACK VIDEO WITH FFMPEG")
    print(f"{'='*60}")
    import subprocess

    configure_ffmpeg_path()
    ffmpeg_exe = str(workspace_dir / "ffmpeg/ffmpeg.exe")

    cmd = [
        ffmpeg_exe, "-y",
        "-i", str(video_path),
        "-i", str(mr_audio),
        "-i", str(hi_audio),
        # Map video from input 0
        "-map", "0:v:0",
        # Map original English audio from input 0
        "-map", "0:a:0",
        "-metadata:s:a:0", "language=eng",
        "-metadata:s:a:0", "title=Original Audio (English)",
        # Map Marathi dubbed audio from input 1
        "-map", "1:a:0",
        "-metadata:s:a:1", "language=mar",
        "-metadata:s:a:1", "title=Marathi Neural Dub (Sarvam AI Male)",
        # Map Hindi dubbed audio from input 2
        "-map", "2:a:0",
        "-metadata:s:a:2", "language=hin",
        "-metadata:s:a:2", "title=Hindi Neural Dub (Sarvam AI Male)",
        # Video copy, Audio AAC 256k
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "256k",
        "-ac", "2",
        str(output_path),
    ]

    print(f"Running command:\n{' '.join(cmd)}\n")
    subprocess.run(cmd, check=True)

    if not output_path.exists():
        raise RuntimeError(f"Output video was not created: {output_path}")

    file_size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"✅ MULTI-TRACK VIDEO SUCCESSFULLY CREATED!")
    print(f"   Location: {output_path}")
    print(f"   Size    : {file_size_mb:.2f} MB")


def inspect_final_video(video_path):
    """Inspect the generated video using FFprobe to verify all streams."""
    print(f"\n{'='*60}")
    print("STEP 4: FINAL VIDEO INSPECTION WITH FFPROBE")
    print(f"{'='*60}")
    import subprocess

    ffprobe_exe = str(workspace_dir / "ffmpeg/ffprobe.exe")
    cmd = [
        ffprobe_exe, "-v", "error",
        "-print_format", "json",
        "-show_streams",
        "-show_format",
        str(video_path),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    data = json.loads(res.stdout)

    print(f"File Duration: {float(data.get('format', {}).get('duration', 0)):.2f}s")
    for s in data.get("streams", []):
        stype = s.get("codec_type")
        idx = s.get("index")
        cname = s.get("codec_name")
        tags = s.get("tags", {})
        lang = tags.get("language", "und")
        title = tags.get("title", "Untitled")
        channels = s.get("channels", "")
        sr = s.get("sample_rate", "")
        br = s.get("bit_rate", "N/A")
        print(f"  Stream #{idx} [{stype.upper()}]: codec={cname}, lang={lang}, title='{title}', {channels}ch, {sr}Hz, {br}bps")


async def main():
    print(f"Processing in folder: {INPUT_DIR}")
    print(f"Input Video: {INPUT_VIDEO}")
    print(f"Output Video: {OUTPUT_VIDEO}")

    # 1. Pre-flight check: Verify text actually converts to speech with new key
    await preflight_verification()

    # 2. Extract or get sentence segments
    segments = await get_or_extract_segments()

    # 3. Generate Marathi Dubbed Track
    mr_track = await generate_dubbed_track(segments, "mr", "Marathi")

    # 4. Generate Hindi Dubbed Track
    hi_track = await generate_dubbed_track(segments, "hi", "Hindi")

    # 5. Mux with original video into ipop folder
    mux_video_with_audio_tracks(INPUT_VIDEO, hi_track, mr_track, OUTPUT_VIDEO)

    # 6. Inspect final video with ffprobe
    inspect_final_video(OUTPUT_VIDEO)

    print("\n" + "=" * 60)
    print("🎉 ALL TASKS EXECUTED SUCCESSFULLY!")
    print(f"Your new dubbed video is saved at:\n{OUTPUT_VIDEO}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
