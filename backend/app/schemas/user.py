"""Pydantic schemas for profile, skills, experience, and portfolio endpoints."""

from datetime import date, datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Profile ----------
class ProfileUpdate(BaseModel):
    """Fields that can be updated on a profile."""
    name: str | None = None
    bio: str | None = None
    photo_url: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    primary_craft: str | None = None
    secondary_crafts: list[str] | None = None
    city: str | None = None
    state: str | None = None
    travel_radius_km: int | None = None
    languages: list[dict] | None = None  # [{lang: str, fluency: str}]
    availability: dict | None = None


class ProfileResponse(BaseModel):
    """Full profile response."""
    user_id: UUID
    name: str | None = None
    bio: str | None = None
    photo_url: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    primary_craft: str | None = None
    secondary_crafts: list[str] | None = None
    city: str | None = None
    state: str | None = None
    travel_radius_km: int = 0
    languages: list[dict] | None = None
    availability: dict | None = None
    completeness_score: int = 0
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class PublicProfileResponse(BaseModel):
    """Public-facing profile (limited fields)."""
    user_id: UUID
    name: str | None = None
    bio: str | None = None
    photo_url: str | None = None
    primary_craft: str | None = None
    secondary_crafts: list[str] | None = None
    city: str | None = None
    state: str | None = None
    identity_verified: bool = False
    completeness_score: int = 0

    model_config = {"from_attributes": True}


# ---------- Skills ----------
class SkillItem(BaseModel):
    """A single skill with proficiency."""
    skill_id: int
    proficiency: str = "intermediate"


class SkillResponse(BaseModel):
    """Skill with name info."""
    skill_id: int
    skill_name: str
    category: str | None = None
    proficiency: str

    model_config = {"from_attributes": True}


class SkillsUpdateRequest(BaseModel):
    """Replace all skills for a user."""
    skills: list[SkillItem]


class SkillListResponse(BaseModel):
    """Master list of available skills."""
    id: int
    name: str
    category: str | None = None

    model_config = {"from_attributes": True}


# ---------- Experience ----------
class ExperienceCreate(BaseModel):
    """Create a new experience entry."""
    title: str = Field(..., min_length=1, max_length=200)
    company: str | None = None
    role_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None


class ExperienceUpdate(BaseModel):
    """Update an experience entry."""
    title: str | None = None
    company: str | None = None
    role_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None


class ExperienceResponse(BaseModel):
    """Experience entry response."""
    id: UUID
    user_id: UUID
    title: str
    company: str | None = None
    role_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- Portfolio ----------
class PortfolioItemCreate(BaseModel):
    """Create a portfolio item (after S3 upload)."""
    type: str = Field(..., pattern=r"^(photo|video|showreel|audio|document|resume)$")
    s3_url: str
    title: str | None = None
    description: str | None = None
    is_public: bool = True


class PortfolioItemUpdate(BaseModel):
    """Update portfolio item metadata."""
    title: str | None = None
    description: str | None = None
    is_public: bool | None = None


class PortfolioItemResponse(BaseModel):
    """Portfolio item response."""
    id: UUID
    user_id: UUID
    type: str
    s3_url: str
    title: str | None = None
    description: str | None = None
    is_public: bool = True
    sort_order: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class PortfolioReorderRequest(BaseModel):
    """Reorder portfolio items."""
    item_ids: list[UUID]


# ---------- Completeness ----------
class CompletenessResponse(BaseModel):
    """Profile completeness score and suggestions."""
    score: int
    max_score: int = 100
    suggestions: list[str]


# ---------- Upload ----------
class UploadUrlRequest(BaseModel):
    """Request a presigned S3 upload URL."""
    filename: str
    content_type: str
    purpose: str = "portfolio"  # portfolio, profile_photo, identity_doc


class UploadUrlResponse(BaseModel):
    """Presigned URL response."""
    upload_url: str
    file_key: str
    cdn_url: str
