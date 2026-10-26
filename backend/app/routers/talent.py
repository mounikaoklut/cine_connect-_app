"""Talent Portal router — profile, portfolio, reels, social, opportunities, applications."""

import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_talent, require_any
from app.models.user import User, UserRole, Profile, UserSkill, Experience, PortfolioItem
from app.models.social import Post, Follow, Like, SavedPost, Comment
from app.models.production import (
    Opportunity, Application, ApplicationStatus, AuditionStep, OpportunityStatus
)
from app.schemas.user import (
    ProfileUpdate, ProfileResponse, PublicProfileResponse, CompletenessResponse,
    SkillResponse, SkillListResponse, SkillsUpdateRequest,
    ExperienceCreate, ExperienceUpdate, ExperienceResponse,
    PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemResponse,
    PortfolioReorderRequest, UploadUrlRequest, UploadUrlResponse,
)
from app.schemas.social import (
    PostCreate, PostUpdate, PostResponse, FeedResponse,
    SocialInteractRequest, CommentCreate, CommentResponse,
)
from app.schemas.production import (
    ApplicationCreate, ApplicationResponse, AuditionStepResponse, OpportunityResponse,
)
from app.services import profile_service
from app.utils.s3 import generate_presigned_upload_url
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/talent", tags=["Talent Portal"])


# ===================== PROFILE =====================

