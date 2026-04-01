from engine import NeuralSyncEngine
import traceback

try:
    engine = NeuralSyncEngine()
    result = engine.translate_batch(["Hello world"], src_lang="eng_Latn", tgt_lang="mar_Deva")
    print(f"Result: {result}")
    with open("debug_out.txt", "w", encoding="utf-8") as f:
        f.write(str(result))
except Exception as e:
    with open("debug_err.txt", "w", encoding="utf-8") as f:
        f.write(traceback.format_exc())
    print("Failed check debug_err.txt")
