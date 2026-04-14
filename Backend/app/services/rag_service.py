import os
import glob
import logging
import torch
import faiss
import numpy as np
from pathlib import Path
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM
from app.core.config import settings

logger = logging.getLogger("rag-service")

class RAGService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.kb_path = Path("knowledge_base")
        self.kb_path.mkdir(exist_ok=True)
        
        # Models
        self.embed_model = None
        self.llm_model = None
        self.llm_tokenizer = None
        
        # FAISS Index
        self.index = None
        self.documents = []
        
        self._initialized = True

    def _load_embed_model(self):
        if self.embed_model is None:
            logger.info("Loading SBERT for RAG indexing...")
            try:
                self.embed_model = SentenceTransformer('all-MiniLM-L6-v2', device=self.device)
            except Exception as e:
                logger.error(f"Failed to load RAG embed model: {e}")
                self.embed_model = "FAILED"

    def _load_llm_model(self):
        if self.llm_model is None:
            model_name = "ibm-granite/granite-4.0-h-micro"
            logger.info(f"Loading IBM Granite model: {model_name}...")
            
            import time
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    hf_token = os.getenv("HF_TOKEN")
                    self.llm_tokenizer = AutoTokenizer.from_pretrained(model_name, token=hf_token)
                    self.llm_model = AutoModelForCausalLM.from_pretrained(
                        model_name, 
                        token=hf_token,
                        torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                        device_map="auto" if self.device == "cuda" else None
                    ).to(self.device if self.device == "cpu" else "cuda")
                    logger.info("Granite model loaded successfully.")
                    break
                except Exception as e:
                    logger.error(f"Attempt {attempt + 1} failed to load Granite model: {e}")
                    if attempt < max_retries - 1:
                        time.sleep(2)
                    else:
                        self.llm_model = "FAILED"
                        logger.error("Final attempt failed. Granite refinement will be permanently skipped for this session.")
        elif self.llm_model == "FAILED":
            # Already failed once this session, don't try again to save time
            return

    def auto_index_knowledge_base(self):
        """Scan knowledge_base folder and index all PDF/TXT files."""
        self._load_embed_model()
        if self.embed_model == "FAILED":
            logger.warning("RAG indexing skipped due to model loading failure.")
            return
        
        files = glob.glob(str(self.kb_path / "*.txt")) + glob.glob(str(self.kb_path / "*.pdf"))
        new_docs = []
        
        for file_path in files:
            try:
                text = ""
                if file_path.endswith(".txt"):
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                elif file_path.endswith(".pdf"):
                    reader = PdfReader(file_path)
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                
                # Simple chunking by paragraph
                chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 20]
                new_docs.extend(chunks)
                logger.info(f"Indexed {len(chunks)} chunks from {os.path.basename(file_path)}")
            except Exception as e:
                logger.error(f"Failed to index {file_path}: {e}")

        if not new_docs:
            logger.warning("No knowledge base documents found to index.")
            return

        self.documents = new_docs
        embeddings = self.embed_model.encode(self.documents)
        dimension = embeddings.shape[1]
        
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(embeddings).astype('float32'))
        logger.info(f"FAISS index built with {len(self.documents)} vectors.")

    def retrieve_context(self, query: str, k: int = 3) -> str:
        if self.index is None or not self.documents:
            return ""
            
        self._load_embed_model()
        query_vector = self.embed_model.encode([query])
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), k)
        
        relevant_chunks = [self.documents[idx] for idx in indices[0] if idx != -1]
        return "\n---\n".join(relevant_chunks)

    def refine_with_granite(self, transcript: str, context: str) -> str:
        """Use IBM Granite to standardize and refine the transcript based on context."""
        self._load_llm_model()
        if self.llm_model == "FAILED":
            logger.warning("Granite refinement skipped due to model loading failure.")
            return transcript
        
        prompt = f"""
System: You are an expert STEM educational content editor. Use the provided context to standardize the transcript. 
Ensure mathematical formulas and technical terms are accurate. 
Keep the tone consistent and the same as the input transcript.

Context:
{context}

Transcript:
{transcript}

Refined Transcript:"""

        inputs = self.llm_tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.llm_model.generate(
                **inputs, 
                max_new_tokens=len(inputs["input_ids"][0]) + 300,
                temperature=0.2,
                do_sample=True
            )
        
        full_text = self.llm_tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract only the part after the prompt
        refined_text = full_text.split("Refined Transcript:")[-1].strip()
        return refined_text

rag_service = RAGService()
