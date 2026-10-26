"""SQLAlchemy ORM models for projects, opportunities, applications, auditions, and invitations."""

import uuid
import enum
from datetime import datetime, date
from typing import Optional

from sqlalchemy import (
    String, Text, Boolean, Integer, Date, DateTime, ForeignKey,
    DECIMAL, ARRAY, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.database import Base


# ===================== ENUMS =====================

class ProjectStatus(str, enum.Enum):
    upcoming = "upcoming"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class OpportunityStatus(str, enum.Enum):
    draft = "draft"
    open = "open"
    closed = "closed"
    cancelled = "cancelled"


class ApplicationStatus(str, enum.Enum):
    submitted = "submitted"
    under_review = "under_review"
    shortlisted = "shortlisted"
    rejected = "rejected"
    hired = "hired"


class InvitationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"


# ===================== PROJECTS =====================

class Project(Base):
    """Production house project."""
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    production_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    genre: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    project_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(
        SAEnum(ProjectStatus, name="project_status"), default=ProjectStatus.upcoming
    )
    shoot_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    shoot_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    budget_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    poster_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    production: Mapped["User"] = relationship(  # type: ignore[name-defined]
        back_populates="projects", foreign_keys=[production_id]
    )
    opportunities: Mapped[list["Opportunity"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


# ===================== OPPORTUNITIES =====================

class Opportunity(Base):
    """Casting call / job opportunity posted by production house."""
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    posted_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    craft: Mapped[str] = mapped_column(String(50), nullable=False)
    required_skills: Mapped[Optional[list[str]]] = mapped_column(
        ARRAY(String(100)), nullable=True
    )
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    age_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    age_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gender_pref: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False)
    project_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    pay_min: Mapped[Optional[float]] = mapped_column(DECIMAL(12, 2), nullable=True)
    pay_max: Mapped[Optional[float]] = mapped_column(DECIMAL(12, 2), nullable=True)
    pay_unit: Mapped[str] = mapped_column(String(20), default="project")
    shoot_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    shoot_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    application_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[OpportunityStatus] = mapped_column(
        SAEnum(OpportunityStatus, name="opportunity_status"), default=OpportunityStatus.open
    )
    embedding = mapped_column(Vector(768), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    project: Mapped[Optional["Project"]] = relationship(back_populates="opportunities")
    poster: Mapped["User"] = relationship(foreign_keys=[posted_by])  # type: ignore[name-defined]
    applications: Mapped[list["Application"]] = relationship(
        back_populates="opportunity", cascade="all, delete-orphan"
    )


# ===================== APPLICATIONS =====================

class Application(Base):
    """Talent application to an opportunity."""
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False
    )
    talent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    cover_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    portfolio_item_ids: Mapped[Optional[list]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), nullable=True
    )
    reel_ids: Mapped[Optional[list]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), nullable=True
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus, name="application_status"), default=ApplicationStatus.submitted
    )
    status_history: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    opportunity: Mapped["Opportunity"] = relationship(back_populates="applications")
    talent: Mapped["User"] = relationship(foreign_keys=[talent_id])  # type: ignore[name-defined]
    audition_steps: Mapped[list["AuditionStep"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )


# ===================== AUDITION STEPS =====================

class AuditionStep(Base):
    """Audition or interview step for a shortlisted application."""
    __tablename__ = "audition_steps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False
    )
    step_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meeting_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application: Mapped["Application"] = relationship(back_populates="audition_steps")


# ===================== INVITATIONS =====================

class Invitation(Base):
    """Collaboration invitation from production house to talent."""
    __tablename__ = "invitations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    from_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    to_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    opportunity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="SET NULL"), nullable=True
    )
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[InvitationStatus] = mapped_column(
        SAEnum(InvitationStatus, name="invitation_status"), default=InvitationStatus.pending
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sender: Mapped["User"] = relationship(foreign_keys=[from_user_id])  # type: ignore[name-defined]
    recipient: Mapped["User"] = relationship(foreign_keys=[to_user_id])  # type: ignore[name-defined]
