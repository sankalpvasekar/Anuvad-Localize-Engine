import os
import sys
import gc

# Memory & Environment Optimization
os.environ['TRANSFORMERS_NO_TENSORFLOW'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_DATASETS_OFFLINE'] = '1'

# UTF-8 for terminal display
import io
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')

# Ensure we can import local modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from benchmark_data import BENCHMARK_DATA
from engine import NeuralSyncEngine, ScholarShield
from app.services.rag_service import rag_service
from indic_transliteration import sanscript
import sacrebleu

def transliterate_if_needed(text: str, target_lang: str) -> str:
    transliteration_map = {
        "ta": sanscript.TAMIL, "gu": sanscript.GUJARATI, "te": sanscript.TELUGU, "kn": sanscript.KANNADA
    }
    if target_lang in transliteration_map:
        return sanscript.transliterate(text, sanscript.DEVANAGARI, transliteration_map[target_lang])
    return text

def run_sequential_evaluation():
    print("\n" + "="*80)
    print(" ANUVAD RESEARCH EVALUATION: SEQUENTIAL MEMORY OPTIMIZED")
    print("="*80)
    
    eval_subset = BENCHMARK_DATA[:3]
    target_languages = ["hi", "mr", "ta", "gu", "te", "kn"]
    it2_lang_map = {"hi": "hin_Deva", "mr": "mar_Deva", "ta": "tam_Taml", "gu": "guj_Gujr", "te": "tel_Telu", "kn": "kan_Knda"}
    
    # ---------------------------------------------------------
    # STAGE 1: RAG REFINEMENT (IBM GRANITE)
    # ---------------------------------------------------------
    print("\n[STAGE 1/2] Loading IBM Granite for Contextual Refinement...")
    shield = ScholarShield()
    rag_service.auto_index_knowledge_base()
    
    refined_corpus = []
    for i, item in enumerate(eval_subset):
        source_text = item['src']
        print(f"  -> Refining Sentence {i+1}...")
        masked, mapping = shield.shield_text(source_text)
        context = rag_service.retrieve_context(source_text)
        refined_source = rag_service.refine_with_granite(masked, context)
        refined_corpus.append({"refined": refined_source, "mapping": mapping, "original": source_text, "refs": item['refs']})

    # CRITICAL: Wipe Granite from RAM to make room for Translation
    print("\n[CLEANUP] Purging Granite from memory...")
    del rag_service.llm_model
    rag_service.llm_model = None
    gc.collect() 

    # ---------------------------------------------------------
    # STAGE 2: TRANSLATION (INDIC TRANS 2)
    # ---------------------------------------------------------
    print("\n[STAGE 2/2] Loading IndicTrans2 Neural Engine...")
    engine = NeuralSyncEngine()
    results_matrix = {lang: {"baseline": [], "anuvad": [], "refs": []} for lang in target_languages}

    for i, data in enumerate(refined_corpus):
        print(f"  -> Translating Sentence {i+1} across {len(target_languages)} languages...")
        for lang in target_languages:
            # Baseline (Original Text)
            raw_translation = engine.translate_batch([data["original"]], "eng_Latn", it2_lang_map[lang])[0]
            results_matrix[lang]["baseline"].append(transliterate_if_needed(raw_translation, lang))
            
            # Anuvad (Refined + Unshielded)
            trans_masked = engine.translate_batch([data["refined"]], "eng_Latn", it2_lang_map[lang])[0]
            unshielded = shield.unshield_text(trans_masked, data["mapping"])
            results_matrix[lang]["anuvad"].append(transliterate_if_needed(unshielded, lang))
            
            # Refs
            results_matrix[lang]["refs"].append(data["refs"][lang])

    # ---------------------------------------------------------
    # STAGE 3: RESULTS
    # ---------------------------------------------------------
    print("\n" + "="*80)
    print(f"{'LANGUAGE':<15} | {'BASELINE BLEU':<15} | {'ANUVAD BLEU':<15} | {'GAP':<10}")
    print("-" * 80)
    for lang in target_languages:
        b_bleu = sacrebleu.corpus_bleu(results_matrix[lang]["baseline"], [results_matrix[lang]["refs"]]).score
        a_bleu = sacrebleu.corpus_bleu(results_matrix[lang]["anuvad"], [results_matrix[lang]["refs"]]).score
        print(f"{lang.upper():<15} | {b_bleu:<15.2f} | {a_bleu:<15.2f} | +{a_bleu - b_bleu:.2f}")
    print("="*80)

if __name__ == "__main__":
    run_sequential_evaluation()
