# Anuvad Evaluation & Benchmarking Suite

This folder contains the evaluation scripts, experimental result tables, and reference transcripts supporting the Anuvad Localize Engine publication.

## Contents
- `benchmark_evaluation.py`: Computes BLEU and WER against ground-truth reference translations.
- `comprehensive_benchmark.py`: Executes end-to-end multi-language test suites.
- `run_honest_latency_benchmark.py`: Measures execution time per pipeline stage (Transcription, RAG, Translation, TTS, Muxing).
- `run_local_tcr_benchmark.py`: Evaluates Transcription-Correction-Refinement (TCR) accuracy.
- `strictly_authentic_benchmark.py`: Tests mathematical and technical term preservation accuracy via ScholarShield.
- `results_summary.csv`: Summary table of BLEU, WER, and latency metrics across tested Indic languages.
- `reference_dataset.json`: Ground-truth source transcripts, RAG-refined transcripts, and professional human reference translations in Hindi and Marathi used for BLEU and WER benchmarking.

## Reproducibility
To run the evaluation benchmarks:
```bash
python benchmark_evaluation.py
python run_honest_latency_benchmark.py
python strictly_authentic_benchmark.py
```
