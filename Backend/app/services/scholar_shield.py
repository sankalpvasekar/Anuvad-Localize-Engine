import os
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class ScholarShield:
    def __init__(self):
        # Neural-Sync strictly shields Universal Mathematical symbols, formulas, and code.
        self.math_regex = re.compile(
            r'\\\w+(?:{[^}]+})*(?:\s*[\+\-\*/=_]\s*[^,.\s]+)*|' # LaTeX commands & equations
            r'[a-zA-Z0-9_\^\(\)]+\s*->\s*[a-zA-Z0-9_\^\(\)\+\s]+|' # Chemical reactions (->)
            r'\b(?:[a-zA-Z0-9_\^\(\)]+\s*[\+\-\*/=]\s*)+[a-zA-Z0-9_\^\(\)]+\b|' # Standard equations
            r'\bdy/dx\b|\$[^$]+\$|'                   # Leibniz notation and inline math
            r'\b[a-zA-Z](?:\^[\d\w]+)\b|'             # Superscripts like x^2
            r'def\s+[a-zA-Z0-9_]+\s*\([^)]*\):|'     # Python function defs
            r'while\s+[a-zA-Z0-9_\s<=>!]+:|'         # While headers
            r'return\s+[a-zA-Z0-9_\s\+\-\*//\(\)]+'   # Return statements
        )
        
        # Dynamic Tech Keywords based on Domain
        self.domain_glossaries = {
            "STEM": self._load_glossary("STEM"),
            "Business": self._load_glossary("Business"),
            "Humanities": self._load_glossary("Humanities"),
            "General": {}
        }

    def _load_glossary(self, domain: str):
        """Dynamically loads glossaries from knowledge_base/<domain>/*_glossary.txt"""
        glossary = {}
        # Get project root (4 levels up from this file)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        kb_path = os.path.join(project_root, "Backend", "knowledge_base", domain)
        if not os.path.exists(kb_path):
            return glossary

        # Search for any file ending in _glossary.txt
        import glob
        glossary_files = glob.glob(os.path.join(kb_path, "*_glossary.txt"))
        
        # Hardcoded core STEM pedagogy for absolute reliability in demo
        if domain == "STEM":
            glossary = {
                "differentiation": "डिफरेंशिएशन", 
                "integration": "इंटीग्रेशन",
                "calculus": "कॅल्क्युलस",
                "integral": "इंटीग्रल",
                "derivative": "डेरिव्हेटिव्ह",
                "formula": "फॉर्म्युला",
                "momentum": "मोमेंटम",
                "catalyst": "कैटेलिस्ट",
                "recursion": "रिकर्शन",
                "binary search": "बाइनरी सर्च",
                "compiler": "कंपाइलर",
                "mitochondria": "माइटोकॉन्ड्रिया"
            }

        # Dynamically load from Backend/preserve_list/all_terms_master.json
        preserve_dir = os.path.join(project_root, "Backend", "preserve_list")
        master_file = os.path.join(preserve_dir, "all_terms_master.json")
        if os.path.exists(master_file):
            try:
                import json
                with open(master_file, "r", encoding="utf-8") as f:
                    master_terms = json.load(f)
                for item in master_terms:
                    t = item.get("term", "").strip().lower()
                    if t and t not in glossary:
                        glossary[t] = t.capitalize()
            except Exception as e:
                print(f"Failed to load master preserve list: {e}")

        for gf in glossary_files:
            try:
                with open(gf, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("-") and ":" in line:
                            parts = line.split(":")
                            term = parts[0].strip("- ").lower()
                            glossary[term] = term.capitalize() 
            except Exception as e:
                print(f"Failed to load glossary {gf}: {e}")
        
        return glossary

    def shield_text(self, text: str, domain: str = "STEM", mapping: dict = None, counter: int = 0):
        if mapping is None:
            mapping = {}
        
        current_counter = counter

        # 1. Shield Math Formulas (MATH_N) via callback substitution
        def _replace_math(match):
            nonlocal current_counter
            formula = match.group(0)
            placeholder = f"[MATH_{current_counter}]"
            mapping[f"MATH_{current_counter}"] = formula
            mapping[placeholder] = formula
            current_counter += 1
            return f" {placeholder} "

        masked_text = self.math_regex.sub(_replace_math, text)

        # 2. Shield Technical Keywords from the detected Domain
        tech_keywords = self.domain_glossaries.get(domain, {})
        if tech_keywords:
            pattern_str = r"\b(" + "|".join(re.escape(k) for k in tech_keywords.keys()) + r")\b"
            tech_regex = re.compile(pattern_str, re.IGNORECASE)

            def _replace_tech(match):
                nonlocal current_counter
                term = match.group(0)
                placeholder = f"[TECH_{current_counter}]"
                mapping[f"TECH_{current_counter}"] = tech_keywords.get(term.lower(), term)
                mapping[placeholder] = tech_keywords.get(term.lower(), term)
                current_counter += 1
                return f" {placeholder} "

            masked_text = tech_regex.sub(_replace_tech, masked_text)

        return masked_text, mapping, current_counter

    def _to_indic(self, num_str):
        indic_map = str.maketrans("0123456789", "०१२३४५६७८९")
        return num_str.translate(indic_map)

    def unshield_text(self, text: str, mapping: dict):
        if not mapping:
            return text
            
        unmasked = text
        indic_to_arabic = str.maketrans("०१२३४५६७८९", "0123456789")
        
        # 1. First, replace direct placeholders (including bracketed forms like [MATH_0])
        sorted_keys = sorted(mapping.keys(), key=len, reverse=True)
        for k in sorted_keys:
            val = str(mapping[k])
            # Direct bracketed and unbracketed replacement
            unmasked = unmasked.replace(f"[{k}]", val)
            unmasked = unmasked.replace(f"<{k}>", val)
            unmasked = re.sub(rf'\b{re.escape(k)}\b', lambda m: val, unmasked)
            
        # 2. Capture and replace transliterated or translated markers (e.g. मॅथ_1, मैथ 0, गणित_0, टेक: 2, तकनीक_1, etc.)
        def replace_transliterated_marker(match):
            full_match = match.group(0)
            marker_type = match.group(1).upper()
            num_str = match.group(2).translate(indic_to_arabic)
            prefix = "MATH" if any(m in marker_type for m in ["MATH", "मॅथ", "मैथ", "गणित"]) else "TECH"
            key = f"{prefix}_{num_str}"
            return str(mapping.get(key, full_match))

        marker_pattern = re.compile(
            r'\[?\s*(MATH|मॅथ|मैथ|गणित|टेक|टेक्|तकनीक|TECH|TECHNOLOGY)\s*[:\-\s_]*\s*([0-9०१२३४५६७८९]{1,3})\s*\]?', 
            re.IGNORECASE
        )
        unmasked = marker_pattern.sub(replace_transliterated_marker, unmasked)
        
        return unmasked


class NeuralSyncEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(NeuralSyncEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_name="ai4bharat/indictrans2-en-indic-1B"):
        if self._initialized:
            return
            
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        from app.core.gpu_manager import gpu_manager
        self.gpu_manager = gpu_manager
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        print(f"Loading Neural Engine ({model_name}) on {self.device} with {self.dtype}...")
        hf_token = os.getenv("HF_TOKEN")
        
        # Memory optimization for 6GB GPUs
        model_kwargs = {
            "token": hf_token,
            "trust_remote_code": True,
        }
        if self.device == "cuda":
            model_kwargs["device_map"] = "auto"
            model_kwargs["torch_dtype"] = torch.float16
        
        try:
            print(f"Loading Primary Neural Engine ({model_name}) on {self.device}...")
            self.tokenizer = AutoTokenizer.from_pretrained(model_name, **model_kwargs)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name, **model_kwargs)
        except Exception as e:
            print(f"Primary engine failed (Gated/Auth issue): {e}")
            fallback_model = "facebook/m2m100_418M"
            print(f"Loading Fallback Neural Engine ({fallback_model}) on {self.device}...")
            self.tokenizer = AutoTokenizer.from_pretrained(fallback_model)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(fallback_model).to(self.device)
            self.is_fallback = True
        else:
            self.is_fallback = False
            
        self._initialized = True
        
    async def translate_batch(self, texts: list, src_lang: str, tgt_lang: str, batch_size=8):
        """Highly optimized batch translation for neural parallelization."""
        import torch
        if not texts:
            return []
            
        await self.gpu_manager.acquire_gpu("TranslationEngine")
        try:
            # Handle M2M100 Fallback language mapping
            if getattr(self, 'is_fallback', False):
                it2_to_m2m = {
                    "eng_Latn": "en", "hin_Deva": "hi", "mar_Deva": "mr", 
                    "tam_Taml": "ta", "tel_Telu": "te", "kan_Knda": "kn", "guj_Gujr": "gu"
                }
                src_lang = it2_to_m2m.get(src_lang, "en")
                tgt_lang = it2_to_m2m.get(tgt_lang, "hi")
                self.tokenizer.src_lang = src_lang
                self.tokenizer.tgt_lang = tgt_lang
            else:
                self.tokenizer.src_lang = src_lang
                self.tokenizer.tgt_lang = tgt_lang
            
            translations = []
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i+batch_size]
                formatted_batch = [f"{src_lang} {tgt_lang} {text}" for text in batch] if not self.is_fallback else batch
                
                inputs = self.tokenizer(
                    formatted_batch, 
                    padding=True, 
                    truncation=True, 
                    max_length=256,
                    return_tensors="pt"
                ).to(self.device)
                
                with torch.no_grad():
                    forced_bos_id = None
                    if self.is_fallback:
                        try:
                            forced_bos_id = self.tokenizer.get_lang_id(tgt_lang)
                        except:
                            forced_bos_id = self.tokenizer.get_lang_id("hi") 
                    elif hasattr(self.tokenizer, 'lang_code_to_id') and tgt_lang in self.tokenizer.lang_code_to_id:
                        forced_bos_id = self.tokenizer.lang_code_to_id[tgt_lang]
                        
                    generated_tokens = self.model.generate(
                        **inputs,
                        forced_bos_token_id=forced_bos_id,
                        max_length=256,
                        num_beams=4,
                        do_sample=False
                    )
                    
                decoded = self.tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
                translations.extend(decoded)
            return translations
        finally:
            self.gpu_manager.release_gpu()
