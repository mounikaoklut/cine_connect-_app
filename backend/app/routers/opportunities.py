"""Opportunities (Casting/Job calls) and Applications router."""

from datetime import date
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.dependencies import get_current_user, require_talent, require_production
from app.models.user import User
from app.models.production_house import ProductionHouse, Project
from app.models.opportunity import Opportunity, Application
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
)

router = APIRouter(tags=["Opportunities & Applications"])


# ==========================================
# OPPORTUNITIES ENDPOINTS
# ==========================================

@router.post(
    "/opportunities",
    response_model=OpportunityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new opportunity/casting call",
)
async def create_opportunity(
    data: OpportunityCreate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    """Create a casting or job opportunity under an owned project and production house."""
    # 1. Verify project exists
    proj_result = await db.execute(select(Project).where(Project.id == data.project_id))
    project = proj_result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated project not found",
        )

    # 2. Determine and verify production house
    ph_id = data.production_house_id or project.production_house_id
    if not ph_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not linked to a valid production house",
        )

    ph_result = await db.execute(select(ProductionHouse).where(ProductionHouse.id == ph_id))
    ph = ph_result.scalar_one_or_none()
    if not ph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated production house not found",
        )

    # 3. Ownership check: current user must own the production house
    if ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create opportunities for production houses you own",
        )

    # 4. Create opportunity
    opp = Opportunity(
        project_id=data.project_id,
        production_house_id=ph_id,
        title=data.title,
        requirements=data.requirements,
        deadline=data.deadline,
        status=data.status or "open",
    )
    db.add(opp)
    try:
        await db.commit()
        await db.refresh(opp)
        return opp
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create opportunity",
        )


@router.get(
    "/opportunities",
    response_model=list[OpportunityResponse],
    summary="List casting & job opportunities",
)
async def list_opportunities(
    project_id: Optional[UUID] = Query(None, description="Filter by project ID"),
    production_house_id: Optional[UUID] = Query(None, description="Filter by production house ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (e.g. open, closed)"),
    db: AsyncSession = Depends(get_db),
):
    """Browse casting and job opportunities with optional filtering."""
    query = select(Opportunity)
    if project_id:
        query = query.where(Opportunity.project_id == project_id)
    if production_house_id:
        query = query.where(Opportunity.production_house_id == production_house_id)
    if status_filter:
        query = query.where(Opportunity.status == status_filter)

    result = await db.execute(query)
    return result.scalars().all()


