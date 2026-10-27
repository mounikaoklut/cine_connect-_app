"""FastAPI REST and WebSocket Endpoints for Notifications & Alerts."""

import uuid
from typing import Optional
from fastapi import (
    APIRouter, Depends, HTTPException, Query, status,
    WebSocket, WebSocketDisconnect, BackgroundTasks
)
from sqlalchemy import select, update, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, AsyncSessionLocal
from app.models.notification import (
    Notification, NotificationType, UserDevice, NotificationPreference
)
from app.schemas.notification import (
    NotificationResponse, NotificationListResponse,
    MarkReadResponse, MarkAllReadResponse,
    DeviceTokenRequest, DeviceTokenResponse,
    NotificationPreferenceSchema, StatusChangeTriggerRequest
)
from app.services.notification_service import (
    NotificationService, notification_ws_manager
)
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts Engine"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    filter_by: str = Query("all", regex="^(all|unread)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: Optional[uuid.UUID] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve paginated list of user notifications with filtering and unread counter."""
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or provide Authorization bearer token",
        )

    query = select(Notification).where(Notification.user_id == target_user_id)
    if filter_by == "unread":
        query = query.where(Notification.is_read.is_(False))

    # Total count for pagination
    count_stmt = select(func.count(Notification.id)).where(Notification.user_id == target_user_id)
    if filter_by == "unread":
        count_stmt = count_stmt.where(Notification.is_read.is_(False))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    # Paginated results ordered by creation date
    offset = (page - 1) * per_page
    query = query.order_by(desc(Notification.created_at)).offset(offset).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    unread_count = await NotificationService.get_unread_count(target_user_id, db=db)

    return NotificationListResponse(
        items=[NotificationResponse.model_validate(item) for item in items],
        total=total,
        unread_count=unread_count,
        page=page,
        per_page=per_page,
    )


@router.patch("/{notification_id}/read", response_model=MarkReadResponse)
async def mark_notification_read(
    notification_id: uuid.UUID,
    user_id: Optional[uuid.UUID] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a single notification as read and decrement the Redis unread counter."""
    target_user_id = current_user.id if current_user else user_id
    query = select(Notification).where(Notification.id == notification_id)
    if target_user_id:
        query = query.where(Notification.user_id == target_user_id)

    result = await db.execute(query)
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    if not notification.is_read:
        notification.is_read = True
        await db.commit()
        unread_count = await NotificationService.decrement_unread_count(notification.user_id)
    else:
        unread_count = await NotificationService.get_unread_count(notification.user_id, db=db)

    return MarkReadResponse(
        id=notification.id,
        is_read=notification.is_read,
        unread_count=unread_count,
    )


@router.post("/mark-all-read", response_model=MarkAllReadResponse)
async def mark_all_notifications_read(
    user_id: Optional[uuid.UUID] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Batch mark all notifications for the user as read and flush Redis unread counter to 0."""
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or provide Authorization bearer token",
        )

    stmt = (
        update(Notification)
        .where(Notification.user_id == target_user_id, Notification.is_read.is_(False))
        .values(is_read=True)
    )
    result = await db.execute(stmt)
    await db.commit()
    marked_count = result.rowcount

    await NotificationService.reset_unread_count(target_user_id)

    return MarkAllReadResponse(
        success=True,
        marked_count=marked_count,
        unread_count=0,
    )


@router.post("/device-token", response_model=DeviceTokenResponse)
async def register_device_token(
    payload: DeviceTokenRequest,
    user_id: Optional[uuid.UUID] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register or refresh the user's FCM push token for Android/Web push delivery."""
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or provide Authorization bearer token",
        )

    result = await db.execute(
        select(UserDevice).where(
            UserDevice.user_id == target_user_id,
            UserDevice.fcm_token == payload.fcm_token,
        )
    )
    device = result.scalar_one_or_none()

    if device:
        device.is_active = True
        device.device_type = payload.device_type
    else:
        device = UserDevice(
            user_id=target_user_id,
            fcm_token=payload.fcm_token,
            device_type=payload.device_type,
            is_active=True,
        )
        db.add(device)

    await db.commit()

    return DeviceTokenResponse(
        success=True,
        device_type=device.device_type,
        is_active=device.is_active,
    )


