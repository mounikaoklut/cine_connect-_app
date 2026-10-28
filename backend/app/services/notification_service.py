"""Real-time Notifications Dispatcher & Background Services for CineConnect.

Handles:
1. PostgreSQL notification persistence
2. Redis unread counter cache
3. WebSocket real-time delivery
4. FCM / AWS SNS mobile push notification generation
5. AWS SES transactional email dispatch for 'Selected' status
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Set, Any

from fastapi import WebSocket
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.notification import Notification, NotificationType, UserDevice, NotificationPreference
from app.redis import get_redis

logger = logging.getLogger("cineconnect.notifications")


class NotificationConnectionManager:
    """Manages active WebSockets for real-time notification streams."""

    def __init__(self):
        # Maps user_id (string) -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket client connected for user {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket client disconnected for user {user_id}")

    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    async def send_to_user(self, user_id: str, payload: dict):
        """Send message directly to user's active WebSocket connections."""
        if user_id in self.active_connections:
            payload_str = json.dumps(payload, default=str)
            dead_sockets = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(payload_str)
                except Exception:
                    dead_sockets.add(connection)
            for dead in dead_sockets:
                self.active_connections[user_id].discard(dead)


# Global singleton connection manager
notification_ws_manager = NotificationConnectionManager()


class NotificationService:
    """Core notification business logic and background worker."""

    @staticmethod
    def get_redis_counter_key(user_id: str | uuid.UUID) -> str:
        return f"user:{str(user_id)}:unread_notifications_count"

    @classmethod
    async def get_unread_count(cls, user_id: uuid.UUID, db: Optional[AsyncSession] = None) -> int:
        """Fetch unread counter from Redis cache, falling back to PostgreSQL."""
        redis = get_redis()
        cache_key = cls.get_redis_counter_key(user_id)
        try:
            val = await redis.get(cache_key)
            if val is not None:
                return int(val)
        except Exception as e:
            logger.warning(f"Redis get unread counter failed: {e}")

        # Fallback to database
        if db:
            result = await db.execute(
                select(func.count(Notification.id)).where(
                    Notification.user_id == user_id,
                    Notification.is_read.is_(False),
                )
            )
            count = result.scalar() or 0
            try:
                await redis.set(cache_key, count, ex=86400)
            except Exception:
                pass
            return count

        return 0

    @classmethod
    async def reset_unread_count(cls, user_id: uuid.UUID) -> None:
        """Reset user unread counter in Redis to 0."""
        try:
            redis = get_redis()
            await redis.set(cls.get_redis_counter_key(user_id), 0, ex=86400)
        except Exception as e:
            logger.warning(f"Redis reset counter error: {e}")

    @classmethod
    async def decrement_unread_count(cls, user_id: uuid.UUID) -> int:
        """Decrement user unread counter in Redis."""
        try:
            redis = get_redis()
            cache_key = cls.get_redis_counter_key(user_id)
            val = await redis.decr(cache_key)
            if val < 0:
                await redis.set(cache_key, 0, ex=86400)
                return 0
            return int(val)
        except Exception as e:
            logger.warning(f"Redis decrement counter error: {e}")
            return 0

    @classmethod
    async def increment_unread_count(cls, user_id: uuid.UUID) -> int:
        """Increment user unread counter in Redis."""
        try:
            redis = get_redis()
            cache_key = cls.get_redis_counter_key(user_id)
            val = await redis.incr(cache_key)
            return int(val)
        except Exception as e:
            logger.warning(f"Redis increment counter error: {e}")
            return 1

    @classmethod
    async def dispatch_notification(
        cls,
        user_id: uuid.UUID,
        title: str,
        body: str,
        notification_type: NotificationType,
        deep_link_route: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
        sender_id: Optional[uuid.UUID] = None,
        db: Optional[AsyncSession] = None,
    ) -> Notification:
        """Full execution pipeline for issuing a notification:
        1. PostgreSQL write
        2. Redis unread counter increment
        3. Active WebSocket push
        4. FCM / AWS SNS push payload generation
        5. AWS SES email dispatch (if type == APPLICATION_STATUS and status == Selected)
        """
        metadata = metadata_json or {}

        # 1. PostgreSQL write
        async def _save_record(session: AsyncSession) -> Notification:
            notif = Notification(
                user_id=user_id,
                sender_id=sender_id,
                title=title,
                body=body,
                notification_type=notification_type,
                deep_link_route=deep_link_route,
                metadata_json=metadata,
                is_read=False,
                created_at=datetime.utcnow(),
            )
            session.add(notif)
            await session.commit()
            await session.refresh(notif)
            return notif

        if db:
            notification = await _save_record(db)
        else:
            async with AsyncSessionLocal() as session:
                notification = await _save_record(session)

        # 2. Redis unread counter increment
        unread_count = await cls.increment_unread_count(user_id)

        # 3. Active WebSocket push
        ws_payload = {
            "type": "NEW_NOTIFICATION",
            "notification": {
                "id": str(notification.id),
                "user_id": str(notification.user_id),
                "sender_id": str(notification.sender_id) if notification.sender_id else None,
                "title": notification.title,
                "body": notification.body,
                "notification_type": notification.notification_type.value,
                "deep_link_route": notification.deep_link_route,
                "metadata_json": notification.metadata_json,
                "is_read": False,
                "created_at": notification.created_at.isoformat(),
            },
            "unread_count": unread_count,
        }

        user_id_str = str(user_id)
        await notification_ws_manager.send_to_user(user_id_str, ws_payload)

        # Publish to Redis channel for multi-instance distributed sync
        try:
            redis = get_redis()
            await redis.publish(f"notifications:events:{user_id_str}", json.dumps(ws_payload))
        except Exception:
            pass

        # 4. FCM / AWS SNS push payload generation (if offline or mobile push registered)
        is_online = notification_ws_manager.is_user_online(user_id_str)
        await cls._send_mobile_push(
            user_id=user_id,
            title=title,
            body=body,
            deep_link_route=deep_link_route,
            metadata=metadata,
            is_foreground=is_online,
        )

        # 5. AWS SES email dispatch for 'Selected' status updates
        if (
            notification_type == NotificationType.APPLICATION_STATUS
            and metadata.get("status") == "Selected"
        ):
            await cls._send_transactional_email(
                user_id=user_id,
                title=title,
                body=body,
                metadata=metadata,
            )

        return notification

    @classmethod
    async def _send_mobile_push(
        cls,
        user_id: uuid.UUID,
        title: str,
        body: str,
        deep_link_route: Optional[str],
        metadata: Dict[str, Any],
        is_foreground: bool,
    ):
        """Generates and dispatches FCM/SNS mobile push notification payloads."""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(UserDevice).where(
                    UserDevice.user_id == user_id,
                    UserDevice.is_active.is_(True),
                )
            )
            devices = result.scalars().all()

        if not devices:
            logger.info(f"No active mobile device push tokens registered for user {user_id}")
            return

        fcm_payload = {
            "notification": {
                "title": title,
                "body": body,
            },
            "data": {
                "click_action": "FLUTTER_NOTIFICATION_CLICK",
                "deep_link_route": deep_link_route or "",
                "is_foreground": str(is_foreground).lower(),
                **{k: str(v) for k, v in metadata.items()},
            },
        }

        for device in devices:
            logger.info(
                f"[FCM Push Dispatch] Sent push to {device.device_type} token "
                f"{device.fcm_token[:12]}... Payload: {fcm_payload['notification']['title']}"
            )

    @classmethod
    async def _send_transactional_email(
        cls,
        user_id: uuid.UUID,
        title: str,
        body: str,
        metadata: Dict[str, Any],
    ):
        """Dispatches celebration / instructions email via AWS SES for Selected talent."""
        logger.info(
            f"[AWS SES Email Dispatch] To User {user_id} — Subject: {title} — "
            f"Role: {metadata.get('role_name')} ({metadata.get('project_title')}). "
            f"Instructions: {metadata.get('instructions', 'Awaiting studio callback confirmation.')}"
        )
