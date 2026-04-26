import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

fig, ax = plt.subplots(1, 1, figsize=(10, 18))
ax.set_xlim(0, 10)
ax.set_ylim(0, 22)
ax.axis('off')
fig.patch.set_facecolor('white')

# ── Color Palette ──────────────────────────────────────────────────────────────
C_BOX     = '#dce3f9'   # lavender boxes
C_BORDER  = '#8a9ad4'   # box border
C_PIPE    = '#fffde7'   # yellow pipeline container
C_PIPE_B  = '#f0c040'   # pipeline border
C_OVAL    = '#dce3f9'
C_DB      = '#dce3f9'
C_TEXT    = '#1a1a2e'
C_ARROW   = '#444466'
C_LABEL   = '#555577'

def rounded_box(ax, x, y, w, h, label, sublabel=None,
                fc=C_BOX, ec=C_BORDER, fontsize=11, subfontsize=8.5):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle="round,pad=0.08", fc=fc, ec=ec, lw=1.8, zorder=3)
    ax.add_patch(box)
    dy = 0.12 if sublabel else 0
    ax.text(x, y + dy, label, ha='center', va='center',
            fontsize=fontsize, fontweight='bold', color=C_TEXT, zorder=4)
    if sublabel:
        ax.text(x, y - 0.28, sublabel, ha='center', va='center',
                fontsize=subfontsize, color='#444466', style='italic', zorder=4)

def oval(ax, x, y, w, h, label, fc=C_OVAL, ec=C_BORDER):
    ell = mpatches.Ellipse((x, y), w, h, fc=fc, ec=ec, lw=1.8, zorder=3)
    ax.add_patch(ell)
    ax.text(x, y, label, ha='center', va='center',
            fontsize=11, fontweight='bold', color=C_TEXT, zorder=4)

def cylinder(ax, x, y, w, h, label):
    rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle="round,pad=0.1", fc=C_BOX, ec=C_BORDER, lw=1.8, zorder=3)
    ax.add_patch(rect)
    ell_top = mpatches.Ellipse((x, y + h/2), w, 0.35,
                               fc='#c8d3f5', ec=C_BORDER, lw=1.5, zorder=4)
    ax.add_patch(ell_top)
    ax.text(x, y, label, ha='center', va='center',
            fontsize=11, fontweight='bold', color=C_TEXT, zorder=5)

def arrow(ax, x1, y1, x2, y2, label='', lx=None, ly=None):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.6), zorder=2)
    if label:
        lx = lx if lx else (x1 + x2) / 2 + 0.15
        ly = ly if ly else (y1 + y2) / 2
        ax.text(lx, ly, label, fontsize=8, color=C_LABEL, ha='left', va='center', zorder=5)

# ── Title ─────────────────────────────────────────────────────────────────────
ax.text(5, 21.4, 'Anuvad: Neural Localization Engine',
        ha='center', va='center', fontsize=15, fontweight='bold', color='#1a1a2e')
ax.text(5, 21.0, 'High-Level Modular System Architecture Flow',
        ha='center', va='center', fontsize=9, color='#555577', style='italic')

# ── 1. USER ───────────────────────────────────────────────────────────────────
oval(ax, 5, 20.0, 2.2, 0.7, 'User')

# Arrow: User → Interface (Upload Video)
arrow(ax, 4.0, 19.65, 4.0, 18.8, 'Upload Video', lx=2.3, ly=19.25)

# ── 2. INTERFACE ──────────────────────────────────────────────────────────────
rounded_box(ax, 5, 18.4, 4.0, 0.75, 'Interface (React.js Dashboard)',
            sublabel='Language Selection  |  Progress Tracking')

# Arrow: Interface → FastAPI
arrow(ax, 5, 18.02, 5, 17.2, 'POST /upload', lx=5.1, ly=17.62)

# ── 3. FastAPI SERVER ─────────────────────────────────────────────────────────
rounded_box(ax, 5, 16.8, 4.0, 0.72, 'FastAPI Server',
            sublabel='asyncio  |  Task Orchestration  |  REST Endpoints')

