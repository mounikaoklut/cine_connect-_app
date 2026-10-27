"""SQLAlchemy ORM models for casting opportunities and talent applications."""

import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import String, Text, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Opportunity(Base):
    """Job, role, or casting call opportunity tied to a project and production house."""
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True
    )
    production_house_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("production_houses.id", ondelete="CASCADE"), nullable=True
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default="open", nullable=True)

    # Relationships
    project: Mapped[Optional["Project"]] = relationship()
    production_house: Mapped[Optional["ProductionHouse"]] = relationship()
    applications: Mapped[list["Application"]] = relationship(
        back_populates="opportunity", cascade="all, delete-orphan"
    )


class Application(Base):
    """Application submitted by talent for an opportunity."""
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    talent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    opportunity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=True
    )
    status: Mapped[Optional[str]] = mapped_column(String(50), default="pending", nullable=True)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    applied_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=True
    )

    __table_args__ = (
        UniqueConstraint("talent_id", "opportunity_id", name="applications_talent_id_opportunity_id_key"),
    )

    # Relationships
    talent: Mapped[Optional["User"]] = relationship()
    opportunity: Mapped[Optional["Opportunity"]] = relationship(back_populates="applications")