@router.get(
    "/opportunities/{opp_id}",
    response_model=OpportunityResponse,
    summary="Get opportunity details by ID",
)
async def get_opportunity(
    opp_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a single opportunity."""
    result = await db.execute(select(Opportunity).where(Opportunity.id == opp_id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )
    return opp


@router.patch(
    "/opportunities/{opp_id}",
    response_model=OpportunityResponse,
    summary="Update opportunity",
)
async def update_opportunity(
    opp_id: UUID,
    data: OpportunityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update opportunity details (owner only)."""
    result = await db.execute(select(Opportunity).where(Opportunity.id == opp_id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    # Check ownership via production house
    ph_result = await db.execute(
        select(ProductionHouse).where(ProductionHouse.id == opp.production_house_id)
    )
    ph = ph_result.scalar_one_or_none()
    if not ph or ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this opportunity",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(opp, field, val)

    try:
        await db.commit()
        await db.refresh(opp)
        return opp
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update opportunity",
        )


@router.delete(
    "/opportunities/{opp_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete / close opportunity",
)
async def delete_opportunity(
    opp_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an opportunity (restricted to the production house owner)."""
    opp_result = await db.execute(select(Opportunity).where(Opportunity.id == opp_id))
    opp = opp_result.scalar_one_or_none()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    ph_result = await db.execute(
        select(ProductionHouse).where(ProductionHouse.id == opp.production_house_id)
    )
    ph = ph_result.scalar_one_or_none()
    if not ph or ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this opportunity",
        )

    await db.execute(delete(Application).where(Application.opportunity_id == opp_id))
    await db.delete(opp)
    await db.commit()



@router.get(
    "/opportunities/{opp_id}/applications",
    response_model=list[ApplicationResponse],
    summary="List applications for an opportunity (Owner only)",
)
async def list_opportunity_applications(
    opp_id: UUID,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    """List all talent applications submitted for this opportunity (restricted to company owner)."""
    opp_result = await db.execute(select(Opportunity).where(Opportunity.id == opp_id))
    opp = opp_result.scalar_one_or_none()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    # Verify ownership
    ph_result = await db.execute(
        select(ProductionHouse).where(ProductionHouse.id == opp.production_house_id)
    )
    ph = ph_result.scalar_one_or_none()
    if not ph or ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view applications for this opportunity",
        )

    app_result = await db.execute(
        select(Application).where(Application.opportunity_id == opp_id)
    )
    return app_result.scalars().all()


# ==========================================
# APPLICATIONS ENDPOINTS
# ==========================================

@router.post(
    "/applications",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply for an opportunity",
)
async def apply_to_opportunity(
    data: ApplicationCreate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Submit an application for an open opportunity."""
    # 1. Fetch opportunity
    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == data.opportunity_id)
    )
    opp = opp_result.scalar_one_or_none()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    # 2. Check opportunity status
    if opp.status and opp.status.lower() != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This opportunity is currently {opp.status} and not accepting applications",
        )

    # 3. Check deadline
    if opp.deadline and opp.deadline < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The deadline for this opportunity has already passed",
        )

    # 4. Check for duplicate application
    existing_result = await db.execute(
        select(Application).where(
            Application.talent_id == current_user.id,
            Application.opportunity_id == data.opportunity_id,
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied to this opportunity",
        )

    # 5. Create application
    application = Application(
        talent_id=current_user.id,
        opportunity_id=data.opportunity_id,
        status="pending",
        cover_letter=data.cover_letter,
    )
    db.add(application)
    try:
        await db.commit()
        await db.refresh(application)
        return application
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied to this opportunity",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit application",
        )


@router.get(
    "/applications/me",
    response_model=list[ApplicationResponse],
    summary="List current user's submitted applications",
)
async def list_my_applications(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all applications submitted by the authenticated talent user."""
    result = await db.execute(
        select(Application).where(Application.talent_id == current_user.id)
    )
    return result.scalars().all()


@router.get(
    "/applications/{app_id}",
    response_model=ApplicationResponse,
    summary="Get application details",
)
async def get_application(
    app_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a single application (talent or company owner only)."""
    result = await db.execute(
        select(Application).where(Application.id == app_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Allow if current user is the applicant
    if application.talent_id == current_user.id:
        return application

    # Or if current user is the owner of the opportunity's production house
    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == application.opportunity_id)
    )
    opp = opp_result.scalar_one_or_none()
    if opp:
        ph_result = await db.execute(
            select(ProductionHouse).where(ProductionHouse.id == opp.production_house_id)
        )
        ph = ph_result.scalar_one_or_none()
        if ph and ph.user_id == current_user.id:
            return application

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to view this application",
    )


@router.patch(
    "/applications/{app_id}/status",
    response_model=ApplicationResponse,
    summary="Update application status (Owner only)",
)
async def update_application_status(
    app_id: UUID,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    """Update application review status (e.g. shortlisted, accepted, rejected). Restricted to company owner."""
    result = await db.execute(
        select(Application).where(Application.id == app_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Verify company ownership
    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == application.opportunity_id)
    )
    opp = opp_result.scalar_one_or_none()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    ph_result = await db.execute(
        select(ProductionHouse).where(ProductionHouse.id == opp.production_house_id)
    )
    ph = ph_result.scalar_one_or_none()
    if not ph or ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this application",
        )

    application.status = data.status
    try:
        await db.commit()
        await db.refresh(application)
        return application
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application status",
        )
