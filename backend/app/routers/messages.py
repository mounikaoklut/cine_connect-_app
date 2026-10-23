"""Direct messaging and conversations router."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.social import Message, Collaboration
from app.schemas.social import MessageCreate, MessageResponse, ConversationSummary

router = APIRouter(prefix="/messages", tags=["Messaging"])


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a direct or collaboration message",
)
async def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.recipient_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a message to yourself",
        )

    # Validate recipient exists
    recip_res = await db.execute(select(User).where(User.id == data.recipient_id))
    if not recip_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient user not found",
        )

    # If collaboration_id provided, validate existence
    if data.collaboration_id:
        collab_res = await db.execute(select(Collaboration).where(Collaboration.id == data.collaboration_id))
        if not collab_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration not found",
            )

    msg = Message(
        sender_id=current_user.id,
        recipient_id=data.recipient_id,
        collaboration_id=data.collaboration_id,
        body=data.body,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.get(
    "/conversations",
    response_model=list[ConversationSummary],
    summary="List user conversations with recent message summaries",
)
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch all messages involving the current user
    result = await db.execute(
        select(Message)
        .where(or_(Message.sender_id == current_user.id, Message.recipient_id == current_user.id))
        .order_by(desc(Message.sent_at))
    )
    messages = result.scalars().all()

    # Group by conversation partner
    partners = {}
    for msg in messages:
        partner_id = msg.recipient_id if msg.sender_id == current_user.id else msg.sender_id
        if partner_id not in partners:
            partners[partner_id] = msg

    summaries = []
    for partner_id, latest_msg in partners.items():
        partner_res = await db.execute(select(User).where(User.id == partner_id))
        partner = partner_res.scalar_one_or_none()
        summaries.append(
            ConversationSummary(
                other_user_id=partner_id,
                other_user_name=partner.full_name if partner else None,
                last_message=latest_msg.body,
                last_message_at=latest_msg.sent_at,
            )
        )

    return summaries


@router.get(
    "/{other_user_id}",
    response_model=list[MessageResponse],
    summary="Get direct message history with a specific user",
)
async def get_conversation_history(
    other_user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Message)
        .where(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.recipient_id == current_user.id),
            )
        )
        .order_by(Message.sent_at.asc())
    )
    return result.scalars().all()
