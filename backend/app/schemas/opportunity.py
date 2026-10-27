"""Pydantic schemas for opportunities and talent applications."""

from datetime import date, datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Opportunities ----------

class OpportunityCreate(BaseModel):
    """Payload to create a new casting or job opportunity."""
    project_id: UUID
    production_house_id: Optional[UUID] = None
    title: str = Field(..., min_length=1, max_length=255)
    requirements: Optional[str] = Field(None, max_length=5000)
    deadline: Optional[date] = None
    status: Optional[str] = Field("open", max_length=50)

    model_config = {"extra": "forbid"}


class OpportunityUpdate(BaseModel):
    """Payload to update an opportunity."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    requirements: Optional[str] = Field(None, max_length=5000)
    deadline: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)

    model_config = {"extra": "forbid"}


class OpportunityResponse(BaseModel):
    """Opportunity details response."""
    id: UUID
    project_id: Optional[UUID] = None
    production_house_id: Optional[UUID] = None
    title: Optional[str] = None
    requirements: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------- Applications ----------

class ApplicationCreate(BaseModel):
    """Payload for talent applying to an opportunity."""
    opportunity_id: UUID
    cover_letter: Optional[str] = Field(None, max_length=5000)

    model_config = {"extra": "forbid"}


class ApplicationStatusUpdate(BaseModel):
    """Payload to update the review status of an application."""
    status: str = Field(..., pattern=r"^(pending|shortlisted|reviewed|accepted|rejected)$")

    model_config = {"extra": "forbid"}


class ApplicationResponse(BaseModel):
    """Application details response."""
    id: UUID
    talent_id: Optional[UUID] = None
    opportunity_id: Optional[UUID] = None
    status: Optional[str] = None
    cover_letter: Optional[str] = None
    applied_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
