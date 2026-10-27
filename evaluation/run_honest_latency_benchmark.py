"""
Honest Latency Benchmark for ScholarShield Pre- and Post-Processing.
Evaluates 100 genuinely unique, distinct STEM and educational sentences:
- 67 unique segments from a real mathematics video lecture (segments_cache.json)
- 25 unique STEM formula sentences across Calculus, Physics, Chemistry, and CS
- 8 unique sentences from foundational NCERT curriculum topics

Zero loop repetition. Every row is an independent, distinct sentence.
Logs per-row masking time, unmasking time, token counts, and total CPU latency to CSV.
"""

import time
import json
import sys
from pathlib import Path
import pandas as pd

workspace_dir = Path(__file__).resolve().parent.parent
backend_dir = workspace_dir / "Backend"
sys.path.insert(0, str(workspace_dir))
sys.path.insert(0, str(backend_dir))

from Backend.app.services.scholar_shield import ScholarShield
from scripts.strictly_authentic_benchmark import FORMULA_DATASET_25

def main():
    print("=" * 70)
    print("RUNNING AUTHENTIC LATENCY BENCHMARK ON 100 GENUINELY DISTINCT SENTENCES")
    print("=" * 70)

    shield = ScholarShield()

    # 1. 67 distinct segments from real lecture
    cache_path = workspace_dir / "_unplaced" / "temp_test" / "segments_cache.json"
    with open(cache_path, "r", encoding="utf-8") as f:
        lecture_segs = [s["text"].strip() for s in json.load(f)]

    # 2. 25 distinct formula sentences
    formula_sents = [s[0].strip() for s in FORMULA_DATASET_25]

    # 3. 8 distinct NCERT STEM sentences
    extra_sents = [
        "Mendel proposed the law of segregation based on monohybrid cross experiments.",
        "The atomic number of an element equals the total number of protons in its nucleus.",
        "Superconductors exhibit zero electrical resistance below a critical transition temperature.",
        "A database transaction must satisfy the ACID properties: atomicity, consistency, isolation, and durability.",
        "Enzymes act as biological catalysts by significantly lowering the activation energy.",
        "The Doppler effect describes the frequency shift of waves emitted by a moving source.",
        "In object-oriented programming, polymorphism enables a single interface to represent different underlying forms.",
        "Avogadro constant defines the number of constituent particles per mole of substance."
    ]

    all_sents = lecture_segs + formula_sents + extra_sents

    # Deduplicate while preserving order
    seen = set()
    unique_100 = []
    for s in all_sents:
        if s and s not in seen:
            seen.add(s)
            unique_100.append(s)

    unique_100 = unique_100[:100]
    print(f"Verified count of unique, distinct sentences: {len(unique_100)}")

    records = []
    for i, s in enumerate(unique_100):
        # Time Pre-Processing (Masking against 4,065 NCERT terms & math regex)
        t0 = time.perf_counter()
        mapping = {}
        masked, mapping, _ = shield.shield_text(s, domain="STEM", mapping=mapping, counter=0)
        t_mask = (time.perf_counter() - t0) * 1000.0 # ms

        # Time Post-Processing (Unmasking and placeholder restoration)
        t1 = time.perf_counter()
        restored = shield.unshield_text(masked, mapping)
        t_unmask = (time.perf_counter() - t1) * 1000.0 # ms

        t_total = t_mask + t_unmask

        records.append({
            "Sentence_ID": i + 1,
            "Input_Length_Chars": len(s),
            "Tokens_Masked_Count": len(mapping),
            "Masking_Time_ms": round(t_mask, 4),
            "Unmasking_Time_ms": round(t_unmask, 4),
            "Total_PrePost_Latency_ms": round(t_total, 4),
            "Input_Sentence": s,
            "Masked_Sentence": masked,
            "Restored_Sentence": restored
        })

    df = pd.DataFrame(records)
    out_csv = workspace_dir / "paper_assets" / "benchmark_scholarshield_latency_100sents.csv"
    df.to_csv(out_csv, index=False, encoding="utf-8")

    mean_tot = df["Total_PrePost_Latency_ms"].mean()
    median_tot = df["Total_PrePost_Latency_ms"].median()
    min_tot = df["Total_PrePost_Latency_ms"].min()
    max_tot = df["Total_PrePost_Latency_ms"].max()
    std_tot = df["Total_PrePost_Latency_ms"].std()
    mean_mask = df["Masking_Time_ms"].mean()
    mean_unmask = df["Unmasking_Time_ms"].mean()

    print("\n--- BENCHMARK SUMMARY (N = 100 DISTINCT SENTENCES) ---")
    print(f"Mean Pre/Post Latency: {mean_tot:.4f} ms")
    print(f"Median Latency:        {median_tot:.4f} ms")
    print(f"Min Latency:           {min_tot:.4f} ms")
    print(f"Max Latency:           {max_tot:.4f} ms")
    print(f"Standard Deviation:    {std_tot:.4f} ms")
    print(f"Mean Masking Time:     {mean_mask:.4f} ms")
    print(f"Mean Unmasking Time:   {mean_unmask:.4f} ms")
    print(f"Saved raw per-row CSV to: {out_csv}")

if __name__ == "__main__":
    main()
