"""CineConnect User Portal - Backend FastAPI Application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, users, media
from app.utils.s3 import ensure_bucket_exists

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown hooks."""
    try:
        from app.database import init_db
        await init_db()
    except Exception as e:
        print(f"Database initialization error: {e}")

    try:
        ensure_bucket_exists()
    except Exception as e:
        print(f"Warning: S3 bucket initialization deferred: {e}")
    yield
    # Shutdown hooks here if needed


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for CineConnect User Portal — Connecting Film & Media Talent with Opportunities",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
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

# Include Phase 1 Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(media.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
    }
