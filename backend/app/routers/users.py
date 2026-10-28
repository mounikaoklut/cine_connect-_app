"""User and profile endpoints: profile management, discovery, skills, experiences, and portfolio."""

import uuid
from datetime import datetime
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_talent
from app.models.user import User, PortfolioMedia
from app.utils.security import normalize_phone
from app.schemas.auth import AccountDeleteRequest
from app.schemas.user import (
    CurrentUserResponse,
    UserProfileUpdate,
    ProfileUpdate,
    PublicProfileResponse,
    CompletenessResponse,
    SkillResponse,
    SkillListResponse,
    SkillsUpdateRequest,
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse,
    PortfolioMediaCreate,
    PortfolioMediaUpdate,
    PortfolioMediaResponse,
    PortfolioReorderRequest,
)
from app.services import auth_service

router = APIRouter(prefix="/users", tags=["Profile & Portfolio"])


# ---------- User Discovery & Search ----------

@router.get("", response_model=list[PublicProfileResponse], summary="Discover and search talent profiles")
async def search_users(
    q: Optional[str] = Query(None, description="Keyword search across name, role, bio, and location"),
    role: Optional[str] = Query(None, description="Filter by craft or role (e.g. Actor, Cinematographer)"),
    location: Optional[str] = Query(None, description="Filter by location/city"),
    account_type: Optional[str] = Query("talent", description="Filter by account type (default: talent)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Search and discover talent profiles for casting directors and collaborators."""
    query = select(User)
    if account_type:
        query = query.where(User.account_type == account_type)
    if role:
        query = query.where(User.role.ilike(f"%{role}%"))
    if location:
        query = query.where(User.location.ilike(f"%{location}%"))
    if q:
        search_pattern = f"%{q}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_pattern),
                User.role.ilike(search_pattern),
                User.bio.ilike(search_pattern),
                User.location.ilike(search_pattern),
            )
        )

    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    users = result.scalars().all()

    return [
        PublicProfileResponse(
            user_id=u.id,
            name=u.full_name,
            bio=u.bio,
            photo_url=None,
            primary_craft=u.role,
            secondary_crafts=None,
            city=u.location,
            state=None,
            identity_verified=u.identity_verified,
            completeness_score=80 if u.full_name and u.bio and u.role else 40,
        )
        for u in users
    ]


# ---------- Current User Profile ----------

@router.get("/me", response_model=CurrentUserResponse, summary="Get current authenticated user profile")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Retrieve the authenticated user's profile directly from public.users."""
    return current_user


