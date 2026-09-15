import os
import logging
import numpy as np
import librosa
import soundfile as sf
from sklearn.cluster import KMeans
from typing import List, Dict, Any, Optional

logger = logging.getLogger("speaker-service")

# Pitch thresholds for gender classification (in Hz)
# Indian languages speakers: Male ~85-180Hz, Female ~165-255Hz
MALE_PITCH_MAX = 175.0
FEMALE_PITCH_MIN = 175.0


class SpeakerService:
    def __init__(self):
        self.n_speakers_limit = 2
        self.profile_memory = {}

    def analyze_speakers(self, audio_path: str, segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes the original audio segments to identify unique speakers and their tone profiles.
        Adds 'speaker_id', 'gender', and 'tone_profile' to each segment.
        Returns a speaker_profiles dict mapping speaker_id -> {gender, pitch, voice_model_id}.
        """
        if not os.path.exists(audio_path) or not segments:
            return segments

        try:
            logger.info(f"Analyzing speakers for {len(segments)} segments...")
            y, sr = librosa.load(audio_path, sr=16000)

            features = []
            valid_indices = []

            for i, seg in enumerate(segments):
                start = seg.get("start", 0)
                end = seg.get("end", start + 1)

                start_sample = int(start * sr)
                end_sample = int(end * sr)
                chunk = y[start_sample:end_sample]

                if len(chunk) < 1600:
                    continue

                mfcc = librosa.feature.mfcc(y=chunk, sr=sr, n_mfcc=13)
                mfcc_mean = np.mean(mfcc, axis=1)

                pitches, magnitudes = librosa.piptrack(y=chunk, sr=sr)
                pitch = self._get_median_pitch(pitches, magnitudes)

                centroid = np.mean(librosa.feature.spectral_centroid(y=chunk, sr=sr))

                feat_vec = np.concatenate([mfcc_mean, [centroid / 1000.0]])
                features.append(feat_vec)
                valid_indices.append(i)

                segments[i]["raw_tone"] = {
                    "pitch": float(pitch),
                    "brightness": float(centroid),
                    "energy": float(np.sqrt(np.mean(chunk**2)))
                }

            if not features:
                return segments

            n_samples = len(features)
            n_clusters = 1
            if n_samples > 10:
                n_clusters = 2

            kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
            labels = kmeans.fit_predict(features)

            cluster_profiles = {}
            for label in range(n_clusters):
                cluster_indices = [valid_indices[i] for i, l in enumerate(labels) if l == label]
                if not cluster_indices:
                    continue

                avg_pitch = np.median([segments[idx]["raw_tone"]["pitch"] for idx in cluster_indices])
                avg_brightness = np.median([segments[idx]["raw_tone"]["brightness"] for idx in cluster_indices])
                avg_energy = np.median([segments[idx]["raw_tone"]["energy"] for idx in cluster_indices])

                gender = self._classify_gender(avg_pitch, avg_brightness, avg_energy)

                cluster_profiles[label] = {
                    "pitch": float(avg_pitch),
                    "brightness": float(avg_brightness),
                    "gender": gender,
                }

            for idx, label in zip(valid_indices, labels):
                segments[idx]["speaker_id"] = int(label)
                segments[idx]["gender"] = cluster_profiles[label]["gender"]
                segments[idx]["raw_tone"]["pitch"] = cluster_profiles[label]["pitch"]
                segments[idx]["raw_tone"]["brightness"] = cluster_profiles[label]["brightness"]

            logger.info(f"Identified {n_clusters} speaker(s): {cluster_profiles}")
            return segments

        except Exception as e:
            logger.error(f"Speaker analysis failed: {e}")
            return segments

    def get_speaker_profiles(self, segments: List[Dict[str, Any]]) -> Dict[int, Dict[str, str]]:
        """
        Build a mapping of speaker_id -> {gender} from analyzed segments.
        Used by dubbing_service to select gender-matched TTS voices.
        """
        profiles = {}
        for seg in segments:
            sid = seg.get("speaker_id", 0)
            if sid not in profiles:
                profiles[sid] = {
                    "gender": seg.get("gender", "unknown"),
                    "pitch": seg.get("raw_tone", {}).get("pitch", 150.0),
                }
        return profiles

    def _classify_gender(self, pitch: float, brightness: float, energy: float) -> str:
        """
        Classify speaker gender from acoustic features.
        Uses pitch as primary, brightness and energy as secondary discriminators.
        """
        score = 0.0

        # Primary: pitch
        if pitch < MALE_PITCH_MAX:
            score -= 1.0  # lean male
        else:
            score += 1.0  # lean female

        # Secondary: spectral brightness (male voices tend to be darker)
        if brightness > 2500:
            score += 0.3
        elif brightness < 1800:
            score -= 0.3

        # Secondary: energy (not decisive but helps in ambiguous cases)
        if energy > 0.05:
            score += 0.1

        gender = "female" if score > 0 else "male"
        logger.info(f"Gender classification: pitch={pitch:.1f}Hz, brightness={brightness:.1f}, gender={gender}")
        return gender

    def _get_median_pitch(self, pitches, magnitudes):
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        return np.median(pitch_values) if pitch_values else 150.0


speaker_service = SpeakerService()
