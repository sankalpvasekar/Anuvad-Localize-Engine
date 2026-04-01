# ScholarFlow Architecture & Design Decisions

This document details the responsibilities and technical reasoning behind the file structure of the ScholarFlow Technical Translation Engine.

| File | Responsibility | Technical Reason |
|---|---|---|
| `main.py` | API Endpoints & Request Handling | Uses Uvicorn and FastAPI to provide a high-concurrency robust asynchronous REST server, supporting concurrent translation batching requests seamlessly. |
| `translator.py` | The Core Engine (Shield & Translator) | Decouples the shielding (RegEx domain replacement) logic from the actual NMT Inference logic to ensure modularity. This ensures memory efficiency with T4 optimizations and isolation. |
| `glossaries/` | Knowledge Base | JSON-driven dictionary allowing the engine to scale its Shield logic to Chemistry, Biology, or Law seamlessly without touching any core logic. |
| `requirements.txt` | Dependency Management | Explicitly pins `transformers==4.39.3` to avoid silent breaking changes in Indic tokenizer implementations, guaranteeing environment stability. |
