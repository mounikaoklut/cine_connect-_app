"""Pydantic schemas for Production House — company profile, projects, opportunities, applications, invitations."""

from datetime import date, datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field

from app.models.production import (
    ProjectStatus, OpportunityStatus, ApplicationStatus, InvitationStatus
)


# ===================== COMPANY PROFILE =====================

class ProductionProfileUpdate(BaseModel):
    company_name: str | None = None
    about: str | None = None
    logo_url: str | None = None
    website_url: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    genres: list[str] | None = None
    specializations: list[str] | None = None
    gst_number: str | None = None


class ProductionProfileResponse(BaseModel):
    user_id: UUID
    company_name: str
    about: str | None = None
    logo_url: str | None = None
    website_url: str | None = None
    city: str | None = None
    state: str | None = None
    country: str = "India"
    genres: list[str] | None = None
    specializations: list[str] | None = None
    is_verified: bool = False
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class PublicProductionResponse(BaseModel):
    user_id: UUID
    company_name: str
    about: str | None = None
    logo_url: str | None = None
    city: str | None = None
    state: str | None = None
    genres: list[str] | None = None
    specializations: list[str] | None = None
    is_verified: bool = False

    model_config = {"from_attributes": True}


# ===================== PROJECTS =====================

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    genre: str | None = None
    project_type: str | None = None
    status: ProjectStatus = ProjectStatus.upcoming
    shoot_start_date: date | None = None
    shoot_end_date: date | None = None
    location: str | None = None
    budget_range: str | None = None
    poster_url: str | None = None


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    genre: str | None = None
    project_type: str | None = None
    status: ProjectStatus | None = None
    shoot_start_date: date | None = None
    shoot_end_date: date | None = None
    location: str | None = None
    budget_range: str | None = None
    poster_url: str | None = None


class ProjectResponse(BaseModel):
    id: UUID
    production_id: UUID
    title: str
    description: str | None = None
    genre: str | None = None
    project_type: str | None = None
    status: ProjectStatus
    shoot_start_date: date | None = None
    shoot_end_date: date | None = None
    location: str | None = None
    budget_range: str | None = None
    poster_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===================== OPPORTUNITIES =====================

class OpportunityCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    craft: str = Field(..., min_length=1, max_length=50)
    project_id: UUID | None = None
    required_skills: list[str] | None = None
    experience_years: int | None = None
    age_min: int | None = None
    age_max: int | None = None
    gender_pref: str | None = None
    city: str | None = None
    state: str | None = None
    is_remote: bool = False
    project_type: str | None = None
    pay_min: float | None = None
    pay_max: float | None = None
    pay_unit: str = "project"
    shoot_start: date | None = None
    shoot_end: date | None = None
    application_deadline: date | None = None
    status: OpportunityStatus = OpportunityStatus.open


class OpportunityUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    craft: str | None = None
    required_skills: list[str] | None = None
    experience_years: int | None = None
    age_min: int | None = None
    age_max: int | None = None
    gender_pref: str | None = None
    city: str | None = None
    state: str | None = None
    is_remote: bool | None = None
    pay_min: float | None = None
    pay_max: float | None = None
    pay_unit: str | None = None
    shoot_start: date | None = None
    shoot_end: date | None = None
    application_deadline: date | None = None
    status: OpportunityStatus | None = None


class OpportunityResponse(BaseModel):
    id: UUID
    project_id: UUID | None = None
    posted_by: UUID
    title: str
    description: str | None = None
    craft: str
    required_skills: list[str] | None = None
    experience_years: int | None = None
    age_min: int | None = None
    age_max: int | None = None
    gender_pref: str | None = None
    city: str | None = None
    state: str | None = None
    is_remote: bool = False
    project_type: str | None = None
    pay_min: float | None = None
    pay_max: float | None = None
    pay_unit: str = "project"
    shoot_start: date | None = None
    shoot_end: date | None = None
    application_deadline: date | None = None
    status: OpportunityStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===================== APPLICATIONS =====================

class ApplicationCreate(BaseModel):
    opportunity_id: UUID
    cover_note: str | None = None
    portfolio_item_ids: list[UUID] | None = None
    reel_ids: list[UUID] | None = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    rejection_reason: str | None = None


class ApplicationResponse(BaseModel):
    id: UUID
    opportunity_id: UUID
    talent_id: UUID
    cover_note: str | None = None
    portfolio_item_ids: list[UUID] | None = None
    reel_ids: list[UUID] | None = None
    status: ApplicationStatus
    status_history: list | None = None
    rejection_reason: str | None = None
    applied_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===================== AUDITION STEPS =====================

class AuditionStepCreate(BaseModel):
    step_type: str = Field(..., pattern=r"^(online_audition|physical_audition|interview|callback)$")
    title: str | None = None
    instructions: str | None = None
    meeting_url: str | None = None
    location: str | None = None
    scheduled_at: datetime | None = None
    notes: str | None = None


class AuditionStepResponse(BaseModel):
    id: UUID
    application_id: UUID
    step_type: str
    title: str | None = None
    instructions: str | None = None
    meeting_url: str | None = None
    location: str | None = None
    scheduled_at: datetime | None = None
    is_completed: bool = False
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ===================== INVITATIONS =====================

class InvitationCreate(BaseModel):
    to_user_id: UUID
    project_id: UUID | None = None
    opportunity_id: UUID | None = None
    message: str | None = None
    expires_at: datetime | None = None


class InvitationRespond(BaseModel):
    status: InvitationStatus


class InvitationResponse(BaseModel):
    id: UUID
    from_user_id: UUID
    to_user_id: UUID
    project_id: UUID | None = None
    opportunity_id: UUID | None = None
    message: str | None = None
    status: InvitationStatus
    expires_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
