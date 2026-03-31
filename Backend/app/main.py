import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings, get_whisper_model
from app.core.database import db_manager
from app.routers import transcribe, auth, projects  # projects and auth from previous structure if needed

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("transcription-system")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the model globally
    logger.info("Starting up... loading global Whisper model.")
    get_whisper_model()
    
    # Connect to MongoDB
    logger.info("Connecting to MongoDB...")
    await db_manager.connect()
    
    yield
    # Shutdown: Clean up if necessary
    logger.info("Shutting down... cleanup.")
    await db_manager.disconnect()

app = FastAPI(
    title=settings.app_name,
    description="Production-grade AI Video Transcription Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middleware: Logging & Timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    
    # Log Request
    logger.info(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log Response
    logger.info(f"Response Status: {response.status_code} | Time: {process_time:.4f}s")
    
    return response

# Include Routers
app.include_router(transcribe.router)
app.include_router(auth.router)
app.include_router(projects.router)

# Mount Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.app_name}
