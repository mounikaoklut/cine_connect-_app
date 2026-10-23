"""CineConnect User Portal - Backend FastAPI Application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.redis import get_redis
from app.routers import (
    auth,
    users,
    media,
    production_houses,
    opportunities,
    social,
    messages,
    collaborations,
)
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


tags_metadata = [
    {
        "name": "Auth & Identity",
        "description": "Talent & Production registration, email/password login, JWT tokens, logout, and password recovery.",
    },
    {
        "name": "Profile & Portfolio",
        "description": "User profile management and portfolio media.",
    },
    {
        "name": "Production Houses & Projects",
        "description": "Production company profiles and film/media project management.",
    },
    {
        "name": "Collaborations",
        "description": "Project collaboration invitations and team management.",
    },
    {
        "name": "Opportunities & Applications",
        "description": "Casting calls, job postings, and talent applications management.",
    },
    {
        "name": "Social & Feed",
        "description": "Talent connections, community posts, likes, and comments.",
    },
    {
        "name": "Messaging",
        "description": "Direct and collaboration messaging between industry talent and producers.",
    },
    {
        "name": "Media Service",
        "description": "Direct S3/MinIO media uploads and asset management.",
    },
    {
        "name": "Health",
        "description": "Service health and readiness checks.",
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
app.include_router(collaborations.router, prefix="/api/v1")
app.include_router(opportunities.router, prefix="/api/v1")
app.include_router(social.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Service liveness probe endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/ready", tags=["Health"])
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Service readiness probe checking PostgreSQL and Redis connectivity."""
    db_ok = False
    redis_ok = False

    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        logger.error(f"Readiness check DB error: {e}")
        db_ok = False

    try:
        r = get_redis()
        pong = await r.ping()
        redis_ok = bool(pong)
    except Exception as e:
        logger.error(f"Readiness check Redis error: {e}")
        redis_ok = False

    status_str = "ready" if (db_ok and redis_ok) else "degraded"
    return {
        "status": status_str,
        "database": "connected" if db_ok else "disconnected",
        "redis": "connected" if redis_ok else "disconnected",
    }
