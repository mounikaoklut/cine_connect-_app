"""Pydantic schemas for social: posts, reels, likes, comments, follows."""

from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field

from app.models.social import PostType


# ===================== POSTS / REELS =====================

class PostCreate(BaseModel):
    type: PostType = PostType.reel
    media_url: str | None = None
    cdn_url: str | None = None
    thumbnail_url: str | None = None
    caption: str | None = None
    tags: list[str] | None = None
    is_public: bool = True


class PostUpdate(BaseModel):
    caption: str | None = None
    tags: list[str] | None = None
    is_public: bool | None = None
    thumbnail_url: str | None = None


class PostResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: PostType
    media_url: str | None = None
    cdn_url: str | None = None
    thumbnail_url: str | None = None
    caption: str | None = None
    tags: list[str] | None = None
    like_count: int = 0
    comment_count: int = 0
    share_count: int = 0
    save_count: int = 0
    is_public: bool = True
    created_at: datetime

    model_config = {"from_attributes": True}


class FeedResponse(BaseModel):
    posts: list[PostResponse]
    total: int
    page: int
    page_size: int


# ===================== SOCIAL INTERACTIONS =====================

class SocialInteractRequest(BaseModel):
    """Like, comment, share, or save a post."""
    action: str = Field(..., pattern=r"^(like|unlike|save|unsave|share)$")
    post_id: UUID


class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)
    parent_id: UUID | None = None


class CommentResponse(BaseModel):
    id: UUID
    user_id: UUID
    post_id: UUID
    parent_id: UUID | None = None
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ===================== FOLLOW =====================

class FollowResponse(BaseModel):
    follower_id: UUID
    following_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class FollowListResponse(BaseModel):
    user_id: UUID
    name: str | None = None
    photo_url: str | None = None
    primary_craft: str | None = None

    model_config = {"from_attributes": True}


# ===================== CONNECTIONS & LEGACY =====================

class ConnectionResponse(BaseModel):
    id: UUID
    follower_id: Optional[UUID] = None
    following_id: Optional[UUID] = None
    status: Optional[str] = "pending"
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConnectionUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(accepted|declined|blocked)$")


class InteractionCreate(BaseModel):
    type: str = Field("like", pattern=r"^(like|comment)$")
    comment: Optional[str] = None


class InteractionResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    post_id: Optional[UUID] = None
    type: Optional[str] = "like"
    comment: Optional[str] = None
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}


class CollaborationCreate(BaseModel):
    talent_id: UUID


class CollaborationUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(accepted|declined)$")


class CollaborationResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID] = None
    talent_id: Optional[UUID] = None
    status: Optional[str] = "invited"
    invited_at: Optional[datetime] = None
    project_title: Optional[str] = None
    talent_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------- Messages ----------
class MessageCreate(BaseModel):
    recipient_id: UUID
    body: str = Field(..., min_length=1)
    collaboration_id: Optional[UUID] = None


class MessageResponse(BaseModel):
    id: UUID
    sender_id: Optional[UUID] = None
    recipient_id: Optional[UUID] = None
    collaboration_id: Optional[UUID] = None
    body: Optional[str] = None
    sent_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    other_user_id: UUID
    other_user_name: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None

