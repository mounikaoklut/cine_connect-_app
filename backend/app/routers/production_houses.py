"""Production House and Project management router."""

from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.production_house import ProductionHouse, Project
from app.schemas.production_house import (
    ProductionHouseCreate,
    ProductionHouseUpdate,
    ProductionHouseResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)

router = APIRouter(tags=["Production Houses & Projects"])


# ==========================================
# PRODUCTION HOUSES ENDPOINTS
# ==========================================

@router.post(
    "/production-houses",
    response_model=ProductionHouseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new production house",
)
async def create_production_house(
    data: ProductionHouseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register a new production house owned by the authenticated user."""
    ph = ProductionHouse(
        user_id=current_user.id,
        company_name=data.company_name,
        description=data.description,
        location=data.location,
        specialization=data.specialization,
    )
    db.add(ph)
    try:
        await db.commit()
        await db.refresh(ph)
        return ph
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create production house",
        )


@router.get(
    "/production-houses",
    response_model=list[ProductionHouseResponse],
    summary="List production houses",
)
async def list_production_houses(
    mine_only: bool = Query(False, description="Filter only production houses owned by current user"),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve production houses, optionally filtered to the authenticated user's companies."""
    query = select(ProductionHouse)
    if mine_only:
        query = query.where(ProductionHouse.user_id == current_user.id)

    result = await db.execute(query)
    return result.scalars().all()


@router.get(
    "/production-houses/{ph_id}",
    response_model=ProductionHouseResponse,
    summary="Get production house by ID",
)
async def get_production_house(
    ph_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a single production house."""
    result = await db.execute(select(ProductionHouse).where(ProductionHouse.id == ph_id))
    ph = result.scalar_one_or_none()
    if not ph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Production house not found",
        )
    return ph


@router.patch(
    "/production-houses/{ph_id}",
    response_model=ProductionHouseResponse,
    summary="Update production house",
)
async def update_production_house(
    ph_id: UUID,
    data: ProductionHouseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update details of a production house (restricted to the owner)."""
    result = await db.execute(select(ProductionHouse).where(ProductionHouse.id == ph_id))
    ph = result.scalar_one_or_none()
    if not ph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Production house not found",
        )

    if ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this production house",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(ph, field, val)

    try:
        await db.commit()
        await db.refresh(ph)
        return ph
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update production house",
        )


# ==========================================
# PROJECTS ENDPOINTS
# ==========================================

@router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new film/media project",
)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new project under a production house owned by the current user."""
    # Verify the production house exists and is owned by the current user
    ph_result = await db.execute(
        select(ProductionHouse).where(ProductionHouse.id == data.production_house_id)
    )
    ph = ph_result.scalar_one_or_none()
    if not ph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated production house not found",
        )

    if ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create projects under production houses you own",
        )

    project = Project(
        production_house_id=data.production_house_id,
        title=data.title,
        description=data.description,
        status=data.status or "development",
        start_date=data.start_date,
    )
    db.add(project)
    try:
        await db.commit()
        await db.refresh(project)
        return project
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project",
        )


@router.get(
    "/projects",
    response_model=list[ProjectResponse],
    summary="List film projects",
)
async def list_projects(
    production_house_id: Optional[UUID] = Query(None, description="Filter projects by production house ID"),
    db: AsyncSession = Depends(get_db),
):
    """List all projects, with optional filtering by production house."""
    query = select(Project)
    if production_house_id:
        query = query.where(Project.production_house_id == production_house_id)

    result = await db.execute(query)
    return result.scalars().all()


@router.get(
    "/projects/{project_id}",
    response_model=ProjectResponse,
    summary="Get project details by ID",
)
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details of a single project."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@router.patch(
    "/projects/{project_id}",
    response_model=ProjectResponse,
    summary="Update project details",
)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update project status, title, description, or start date (owner only)."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Check ownership via the production house
    ph_result = await db.execute(
        select(ProductionHouse).where(ProductionHouse.id == project.production_house_id)
    )
    ph = ph_result.scalar_one_or_none()
    if not ph or ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this project",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(project, field, val)

    try:
        await db.commit()
        await db.refresh(project)
        return project
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update project",
        )