@router.get("/profile", response_model=dict, summary="Get full talent profile")
async def get_talent_profile(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve own profile including skills, experience, credits, and portfolio."""
    profile_data = await profile_service.get_full_profile(db, current_user.id)
    if not profile_data:
        raise HTTPException(status_code=404, detail="Profile not found")

    user = profile_data["user"]
    profile = profile_data["profile"]
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "auth_provider": user.auth_provider,
        "email_verified": user.email_verified,
        "phone_verified": user.phone_verified,
        "identity_verified": user.identity_verified,
        "profile": ProfileResponse.model_validate(profile) if profile else None,
        "skills": profile_data["skills"],
        "experiences": [ExperienceResponse.model_validate(e) for e in profile_data["experiences"]],
        "portfolio": [PortfolioItemResponse.model_validate(p) for p in profile_data["portfolio_items"]],
    }


@router.put("/profile", response_model=ProfileResponse, summary="Update talent profile")
async def update_talent_profile(
    data: ProfileUpdate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    profile = await profile_service.update_profile(
        db, current_user.id, data.model_dump(exclude_unset=True)
    )
    return ProfileResponse.model_validate(profile)


@router.get("/profile/completeness", response_model=CompletenessResponse, summary="Profile completeness score")
async def get_completeness(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    completeness = await profile_service.calculate_full_completeness(db, current_user.id)
    return CompletenessResponse(**completeness)


@router.get("/profile/{user_id}/public", response_model=PublicProfileResponse, summary="View any talent's public profile")
async def get_public_talent_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_any),
):
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(
            User.id == user_id, User.role == UserRole.TALENT
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Talent not found")
    profile = user.profile
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


# ===================== SKILLS =====================

@router.get("/skills/catalog", response_model=list[SkillListResponse], summary="All skills catalog")
async def get_skills_catalog(db: AsyncSession = Depends(get_db)):
    skills = await profile_service.get_all_skills(db)
    return [SkillListResponse.model_validate(s) for s in skills]


@router.get("/skills", response_model=list[SkillResponse], summary="My skills")
async def get_my_skills(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    return await profile_service.get_user_skills(db, current_user.id)


@router.put("/skills", response_model=list[SkillResponse], summary="Update skills")
async def update_my_skills(
    data: SkillsUpdateRequest,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    return await profile_service.update_user_skills(
        db, current_user.id, [s.model_dump() for s in data.skills]
    )


# ===================== EXPERIENCE =====================

@router.get("/experience", response_model=list[ExperienceResponse], summary="List experiences")
async def list_experiences(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    profile_data = await profile_service.get_full_profile(db, current_user.id)
    return [ExperienceResponse.model_validate(e) for e in profile_data["experiences"]]


@router.post("/experience", response_model=ExperienceResponse, status_code=201, summary="Add experience")
async def add_experience(
    data: ExperienceCreate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    exp = await profile_service.create_experience(db, current_user.id, data.model_dump())
    return ExperienceResponse.model_validate(exp)


@router.patch("/experience/{exp_id}", response_model=ExperienceResponse, summary="Update experience")
async def update_experience(
    exp_id: UUID,
    data: ExperienceUpdate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    exp = await profile_service.update_experience(
        db, current_user.id, exp_id, data.model_dump(exclude_unset=True)
    )
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return ExperienceResponse.model_validate(exp)


@router.delete("/experience/{exp_id}", status_code=204, summary="Delete experience")
async def delete_experience(
    exp_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    deleted = await profile_service.delete_experience(db, current_user.id, exp_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Experience not found")


# ===================== PORTFOLIO =====================

@router.get("/portfolio", response_model=list[PortfolioItemResponse], summary="List portfolio")
async def list_portfolio(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    profile_data = await profile_service.get_full_profile(db, current_user.id)
    return [PortfolioItemResponse.model_validate(p) for p in profile_data["portfolio_items"]]


@router.post("/portfolio", response_model=PortfolioItemResponse, status_code=201, summary="Add portfolio item")
async def add_portfolio_item(
    data: PortfolioItemCreate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    item = await profile_service.create_portfolio_item(db, current_user.id, data.model_dump())
    return PortfolioItemResponse.model_validate(item)


@router.patch("/portfolio/{item_id}", response_model=PortfolioItemResponse, summary="Update portfolio item")
async def update_portfolio_item(
    item_id: UUID,
    data: PortfolioItemUpdate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    item = await profile_service.update_portfolio_item(
        db, current_user.id, item_id, data.model_dump(exclude_unset=True)
    )
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return PortfolioItemResponse.model_validate(item)


@router.delete("/portfolio/{item_id}", status_code=204, summary="Delete portfolio item")
async def delete_portfolio_item(
    item_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    deleted = await profile_service.delete_portfolio_item(db, current_user.id, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Portfolio item not found")


@router.put("/portfolio/reorder", summary="Reorder portfolio items")
async def reorder_portfolio(
    data: PortfolioReorderRequest,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    await profile_service.reorder_portfolio(db, current_user.id, data.item_ids)
    return {"message": "Portfolio reordered successfully"}


# ===================== S3 PRESIGNED UPLOAD =====================

@router.post("/portfolio/presigned-url", response_model=UploadUrlResponse, summary="Get S3 presigned URL for media upload")
async def get_presigned_url(
    data: UploadUrlRequest,
    current_user: User = Depends(require_talent),
):
    """Generate AWS S3 pre-signed URL for direct client upload of media and headshots."""
    allowed = settings.ALLOWED_IMAGE_TYPES + settings.ALLOWED_VIDEO_TYPES + settings.ALLOWED_DOC_TYPES
    if data.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported content type: {data.content_type}")

    ext = data.filename.split(".")[-1] if "." in data.filename else "bin"
    file_key = f"{data.purpose}/{current_user.id}/{uuid.uuid4()}.{ext}"
    try:
        res = generate_presigned_upload_url(file_key=file_key, content_type=data.content_type)
        return UploadUrlResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {e}")


# ===================== REELS & FEED =====================

@router.post("/reels", response_model=PostResponse, status_code=201, summary="Save reel metadata after S3 upload")
async def create_reel(
    data: PostCreate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Save reel metadata after direct S3 upload. CDN URL is derived from media_url."""
    post = Post(
        user_id=current_user.id,
        type=data.type,
        media_url=data.media_url,
        cdn_url=data.cdn_url or data.media_url,
        thumbnail_url=data.thumbnail_url,
        caption=data.caption,
        tags=data.tags,
        is_public=data.is_public,
    )
    db.add(post)
    await db.flush()
    return PostResponse.model_validate(post)


@router.get("/feed", response_model=FeedResponse, summary="Paginated content feed with CDN URLs")
async def get_feed(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated feed of reels/posts from followed users + discovery."""
    # Get users that current user follows
    follows_result = await db.execute(
        select(Follow.following_id).where(Follow.follower_id == current_user.id)
    )
    following_ids = [row[0] for row in follows_result.fetchall()]
    following_ids.append(current_user.id)

    offset = (page - 1) * page_size
    posts_result = await db.execute(
        select(Post)
        .where(Post.user_id.in_(following_ids), Post.is_public == True)
        .order_by(desc(Post.created_at))
        .offset(offset)
        .limit(page_size)
    )
    posts = list(posts_result.scalars().all())

    total_result = await db.execute(
        select(func.count(Post.id)).where(
            Post.user_id.in_(following_ids), Post.is_public == True
        )
    )
    total = total_result.scalar() or 0

    return FeedResponse(
        posts=[PostResponse.model_validate(p) for p in posts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/reels/{post_id}", response_model=PostResponse, summary="Get a single post/reel")
async def get_post(post_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return PostResponse.model_validate(post)


@router.patch("/reels/{post_id}", response_model=PostResponse, summary="Edit a post")
async def edit_post(
    post_id: UUID,
    data: PostUpdate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(post, k, v)
    await db.flush()
    return PostResponse.model_validate(post)


@router.delete("/reels/{post_id}", status_code=204, summary="Delete a post")
async def delete_post(
    post_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)


# ===================== SOCIAL INTERACTIONS =====================

@router.post("/social/interact", summary="Like, unlike, save, unsave, or share a post")
async def social_interact(
    data: SocialInteractRequest,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Social interactions cached in Redis for real-time counter updates."""
    post_result = await db.execute(select(Post).where(Post.id == data.post_id))
    post = post_result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if data.action == "like":
        existing = await db.execute(
            select(Like).where(Like.user_id == current_user.id, Like.post_id == data.post_id)
        )
        if not existing.scalar_one_or_none():
            db.add(Like(user_id=current_user.id, post_id=data.post_id))
            post.like_count += 1
        return {"message": "Post liked"}

    elif data.action == "unlike":
        existing = await db.execute(
            select(Like).where(Like.user_id == current_user.id, Like.post_id == data.post_id)
        )
        like = existing.scalar_one_or_none()
        if like:
            await db.delete(like)
            post.like_count = max(0, post.like_count - 1)
        return {"message": "Post unliked"}

    elif data.action == "save":
        existing = await db.execute(
            select(SavedPost).where(
                SavedPost.user_id == current_user.id, SavedPost.post_id == data.post_id
            )
        )
        if not existing.scalar_one_or_none():
            db.add(SavedPost(user_id=current_user.id, post_id=data.post_id))
            post.save_count += 1
        return {"message": "Post saved"}

    elif data.action == "unsave":
        existing = await db.execute(
            select(SavedPost).where(
                SavedPost.user_id == current_user.id, SavedPost.post_id == data.post_id
            )
        )
        saved = existing.scalar_one_or_none()
        if saved:
            await db.delete(saved)
            post.save_count = max(0, post.save_count - 1)
        return {"message": "Post unsaved"}

    elif data.action == "share":
        post.share_count += 1
        return {"message": "Share counted", "share_count": post.share_count}

    return {"message": "Action completed"}


@router.get("/social/posts/{post_id}/comments", response_model=list[CommentResponse], summary="Get comments on a post")
async def get_comments(post_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment).where(Comment.post_id == post_id, Comment.parent_id == None)
        .order_by(Comment.created_at)
    )
    return [CommentResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/social/posts/{post_id}/comments", response_model=CommentResponse, status_code=201, summary="Add a comment")
async def add_comment(
    post_id: UUID,
    data: CommentCreate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        user_id=current_user.id,
        post_id=post_id,
        parent_id=data.parent_id,
        body=data.body,
    )
    db.add(comment)
    post.comment_count += 1
    await db.flush()
    return CommentResponse.model_validate(comment)


@router.delete("/social/posts/{post_id}/comments/{comment_id}", status_code=204, summary="Delete a comment")
async def delete_comment(
    post_id: UUID,
    comment_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Comment).where(
            Comment.id == comment_id,
            Comment.post_id == post_id,
            Comment.user_id == current_user.id,
        )
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post:
        post.comment_count = max(0, post.comment_count - 1)
    await db.delete(comment)


# ===================== FOLLOW / CONNECT =====================

@router.post("/social/follow", summary="Follow a talent or production house")
async def follow_user(
    target_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    if target_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    existing = await db.execute(
        select(Follow).where(
            Follow.follower_id == current_user.id, Follow.following_id == target_id
        )
    )
    if not existing.scalar_one_or_none():
        db.add(Follow(follower_id=current_user.id, following_id=target_id))
    return {"message": f"Now following {target_id}"}


@router.delete("/social/follow/{target_id}", status_code=204, summary="Unfollow a user")
async def unfollow_user(
    target_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Follow).where(
            Follow.follower_id == current_user.id, Follow.following_id == target_id
        )
    )
    follow = result.scalar_one_or_none()
    if follow:
        await db.delete(follow)


@router.get("/social/followers", summary="My followers list")
async def get_followers(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Follow).where(Follow.following_id == current_user.id)
    )
    return [{"follower_id": f.follower_id} for f in result.scalars().all()]


@router.get("/social/following", summary="Who I follow")
async def get_following(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Follow).where(Follow.follower_id == current_user.id)
    )
    return [{"following_id": f.following_id} for f in result.scalars().all()]


