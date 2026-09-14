import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import DatabaseManager
from app.api import users, workspaces, documents, dashboard, chat, reports, analysis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize MongoDB (live or fallback mock) & seed demo data
    await DatabaseManager.connect_db()
    yield
    # Shutdown
    await DatabaseManager.close_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for the Development of Multi-Agent AI Analysis System for Financial Research and Business Insights (Phase 1)",
    lifespan=lifespan
)

# Configure CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(workspaces.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System Status"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "live_mongodb"
    }

@app.get("/", tags=["System Status"])
async def root():
    return {
        "message": "Welcome to the Development of Multi-Agent AI Analysis System for Financial Research and Business Insights API (Phase 1)",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    # Switch working directory to the Backend root so that uvicorn subprocesses can find 'app'
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(backend_dir)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
