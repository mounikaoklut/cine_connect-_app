"""Social router: user connections, feed posts, likes, and comments."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.social import Connection, Post, Interaction
from app.schemas.social import (
    ConnectionResponse,
    ConnectionUpdate,
    PostCreate,
    PostResponse,
    InteractionCreate,
    InteractionResponse,
)

router = APIRouter(tags=["Social & Feed"])


# ==========================================
# CONNECTIONS & FOLLOWS
# ==========================================

@router.post(
    "/connections/{target_user_id}",
    response_model=ConnectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a connection or follow request to another user",
)
async def create_connection(
    target_user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if target_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot connect with yourself",
        )

    target_res = await db.execute(select(User).where(User.id == target_user_id))
    target = target_res.scalar_one_or_none()
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found",
        )

    # Check existing connection
    existing_res = await db.execute(
        select(Connection).where(
            or_(
                (Connection.follower_id == current_user.id) & (Connection.following_id == target_user_id),
                (Connection.follower_id == target_user_id) & (Connection.following_id == current_user.id),
            )
        )
    )
    existing = existing_res.scalar_one_or_none()
    if existing:
        return existing

    conn = Connection(
        follower_id=current_user.id,
        following_id=target_user_id,
        status="pending",
    )
    db.add(conn)
    await db.commit()
    await db.refresh(conn)
    return conn


@router.get(
    "/connections",
    response_model=list[ConnectionResponse],
    summary="List current user's connections and requests",
)
async def list_connections(
    status_filter: Optional[str] = Query(None, description="Filter by status (pending, accepted, etc.)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Connection).where(
        or_(Connection.follower_id == current_user.id, Connection.following_id == current_user.id)
    )
    if status_filter:
        query = query.where(Connection.status == status_filter)

    result = await db.execute(query)
    return result.scalars().all()


@router.patch(
    "/connections/{conn_id}",
    response_model=ConnectionResponse,
    summary="Accept or decline connection request",
)
async def update_connection_status(
    conn_id: uuid.UUID,
    data: ConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Connection).where(Connection.id == conn_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    # Only recipient can accept or decline
    if conn.following_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the connection recipient can update this request",
        )

    conn.status = data.status
    await db.commit()
    await db.refresh(conn)
    return conn


@router.delete(
    "/connections/{conn_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a connection or cancel request",
)
async def delete_connection(
    conn_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Connection).where(Connection.id == conn_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    if conn.follower_id != current_user.id and conn.following_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to remove this connection",
        )

    await db.delete(conn)
    await db.commit()


# ==========================================
# FEED POSTS & INTERACTIONS
# ==========================================

@router.post(
    "/posts",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new feed post",
)
async def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = Post(
        user_id=current_user.id,
        caption=data.caption,
        media_url=data.media_url,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        caption=post.caption,
        media_url=post.media_url,
        created_at=post.created_at,
        author_name=current_user.full_name,
        likes_count=0,
        comments_count=0,
    )


@router.get(
    "/posts",
    response_model=list[PostResponse],
    summary="List feed posts with interaction counts",
)
async def list_posts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post, User)
        .outerjoin(User, Post.user_id == User.id)
        .order_by(Post.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    rows = result.all()
    output = []
    for post, author in rows:
        # Count likes and comments
        likes_res = await db.execute(
            select(func.count(Interaction.id)).where(
                Interaction.post_id == post.id, Interaction.type == "like"
            )
        )
        likes_count = likes_res.scalar() or 0

        comments_res = await db.execute(
            select(func.count(Interaction.id)).where(
                Interaction.post_id == post.id, Interaction.type == "comment"
            )
        )
        comments_count = comments_res.scalar() or 0

        output.append(
            PostResponse(
                id=post.id,
                user_id=post.user_id,
                caption=post.caption,
                media_url=post.media_url,
                created_at=post.created_at,
                author_name=author.full_name if author else None,
                likes_count=likes_count,
                comments_count=comments_count,
            )
        )
    return output


@router.get(
    "/posts/{post_id}",
    response_model=PostResponse,
    summary="Get details of a single feed post",
)
async def get_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post, User).outerjoin(User, Post.user_id == User.id).where(Post.id == post_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    post, author = row
    likes_res = await db.execute(
        select(func.count(Interaction.id)).where(
            Interaction.post_id == post.id, Interaction.type == "like"
        )
    )
    comments_res = await db.execute(
        select(func.count(Interaction.id)).where(
            Interaction.post_id == post.id, Interaction.type == "comment"
        )
    )

    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        caption=post.caption,
        media_url=post.media_url,
        created_at=post.created_at,
        author_name=author.full_name if author else None,
        likes_count=likes_res.scalar() or 0,
        comments_count=comments_res.scalar() or 0,
    )


@router.delete(
    "/posts/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete own post",
)
async def delete_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts",
        )

    await db.delete(post)
    await db.commit()


@router.post(
    "/posts/{post_id}/interactions",
    response_model=InteractionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Like or comment on a post",
)
async def create_interaction(
    post_id: uuid.UUID,
    data: InteractionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post_res = await db.execute(select(Post).where(Post.id == post_id))
    if not post_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # For likes, check if already liked
    if data.type == "like":
        existing = await db.execute(
            select(Interaction).where(
                Interaction.post_id == post_id,
                Interaction.user_id == current_user.id,
                Interaction.type == "like",
            )
        )
        like_item = existing.scalar_one_or_none()
        if like_item:
            return InteractionResponse(
                id=like_item.id,
                user_id=like_item.user_id,
                post_id=like_item.post_id,
                type=like_item.type,
                comment=like_item.comment,
                user_name=current_user.full_name,
            )

    interaction = Interaction(
        user_id=current_user.id,
        post_id=post_id,
        type=data.type,
        comment=data.comment if data.type == "comment" else None,
    )
    db.add(interaction)
    await db.commit()
    await db.refresh(interaction)

    return InteractionResponse(
        id=interaction.id,
        user_id=interaction.user_id,
        post_id=interaction.post_id,
        type=interaction.type,
        comment=interaction.comment,
        user_name=current_user.full_name,
    )


@router.delete(
    "/posts/{post_id}/interactions/{interaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a like or comment",
)
async def delete_interaction(
    post_id: uuid.UUID,
    interaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Interaction).where(
            Interaction.id == interaction_id,
            Interaction.post_id == post_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interaction not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only remove your own interactions",
        )

    await db.delete(item)
    await db.commit()
