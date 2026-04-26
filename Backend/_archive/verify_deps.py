import sys
import importlib

packages = [
    "sentence_transformers",
    "faiss",
    "transformers",
    "accelerate",
    "indic_transliteration",
    "huggingface_hub",
    "torch",
    "sacremoses",
    "sentencepiece",
    "langdetect"
]

print(f"Python version: {sys.version}")
print("-" * 30)

missing = []

for pkg in packages:
    try:
        m = importlib.import_module(pkg)
        version = getattr(m, "__version__", "unknown")
        print(f"[OK]   {pkg:<25} | Version: {version}")
    except ImportError as e:
        print(f"[FAIL] {pkg:<25} | Error: {e}")
        missing.append(pkg)

print("-" * 30)
if not missing:
    print("All dependencies are correctly installed!")
else:
    print(f"Missing packages: {', '.join(missing)}")
    sys.exit(1)
