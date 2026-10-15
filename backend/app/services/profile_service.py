"""Profile service: business logic for profile, skills, experience, and portfolio."""

from uuid import UUID

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User, Profile, Skill, UserSkill, Experience, PortfolioItem


async def get_full_profile(db: AsyncSession, user_id: UUID) -> dict:
    """Get a user's complete profile including skills, experiences, and portfolio.

    Returns:
        Dict with profile, skills, experiences, and portfolio_items.
    """
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.profile),
            selectinload(User.skills).selectinload(UserSkill.skill),
            selectinload(User.experiences),
            selectinload(User.portfolio_items),
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        return None

    return {
        "user": user,
        "profile": user.profile,
        "skills": [
            {
                "skill_id": us.skill_id,
                "skill_name": us.skill.name,
                "category": us.skill.category,
                "proficiency": us.proficiency,
            }
            for us in user.skills
        ],
        "experiences": user.experiences,
        "portfolio_items": sorted(user.portfolio_items, key=lambda x: x.sort_order),
    }


async def update_profile(db: AsyncSession, user_id: UUID, data: dict) -> Profile:
    """Update profile fields. Only non-None fields are updated."""
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)

    for key, value in data.items():
        if value is not None and hasattr(profile, key):
            setattr(profile, key, value)

    # Recalculate completeness score
    profile.completeness_score = calculate_completeness(profile, db, user_id)
    await db.flush()
    return profile


def calculate_completeness(profile: Profile, db=None, user_id=None) -> int:
    """Calculate profile completeness score (0-100).

    Scoring weights:
        Name + Photo: 15, Bio: 10, Primary craft: 10, Skills: 10,
        Experience: 15, Portfolio: 15, Location: 5, Languages: 5,
        Availability: 5, Identity verified: 10
    """
    score = 0

    # Name + Photo (15)
    if profile.name:
        score += 8
    if profile.photo_url:
        score += 7

    # Bio (10)
    if profile.bio and len(profile.bio) >= 50:
        score += 10
    elif profile.bio:
        score += 5

    # Primary craft (10)
    if profile.primary_craft:
        score += 10

    # Location (5)
    if profile.city:
        score += 5

    # Languages (5)
    if profile.languages and len(profile.languages) > 0:
        score += 5

    # Availability (5)
    if profile.availability and profile.availability != {}:
        score += 5

    # Note: Skills (10), Experience (15), Portfolio (15), Identity (10)
    # are checked via async queries in the full scoring endpoint
    return score


async def calculate_full_completeness(db: AsyncSession, user_id: UUID) -> dict:
    """Calculate full completeness score including related records.

    Returns:
        Dict with score, max_score, and suggestions list.
    """
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.profile),
            selectinload(User.skills),
            selectinload(User.experiences),
            selectinload(User.portfolio_items),
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        return {"score": 0, "max_score": 100, "suggestions": []}

    profile = user.profile
    score = 0
    suggestions = []

    # Name + Photo (15)
    if profile and profile.name:
        score += 8
    else:
        suggestions.append("Add your name to your profile")
    if profile and profile.photo_url:
        score += 7
    else:
        suggestions.append("Upload a profile photo")

    # Bio (10)
    if profile and profile.bio and len(profile.bio) >= 50:
        score += 10
    elif profile and profile.bio:
        score += 5
        suggestions.append("Write a longer bio (50+ characters) to reach full points")
    else:
        suggestions.append("Write a bio to tell people about yourself")

    # Primary craft (10)
    if profile and profile.primary_craft:
        score += 10
    else:
        suggestions.append("Select your primary craft (e.g., Actor, DOP, Editor)")

    # Skills (10)
    if len(user.skills) >= 3:
        score += 10
    elif len(user.skills) > 0:
        score += 5
        suggestions.append(f"Add {3 - len(user.skills)} more skills to reach full points")
    else:
        suggestions.append("Add at least 3 skills to showcase your abilities")

    # Experience (15)
    if len(user.experiences) >= 1:
        score += 15
    else:
        suggestions.append("Add your work experience and credits")

    # Portfolio (15)
    if len(user.portfolio_items) >= 3:
        score += 15
    elif len(user.portfolio_items) > 0:
        score += 7
        suggestions.append(f"Add {3 - len(user.portfolio_items)} more portfolio items to reach full points")
    else:
        suggestions.append("Upload photos, showreels, or work samples to your portfolio")

    # Location (5)
    if profile and profile.city:
        score += 5
    else:
        suggestions.append("Add your city/location")

    # Languages (5)
    if profile and profile.languages and len(profile.languages) > 0:
        score += 5
    else:
        suggestions.append("Add languages you speak")

    # Availability (5)
    if profile and profile.availability and profile.availability != {}:
        score += 5
    else:
        suggestions.append("Set your availability status")

    # Identity verified (10)
    if user.identity_verified:
        score += 10
    else:
        suggestions.append("Verify your identity for a trusted badge")

    # Update stored score
    if profile:
        profile.completeness_score = score

    return {"score": score, "max_score": 100, "suggestions": suggestions}


