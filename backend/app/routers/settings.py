"""FastAPI Router for User Settings, Preferences, Security, and Sessions."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.database import get_db
from app.redis import get_redis
from app.models.user import User
from app.dependencies import security_scheme
from app.utils.security import decode_token
from app.schemas.settings import (
    UserSettingsResponse, UserSettingsUpdate, ActiveSessionsListResponse,
    PasswordChangeRequest, Toggle2FARequest, Toggle2FAResponse,
    AccountActionRequest, DataExportResponse
)
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["Settings & Account Management"])

DEFAULT_TEST_USER_ID = UUID("d3b07384-d113-4a44-9c81-c30089f23d88")


async def get_optional_current_user_id(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
) -> UUID:
    """Extract user ID from Bearer JWT, x-user-id header, or default test account."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("sub"):
            try:
                return UUID(payload["sub"])
            except ValueError:
                pass

    if x_user_id:
        try:
            return UUID(x_user_id)
        except ValueError:
            pass

    return DEFAULT_TEST_USER_ID


@router.get("/me", response_model=UserSettingsResponse)
async def get_my_settings(
    user_id: UUID = Depends(get_optional_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Fetch current user settings and account preferences."""
    settings = await SettingsService.get_or_create_settings(db, user_id)
    return settings


@router.put("/me", response_model=UserSettingsResponse)
async def update_my_settings(
    update_data: UserSettingsUpdate,
    user_id: UUID = Depends(get_optional_current_user_id),
    db: AsyncSession = Depends(get_db),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """Update profile parameters, availability, notifications matrix, and general preferences."""
    updated = await SettingsService.update_settings(db, user_id, update_data, redis_client)
    return updated


@router.get("/sessions", response_model=ActiveSessionsListResponse)
async def get_active_sessions(
    request: Request,
    user_id: UUID = Depends(get_optional_current_user_id),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """Retrieve active devices and login sessions tracked in Redis."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Client")
    return await SettingsService.get_active_sessions(redis_client, user_id, client_ip, user_agent)


@router.delete("/sessions/{session_id}")
async def revoke_active_session(
    session_id: str,
    user_id: UUID = Depends(get_optional_current_user_id),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """Revoke a specific active device session from Redis."""
    success = await SettingsService.revoke_session(redis_client, user_id, session_id)
    return {"status": "success", "revoked_session_id": session_id}


@router.post("/sessions/revoke-all-others")
async def revoke_all_other_sessions(
    user_id: UUID = Depends(get_optional_current_user_id),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """One-tap sign out of all other active devices."""
    count = await SettingsService.revoke_all_other_sessions(redis_client, user_id)
    return {
        "status": "success",
        "message": f"Successfully invalidated {count} other active device sessions.",
        "revoked_count": count
    }


@router.post("/security/change-password")
async def change_password(
    req: PasswordChangeRequest,
    user_id: UUID = Depends(get_optional_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Secure password update validating current credentials."""
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        # Create user record if default test user
        user = User(id=user_id, email="kabir.mehra@cineconnect.com")
        db.add(user)
        await db.commit()
        await db.refresh(user)

    success, msg = await SettingsService.change_password(
        db, user, req.current_password, req.new_password, req.confirm_password
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    return {"status": "success", "message": msg}


@router.post("/security/toggle-2fa", response_model=Toggle2FAResponse)
async def toggle_two_factor(
    req: Toggle2FARequest,
    user_id: UUID = Depends(get_optional_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable Two-Factor Authentication."""
    return await SettingsService.toggle_2fa(db, user_id, req.enabled)


@router.post("/export-data", response_model=DataExportResponse)
async def export_data(
    user_id: UUID = Depends(get_optional_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Generate a downloadable ZIP package of all user data and media metadata."""
    return await SettingsService.export_user_data(db, user_id)


@router.delete("/account")
async def deactivate_or_delete_account(
    req: AccountActionRequest,
    user_id: UUID = Depends(get_optional_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate or permanently delete account with safeguards."""
    if req.action == "DELETE" and req.confirmation_text.strip() != "DELETE MY ACCOUNT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation text must exactly match 'DELETE MY ACCOUNT'."
        )

    success, message = await SettingsService.deactivate_or_delete_account(db, user_id, req.action)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return {"status": "success", "action": req.action, "message": message}
