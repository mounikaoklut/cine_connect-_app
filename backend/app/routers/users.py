"""User and profile endpoints: profile management, skills, experiences, and portfolio."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Profile
from app.schemas.user import (
    ProfileUpdate,
    ProfileResponse,
    PublicProfileResponse,
    CompletenessResponse,
    SkillResponse,
    SkillListResponse,
    SkillsUpdateRequest,
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse,
    PortfolioItemCreate,
    PortfolioItemUpdate,
    PortfolioItemResponse,
    PortfolioReorderRequest,
)
from app.services import profile_service

router = APIRouter(prefix="/users", tags=["Profile & Portfolio"])


# ---------- Current User Profile ----------

@router.get("/me", response_model=dict, summary="Get current authenticated user profile with full details")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_data = await profile_service.get_full_profile(db, current_user.id)
    if not profile_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    user = profile_data["user"]
    profile = profile_data["profile"]

    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "auth_provider": user.auth_provider,
        "email_verified": user.email_verified,
        "phone_verified": user.phone_verified,
        "identity_verified": user.identity_verified,
        "profile": ProfileResponse.model_validate(profile) if profile else None,
        "skills": profile_data["skills"],
        "experiences": [ExperienceResponse.model_validate(e) for e in profile_data["experiences"]],
        "portfolio": [PortfolioItemResponse.model_validate(p) for p in profile_data["portfolio_items"]],
    }


@router.patch("/me", response_model=ProfileResponse, summary="Update basic profile information")
async def update_my_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await profile_service.update_profile(
        db, current_user.id, data.model_dump(exclude_unset=True)
    )
    return ProfileResponse.model_validate(profile)


@router.get("/me/completeness", response_model=CompletenessResponse, summary="Get profile completeness score and suggestions")
async def get_completeness(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    completeness = await profile_service.calculate_full_completeness(db, current_user.id)
    return CompletenessResponse(**completeness)


@router.get("/{user_id}/public", response_model=PublicProfileResponse, summary="Get public profile of any talent user")
async def get_public_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result_prof = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result_prof.scalar_one_or_none()

    return PublicProfileResponse(
        user_id=user.id,
        name=profile.name if profile else None,
        bio=profile.bio if profile else None,
        photo_url=profile.photo_url if profile else None,
        primary_craft=profile.primary_craft if profile else None,
        secondary_crafts=profile.secondary_crafts if profile else None,
        city=profile.city if profile else None,
        state=profile.state if profile else None,
        identity_verified=user.identity_verified,
        completeness_score=profile.completeness_score if profile else 0,
    )


# ---------- Skills ----------

@router.get("/skills/catalog", response_model=list[SkillListResponse], summary="List all skills from the catalog")
async def get_skills_catalog(db: AsyncSession = Depends(get_db)):
    skills = await profile_service.get_all_skills(db)
    return [SkillListResponse.model_validate(s) for s in skills]


@router.get("/me/skills", response_model=list[SkillResponse], summary="Get skills of current user")
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    skills = await profile_service.get_user_skills(db, current_user.id)
    return skills


@router.put("/me/skills", response_model=list[SkillResponse], summary="Update/replace user's skills")
async def update_my_skills(
    data: SkillsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    skill_dicts = [s.model_dump() for s in data.skills]
    updated = await profile_service.update_user_skills(db, current_user.id, skill_dicts)
    return updated


# ---------- Experience ----------

@router.get("/me/experience", response_model=list[ExperienceResponse], summary="List work experiences")
async def list_my_experiences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_data = await profile_service.get_full_profile(db, current_user.id)
    return [ExperienceResponse.model_validate(e) for e in profile_data["experiences"]]


@router.post("/me/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED, summary="Add work experience")
async def add_experience(
    data: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    exp = await profile_service.create_experience(db, current_user.id, data.model_dump())
    return ExperienceResponse.model_validate(exp)


@router.patch("/me/experience/{exp_id}", response_model=ExperienceResponse, summary="Update work experience")
async def update_experience(
    exp_id: UUID,
    data: ExperienceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    exp = await profile_service.update_experience(
        db, current_user.id, exp_id, data.model_dump(exclude_unset=True)
    )
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
    return ExperienceResponse.model_validate(exp)


@router.delete("/me/experience/{exp_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete work experience")
async def delete_experience(
    exp_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await profile_service.delete_experience(db, current_user.id, exp_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")


# ---------- Portfolio ----------

@router.get("/me/portfolio", response_model=list[PortfolioItemResponse], summary="List portfolio items")
async def list_my_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_data = await profile_service.get_full_profile(db, current_user.id)
    return [PortfolioItemResponse.model_validate(p) for p in profile_data["portfolio_items"]]


@router.post("/me/portfolio", response_model=PortfolioItemResponse, status_code=status.HTTP_201_CREATED, summary="Add item to portfolio")
async def add_portfolio_item(
    data: PortfolioItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = await profile_service.create_portfolio_item(db, current_user.id, data.model_dump())
    return PortfolioItemResponse.model_validate(item)


@router.patch("/me/portfolio/{item_id}", response_model=PortfolioItemResponse, summary="Update portfolio item")
async def update_portfolio_item(
    item_id: UUID,
    data: PortfolioItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = await profile_service.update_portfolio_item(
        db, current_user.id, item_id, data.model_dump(exclude_unset=True)
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")
    return PortfolioItemResponse.model_validate(item)


@router.delete("/me/portfolio/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete portfolio item")
async def delete_portfolio_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await profile_service.delete_portfolio_item(db, current_user.id, item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")


@router.put("/me/portfolio/reorder", summary="Reorder portfolio items")
async def reorder_portfolio_items(
    data: PortfolioReorderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await profile_service.reorder_portfolio(db, current_user.id, data.item_ids)
    return {"message": "Portfolio reordered successfully"}