# ---------- Skills ----------

async def get_all_skills(db: AsyncSession) -> list[Skill]:
    """Get master list of all available skills."""
    result = await db.execute(select(Skill).order_by(Skill.category, Skill.name))
    return list(result.scalars().all())


async def get_user_skills(db: AsyncSession, user_id: UUID) -> list[dict]:
    """Get a user's skills with details."""
    result = await db.execute(
        select(UserSkill)
        .options(selectinload(UserSkill.skill))
        .where(UserSkill.user_id == user_id)
    )
    return [
        {
            "skill_id": us.skill_id,
            "skill_name": us.skill.name,
            "category": us.skill.category,
            "proficiency": us.proficiency,
        }
        for us in result.scalars().all()
    ]


async def update_user_skills(
    db: AsyncSession, user_id: UUID, skills: list[dict]
) -> list[dict]:
    """Replace all skills for a user."""
    # Delete existing
    await db.execute(delete(UserSkill).where(UserSkill.user_id == user_id))

    # Add new
    for skill_data in skills:
        user_skill = UserSkill(
            user_id=user_id,
            skill_id=skill_data["skill_id"],
            proficiency=skill_data.get("proficiency", "intermediate"),
        )
        db.add(user_skill)

    await db.flush()
    return await get_user_skills(db, user_id)


# ---------- Experience ----------

async def create_experience(db: AsyncSession, user_id: UUID, data: dict) -> Experience:
    """Create a new experience entry."""
    exp = Experience(user_id=user_id, **data)
    db.add(exp)
    await db.flush()
    return exp


async def update_experience(
    db: AsyncSession, user_id: UUID, exp_id: UUID, data: dict
) -> Experience | None:
    """Update an experience entry. Returns None if not found or not owned."""
    result = await db.execute(
        select(Experience).where(Experience.id == exp_id, Experience.user_id == user_id)
    )
    exp = result.scalar_one_or_none()
    if not exp:
        return None

    for key, value in data.items():
        if value is not None and hasattr(exp, key):
            setattr(exp, key, value)

    await db.flush()
    return exp


async def delete_experience(db: AsyncSession, user_id: UUID, exp_id: UUID) -> bool:
    """Delete an experience entry. Returns True if deleted."""
    result = await db.execute(
        select(Experience).where(Experience.id == exp_id, Experience.user_id == user_id)
    )
    exp = result.scalar_one_or_none()
    if not exp:
        return False
    await db.delete(exp)
    return True


# ---------- Portfolio ----------

async def create_portfolio_item(db: AsyncSession, user_id: UUID, data: dict) -> PortfolioItem:
    """Create a new portfolio item."""
    # Get max sort_order
    result = await db.execute(
        select(PortfolioItem.sort_order)
        .where(PortfolioItem.user_id == user_id)
        .order_by(PortfolioItem.sort_order.desc())
        .limit(1)
    )
    max_order = result.scalar() or 0

    item = PortfolioItem(user_id=user_id, sort_order=max_order + 1, **data)
    db.add(item)
    await db.flush()
    return item


async def update_portfolio_item(
    db: AsyncSession, user_id: UUID, item_id: UUID, data: dict
) -> PortfolioItem | None:
    """Update a portfolio item's metadata."""
    result = await db.execute(
        select(PortfolioItem).where(
            PortfolioItem.id == item_id, PortfolioItem.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        return None

    for key, value in data.items():
        if value is not None and hasattr(item, key):
            setattr(item, key, value)

    await db.flush()
    return item


async def delete_portfolio_item(db: AsyncSession, user_id: UUID, item_id: UUID) -> bool:
    """Delete a portfolio item."""
    result = await db.execute(
        select(PortfolioItem).where(
            PortfolioItem.id == item_id, PortfolioItem.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        return False
    await db.delete(item)
    return True


async def reorder_portfolio(db: AsyncSession, user_id: UUID, item_ids: list[UUID]) -> bool:
    """Reorder portfolio items by the given ID list."""
    for index, item_id in enumerate(item_ids):
        result = await db.execute(
            select(PortfolioItem).where(
                PortfolioItem.id == item_id, PortfolioItem.user_id == user_id
            )
        )
        item = result.scalar_one_or_none()
        if item:
            item.sort_order = index
    await db.flush()
    return True
