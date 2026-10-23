"""Test configuration and fixtures for CineConnect Backend."""

import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import get_settings
from app.database import get_db
from app.main import app
from app.redis import redis_pool

settings = get_settings()


@pytest_asyncio.fixture(autouse=True)
async def cleanup_redis():
    yield
    await redis_pool.disconnect()


test_engine = create_async_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
)
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function")
async def client():
    """Async HTTP test client connected to the FastAPI application."""
    async def override_get_db():
        async with TestSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Database session connected to the CineConnect async engine via NullPool."""
    async with TestSessionLocal() as session:
        yield session
