"""Production House Portal router — company profile, projects, opportunities, talent discovery, applications, collaborations."""

import uuid
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_production, require_any
from app.models.user import User, UserRole, Profile, ProductionHouseProfile
from app.models.production import (
    Project, ProjectStatus,
    Opportunity, OpportunityStatus,
    Application, ApplicationStatus,
    AuditionStep,
    Invitation, InvitationStatus,
)
from app.schemas.production import (
    ProductionProfileUpdate, ProductionProfileResponse, PublicProductionResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    OpportunityCreate, OpportunityUpdate, OpportunityResponse,
    ApplicationResponse, ApplicationStatusUpdate,
    AuditionStepCreate, AuditionStepResponse,
    InvitationCreate, InvitationRespond, InvitationResponse,
)
from app.schemas.user import PublicProfileResponse, ProfileResponse, ExperienceResponse, PortfolioItemResponse
from app.utils.opensearch import search_talent, index_opportunity

router = APIRouter(prefix="/production", tags=["Production House Portal"])


# ===================== COMPANY PROFILE =====================

@router.get("/profile", response_model=ProductionProfileResponse, summary="View own company profile")
async def get_company_profile(
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductionHouseProfile).where(
            ProductionHouseProfile.user_id == current_user.id
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return ProductionProfileResponse.model_validate(profile)


@router.put("/profile", response_model=ProductionProfileResponse, summary="Update company profile")
async def update_company_profile(
    data: ProductionProfileUpdate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductionHouseProfile).where(
            ProductionHouseProfile.user_id == current_user.id
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        profile = ProductionHouseProfile(user_id=current_user.id, company_name="My Company")
        db.add(profile)

    for key, value in data.model_dump(exclude_unset=True).items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)

    await db.flush()
    return ProductionProfileResponse.model_validate(profile)


@router.get("/{prod_id}/public", response_model=PublicProductionResponse, summary="View any production house public profile")
async def get_public_production_profile(
    prod_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductionHouseProfile).where(ProductionHouseProfile.user_id == prod_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Production house not found")
    return PublicProductionResponse.model_validate(profile)


# ===================== PROJECTS =====================

@router.post("/projects", response_model=ProjectResponse, status_code=201, summary="Create a project")
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    project = Project(production_id=current_user.id, **data.model_dump())
    db.add(project)
    await db.flush()
    return ProjectResponse.model_validate(project)


@router.get("/projects", response_model=list[ProjectResponse], summary="List projects (upcoming/ongoing/completed)")
async def list_projects(
    project_status: ProjectStatus | None = Query(None),
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    query = select(Project).where(Project.production_id == current_user.id)
    if project_status:
        query = query.where(Project.status == project_status)
    result = await db.execute(query.order_by(desc(Project.created_at)))
    return [ProjectResponse.model_validate(p) for p in result.scalars().all()]


@router.get("/projects/{project_id}", response_model=ProjectResponse, summary="Project detail with casting calls")
async def get_project(
    project_id: UUID,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).options(selectinload(Project.opportunities)).where(
            Project.id == project_id, Project.production_id == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(project)


@router.put("/projects/{project_id}", response_model=ProjectResponse, summary="Update project")
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(
            Project.id == project_id, Project.production_id == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(project, key, value)
    await db.flush()
    return ProjectResponse.model_validate(project)


@router.delete("/projects/{project_id}", status_code=204, summary="Delete a project")
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(
            Project.id == project_id, Project.production_id == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)


# ===================== OPPORTUNITIES / CASTING CALLS =====================

@router.post("/opportunities", response_model=OpportunityResponse, status_code=201, summary="Publish a casting call")
async def create_opportunity(
    data: OpportunityCreate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    """Create and publish a casting call. Indexes directly into OpenSearch."""
    opportunity = Opportunity(
        posted_by=current_user.id,
        **data.model_dump(exclude_unset=True),
    )
    db.add(opportunity)
    await db.flush()

    # Index into OpenSearch for talent discovery
    try:
        await index_opportunity(opportunity)
    except Exception:
        pass  # OpenSearch indexing is best-effort, don't fail the request

    return OpportunityResponse.model_validate(opportunity)


@router.get("/opportunities", response_model=list[OpportunityResponse], summary="List all posted opportunities")
async def list_opportunities(
    opp_status: OpportunityStatus | None = Query(None),
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    query = select(Opportunity).where(Opportunity.posted_by == current_user.id)
    if opp_status:
        query = query.where(Opportunity.status == opp_status)
    result = await db.execute(query.order_by(desc(Opportunity.created_at)))
    return [OpportunityResponse.model_validate(o) for o in result.scalars().all()]


@router.put("/opportunities/{opportunity_id}", response_model=OpportunityResponse, summary="Update or close a casting call")
async def update_opportunity(
    opportunity_id: UUID,
    data: OpportunityUpdate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Opportunity).where(
            Opportunity.id == opportunity_id, Opportunity.posted_by == current_user.id
        )
    )
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(opp, key, value)
    await db.flush()
    return OpportunityResponse.model_validate(opp)


# ===================== TALENT DISCOVERY =====================

@router.get("/talent/search", summary="Advanced talent search (OpenSearch)")
async def search_talent_profiles(
    craft: str | None = Query(None, description="Primary craft e.g. Actor, DOP, Editor"),
    skills: str | None = Query(None, description="Comma-separated skill names"),
    city: str | None = Query(None),
    state: str | None = Query(None),
    experience_min: int | None = Query(None, description="Min years of experience"),
    gender: str | None = Query(None),
    age_min: int | None = Query(None),
    age_max: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    """
    Advanced talent search via AWS OpenSearch.
    Falls back to PostgreSQL query if OpenSearch is unavailable.
    """
    try:
        results = await search_talent(
            craft=craft, skills=skills, city=city, state=state,
            gender=gender, age_min=age_min, age_max=age_max,
            page=page, page_size=page_size,
        )
        return results
    except Exception:
        # PostgreSQL fallback
        query = select(User, Profile).join(
            Profile, Profile.user_id == User.id
        ).where(User.role == UserRole.TALENT, User.is_active == True)

        if craft:
            query = query.where(Profile.primary_craft.ilike(f"%{craft}%"))
        if city:
            query = query.where(Profile.city.ilike(f"%{city}%"))
        if state:
            query = query.where(Profile.state.ilike(f"%{state}%"))
        if gender:
            query = query.where(Profile.gender == gender)

        offset = (page - 1) * page_size
        result = await db.execute(
            query.order_by(desc(Profile.completeness_score)).offset(offset).limit(page_size)
        )
        rows = result.fetchall()
        return [
            {
                "user_id": row.User.id,
                "name": row.Profile.name,
                "photo_url": row.Profile.photo_url,
                "primary_craft": row.Profile.primary_craft,
                "city": row.Profile.city,
                "state": row.Profile.state,
                "identity_verified": row.User.identity_verified,
                "completeness_score": row.Profile.completeness_score,
            }
            for row in rows
        ]


@router.get("/talent/{talent_id}", summary="View full talent profile, portfolio, and credits")
async def get_talent_profile(
    talent_id: UUID,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    """Full talent profile view including portfolio assets and experience credits."""
    result = await db.execute(
        select(User).options(
            selectinload(User.profile),
            selectinload(User.skills),
            selectinload(User.experiences),
            selectinload(User.portfolio_items),
        ).where(User.id == talent_id, User.role == UserRole.TALENT)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Talent not found")

    profile = user.profile
    return {
        "user_id": user.id,
        "email": user.email,
        "identity_verified": user.identity_verified,
        "profile": ProfileResponse.model_validate(profile) if profile else None,
        "experiences": [ExperienceResponse.model_validate(e) for e in user.experiences],
        "portfolio": [PortfolioItemResponse.model_validate(p) for p in user.portfolio_items],
    }


# ===================== APPLICATIONS PIPELINE =====================

@router.get(
    "/opportunities/{opportunity_id}/applications",
    response_model=list[ApplicationResponse],
    summary="List all applications for a casting call",
)
async def list_applications(
    opportunity_id: UUID,
    app_status: ApplicationStatus | None = Query(None),
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    # Verify ownership
    opp_result = await db.execute(
        select(Opportunity).where(
            Opportunity.id == opportunity_id, Opportunity.posted_by == current_user.id
        )
    )
    if not opp_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Opportunity not found")

    query = select(Application).where(Application.opportunity_id == opportunity_id)
    if app_status:
        query = query.where(Application.status == app_status)
    result = await db.execute(query.order_by(desc(Application.applied_at)))
    return [ApplicationResponse.model_validate(a) for a in result.scalars().all()]


@router.patch(
    "/applications/{application_id}/status",
    response_model=ApplicationResponse,
    summary="Transition applicant status (review → shortlist / reject)",
)
async def update_application_status(
    application_id: UUID,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    app_result = await db.execute(
        select(Application)
        .options(selectinload(Application.opportunity))
        .where(Application.id == application_id)
    )
    application = app_result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify the opportunity belongs to this production house
    if application.opportunity.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this application")

    old_status = application.status
    application.status = data.status
    if data.rejection_reason:
        application.rejection_reason = data.rejection_reason

    # Append to status history
    history = application.status_history or []
    history.append({
        "from": old_status.value,
        "to": data.status.value,
        "timestamp": datetime.utcnow().isoformat(),
        "by": str(current_user.id),
    })
    application.status_history = history
    await db.flush()
    return ApplicationResponse.model_validate(application)


@router.post(
    "/applications/{application_id}/schedule-audition",
    response_model=AuditionStepResponse,
    status_code=201,
    summary="Send audition link/details to shortlisted candidate",
)
async def schedule_audition(
    application_id: UUID,
    data: AuditionStepCreate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    """Schedule an online/physical audition for a shortlisted applicant."""
    app_result = await db.execute(
        select(Application)
        .options(selectinload(Application.opportunity))
        .where(Application.id == application_id)
    )
    application = app_result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.opportunity.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if application.status != ApplicationStatus.shortlisted:
        raise HTTPException(
            status_code=400,
            detail="Auditions can only be scheduled for shortlisted candidates"
        )

    step = AuditionStep(application_id=application_id, **data.model_dump())
    db.add(step)
    await db.flush()
    return AuditionStepResponse.model_validate(step)


# ===================== COLLABORATIONS =====================

@router.post("/collaborations/invite", response_model=InvitationResponse, status_code=201, summary="Invite talent to collaborate")
async def send_invitation(
    data: InvitationCreate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    # Verify recipient exists
    recipient_result = await db.execute(
        select(User).where(User.id == data.to_user_id, User.role == UserRole.TALENT)
    )
    if not recipient_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Talent user not found")

    invitation = Invitation(
        from_user_id=current_user.id,
        to_user_id=data.to_user_id,
        project_id=data.project_id,
        opportunity_id=data.opportunity_id,
        message=data.message,
        expires_at=data.expires_at,
    )
    db.add(invitation)
    await db.flush()
    return InvitationResponse.model_validate(invitation)


@router.get("/collaborations", response_model=list[InvitationResponse], summary="View active collaborations")
async def list_sent_invitations(
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invitation)
        .where(Invitation.from_user_id == current_user.id)
        .order_by(desc(Invitation.created_at))
    )
    return [InvitationResponse.model_validate(i) for i in result.scalars().all()]


# ===================== TALENT INVITATION RESPONSES =====================

@router.get("/invitations/received", response_model=list[InvitationResponse], summary="Talent: view received invitations")
async def list_received_invitations(
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invitation)
        .where(Invitation.to_user_id == current_user.id)
        .order_by(desc(Invitation.created_at))
    )
    return [InvitationResponse.model_validate(i) for i in result.scalars().all()]


@router.patch("/invitations/{invitation_id}/respond", response_model=InvitationResponse, summary="Accept or decline an invitation")
async def respond_to_invitation(
    invitation_id: UUID,
    data: InvitationRespond,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invitation).where(
            Invitation.id == invitation_id,
            Invitation.to_user_id == current_user.id,
        )
    )
    invitation = result.scalar_one_or_none()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invitation.status != InvitationStatus.pending:
        raise HTTPException(status_code=400, detail="Invitation has already been responded to")

    invitation.status = data.status
    invitation.responded_at = datetime.utcnow()
    await db.flush()
    return InvitationResponse.model_validate(invitation)
