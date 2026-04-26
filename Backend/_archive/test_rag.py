import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from dotenv import load_dotenv
load_dotenv(".env")

from app.services.rag_service import rag_service
from engine import ScholarShield, NeuralSyncEngine

transcript = "Hello, today we will learn about x square and its applications."
context = "Educational STEM content focusing on algebra, quadratic equations, and variables like x^2."

try:
    print("Testing IBM Granite RAG Refinement...")
    
    # 1. RAG First
    refined = rag_service.refine_with_granite(transcript, context)
    print("REFINED RESULT USING GRANITE:")
    print(refined)
    
    print("\nAttempting to store refined text into Self-Knowledge FAISS Loop...")
    rag_service.store_transcript_context(refined)
    
    # 2. Shielding
    shield = ScholarShield()
    masked_text, shield_mapping = shield.shield_text(refined)
    print(f"Masked Text: {masked_text}")
    print(f"Shield Mapping: {shield_mapping}")
    
    # 3. Translation
    print("\nTesting IndicTrans2 Translation to Hindi...")
    translator = NeuralSyncEngine()
    raw_translated = translator.translate_batch([masked_text], src_lang="eng_Latn", tgt_lang="hin_Deva")[0]
    print(f"Raw Translation: {raw_translated}")
    
    # 4. Unshielding
    final_translated = shield.unshield_text(raw_translated, shield_mapping)
    print(f"Final Translated (Unshielded): {final_translated}")

except Exception as e:
    import traceback
    print("ERROR DURING TEST:")
    traceback.print_exc()
