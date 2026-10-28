"""Real-Time WebSocket and REST Chat endpoints for CineConnect."""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Set

from fastapi import (
    APIRouter, WebSocket, WebSocketDisconnect, Depends, Query,
    HTTPException, status
)
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, Profile
from app.models.chat import Conversation, ConversationParticipant, ChatMessageModel
from app.schemas.chat import (
    ChatMessageCreate, ChatMessageResponse, ConversationResponse,
    ParticipantResponse, AuditionCalloutSchema
)
from app.redis import get_redis

router = APIRouter(tags=["Real-Time Chat & Messaging"])


class ConnectionManager:
    """Singleton WebSocket Connection Manager with Redis Pub/Sub support."""

    def __init__(self):
        # Maps user_id -> Set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            payload = json.dumps(message)
            dead_sockets = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(payload)
                except Exception:
                    dead_sockets.add(connection)
            for dead in dead_sockets:
                self.active_connections[user_id].discard(dead)

    async def broadcast_to_conversation(self, message: dict, participant_ids: List[str]):
        """Broadcast message to all connected participants and publish to Redis."""
        payload_str = json.dumps(message)

        # 1. Local direct delivery
        for uid in participant_ids:
            if uid in self.active_connections:
                for connection in self.active_connections[uid]:
                    try:
                        await connection.send_text(payload_str)
                    except Exception:
                        pass

        # 2. Redis Pub/Sub broadcast for multi-instance scalability
        try:
            redis = get_redis()
            await redis.publish("chat:events", payload_str)
        except Exception:
            pass


manager = ConnectionManager()


@router.websocket("/ws/chat")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
):
    """Real-Time WebSocket endpoint supporting send_message, typing, and mark_read."""
    # For testing or authentication
    user_id = "talent-me"
    if token and token.startswith("user_"):
        user_id = token

    await manager.connect(websocket, user_id)

    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
                action = data.get("action")

                if action == "ping":
                    await websocket.send_text(json.dumps({"event": "pong", "timestamp": datetime.utcnow().isoformat()}))

                elif action == "send_message":
                    conv_id = data.get("conversation_id")
                    content = data.get("content", "")
                    msg_type = data.get("type", "text")
                    media_url = data.get("media_url")
                    media_thumb = data.get("media_thumbnail_url")
                    media_duration = data.get("media_duration_seconds")
                    media_filename = data.get("media_file_name")
                    media_filesize = data.get("media_file_size")

                    message_id = str(uuid.uuid4())
                    now_iso = datetime.utcnow().isoformat()

                    out_msg = {
                        "event": "new_message",
                        "message": {
                            "id": message_id,
                            "conversation_id": conv_id,
                            "sender_id": user_id,
                            "sender_name": "Me",
                            "is_from_talent": True,
                            "content": content,
                            "type": msg_type,
                            "media_url": media_url,
                            "media_thumbnail_url": media_thumb,
                            "media_duration_seconds": media_duration,
                            "media_file_name": media_filename,
                            "media_file_size": media_filesize,
                            "status": "delivered",
                            "timestamp": now_iso,
                        }
                    }

                    # Acknowledge back to sender
                    await websocket.send_text(json.dumps(out_msg))

                elif action == "typing":
                    conv_id = data.get("conversation_id")
                    is_typing = data.get("is_typing", False)
                    typing_event = {
                        "event": "typing_indicator",
                        "conversation_id": conv_id,
                        "is_typing": is_typing,
                        "user_id": user_id,
                    }
                    await manager.send_personal_message(typing_event, user_id)

                elif action == "mark_read":
                    conv_id = data.get("conversation_id")
                    message_id = data.get("message_id")
                    receipt_event = {
                        "event": "receipt_update",
                        "conversation_id": conv_id,
                        "message_id": message_id,
                        "status": "read",
                    }
                    await websocket.send_text(json.dumps(receipt_event))

            except json.JSONDecodeError:
                pass

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception:
        manager.disconnect(websocket, user_id)


@router.get("/chat/conversations", summary="List conversations for current user")
async def get_user_conversations():
    """Retrieve conversations segmented by production chats and direct messages."""
    # Pre-seeded rich conversations matching CineConnect specifications
    now = datetime.utcnow().isoformat()
    return {
        "production_chats": [
            {
                "id": "conv-prod-1",
                "type": "production",
                "title": "Sacred Vows — OTT Thriller",
                "project_tag": "Project: 'Sacred Vows' | Role: 'Lead Antagonist - Vikram'",
                "role_tag": "Lead Antagonist (Vikram)",
                "associated_casting_id": "cast-101",
                "participant": {
                    "id": "prod-dharma",
                    "name": "Dharma Productions / Netflix",
                    "avatar_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
                    "is_production_house": True,
                    "is_verified": True,
                    "is_online": True,
                    "last_seen_text": "Online",
                },
                "unread_count": 2,
                "updated_at": now,
            },
            {
                "id": "conv-prod-2",
                "type": "production",
                "title": "Dastaan-e-Hind",
                "project_tag": "Project: 'Dastaan-e-Hind' | Role: 'Director of Photography'",
                "role_tag": "Chief Cinematographer",
                "associated_casting_id": "cast-102",
                "participant": {
                    "id": "prod-excel",
                    "name": "Excel Entertainment",
                    "avatar_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80",
                    "is_production_house": True,
                    "is_verified": True,
                    "is_online": True,
                    "last_seen_text": "Online",
                },
                "unread_count": 0,
                "updated_at": now,
            },
        ],
        "direct_messages": [
            {
                "id": "conv-dm-1",
                "type": "direct",
                "participant": {
                    "id": "tal-1",
                    "name": "Kabir Mehra",
                    "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
                    "is_production_house": False,
                    "is_verified": True,
                    "is_online": True,
                    "last_seen_text": "Online",
                },
                "project_tag": "Actor & Voice Artist • Mumbai",
                "unread_count": 1,
                "updated_at": now,
            }
        ]
    }
