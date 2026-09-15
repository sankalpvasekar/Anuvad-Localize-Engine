import logging
import torch
import numpy as np
from sentence_transformers import SentenceTransformer, util

logger = logging.getLogger("sbert-service")

class DomainDetectionService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DomainDetectionService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        
        # Define Domain Centroids (Short descriptive paragraphs)
        self.domains = {
            "STEM": "Mathematics, science, engineering, and technology. Focuses on formulas, calculations, integration, differentiation, physics, chemistry, and technical documentation.",
            "Humanities": "History, literature, philosophy, and arts. Focuses on narratives, social structures, cultural analysis, and descriptive storytelling.",
            "Business": "Economics, management, finance, and marketing. Focuses on markets, strategies, organizational behavior, and commercial terminology.",
            "General": "Converational everyday talk, casual dialogue, and non-specialized information."
        }
        self.domain_embeddings = {}
        self._initialized = True

    def _load_model(self):
        if self.model is None:
            logger.info("Loading SBERT for Domain Detection...")
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2', device=self.device)
                # Initialize core domain embeddings
                for name, desc in self.domains.items():
                    self.domain_embeddings[name] = self.model.encode(desc)
            except Exception as e:
                logger.error(f"Failed to load SBERT model: {e}. Using 'General' fallback.")
                self.model = "FAILED"

    def detect_domain(self, text: str) -> str:
        """Detect the primary domain of the text using cosine similarity."""
        self._load_model()
        
        if self.model == "FAILED" or self.model is None:
            return "General"
            
        text_embedding = self.model.encode(text)
        best_domain = "General"
        max_similarity = -1.0
        
        for name, emb in self.domain_embeddings.items():
            similarity = util.cos_sim(text_embedding, emb).item()
            if similarity > max_similarity:
                max_similarity = similarity
                best_domain = name
        
        logger.info(f"Detected domain: {best_domain} (confidence: {max_similarity:.2f})")
        return best_domain

domain_service = DomainDetectionService()