@router.get("/preferences", response_model=NotificationPreferenceSchema)
async def get_notification_preferences(
    user_id: Optional[uuid.UUID] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve user notification settings and channel toggles."""
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or provide Authorization bearer token",
        )

    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == target_user_id)
    )
    pref = result.scalar_one_or_none()
    if not pref:
        # Default settings
        return NotificationPreferenceSchema()

    return NotificationPreferenceSchema(
        application_status=pref.application_status,
        interview_schedule=pref.interview_schedule,
        direct_message=pref.direct_message,
        casting_alert=pref.casting_alert,
        system=pref.system,
        email_enabled=pref.email_enabled,
        push_enabled=pref.push_enabled,
    )


@router.put("/preferences", response_model=NotificationPreferenceSchema)
async def update_notification_preferences(
    payload: NotificationPreferenceSchema,
    user_id: Optional[uuid.UUID] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user notification preferences."""
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or provide Authorization bearer token",
        )

    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == target_user_id)
    )
    pref = result.scalar_one_or_none()

    if pref:
        pref.application_status = payload.application_status
        pref.interview_schedule = payload.interview_schedule
        pref.direct_message = payload.direct_message
        pref.casting_alert = payload.casting_alert
        pref.system = payload.system
        pref.email_enabled = payload.email_enabled
        pref.push_enabled = payload.push_enabled
    else:
        pref = NotificationPreference(
            user_id=target_user_id,
            application_status=payload.application_status,
            interview_schedule=payload.interview_schedule,
            direct_message=payload.direct_message,
            casting_alert=payload.casting_alert,
            system=payload.system,
            email_enabled=payload.email_enabled,
            push_enabled=payload.push_enabled,
        )
        db.add(pref)

    await db.commit()
    return payload


@router.post("/trigger-status-update", response_model=NotificationResponse)
async def trigger_status_update(
    payload: StatusChangeTriggerRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Trigger application status change (Selected, Under Review, Not Selected).

    Executes:
    1. Postgres write
    2. Redis unread counter increment
    3. Real-time WebSocket event
    4. Mobile push payload generation
    5. AWS SES email dispatch for Selected status
    """
    status = payload.status
    if status == "Selected":
        title = f"🎉 Congratulations! You have been Selected for {payload.role_name}"
        body = (
            f"{payload.production_house} has officially marked your application as SELECTED for "
            f"'{payload.project_title}'. Check details and instructions."
        )
    elif status == "Under Review":
        title = f"🎬 Application Under Review: {payload.role_name}"
        body = (
            f"Your self-tape and portfolio for '{payload.project_title}' are now actively being "
            f"screened by {payload.production_house} casting directors."
        )
    else:  # Not Selected
        title = f"Application Update for {payload.role_name}"
        body = (
            f"Thank you for auditioning for '{payload.project_title}'. The production team has decided to "
            f"proceed with other candidates for this specific role. Explore other open casting calls!"
        )

    deep_link = f"/opportunities/applications/{payload.application_id or 'latest'}"
    metadata = {
        "status": status,
        "role_name": payload.role_name,
        "project_title": payload.project_title,
        "production_house": payload.production_house,
        "application_id": payload.application_id or str(uuid.uuid4()),
        "instructions": payload.instructions or "Please contact production team via Studio Chat.",
        "feedback_note": payload.feedback_note,
    }

    # Execute dispatch pipeline
    notification = await NotificationService.dispatch_notification(
        user_id=payload.target_user_id,
        title=title,
        body=body,
        notification_type=NotificationType.APPLICATION_STATUS,
        deep_link_route=deep_link,
        metadata_json=metadata,
        sender_id=payload.sender_id,
        db=db,
    )

    return NotificationResponse.model_validate(notification)


# ===================== WEBSOCKET REAL-TIME STREAM =====================

@router.websocket("/ws/{user_id}")
async def websocket_notifications_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint connecting Flutter & Web clients to real-time notification events."""
    await notification_ws_manager.connect(websocket, user_id)

    # Send initial unread count on connection
    try:
        unread_count = await NotificationService.get_unread_count(uuid.UUID(user_id))
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "user_id": user_id,
            "unread_count": unread_count,
        })
    except Exception:
        pass

    try:
        while True:
            # Keep-alive ping/pong and client actions
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("action") == "PING":
                    await websocket.send_json({"type": "PONG"})
                elif msg.get("action") == "REFRESH_COUNT":
                    count = await NotificationService.get_unread_count(uuid.UUID(user_id))
                    await websocket.send_json({"type": "COUNT_UPDATE", "unread_count": count})
            except Exception:
                pass
    except WebSocketDisconnect:
        notification_ws_manager.disconnect(websocket, user_id)
