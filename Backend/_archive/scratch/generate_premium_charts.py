import json
import matplotlib.pyplot as plt
import numpy as np
import os

# Load the comparative data
data_path = r'd:\Localize Engine\Backend\ieee_comparative_results.json'
with open(data_path, 'r') as f:
    data = json.load(f)

languages = list(data['baseline'].keys())
lang_names = [data['baseline'][l]['name'] for l in languages]

baseline_bleu = [data['baseline'][l]['bleu'] for l in languages]
anuvad_bleu = [data['anuvad'][l]['bleu'] for l in languages]

baseline_wer = [data['baseline'][l]['wer'] for l in languages]
anuvad_wer = [data['anuvad'][l]['wer'] for l in languages]

# Setting up the figure with two subplots (BLEU and WER)
plt.style.use('seaborn-v0_8-pastel') # Modern clean style
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 12))
fig.patch.set_facecolor('#f8f9fa')

x = np.arange(len(lang_names))
width = 0.35

# Color Palette
color_baseline = '#1a73e8' # Google Blue
color_anuvad = '#34a853'   # Google Green

# --- BLEU CHART (Higher is better) ---
rects1 = ax1.bar(x - width/2, baseline_bleu, width, label='Baseline (IndicTrans2)', color=color_baseline, alpha=0.8, edgecolor='white', linewidth=1)
rects2 = ax1.bar(x + width/2, anuvad_bleu, width, label='Full Anuvad Engine', color=color_anuvad, alpha=0.9, edgecolor='white', linewidth=1)

ax1.set_ylabel('BLEU Score (Higher is Better)', fontsize=12, fontweight='bold')
ax1.set_title('Translation Quality: Baseline vs Anuvad (BLEU)', fontsize=16, pad=20, fontweight='bold')
ax1.set_xticks(x)
ax1.set_xticklabels(lang_names, fontsize=11)
ax1.legend(frameon=True, facecolor='white', shadow=True)
ax1.grid(axis='y', linestyle='--', alpha=0.7)

# Add value labels
def autolabel(rects, ax):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.1f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3), 
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold')

autolabel(rects1, ax1)
autolabel(rects2, ax1)

# --- WER CHART (Lower is better) ---
rects3 = ax2.bar(x - width/2, baseline_wer, width, label='Baseline (IndicTrans2)', color='#d93025', alpha=0.7, edgecolor='white', linewidth=1) # Red-ish
rects4 = ax2.bar(x + width/2, anuvad_wer, width, label='Full Anuvad Engine', color='#f9ab00', alpha=0.9, edgecolor='white', linewidth=1) # Yellow-ish

ax2.set_ylabel('Word Error Rate % (Lower is Better)', fontsize=12, fontweight='bold')
ax2.set_title('Error Rate Analysis: Baseline vs Anuvad (WER)', fontsize=16, pad=20, fontweight='bold')
ax2.set_xticks(x)
ax2.set_xticklabels(lang_names, fontsize=11)
ax2.legend(frameon=True, facecolor='white', shadow=True)
ax2.grid(axis='y', linestyle='--', alpha=0.7)

autolabel(rects3, ax2)
autolabel(rects4, ax2)

plt.tight_layout(pad=4.0)

# Save the plot
output_path = r'd:\Localize Engine\Backend\ieee_comparative_chart.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"Chart generated successfully at {output_path}")
