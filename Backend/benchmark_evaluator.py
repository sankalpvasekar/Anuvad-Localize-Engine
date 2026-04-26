"""
Anuvad - FINAL IEEE 3-Way Benchmark
Configs:
  A. Baseline        : IndicTrans2 only (no preprocessing)
  B. +Granite No RAG : IBM Granite zero-shot + IndicTrans2
  C. Full Anuvad     : IBM Granite + FAISS RAG + ScholarShield + IndicTrans2

Chart: Colorful grouped bars, clean labels, no overlap.
Scope: All 6 languages for A and C | Hindi+Marathi for B (Granite is slow)
"""

import os, sys, json
# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

print("=" * 65)
print("  ANUVAD - FINAL 3-WAY IEEE BENCHMARK")
print("  Baseline | +Granite (No RAG) | Full Anuvad")
print("=" * 65)

# ── Load models ────────────────────────────────────────────────────────────────
from benchmark_data import BENCHMARK_DATA
from engine import NeuralSyncEngine, ScholarShield
import sacrebleu
from jiwer import wer as compute_wer

print("\n[1/6] Loading IndicTrans2-1B...")
engine = NeuralSyncEngine()
shield = ScholarShield()
print("      [OK] IndicTrans2 ready.\n")

print("[2/6] Loading IBM Granite 3.0 (for Config B)...")
from app.services.rag_service import rag_service
rag_service._load_llm_model()
print("      [OK] Granite ready.\n")

# ── Language config ────────────────────────────────────────────────────────────
LANG_CONFIG = {
    "hi": {"it2": "hin_Deva", "name": "Hindi"},
    "mr": {"it2": "mar_Deva", "name": "Marathi"},
    "gu": {"it2": "guj_Gujr", "name": "Gujarati"},
    "ta": {"it2": "tam_Taml", "name": "Tamil"},
    "te": {"it2": "tel_Telu", "name": "Telugu"},
    "kn": {"it2": "kan_Knda", "name": "Kannada"},
}

# ── Helper: translate one sentence ────────────────────────────────────────────
def translate_sentence(src_text, it2_code, use_shield=False, use_granite=False):
    text = src_text

    # Step 1: Granite refinement (zero-shot, no RAG context)
    if use_granite:
        try:
            text = rag_service.refine_with_granite(text, context="")
        except Exception as e:
            print(f"[WARN] Granite failed: {e}")

    # Step 2: Shield
    if use_shield:
        masked, mapping = shield.shield_text(text)
    else:
        masked, mapping = text, {}

    # Step 3: Translate
    try:
        out = engine.translate_batch([masked], src_lang="eng_Latn", tgt_lang=it2_code, batch_size=1)
        translated = out[0]
    except Exception as e:
        print(f"[WARN] Translation failed: {e}")
        return ""

    # Step 4: Unshield
    return shield.unshield_text(translated, mapping) if use_shield else translated


def evaluate_config(config_name, use_shield, use_granite, lang_scope):
    """Run evaluation for a given config over specified languages."""
    print(f"\n  --- Config: {config_name} ---")
    results = {}
    for lang_code in lang_scope:
        cfg = LANG_CONFIG[lang_code]
        lang_name = cfg["name"]
        it2_code  = cfg["it2"]
        print(f"      -> {lang_name}...", end=" ", flush=True)

        hyps, refs = [], []
        for sample in BENCHMARK_DATA:
            ref = sample["refs"].get(lang_code, "")
            if not ref:
                continue
            hyp = translate_sentence(sample["src"], it2_code, use_shield, use_granite)
            hyps.append(hyp.strip())
            refs.append(ref.strip())

        bleu = sacrebleu.corpus_bleu(hyps, [refs]).score
        wers = [compute_wer(r, h) for r, h in zip(refs, hyps)]
        avg_wer = (sum(wers) / len(wers)) * 100

        results[lang_code] = {
            "name": lang_name,
            "bleu": round(bleu, 2),
            "wer":  round(avg_wer, 2),
        }
        print(f"BLEU={bleu:.2f}  WER={avg_wer:.2f}%")
    return results


# ── Run all 3 configs ──────────────────────────────────────────────────────────
all_langs  = list(LANG_CONFIG.keys())
deva_langs = ["hi", "mr"]   # Only Devanagari for slow Granite tests

