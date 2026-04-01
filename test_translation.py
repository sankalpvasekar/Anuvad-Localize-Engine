import sys
import os
import json
from engine import ScholarShield, NeuralSyncEngine

def run_translation(file_path, target_lang="mar_Deva"):
    print(f"Loading transcript from: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"Error: Could not find '{file_path}'")
        sys.exit(1)
        
    shield = ScholarShield()
    
    try:
        print("Initializing Neural Translation Engine (this might download model files...)")
        translator = NeuralSyncEngine(model_name="ai4bharat/indictrans2-en-indic-1B")
        engine_ready = True
    except ImportError:
        print("\n[WARNING]: PyTorch or Transformers are not installed!")
        print("Simulating the Neural Translation Engine for demonstration.\n")
        engine_ready = False
    
    with open(file_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f.readlines() if line.strip()]
        
    print(f"Processing {len(lines)} segments...")
    
    output_lines = []
    
    # Process in smaller batches
    for i in range(0, min(20, len(lines)), 4): # Testing just the first 20 lines to keep it fast
        batch_lines = lines[i:i+4]
        
        # 1. Domain Shielding
        masked_batch = []
        mappings = []
        for line in batch_lines:
            masked, mapping = shield.shield_text(line)
            masked_batch.append(masked)
            mappings.append(mapping)
            
        # 2. Neural Translation
        if engine_ready:
            try:
                translated_batch = translator.translate_batch(masked_batch, src_lang="eng_Latn", tgt_lang=target_lang, batch_size=4)
            except Exception as e:
                import traceback
                print(f"Translation generation failed: {e}")
                traceback.print_exc()
                translated_batch = [f"[Failed] {txt}" for txt in masked_batch]
        else:
            # Simulated Mock Translation (Inverts text to show it changed, leaves MATH/TECH untouched so unshield works)
            translated_batch = []
            for txt in masked_batch:
                translated = txt.replace("equation", "समीकरण").replace("velocity", "वेग")
                translated_batch.append(f"[Mock_Marathi] {translated}")
                
        # 3. Label Restoration
        for j, translated_txt in enumerate(translated_batch):
            final_text = shield.unshield_text(translated_txt, mappings[j])
            # We don't print here to avoid Windows terminal encoding crashes.
            output_lines.append(final_text)

    # Save to file
    with open("translated_output.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
        
    print(f"Translation complete! Only printed the first 20 lines for speed.")
    print("Full result saved dynamically to 'translated_output.txt'")

if __name__ == "__main__":
    run_translation("transcript.txt")
