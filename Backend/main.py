from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List
import json
import os
import contextlib
import tempfile
from engine import ScholarShield, NeuralSyncEngine

translator_engine = None

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    global translator_engine
    try:
        # Load the models once using FastAPI's Lifespan event for optimized latency.
        translator_engine = NeuralSyncEngine(model_name="ai4bharat/indictrans2-en-indic-1B")
        print("Neural-Sync Engine successfully loaded into VRAM.")
    except Exception as e:
        print(f"Failed to load model during startup: {e}")
    yield
    translator_engine = None

app = FastAPI(title="ScholarFlow Neural-Sync Translation Engine", lifespan=lifespan)

@app.post("/upload-transcript")
async def upload_transcript(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    target_lang: str = Form("mar_Deva")
):
    if not translator_engine:
        raise HTTPException(status_code=503, detail="Translation engine not active. Check startup logs.")

    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are supported.")
        
    try:
        contents = await file.read()
        segments = json.loads(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format. Engine requires a list of dicts. Error: {str(e)}")
        
    # 1. Universal Symbol Shielding
    masked_texts = []
    mappings = []
    shields = []
    for seg in segments:
        shield = ScholarShield() # Reset counter per segment for stability
        text = seg.get("text", "")
        masked_txt, mapping = shield.shield_text(text)
        masked_texts.append(masked_txt)
        mappings.append(mapping)
        shields.append(shield)
        
    # 2. Neural Map Translations (Batch size 4 recommended by specifications)
    try:
        translated_texts = translator_engine.translate_batch(
            texts=masked_texts, 
            src_lang="eng_Latn", 
            tgt_lang=target_lang, 
            batch_size=4
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Neural Translation Failed: {str(e)}")
        
    # 3. Temporal Mapping & Reconstruction
    translated_segments = []
    for idx, seg in enumerate(segments):
        # Re-attaching the translated & unmasked strings back to their original segment context (1:1 synced)
        final_text = shields[idx].unshield_text(translated_texts[idx], mappings[idx])
        
        reconstructed_seg = {
            "start": seg.get("start"),
            "end": seg.get("end"),
            "text": final_text
        }
        translated_segments.append(reconstructed_seg)
        
    # Write to a temporary file to return as a download
    fd, temp_file_path = tempfile.mkstemp(suffix=".json")
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as tmp:
            json.dump(translated_segments, tmp, ensure_ascii=False, indent=2)
    except Exception as e:
        os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to create result file: {str(e)}")
        
    # Add cleanup to background tasks
    background_tasks.add_task(os.remove, temp_file_path)
    
    return FileResponse(
        path=temp_file_path, 
        filename=f"translated_{file.filename}", 
        media_type="application/json"
    )
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
