"""Pydantic schemas for production houses and film projects."""

from datetime import date
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Production Houses ----------

class ProductionHouseCreate(BaseModel):
    """Payload to create a new production house."""
    company_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    location: Optional[str] = Field(None, max_length=255)
    specialization: Optional[str] = Field(None, max_length=255)

    model_config = {"extra": "forbid"}


class ProductionHouseUpdate(BaseModel):
    """Payload to update an existing production house."""
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    location: Optional[str] = Field(None, max_length=255)
    specialization: Optional[str] = Field(None, max_length=255)

    model_config = {"extra": "forbid"}


class ProductionHouseResponse(BaseModel):
    """Production house details response."""
    id: UUID
    user_id: Optional[UUID] = None
    company_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------- Projects ----------

class ProjectCreate(BaseModel):
    """Payload to create a new project under a production house."""
    production_house_id: UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=3000)
    status: Optional[str] = Field("development", max_length=50)
    start_date: Optional[date] = None

    model_config = {"extra": "forbid"}


class ProjectUpdate(BaseModel):
    """Payload to update an existing project."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=3000)
    status: Optional[str] = Field(None, max_length=50)
    start_date: Optional[date] = None

    model_config = {"extra": "forbid"}


class ProjectResponse(BaseModel):
    """Project details response."""
    id: UUID
    production_house_id: Optional[UUID] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None

    model_config = {"from_attributes": True}
