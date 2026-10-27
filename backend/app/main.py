"""CineConnect User Portal - Backend FastAPI Application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, users, media, production_houses, opportunities
from app.utils.s3 import ensure_bucket_exists

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown hooks."""
    # Startup: ensure S3/MinIO bucket exists if configured
    try:
        ensure_bucket_exists()
    except Exception as e:
        print(f"Warning: S3 bucket initialization deferred: {e}")
    yield
    # Shutdown hooks here if needed


tags_metadata = [
    {
        "name": "Auth & Identity",
        "description": "User registration, login, JWT token management, and OTP authentication.",
    },
    {
        "name": "Profile & Portfolio",
        "description": "User profile management and profile details.",
    },
    {
        "name": "Production Houses & Projects",
        "description": "Production company profiles and film/media project management.",
    },
    {
        "name": "Opportunities & Applications",
        "description": "Casting calls, job postings, and talent applications management.",
    },
    {
        "name": "Media Service",
        "description": "Direct S3/MinIO media uploads and asset management.",
    },
    {
        "name": "Health",
        "description": "Service health checks.",
    },
]

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for CineConnect User Portal — Connecting Film & Media Talent with Opportunities",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=tags_metadata,
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(media.router, prefix="/api/v1")
app.include_router(production_houses.router, prefix="/api/v1")
app.include_router(opportunities.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
    }
