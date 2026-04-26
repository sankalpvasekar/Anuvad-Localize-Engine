import os
import sys
import torch
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Setup paths
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

def verify_neural_engine():
    print("\n--- DIAGNOSTIC: ANALYZING NEURAL ENGINE & RAG SERVICE ---")
    
    # 1. Environment Check
    token = os.getenv("HF_TOKEN")
    if not token:
        print("❌ ERROR: HF_TOKEN not found in .env file.")
    else:
        print(f"✅ HF_TOKEN detected: {token[:5]}...{token[-4:]}")

    # 2. RAG SERVICE CHECK (IBM Granite)
    print("\nAttempting to load RAG Service (IBM Granite)...")
    try:
        from app.services.rag_service import rag_service
        # Initialize indexing first
        rag_service.auto_index_knowledge_base()
        # Force load LLM
        rag_service._load_llm_model()
        
        if rag_service.llm_model == "FAILED":
            print("❌ FAILURE: IBM Granite failed to load.")
            print(f"EXACT REASON:\n{getattr(rag_service, 'llm_load_err', 'No detailed error captured.')}")
        else:
            print("✅ SUCCESS: IBM Granite loaded correctly on CPU.")
            
            # Simple inference test
            print("Running test refinement...")
            refined = rag_service.refine_with_granite("In Java, a constructor is a method.", "Constructors initialize objects.")
            print(f"Refinement Result: {refined[:100]}...")
            
    except Exception as e:
        import traceback
        print(f"❌ CRITICAL EXCEPTION during RAG loading:\n{e}")
        print(traceback.format_exc())

    # 3. NEURAL SYNC ENGINE CHECK (IndicTrans2)
    print("\nAttempting to load Neural Sync Engine (IndicTrans2)...")
    try:
        from engine import NeuralSyncEngine
        engine = NeuralSyncEngine()
        print("✅ SUCCESS: IndicTrans2 loaded correctly.")
        
        # Simple translation test
        print("Running test translation...")
        translated = engine.translate_batch(["Hello world"], "eng_Latn", "hin_Deva")[0]
        print(f"Translation Result: {translated}")
        
    except Exception as e:
        import traceback
        print(f"❌ CRITICAL EXCEPTION during IndicTrans2 loading:\n{e}")
        print(traceback.format_exc())

    print("\n--- DIAGNOSTIC COMPLETE ---")

if __name__ == "__main__":
    verify_neural_engine()
