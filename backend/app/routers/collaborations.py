"""Project collaborations router."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_talent, require_production
from app.models.user import User
from app.models.production_house import ProductionHouse, Project
from app.models.social import Collaboration
from app.schemas.social import CollaborationCreate, CollaborationUpdate, CollaborationResponse

router = APIRouter(tags=["Collaborations"])


@router.post(
    "/projects/{project_id}/collaborations",
    response_model=CollaborationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Invite talent to collaborate on a project (Production only)",
)
async def invite_collaborator(
    project_id: uuid.UUID,
    data: CollaborationCreate,
    current_user: User = Depends(require_production),
    db: AsyncSession = Depends(get_db),
):
    # Verify project exists and belongs to current user via production house
    proj_res = await db.execute(select(Project).where(Project.id == project_id))
    project = proj_res.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    ph_res = await db.execute(
        select(ProductionHouse).where(ProductionHouse.id == project.production_house_id)
    )
    ph = ph_res.scalar_one_or_none()
    if not ph or ph.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can invite collaborators",
        )

    # Verify talent exists
    talent_res = await db.execute(select(User).where(User.id == data.talent_id))
    talent = talent_res.scalar_one_or_none()
    if not talent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent user not found",
        )

    # Check existing collaboration
    existing = await db.execute(
        select(Collaboration).where(
            Collaboration.project_id == project_id,
            Collaboration.talent_id == data.talent_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This talent has already been invited or added to this project",
        )

    collab = Collaboration(
        project_id=project_id,
        talent_id=data.talent_id,
        status="invited",
    )
    db.add(collab)
    await db.commit()
    await db.refresh(collab)

    return CollaborationResponse(
        id=collab.id,
        project_id=collab.project_id,
        talent_id=collab.talent_id,
        status=collab.status,
        invited_at=collab.invited_at,
        project_title=project.title,
        talent_name=talent.full_name,
    )


@router.get(
    "/projects/{project_id}/collaborations",
    response_model=list[CollaborationResponse],
    summary="List collaborators for a project",
)
async def list_project_collaborations(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Collaboration, Project, User)
        .outerjoin(Project, Collaboration.project_id == Project.id)
        .outerjoin(User, Collaboration.talent_id == User.id)
        .where(Collaboration.project_id == project_id)
    )
    rows = result.all()
    return [
        CollaborationResponse(
            id=collab.id,
            project_id=collab.project_id,
            talent_id=collab.talent_id,
            status=collab.status,
            invited_at=collab.invited_at,
            project_title=project.title if project else None,
            talent_name=talent.full_name if talent else None,
        )
        for collab, project, talent in rows
    ]


@router.get(
    "/collaborations/me",
    response_model=list[CollaborationResponse],
    summary="List project collaboration invitations for current talent (Talent only)",
)
async def list_my_collaborations(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all project collaboration invitations received by the current talent."""
    result = await db.execute(
        select(Collaboration, Project, User)
        .outerjoin(Project, Collaboration.project_id == Project.id)
        .outerjoin(User, Collaboration.talent_id == User.id)
        .where(Collaboration.talent_id == current_user.id)
    )
    rows = result.all()
    return [
        CollaborationResponse(
            id=collab.id,
            project_id=collab.project_id,
            talent_id=collab.talent_id,
            status=collab.status,
            invited_at=collab.invited_at,
            project_title=project.title if project else None,
            talent_name=talent.full_name if talent else None,
        )
        for collab, project, talent in rows
    ]


@router.patch(
    "/collaborations/{collab_id}/status",
    response_model=CollaborationResponse,
    summary="Accept or decline collaboration invitation (Talent only)",
)
async def update_collaboration_status(
    collab_id: uuid.UUID,
    data: CollaborationUpdate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Collaboration, Project, User)
        .outerjoin(Project, Collaboration.project_id == Project.id)
        .outerjoin(User, Collaboration.talent_id == User.id)
        .where(Collaboration.id == collab_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaboration not found",
        )
    collab, project, talent = row

    if collab.talent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the invited talent can update this collaboration status",
        )

    collab.status = data.status
    await db.commit()
    await db.refresh(collab)

    return CollaborationResponse(
        id=collab.id,
        project_id=collab.project_id,
        talent_id=collab.talent_id,
        status=collab.status,
        invited_at=collab.invited_at,
        project_title=project.title if project else None,
        talent_name=talent.full_name if talent else None,
    )
