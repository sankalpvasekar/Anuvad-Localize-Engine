import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch

fig, ax = plt.subplots(figsize=(14, 10))
ax.set_xlim(0, 14)
ax.set_ylim(0, 10)
ax.axis('off')
fig.patch.set_facecolor('#f9f9fb')

# ── Layer Definitions (bottom to top) ─────────────────────────────────────────
layers = [
    {
        "title":    "Layer 5: Persistence & Data Layer",
        "color":    "#d32f2f",
        "light":    "#ffebee",
        "icon":     "[DB]",
        "tools":    ["MongoDB", "File Storage"],
        "desc":     "Stores user data, transcripts, project states and all multimedia output files.",
        "y":        0.3,
    },
    {
        "title":    "Layer 4: Multimedia Processing Unit",
        "color":    "#e65100",
        "light":    "#fff3e0",
        "icon":     "[AV]",
        "tools":    ["FFmpeg Extract", "afftdn Denoise", "atempo Sync", "OTT Mux"],
        "desc":     "Extracts audio, removes noise, synchronizes timing, generates multi-language video output.",
        "y":        2.2,
    },
    {
        "title":    "Layer 3: Neural Execution Layer",
        "color":    "#6a1b9a",
        "light":    "#f3e5f5",
        "icon":     "[AI]",
        "tools":    ["Whisper large-v3", "SBERT + RAG", "ScholarShield", "IndicTrans2", "IBM Granite 3.0", "MMS-TTS"],
        "desc":     "Transcription, domain classification, context retrieval, translation, refinement and speech synthesis.",
        "y":        4.1,
    },
    {
        "title":    "Layer 2: API & Orchestration Layer",
        "color":    "#1565c0",
        "light":    "#e3f2fd",
        "icon":     "[API]",
        "tools":    ["FastAPI", "asyncio", "Task Scheduler", "MongoDB Driver"],
        "desc":     "Manages complete workflow, executes tasks asynchronously, coordinates all AI services.",
        "y":        6.3,
    },
    {
        "title":    "Layer 1: User Interface Layer",
        "color":    "#1b5e20",
        "light":    "#e8f5e9",
        "icon":     "[UI]",
        "tools":    ["React.js (Vite)", "Axios Polling", "Video Upload UI", "Language Selector"],
        "desc":     "Handles video upload, target language selection and real-time progress tracking.",
        "y":        8.2,
    },
]

# ── Draw Each Layer ────────────────────────────────────────────────────────────
for layer in layers:
    y      = layer["y"]
    color  = layer["color"]
    light  = layer["light"]

    # Main layer background
    bg = FancyBboxPatch((0.3, y), 13.4, 1.7,
                        boxstyle="round,pad=0.12",
                        fc=light, ec=color, lw=2.2, zorder=2)
    ax.add_patch(bg)

    # Left colored accent bar
    bar = FancyBboxPatch((0.3, y), 0.55, 1.7,
                         boxstyle="round,pad=0.0",
                         fc=color, ec=color, lw=0, zorder=3)
    ax.add_patch(bar)

    # Icon + Title
    ax.text(1.05, y + 1.35, layer["icon"] + "  " + layer["title"],
            fontsize=10.5, fontweight='bold', color=color,
            va='center', ha='left', zorder=4)

    # Description
    ax.text(1.05, y + 1.02, layer["desc"],
            fontsize=8.2, color='#333333', va='center', ha='left',
            style='italic', zorder=4, wrap=True)

    # Tool chips
    chip_x = 1.05
    chip_y = y + 0.42
    for tool in layer["tools"]:
        chip_w = len(tool) * 0.115 + 0.35
        chip = FancyBboxPatch((chip_x, chip_y - 0.18), chip_w, 0.38,
                              boxstyle="round,pad=0.05",
                              fc=color, ec=color, lw=0, alpha=0.88, zorder=4)
        ax.add_patch(chip)
        ax.text(chip_x + chip_w / 2, chip_y + 0.01, tool,
                fontsize=7.8, color='white', fontweight='bold',
                ha='center', va='center', zorder=5)
        chip_x += chip_w + 0.22

# ── Connecting Arrows between layers ──────────────────────────────────────────
arrow_x = 7.0
for y_start, y_end, label in [
    (2.02, 1.98, ""),
    (4.02, 3.98, ""),
    (6.12, 6.08, ""),
    (8.05, 8.02, ""),
]:
    ax.annotate('', xy=(arrow_x, y_end), xytext=(arrow_x, y_start),
                arrowprops=dict(arrowstyle='<->', color='#666688', lw=1.8), zorder=6)

# ── Title ─────────────────────────────────────────────────────────────────────
ax.text(7.0, 9.8, "Anuvad: Neural Localization Engine",
        ha='center', va='center', fontsize=16, fontweight='bold', color='#1a1a2e')
ax.text(7.0, 9.55, "Five-Layer System Architecture",
        ha='center', va='center', fontsize=10, color='#555577', style='italic')

# Divider
ax.plot([0.5, 13.5], [9.42, 9.42], color='#ccccdd', lw=1.2)

plt.tight_layout(pad=0.3)
out = r'd:\Localize Engine\Backend\system_architecture_layers.png'
plt.savefig(out, dpi=200, bbox_inches='tight', facecolor='#f9f9fb')
print(f"Saved: {out}")
