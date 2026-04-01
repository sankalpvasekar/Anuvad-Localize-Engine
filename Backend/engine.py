import os
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ScholarShield:
    def __init__(self):
        # Neural-Sync strictly shields Universal Mathematical symbols and formulas.
        self.math_regex = re.compile(
            r'\\\w+({[^}]+})*|'                     # LaTeX commands
            r'\b(?:[a-zA-Z0-9]+\b\s*[\+\-\*/=]\s*)+\b[a-zA-Z0-9]+\b|' # Standard equations
            r'\bdy/dx\b|\$[^$]+\$|'                   # Leibniz notation and inline math
            r'\b[a-zA-Z](?:\^[\d\w]+)\b'             # Superscripts like x^2
        )
        
        # Explicit Tech Shield for STEM terms that NMT often mis-translates to everyday meanings.
        # This ensures they remain phonetically consistent with classroom pedagogy.
        self.tech_keywords = {
            "differentiation": "डिफरेंशिएशन", 
            "integration": "इंटीग्रेशन",
            "calculus": "कॅल्क्युलस",
            "integral": "इंटीग्रल",
            "differentiation": "डिफरेंशिएशन",
            "derivative": "डेरिव्हेटिव्ह",
            "differentiation process": "डिफरेंशिएशनची प्रक्रिया"
        }
        self.tech_regex = re.compile(rf"\b({'|'.join(re.escape(k) for k in self.tech_keywords.keys())})\b", re.IGNORECASE)

    def shield_text(self, text: str):
        mapping = {}
        counter = 0
        masked_text = text

        # 1. Shield Math Formulas (MATH_N)
        for match in self.math_regex.finditer(masked_text):
            formula = match.group(0)
            if formula not in mapping.values(): 
                placeholder = f"MATH_{counter}"
                mapping[placeholder] = formula
                masked_text = masked_text.replace(formula, placeholder)
                counter += 1
                
        # 2. Shield Technical STEM Keywords (TECH_N)
        for match in self.tech_regex.finditer(masked_text):
            term = match.group(0)
            placeholder = f"TECH_{counter}"
            # Standardize key for tech restoration
            mapping[placeholder] = self.tech_keywords.get(term.lower(), term)
            masked_text = masked_text.replace(term, placeholder)
            counter += 1

        return masked_text, mapping

    def _to_indic(self, num_str):
        indic_map = str.maketrans("0123456789", "०१२३४५६७८९")
        return num_str.translate(indic_map)

    def unshield_text(self, text: str, mapping: dict):
        if not mapping:
            return text
            
        unmasked = text
        
        # 1. Capture all types of markers the AI might have outputted.
        # We look for something that looks like a marker (TECH/MATH/मॅथ/टेक) followed by any numeric-like string.
        marker_pattern = re.compile(
            r'(?:MATH|मॅथ|मैथ|टेक|टेक्|TECH|TECHNOLOGY)\s*[:\-\s_]*\s*([0-9०१२३४५६७८९]{1,3})', 
            re.IGNORECASE
        )
        
        # 2. Get all original placeholders in the order they were created.
        placeholders = list(mapping.keys())
        
        # 3. Find all matches in the translated text.
        matches = list(marker_pattern.finditer(unmasked))
        
        # 4. Sequential replacement: Replace the Nth match with the Nth placeholder.
        # We work backwards to avoid offset issues with string slicing.
        for i in range(min(len(matches), len(placeholders)) - 1, -1, -1):
            match = matches[i]
            placeholder = placeholders[i]
            unmasked = unmasked[:match.start()] + placeholder + unmasked[match.end():]

        # 5. Restore original terms from the standardized placeholders
        for placeholder, original in mapping.items():
            unmasked = unmasked.replace(placeholder, original)
            
        return unmasked

class NeuralSyncEngine:
    def __init__(self, model_name="ai4bharat/indictrans2-en-indic-1B"):
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        print(f"Loading Neural Engine ({model_name}) on {self.device} with {self.dtype}...")
        hf_token = os.getenv("HF_TOKEN")
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name, 
            trust_remote_code=True,
            token=hf_token
        )
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name, 
            trust_remote_code=True,
            token=hf_token
        ).to(self.device, dtype=self.dtype)
        
    def translate_batch(self, texts: list, src_lang: str, tgt_lang: str, batch_size=4):
        import torch
        # IndicProcessor naturally handles phonetic transliteration natively through subword embeddings.
        self.tokenizer.src_lang = src_lang
        self.tokenizer.tgt_lang = tgt_lang
        
        translations = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            
            # IndicTrans2 tokenizer expects: "src_lang tgt_lang sentence"
            formatted_batch = [f"{src_lang} {tgt_lang} {text}" for text in batch]
            
            inputs = self.tokenizer(formatted_batch, padding=True, truncation=True, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                forced_bos_id = None
                if hasattr(self.tokenizer, 'lang_code_to_id') and tgt_lang in self.tokenizer.lang_code_to_id:
                    forced_bos_id = self.tokenizer.lang_code_to_id[tgt_lang]
                    
                generated_tokens = self.model.generate(
                    **inputs,
                    forced_bos_token_id=forced_bos_id,
                    max_length=256
                )
                
            decoded = self.tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
            translations.extend(decoded)
            
        return translations
