"""Chat router — REST endpoints for conversations + WebSocket real-time messaging via Redis Pub/Sub."""

import json
import uuid
from uuid import UUID
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_any
from app.models.user import User
from app.models.chat import Conversation, Message, Notification
from app.schemas.chat import (
    ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse, MessageHistoryResponse,
    WSMessageIn, WSMessageOut,
    NotificationResponse,
)
from app.redis import get_redis
from app.utils.security import decode_token

router = APIRouter(prefix="/chat", tags=["Chat & Messaging"])


# ===================== CONVERSATIONS =====================

@router.get("/rooms", response_model=list[ConversationResponse], summary="Get active conversations")
async def list_conversations(
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    """List all conversations where the current user is a participant."""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.participant_ids.any(current_user.id))  # type: ignore
        .order_by(desc(Conversation.last_message_at))
    )
    return [ConversationResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/rooms", response_model=ConversationResponse, status_code=201, summary="Start a conversation")
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    """Start or retrieve an existing 1:1 conversation between two users."""
    if data.participant_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot start a conversation with yourself")

    # Check if conversation already exists between these two users
    result = await db.execute(
        select(Conversation).where(
            Conversation.participant_ids.contains([current_user.id]),  # type: ignore
            Conversation.participant_ids.contains([data.participant_id]),  # type: ignore
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return ConversationResponse.model_validate(existing)

    conversation = Conversation(
        participant_ids=[current_user.id, data.participant_id],
        project_id=data.project_id,
    )
    db.add(conversation)
    await db.flush()

    # Send initial message if provided
    if data.initial_message:
        msg = Message(
            conversation_id=conversation.id,
            sender_id=current_user.id,
            body=data.initial_message,
        )
        db.add(msg)
        await db.flush()

    return ConversationResponse.model_validate(conversation)


@router.get("/rooms/{room_id}/messages", response_model=MessageHistoryResponse, summary="Paginated chat history")
async def get_chat_history(
    room_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    """Load paginated chat history from PostgreSQL with Redis cache fallback."""
    # Verify participation
    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == room_id)
    )
    conversation = conv_result.scalar_one_or_none()
    if not conversation or current_user.id not in conversation.participant_ids:
        raise HTTPException(status_code=403, detail="Not a participant of this conversation")

    offset = (page - 1) * page_size
    messages_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == room_id)
        .order_by(desc(Message.created_at))
        .offset(offset)
        .limit(page_size)
    )
    messages = list(messages_result.scalars().all())

    total_result = await db.execute(
        select(func.count(Message.id)).where(Message.conversation_id == room_id)
    )
    total = total_result.scalar() or 0

    return MessageHistoryResponse(
        messages=[MessageResponse.model_validate(m) for m in reversed(messages)],
        total=total,
        page=page,
        page_size=page_size,
    )


# ===================== NOTIFICATIONS =====================

@router.get("/notifications", response_model=list[NotificationResponse], summary="Get in-app notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    query = select(Notification).where(Notification.user_id == current_user.id)
    if unread_only:
        query = query.where(Notification.is_read == False)
    result = await db.execute(query.order_by(desc(Notification.created_at)).limit(100))
    return [NotificationResponse.model_validate(n) for n in result.scalars().all()]


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse, summary="Mark notification as read")
async def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    await db.flush()
    return NotificationResponse.model_validate(notification)


@router.patch("/notifications/read-all", summary="Mark all notifications as read")
async def mark_all_notifications_read(
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
    )
    for notification in result.scalars().all():
        notification.is_read = True
    return {"message": "All notifications marked as read"}


# ===================== WEBSOCKET — REAL-TIME CHAT =====================

class ConnectionManager:
    """Manages active WebSocket connections per room."""

    def __init__(self):
        # room_id -> list of (websocket, user_id)
        self.active_connections: dict[str, list[tuple[WebSocket, str]]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append((websocket, user_id))

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id] = [
                (ws, uid) for ws, uid in self.active_connections[room_id] if ws != websocket
            ]

    async def broadcast(self, room_id: str, message: dict):
        """Broadcast to all connected clients in the room."""
        if room_id in self.active_connections:
            dead = []
            for ws, uid in self.active_connections[room_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.append((ws, uid))
            for item in dead:
                self.active_connections[room_id].remove(item)


manager = ConnectionManager()


@router.websocket("/ws/chat/{room_id}")
async def websocket_chat(
    websocket: WebSocket,
    room_id: str,
    token: str,
):
    """
    Bi-directional WebSocket endpoint backed by Redis Pub/Sub.

    Connect with: ws://.../ws/chat/{room_id}?token=<JWT>

    Message format (send):
        {"body": "Hello!", "attachment_urls": []}

    Message format (receive):
        {"id": "...", "conversation_id": "...", "sender_id": "...", "body": "...", "created_at": "..."}
    """
    # Authenticate via token query param
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    sender_id = payload.get("sub")
    if not sender_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, room_id, sender_id)
    r = get_redis()
    pubsub_channel = f"chat:{room_id}"

    try:
        while True:
            # Wait for message from the client
            raw = await websocket.receive_text()
            try:
                data = WSMessageIn.model_validate_json(raw)
            except Exception:
                await websocket.send_json({"error": "Invalid message format"})
                continue

            # Persist to DB (use a new session per message)
            from app.database import AsyncSessionLocal
            async with AsyncSessionLocal() as db:
                async with db.begin():
                    msg = Message(
                        conversation_id=UUID(room_id),
                        sender_id=UUID(sender_id),
                        body=data.body,
                        attachment_urls=data.attachment_urls,
                        status="sent",
                    )
                    db.add(msg)
                    await db.flush()

                    # Update conversation last_message_at
                    conv_result = await db.execute(
                        select(Conversation).where(Conversation.id == UUID(room_id))
                    )
                    conv = conv_result.scalar_one_or_none()
                    if conv:
                        from datetime import datetime
                        conv.last_message_at = datetime.utcnow()

                    await db.commit()

                    out_payload = WSMessageOut(
                        id=str(msg.id),
                        conversation_id=room_id,
                        sender_id=sender_id,
                        body=data.body,
                        attachment_urls=data.attachment_urls,
                        created_at=msg.created_at.isoformat(),
                    )

            # Broadcast to all connections in this room (in-process)
            await manager.broadcast(room_id, out_payload.model_dump())

            # Publish to Redis Pub/Sub so other server instances receive it
            try:
                await r.publish(pubsub_channel, out_payload.model_dump_json())
            except Exception:
                pass

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
