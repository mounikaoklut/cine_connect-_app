"""Pydantic schemas for Notifications, Preferences, and Push Tokens."""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    sender_id: Optional[uuid.UUID] = None
    title: str
    body: str
    notification_type: NotificationType
    deep_link_route: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    per_page: int


class MarkReadResponse(BaseModel):
    id: uuid.UUID
    is_read: bool
    unread_count: int


class MarkAllReadResponse(BaseModel):
    success: bool
    marked_count: int
    unread_count: int


class DeviceTokenRequest(BaseModel):
    fcm_token: str = Field(..., min_length=10, max_length=512)
    device_type: str = Field(default="android", pattern="^(android|ios|web)$")


class DeviceTokenResponse(BaseModel):
    success: bool
    device_type: str
    is_active: bool


class NotificationPreferenceSchema(BaseModel):
    application_status: bool = True
    interview_schedule: bool = True
    direct_message: bool = True
    casting_alert: bool = True
    system: bool = True
    email_enabled: bool = True
    push_enabled: bool = True


class StatusChangeTriggerRequest(BaseModel):
    """Payload to trigger an application status update notification."""
    target_user_id: uuid.UUID
    sender_id: Optional[uuid.UUID] = None
    project_title: str
    role_name: str
    production_house: str
    status: str = Field(..., pattern="^(Selected|Under Review|Not Selected)$")
    application_id: Optional[str] = None
    instructions: Optional[str] = None
    feedback_note: Optional[str] = None