# ===================== OPPORTUNITIES (Talent Discovery) =====================

@router.get("/opportunities", response_model=list[OpportunityResponse], summary="Search/browse opportunities")
async def search_opportunities(
    craft: str | None = Query(None),
    city: str | None = Query(None),
    state: str | None = Query(None),
    is_remote: bool | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    """Query open opportunities with filters. OpenSearch powers advanced matching."""
    query = select(Opportunity).where(Opportunity.status == OpportunityStatus.open)
    if craft:
        query = query.where(Opportunity.craft.ilike(f"%{craft}%"))
    if city:
        query = query.where(Opportunity.city.ilike(f"%{city}%"))
    if state:
        query = query.where(Opportunity.state.ilike(f"%{state}%"))
    if is_remote is not None:
        query = query.where(Opportunity.is_remote == is_remote)

    offset = (page - 1) * page_size
    result = await db.execute(query.order_by(desc(Opportunity.created_at)).offset(offset).limit(page_size))
    return [OpportunityResponse.model_validate(o) for o in result.scalars().all()]


@router.get("/opportunities/{opportunity_id}", response_model=OpportunityResponse, summary="Opportunity details & requirements")
async def get_opportunity_detail(
    opportunity_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return OpportunityResponse.model_validate(opp)


# ===================== APPLICATIONS =====================

@router.post("/applications", response_model=ApplicationResponse, status_code=201, summary="Apply for an opportunity")
async def submit_application(
    data: ApplicationCreate,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    # Check opportunity exists and is open
    opp_result = await db.execute(
        select(Opportunity).where(
            Opportunity.id == data.opportunity_id,
            Opportunity.status == OpportunityStatus.open,
        )
    )
    if not opp_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Opportunity not found or no longer accepting applications")

    # Prevent duplicate applications
    existing = await db.execute(
        select(Application).where(
            Application.opportunity_id == data.opportunity_id,
            Application.talent_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You have already applied for this opportunity")

    application = Application(
        opportunity_id=data.opportunity_id,
        talent_id=current_user.id,
        cover_note=data.cover_note,
        portfolio_item_ids=data.portfolio_item_ids,
        reel_ids=data.reel_ids,
        status=ApplicationStatus.submitted,
        status_history=[{"status": "submitted", "timestamp": str(uuid.uuid4())}],
    )
    db.add(application)
    await db.flush()
    return ApplicationResponse.model_validate(application)


@router.get("/applications", response_model=list[ApplicationResponse], summary="My application list with statuses")
async def list_my_applications(
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application)
        .where(Application.talent_id == current_user.id)
        .order_by(desc(Application.applied_at))
    )
    return [ApplicationResponse.model_validate(a) for a in result.scalars().all()]


@router.get("/applications/{application_id}", response_model=ApplicationResponse, summary="Track application status")
async def get_application(
    application_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.talent_id == current_user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse.model_validate(application)


@router.get(
    "/applications/{application_id}/audition-steps",
    response_model=list[AuditionStepResponse],
    summary="View audition/interview steps (shortlisted candidates only)",
)
async def get_audition_steps(
    application_id: UUID,
    current_user: User = Depends(require_talent),
    db: AsyncSession = Depends(get_db),
):
    app_result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.talent_id == current_user.id,
        )
    )
    application = app_result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application.status != ApplicationStatus.shortlisted:
        raise HTTPException(status_code=403, detail="Audition steps are only visible for shortlisted candidates")

    steps_result = await db.execute(
        select(AuditionStep).where(AuditionStep.application_id == application_id)
        .order_by(AuditionStep.created_at)
    )
    return [AuditionStepResponse.model_validate(s) for s in steps_result.scalars().all()]
