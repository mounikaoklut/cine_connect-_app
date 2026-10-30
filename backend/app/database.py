"""Async SQLAlchemy database engine and session management with resilient fallback."""

import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import ARRAY
from sqlalchemy.dialects.postgresql import JSONB, UUID
from pgvector.sqlalchemy import Vector

from app.config import get_settings

settings = get_settings()


# SQLite compatibility compilers
@compiles(ARRAY, "sqlite")
def compile_array(type_, compiler, **kw):
    return "JSON"


@compiles(JSONB, "sqlite")
def compile_jsonb(type_, compiler, **kw):
    return "JSON"


@compiles(UUID, "sqlite")
def compile_uuid(type_, compiler, **kw):
    return "VARCHAR(36)"


@compiles(Vector, "sqlite")
def compile_vector(type_, compiler, **kw):
    return "TEXT"


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# Primary engine (PostgreSQL as configured in settings)
_pg_engine = None
if settings.DATABASE_URL.startswith("postgresql"):
    try:
        _pg_engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            pool_size=10,
            max_overflow=5,
            pool_pre_ping=True,
        )
    except Exception:
        _pg_engine = None

# Fallback SQLite engine
sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cineconnect.db"))
_sqlite_engine = create_async_engine(
    f"sqlite+aiosqlite:///{sqlite_path}",
    echo=False,
    connect_args={"check_same_thread": False},
)

# Active engine tracker (defaults to SQLite until init_db checks PG)
_active_engine = _sqlite_engine
_active_sessionmaker = async_sessionmaker(_active_engine, class_=AsyncSession, expire_on_commit=False)
engine = _active_engine
async_session = _active_sessionmaker


def AsyncSessionLocal() -> AsyncSession:
    """Return a new AsyncSession from the currently active sessionmaker."""
    return _active_sessionmaker()


async def init_db():
    """Initialize database tables and seed sample data if needed."""
    global _active_engine, _active_sessionmaker, engine, async_session

    # Test if PostgreSQL is reachable
    if _pg_engine:
        try:
            async with _pg_engine.connect() as conn:
                await conn.execute(select(1))
            _active_engine = _pg_engine
            _active_sessionmaker = async_sessionmaker(_active_engine, class_=AsyncSession, expire_on_commit=False)
            engine = _active_engine
            async_session = _active_sessionmaker
            print("Connected to PostgreSQL successfully.")
            return
        except Exception as e:
            print(f"PostgreSQL not available ({e}). Using local SQLite database.")

    # Using SQLite fallback
    _active_engine = _sqlite_engine
    _active_sessionmaker = async_sessionmaker(_active_engine, class_=AsyncSession, expire_on_commit=False)
    engine = _active_engine
    async_session = _active_sessionmaker

    async with _active_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed skills catalog if empty
    from app.models.user import Skill
    async with _active_sessionmaker() as session:
        result = await session.execute(select(Skill).limit(1))
        if not result.scalar_one_or_none():
            skills = [
                Skill(name="Method Acting", category="acting"),
                Skill(name="Voice Acting", category="acting"),
                Skill(name="Stunt Performance", category="acting"),
                Skill(name="Cinematography", category="camera"),
                Skill(name="Drone Piloting", category="camera"),
                Skill(name="Lighting / Gaffer", category="camera"),
                Skill(name="Video Editing", category="editing"),
                Skill(name="Color Grading", category="editing"),
                Skill(name="VFX", category="editing"),
                Skill(name="Sound Design", category="editing"),
                Skill(name="DaVinci Resolve", category="editing"),
                Skill(name="Adobe Premiere", category="editing"),
                Skill(name="Screenwriting", category="writing"),
                Skill(name="Story Development", category="writing"),
                Skill(name="Director", category="direction"),
                Skill(name="Shot Composition", category="direction"),
            ]
            session.add_all(skills)
            await session.commit()
            print("Seeded skills catalog into local database.")

<<<<<<< Updated upstream
        # Seed default talent and production demo accounts
        from app.models.user import User
=======
        # Seed default demo accounts (Talent and Production)
        from app.models.user import User, Profile
        from app.models.production import ProductionHouse
>>>>>>> Stashed changes
        from app.utils.security import hash_password
        import uuid

        talent_res = await session.execute(select(User).where(User.email == "kabir.mehra@cineconnect.com"))
        if not talent_res.scalar_one_or_none():
<<<<<<< Updated upstream
            demo_talent = User(
                id=uuid.UUID("d3b07384-d113-4a44-9c81-c30089f23d88"),
=======
            kabir_id = uuid.UUID("d3b07384-d113-4a44-9c81-c30089f23d88")
            demo_talent = User(
                id=kabir_id,
>>>>>>> Stashed changes
                email="kabir.mehra@cineconnect.com",
                password_hash=hash_password("Password123!"),
                account_type="talent",
                full_name="Kabir Mehra",
                role="Actor",
                location="Mumbai, Maharashtra",
                phone="+91 98200 12345",
                email_verified=True,
                phone_verified=True,
                identity_verified=True,
            )
            session.add(demo_talent)
<<<<<<< Updated upstream

        prod_res = await session.execute(select(User).where(User.email == "producer@cineconnect.com"))
        if not prod_res.scalar_one_or_none():
            demo_prod = User(
                id=uuid.UUID("e4a18295-e224-4b55-8d92-d4009af34e99"),
=======
            profile = Profile(
                user_id=kabir_id,
                name="Kabir Mehra",
                bio="Method actor with 8+ years across independent cinema and OTT thrillers.",
                photo_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
                primary_craft="Actor",
                city="Mumbai",
                state="Maharashtra",
                travel_radius_km=500,
                completeness_score=85,
            )
            session.add(profile)

        prod_res = await session.execute(select(User).where(User.email == "producer@cineconnect.com"))
        if not prod_res.scalar_one_or_none():
            prod_id = uuid.UUID("e4a18295-e224-4b55-8d92-d4009af34e99")
            demo_prod = User(
                id=prod_id,
>>>>>>> Stashed changes
                email="producer@cineconnect.com",
                password_hash=hash_password("Password123!"),
                account_type="production",
                full_name="Shadow Reel Studios",
                role="Producer / Director",
                location="Mumbai, Maharashtra",
                phone="+91 98200 54321",
                email_verified=True,
                phone_verified=True,
                identity_verified=True,
            )
            session.add(demo_prod)
<<<<<<< Updated upstream

        await session.commit()
        print("Seeded default accounts into database.")
=======
            ph = ProductionHouse(
                id=uuid.uuid4(),
                user_id=prod_id,
                company_name="Shadow Reel Studios",
                description="Independent feature film & commercial production house.",
                location="Mumbai, Maharashtra",
                specialization="Feature Films & OTT Series",
            )
            session.add(ph)

        await session.commit()
        print("Default accounts verified/seeded into database.")
>>>>>>> Stashed changes


async def get_db() -> AsyncSession:
    """Dependency that yields an async database session."""
    async with _active_sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

