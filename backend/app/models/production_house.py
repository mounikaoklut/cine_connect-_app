"""SQLAlchemy ORM models for production houses and film projects."""

import uuid
from datetime import date
from typing import Optional

from sqlalchemy import String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProductionHouse(Base):
    """Production company entity linked to an owner user."""
    __tablename__ = "production_houses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    projects: Mapped[list["Project"]] = relationship(
        back_populates="production_house", cascade="all, delete-orphan"
    )


class Project(Base):
    """Film or media project created under a production house."""
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    production_house_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("production_houses.id", ondelete="CASCADE"), nullable=True
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default="development", nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Relationships
    production_house: Mapped[Optional["ProductionHouse"]] = relationship(
        back_populates="projects"
    )