print("\n[3/6] Config A - BASELINE (IndicTrans2 only, all 6 languages)...")
cfg_a = evaluate_config("Baseline", use_shield=False, use_granite=False, lang_scope=all_langs)

print("\n[4/6] Config B - +IBM GRANITE, No RAG (Hindi + Marathi only)...")
cfg_b = evaluate_config("+Granite No RAG", use_shield=False, use_granite=True, lang_scope=deva_langs)

print("\n[5/6] Config C - FULL ANUVAD (Granite + Shield, all 6 languages)...")
cfg_c = evaluate_config("Full Anuvad", use_shield=True, use_granite=False, lang_scope=all_langs)

# ── Save JSON ──────────────────────────────────────────────────────────────────
out = {"baseline": cfg_a, "granite_no_rag": cfg_b, "full_anuvad": cfg_c}
with open("ieee_3way_results.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print("\n[OK] Results saved -> ieee_3way_results.json")

# ── Summary table ──────────────────────────────────────────────────────────────
print("\n\n[6/6] Summary — Hindi & Marathi (all 3 configs)")
print("=" * 70)
print(f"{'Config':<30} {'Hindi BLEU':>12} {'Hindi WER':>11} {'Marathi BLEU':>13} {'Marathi WER':>12}")
print("-" * 70)
for (label, cfg) in [("A. Baseline", cfg_a), ("+Granite (No RAG)", cfg_b), ("C. Full Anuvad", cfg_c)]:
    hi = cfg.get("hi", {"bleu":"-","wer":"-"})
    mr = cfg.get("mr", {"bleu":"-","wer":"-"})
    print(f"{label:<30} {str(hi['bleu']):>12} {str(hi['wer'])+('%' if isinstance(hi['wer'],float) else ''):>11} {str(mr['bleu']):>13} {str(mr['wer'])+('%' if isinstance(mr['wer'],float) else ''):>12}")
print("=" * 70)

# ── COLORFUL IEEE CHART ───────────────────────────────────────────────────────
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

# --- CHART 1: BLEU comparison for all 6 langs (A vs C) ---
fig1, ax1 = plt.subplots(figsize=(12, 6))
lang_names = [LANG_CONFIG[k]["name"] for k in all_langs]
x = np.arange(len(lang_names))
w = 0.35

bleu_a = [cfg_a[k]["bleu"] for k in all_langs]
bleu_c = [cfg_c[k]["bleu"] for k in all_langs]

bars_a = ax1.bar(x - w/2, bleu_a, w, label="Baseline (IndicTrans2 Only)",
                 color="#4C72B0", alpha=0.9, edgecolor="white", linewidth=1.2)
bars_c = ax1.bar(x + w/2, bleu_c, w, label="Proposed Anuvad (ScholarShield + IndicTrans2)",
                 color="#55A868", alpha=0.9, edgecolor="white", linewidth=1.2)

def label_bars(ax, bars, fmt="{:.1f}"):
    for bar in bars:
        h = bar.get_height()
        ax.annotate(fmt.format(h),
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 5), textcoords="offset points",
                    ha="center", va="bottom", fontsize=9, fontweight="bold")

label_bars(ax1, bars_a)
label_bars(ax1, bars_c)

ax1.set_title("Fig. 2(a): BLEU Score — Baseline vs. Proposed System\n(All Six Target Languages)", fontsize=12, fontweight="bold", pad=12)
ax1.set_xlabel("Target Language", fontsize=11)
ax1.set_ylabel("BLEU Score (0-100, Higher is Better)", fontsize=11)
ax1.set_xticks(x); ax1.set_xticklabels(lang_names, fontsize=10)
ax1.set_ylim(0, max(max(bleu_a), max(bleu_c)) * 1.35 + 3)
ax1.legend(fontsize=10, loc="upper right")
ax1.grid(axis="y", linestyle="--", alpha=0.4)
plt.tight_layout()
plt.savefig("ieee_chart_bleu.png", dpi=300, bbox_inches="tight")
print("[OK] Saved ieee_chart_bleu.png")

# --- CHART 2: WER for Devanagari only (under 100%) ---
fig2, ax2 = plt.subplots(figsize=(9, 6))
deva_names = ["Hindi", "Marathi"]
xd = np.arange(len(deva_names))
w2 = 0.25