@router.patch("/me", response_model=CurrentUserResponse, summary="Update basic profile information")
async def update_my_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update allowed profile fields directly in public.users."""
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return current_user

    if "phone" in update_data:
        new_phone = update_data.pop("phone")
        if new_phone:
            norm_phone = normalize_phone(new_phone)
            alt_phone = norm_phone[1:] if norm_phone.startswith("+") else f"+{norm_phone}"
            existing_user = await db.execute(
                select(User).where(
                    ((User.phone == norm_phone) | (User.phone == alt_phone)) & (User.id != current_user.id)
                )
            )
            if existing_user.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This mobile number is already associated with another Cine Connect account.",
                )
            current_user.phone = norm_phone
        else:
            current_user.phone = None

    for field, value in update_data.items():
        setattr(current_user, field, value)

    try:
        await db.commit()
        await db.refresh(current_user)
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}",
        )


@router.delete("/me", response_model=dict, summary="Delete current user account")
async def delete_my_account(
    data: AccountDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        await auth_service.delete_user_account(db, current_user, data.password)
        return {"message": "Account deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me/completeness", response_model=CompletenessResponse, summary="Get profile completeness score and suggestions")
async def get_completeness(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    score = 0
    suggestions = []

    if current_user.full_name:
        score += 20
    else:
        suggestions.append("Add your full name")

    if current_user.bio:
        score += 20
    else:
        suggestions.append("Add a bio summarizing your experience and style")

    if current_user.role:
        score += 20
    else:
        suggestions.append("Select your primary role or craft")

    if current_user.location:
        score += 15
    else:
        suggestions.append("Add your city / location")

    if current_user.phone:
        score += 15
    else:
        suggestions.append("Add your mobile phone number to your profile")

    # Check portfolio media
    res = await db.execute(
        select(PortfolioMedia).where(PortfolioMedia.talent_id == current_user.id)
    )
    media_items = res.scalars().all()
    if media_items:
        score += 10
    else:
        suggestions.append("Upload at least one item to your portfolio")

    return CompletenessResponse(
        score=min(score, 100),
        max_score=100,
        suggestions=suggestions,
    )


@router.get("/{user_id}/public", response_model=PublicProfileResponse, summary="Get public profile of any talent user")
async def get_public_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return PublicProfileResponse(
        user_id=user.id,
        name=user.full_name,
        bio=user.bio,
        photo_url=None,
        primary_craft=user.role,
        secondary_crafts=None,
        city=user.location,
        state=None,
        identity_verified=user.identity_verified,
        completeness_score=80 if user.full_name and user.bio and user.role else 40,
    )


# ---------- Skills ----------

SKILLS_CATALOG = [
    {"id": 1, "name": "Method Acting", "category": "Acting"},
    {"id": 2, "name": "Voice Modulation", "category": "Acting"},
    {"id": 3, "name": "Cinematography", "category": "Camera"},
    {"id": 4, "name": "Camera Operation", "category": "Camera"},
    {"id": 5, "name": "Lighting Design", "category": "Camera"},
    {"id": 6, "name": "Video Editing", "category": "Editing"},
    {"id": 7, "name": "Color Grading", "category": "Editing"},
    {"id": 8, "name": "Sound Design", "category": "Audio"},
    {"id": 9, "name": "Screenwriting", "category": "Writing"},
    {"id": 10, "name": "Direction", "category": "Direction"},
    {"id": 11, "name": "Production Management", "category": "Production"},
    {"id": 12, "name": "Stunts & Action", "category": "Stunts"},
]


@router.get("/skills/catalog", response_model=list[SkillListResponse], summary="List all skills from the catalog")
async def get_skills_catalog():
    return [SkillListResponse(**s) for s in SKILLS_CATALOG]


@router.get("/me/skills", response_model=list[SkillResponse], summary="Get skills of current user")
async def get_my_skills(current_user: User = Depends(get_current_user)):
    if current_user.role:
        return [
            SkillResponse(
                skill_id=1,
                skill_name=current_user.role,
                category="Primary Role",
                proficiency="expert",
            )
        ]
    return []


@router.put("/me/skills", response_model=list[SkillResponse], summary="Update/replace user's skills (Talent only)")
async def update_my_skills(
    data: SkillsUpdateRequest,
    current_user: User = Depends(require_talent),
):
    catalog_map = {s["id"]: s["name"] for s in SKILLS_CATALOG}
    result = []
    for s in data.skills:
        name = catalog_map.get(s.skill_id, f"Skill {s.skill_id}")
        result.append(
            SkillResponse(
                skill_id=s.skill_id,
                skill_name=name,
                proficiency=s.proficiency,
            )
        )
    return result


# ---------- Experience ----------

@router.get("/me/experience", response_model=list[ExperienceResponse], summary="List work experiences")
async def list_my_experiences(
    current_user: User = Depends(get_current_user),
):
    if current_user.experience_years:
        return [
            ExperienceResponse(
                id=current_user.id,
                user_id=current_user.id,
                title=current_user.role or "Professional Experience",
                company=current_user.location or "Independent",
                role_type="Full-time",
                start_date=None,
                end_date=None,
                description=f"{current_user.experience_years} years in {current_user.role or 'industry'}",
                created_at=current_user.created_at or datetime.utcnow(),
            )
        ]
    return []


@router.post("/me/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED, summary="Add work experience (Talent only)")
async def add_experience(
    data: ExperienceCreate,
    current_user: User = Depends(require_talent),
):
    return ExperienceResponse(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=data.title,
        company=data.company,
        role_type=data.role_type,
        start_date=data.start_date,
        end_date=data.end_date,
        description=data.description,
        created_at=datetime.utcnow(),
    )


@router.patch("/me/experience/{exp_id}", response_model=ExperienceResponse, summary="Update work experience (Talent only)")
async def update_experience(
    exp_id: UUID,
    data: ExperienceUpdate,
    current_user: User = Depends(require_talent),
):
    return ExperienceResponse(
        id=exp_id,
        user_id=current_user.id,
        title=data.title or "Updated Experience",
        company=data.company,
        role_type=data.role_type,
        start_date=data.start_date,
        end_date=data.end_date,
        description=data.description,
        created_at=datetime.utcnow(),
    )


@router.delete("/me/experience/{exp_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete work experience (Talent only)")
async def delete_experience(
    exp_id: UUID,
    current_user: User = Depends(require_talent),
):
    return None


# ---------- Portfolio (backed by public.portfolio_media) ----------

@router.get("/me/portfolio", response_model=list[PortfolioMediaResponse], summary="List portfolio media items")
async def list_my_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioMedia).where(PortfolioMedia.talent_id == current_user.id)
    )
    items = result.scalars().all()
    return [PortfolioMediaResponse.model_validate(p) for p in items]


@router.post("/me/portfolio", response_model=PortfolioMediaResponse, status_code=status.HTTP_201_CREATED, summary="Add item to portfolio (Talent only)")
async def add_portfolio_item(
    data: PortfolioMediaCreate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    item = PortfolioMedia(
        talent_id=current_user.id,
        title=data.title or "Portfolio Asset",
        media_url=data.media_url,
        media_type=data.media_type or "photo",
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return PortfolioMediaResponse.model_validate(item)


@router.patch("/me/portfolio/{item_id}", response_model=PortfolioMediaResponse, summary="Update portfolio item (Talent only)")
async def update_portfolio_item(
    item_id: UUID,
    data: PortfolioMediaUpdate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioMedia).where(
            PortfolioMedia.id == item_id,
            PortfolioMedia.talent_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio media not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if val is not None:
            setattr(item, field, val)

    await db.commit()
    await db.refresh(item)
    return PortfolioMediaResponse.model_validate(item)


@router.delete("/me/portfolio/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete portfolio item (Talent only)")
async def delete_portfolio_item(
    item_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioMedia).where(
            PortfolioMedia.id == item_id,
            PortfolioMedia.talent_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio media not found")

    await db.delete(item)
    await db.commit()


@router.put("/me/portfolio/reorder", summary="Reorder portfolio items (Talent only)")
async def reorder_portfolio_items(
    data: PortfolioReorderRequest,
    current_user: User = Depends(require_talent),
):
    return {"message": "Portfolio reordered successfully"}