# Arrow: FastAPI → Pipeline
arrow(ax, 5, 16.44, 5, 15.65, 'Initialize Pipeline', lx=5.1, ly=16.05)

# ── 4. NEURAL PIPELINE CONTAINER ─────────────────────────────────────────────
pipeline_rect = FancyBboxPatch((1.0, 9.4), 8.0, 6.1,
                               boxstyle="round,pad=0.15",
                               fc=C_PIPE, ec=C_PIPE_B, lw=2.2, zorder=1)
ax.add_patch(pipeline_rect)
ax.text(5, 15.3, 'Neural Pipeline Orchestrator', ha='center', va='center',
        fontsize=10, fontweight='bold', color='#7a6000', zorder=2)

# Stage 1
rounded_box(ax, 5, 14.55, 5.5, 0.72,
            'Stage 1: Perception',
            sublabel='FFmpeg Audio Extraction  +  Whisper large-v3 Lang Detection')
arrow(ax, 5, 14.19, 5, 13.4, 'Transcribed Segments + Timestamps', lx=5.1, ly=13.8)

# Stage 2
rounded_box(ax, 5, 13.05, 5.5, 0.72,
            'Stage 2: Intelligence',
            sublabel='SBERT Domain Detection  +  RAG Context Retrieval  +  ScholarShield')
arrow(ax, 5, 12.69, 5, 11.9, 'Refined + Context-Enriched Source', lx=5.1, ly=12.3)

# Stage 3
rounded_box(ax, 5, 11.55, 5.5, 0.72,
            'Stage 3: Localization',
            sublabel='IndicTrans2 Translation  +  IBM Granite Refinement  +  Parallel TTS')
arrow(ax, 5, 11.19, 5, 10.4, 'Synchronized Audio Tracks', lx=5.1, ly=10.8)

# Stage 4
rounded_box(ax, 5, 10.05, 5.5, 0.72,
            'Stage 4: Finalization',
            sublabel='Neural Audio Sequencing  +  atempo Sync  +  Silence Padding')

# Arrow OUT of pipeline
arrow(ax, 5, 9.69, 5, 8.85, 'FFmpeg OTT Mux', lx=5.1, ly=9.27)

# ── 5. OUTPUT VIDEO ───────────────────────────────────────────────────────────
rounded_box(ax, 5, 8.45, 5.5, 0.72,
            'Localized Video.mp4 (Multi-Track Output)',
            sublabel='Original + Hindi + Marathi + Tamil ... (Switchable Audio Tracks)')

# Arrow to MongoDB
arrow(ax, 5, 8.09, 5, 7.28, 'Update Project Status', lx=5.1, ly=7.7)

# ── 6. MONGODB ────────────────────────────────────────────────────────────────
cylinder(ax, 5, 6.85, 4.0, 0.72, 'MongoDB')
ax.text(5, 6.35, 'User Data  |  Transcripts  |  Project States  |  File Paths',
        ha='center', va='center', fontsize=7.5, color='#555577', style='italic')

# ── RETURN ARROW: MongoDB → Interface (right side) ───────────────────────────
ax.annotate('', xy=(8.5, 18.4), xytext=(8.5, 6.85),
            arrowprops=dict(arrowstyle='->', color='#8a9ad4', lw=1.5,
                            connectionstyle='arc3,rad=0.0'), zorder=2)
ax.plot([8.5, 8.5], [6.85, 18.4], color='#8a9ad4', lw=1.5, zorder=2)
ax.text(9.0, 12.6, 'Stream\nProgress\nUpdates', ha='center', va='center',
        fontsize=8, color=C_LABEL, rotation=90)

# Return arrow: top of right side → User
arrow(ax, 8.5, 18.4, 6.2, 19.65, 'Localized Experience', lx=6.4, ly=19.3)

plt.tight_layout(pad=0.5)
out_path = r'd:\Localize Engine\Backend\system_architecture_flow.png'
plt.savefig(out_path, dpi=200, bbox_inches='tight', facecolor='white')
print(f"Saved: {out_path}")