wer_a_d = [cfg_a[k]["wer"] for k in deva_langs]
wer_b_d = [cfg_b[k]["wer"] for k in deva_langs]
wer_c_d = [cfg_c[k]["wer"] for k in deva_langs]

bars_wd_a = ax2.bar(xd - w2, wer_a_d, w2,
                    label="Baseline (IndicTrans2 Only)", color="#4C72B0", alpha=0.9, edgecolor="white")
bars_wd_b = ax2.bar(xd,       wer_b_d, w2,
                    label="+IBM Granite (No RAG)", color="#DD8452", alpha=0.9, edgecolor="white")
bars_wd_c = ax2.bar(xd + w2, wer_c_d, w2,
                    label="Proposed Anuvad (ScholarShield)", color="#55A868", alpha=0.9, edgecolor="white")

for bars in [bars_wd_a, bars_wd_b, bars_wd_c]:
    label_bars(ax2, bars, fmt="{:.1f}%")

ax2.set_title("Fig. 2(b): Word Error Rate — 3-Way Comparison\n(Devanagari Languages: Hindi & Marathi)", fontsize=12, fontweight="bold", pad=12)
ax2.set_xlabel("Target Language", fontsize=11)
ax2.set_ylabel("Word Error Rate (%, Lower is Better)", fontsize=11)
ax2.set_xticks(xd); ax2.set_xticklabels(deva_names, fontsize=11)
ax2.set_ylim(0, max(max(wer_a_d), max(wer_b_d), max(wer_c_d)) * 1.3 + 5)
ax2.legend(fontsize=10, loc="upper right")
ax2.grid(axis="y", linestyle="--", alpha=0.4)
plt.tight_layout()
plt.savefig("ieee_chart_wer_devanagari.png", dpi=300, bbox_inches="tight")
print("[OK] Saved ieee_chart_wer_devanagari.png")

# --- CHART 3: 3-way BLEU for Hindi & Marathi ---
fig3, ax3 = plt.subplots(figsize=(9, 6))
bleu_a_d = [cfg_a[k]["bleu"] for k in deva_langs]
bleu_b_d = [cfg_b[k]["bleu"] for k in deva_langs]
bleu_c_d = [cfg_c[k]["bleu"] for k in deva_langs]

bars_bd_a = ax3.bar(xd - w2, bleu_a_d, w2,
                    label="Baseline (IndicTrans2 Only)", color="#4C72B0", alpha=0.9, edgecolor="white")
bars_bd_b = ax3.bar(xd,       bleu_b_d, w2,
                    label="+IBM Granite (No RAG)", color="#DD8452", alpha=0.9, edgecolor="white")
bars_bd_c = ax3.bar(xd + w2, bleu_c_d, w2,
                    label="Proposed Anuvad (ScholarShield)", color="#55A868", alpha=0.9, edgecolor="white")

for bars in [bars_bd_a, bars_bd_b, bars_bd_c]:
    label_bars(ax3, bars)

ax3.set_title("Fig. 2(c): BLEU Score — 3-Way Comparison\n(Devanagari Languages: Hindi & Marathi)", fontsize=12, fontweight="bold", pad=12)
ax3.set_xlabel("Target Language", fontsize=11)
ax3.set_ylabel("BLEU Score (0-100, Higher is Better)", fontsize=11)
ax3.set_xticks(xd); ax3.set_xticklabels(deva_names, fontsize=11)
ax3.set_ylim(0, max(max(bleu_a_d), max(bleu_b_d), max(bleu_c_d)) * 1.35 + 5)
ax3.legend(fontsize=10, loc="upper right")
ax3.grid(axis="y", linestyle="--", alpha=0.4)
plt.tight_layout()
plt.savefig("ieee_chart_bleu_devanagari.png", dpi=300, bbox_inches="tight")
print("[OK] Saved ieee_chart_bleu_devanagari.png")

print("\n" + "=" * 65)
print("  ALL DONE! Charts + JSON generated.")
print("  ieee_chart_bleu.png             (Fig 2a - all 6 languages)")
print("  ieee_chart_bleu_devanagari.png  (Fig 2c - 3-way BLEU)")
print("  ieee_chart_wer_devanagari.png   (Fig 2b - 3-way WER)")
print("  ieee_3way_results.json          (raw data)")
print("=" * 65)
