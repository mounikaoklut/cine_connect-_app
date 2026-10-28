"""Auth service: business logic for Talent & Production registration, login, tokens, and password reset."""

from uuid import UUID
from typing import Optional

from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.production_house import ProductionHouse
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_password_reset_token,
    normalize_phone,
)
from app.config import get_settings
from app.redis import get_redis

settings = get_settings()


async def check_email_available(db: AsyncSession, email: str) -> None:
    """Validate that email is not already registered."""
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")


async def check_phone_available(db: AsyncSession, phone: str, exclude_user_id: Optional[UUID] = None) -> str:
    """Validate that mobile phone is not already associated with another account."""
    norm_phone = normalize_phone(phone)
    if not norm_phone:
        return ""
    alt_phone = norm_phone[1:] if norm_phone.startswith("+") else f"+{norm_phone}"

    query = select(User).where(or_(User.phone == norm_phone, User.phone == alt_phone))
    if exclude_user_id:
        query = query.where(User.id != exclude_user_id)

    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise ValueError("Mobile number already registered with another account")
    return norm_phone


async def register_talent(
    db: AsyncSession,
    email: str,
    password: str,
    phone: str,
    name: str,
    craft: Optional[str] = None,
    location: Optional[str] = None,
) -> tuple[User, str, str]:
    """Register a new Talent account with email, password, mobile number, and name (no OTP).

    Returns:
        Tuple of (user, access_token, refresh_token)
    """
    await check_email_available(db, email)
    norm_phone = await check_phone_available(db, phone)

    user = User(
        email=email,
        full_name=name,
        password_hash=hash_password(password),
        phone=norm_phone,
        account_type="talent",
        role=craft or "talent",
        location=location,
        auth_provider="email",
        email_verified=False,
        phone_verified=False,
        identity_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, {"account_type": "talent", "role": user.role})
    refresh_token = create_refresh_token(user.id)

    return user, access_token, refresh_token


async def register_production(
    db: AsyncSession,
    company_name: str,
    email: str,
    phone: str,
    password: str,
    location: Optional[str] = None,
    description: Optional[str] = None,
) -> tuple[User, ProductionHouse, str, str]:
    """Register a new Production account and its associated production-house profile atomically (no OTP).

    Ensures no production house is created without an associated account, and no duplicate records on retries.

    Returns:
        Tuple of (user, production_house, access_token, refresh_token)
    """
    await check_email_available(db, email)
    norm_phone = await check_phone_available(db, phone)

    # Atomic creation of User and ProductionHouse in a single transaction
    user = User(
        email=email,
        full_name=company_name,
        password_hash=hash_password(password),
        phone=norm_phone,
        account_type="production",
        role="production",
        location=location,
        auth_provider="email",
        email_verified=False,
        phone_verified=False,
        identity_verified=False,
    )
    try:
        db.add(user)
        await db.flush()  # Generates user.id without committing

        ph = ProductionHouse(
            user_id=user.id,
            company_name=company_name,
            location=location,
            description=description,
        )
        db.add(ph)

        await db.commit()
        await db.refresh(user)
        await db.refresh(ph)
    except Exception:
        await db.rollback()
        raise

    access_token = create_access_token(user.id, {"account_type": "production", "role": "production"})
    refresh_token = create_refresh_token(user.id)

    return user, ph, access_token, refresh_token


async def register_with_email(
    db: AsyncSession,
    email: str,
    password: str,
    name: str,
    phone: Optional[str] = None,
    account_type: Optional[str] = "talent",
) -> tuple[User, Optional[ProductionHouse], str, str]:
    """Unified / backward-compatible registration endpoint."""
    target_type = (account_type or "talent").lower()
    if target_type == "production":
        if not phone:
            raise ValueError("Mobile number is required for production registration")
        user, ph, access, refresh = await register_production(
            db,
            company_name=name,
            email=email,
            phone=phone,
            password=password,
        )
        return user, ph, access, refresh

    # Default to Talent registration
    await check_email_available(db, email)
    norm_phone = await check_phone_available(db, phone) if phone else None

    user = User(
        email=email,
        full_name=name,
        password_hash=hash_password(password),
        phone=norm_phone,
        account_type="talent",
        role="talent",
        auth_provider="email",
        email_verified=False,
        phone_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, {"account_type": "talent", "role": user.role})
    refresh_token = create_refresh_token(user.id)

    return user, None, access_token, refresh_token


async def login_with_email(
    db: AsyncSession, email: str, password: str
) -> tuple[User, Optional[ProductionHouse], str, str]:
    """Authenticate with email and password for both Talent and Production.

    Returns:
        Tuple of (user, production_house_or_none, access_token, refresh_token)
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    # Fetch associated production house if user is a production account
    ph: Optional[ProductionHouse] = None
    ph_res = await db.execute(
        select(ProductionHouse).where(ProductionHouse.user_id == user.id)
    )
    ph = ph_res.scalars().first()

    claims = {"account_type": user.account_type or "talent", "role": user.role}
    access_token = create_access_token(user.id, claims)
    refresh_token = create_refresh_token(user.id)

    return user, ph, access_token, refresh_token


async def refresh_tokens(db: AsyncSession, refresh_token_str: str) -> tuple[str, str]:
    """Validate a refresh token, check Redis revocation, verify user existence, and issue new token pair preserving claims."""
    r = get_redis()
    try:
        is_revoked = await r.get(f"bl_token:{refresh_token_str}")
        if is_revoked:
            raise ValueError("Refresh token has been revoked. Please log in again.")
    except ValueError:
        raise
    except Exception:
        pass

    payload = decode_token(refresh_token_str)
    if not payload or payload.get("type") != "refresh":
        raise ValueError("Invalid refresh token")

    sub = payload.get("sub")
    if not sub:
        raise ValueError("Invalid token subject")

    try:
        user_id = UUID(str(sub))
    except (ValueError, TypeError):
        raise ValueError("Invalid token subject format")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    claims = {"account_type": user.account_type or "talent", "role": user.role}
    new_access = create_access_token(user.id, claims)
    new_refresh = create_refresh_token(user.id)

    # Invalidate previous refresh token upon rotation
    try:
        await r.set(
            f"bl_token:{refresh_token_str}",
            "revoked",
            ex=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        )
    except Exception:
        pass

    return new_access, new_refresh


async def revoke_refresh_token(refresh_token_str: str) -> None:
    """Revoke a refresh token by adding it to Redis blacklist."""
    r = get_redis()
    await r.set(
        f"bl_token:{refresh_token_str}",
        "revoked",
        ex=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


async def verify_email(db: AsyncSession, token: str) -> bool:
    """Verify user's email using a valid email verification token."""
    payload = decode_token(token)
    if not payload or payload.get("type") != "email_verification":
        raise ValueError("Invalid or expired email verification token")

    user_id = UUID(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    user.email_verified = True
    await db.commit()
    await db.refresh(user)
    return True


async def resend_email_verification(
    db: AsyncSession, user_id: Optional[UUID] = None, email: Optional[str] = None
) -> Optional[str]:
    """Generate a new email verification token for user."""
    from app.utils.security import create_email_verification_token
    query = select(User)
    if user_id:
        query = query.where(User.id == user_id)
    elif email:
        query = query.where(User.email == email)
    else:
        return None

    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        return None

    return create_email_verification_token(user.id)


async def delete_user_account(db: AsyncSession, user: User, password: str) -> None:
    """Delete a user account after validating their password confirmation."""
    if not user.password_hash or not verify_password(password, user.password_hash):
        raise ValueError("Invalid password confirmation")

    await db.delete(user)
    await db.commit()


async def request_password_reset(db: AsyncSession, email: str) -> Optional[str]:
    """Generate a password reset token for the given email."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        return None  # Prevent email enumeration

    return create_password_reset_token(user.id)


async def reset_password(db: AsyncSession, token: str, new_password: str) -> bool:
    """Reset password using a valid reset token."""
    payload = decode_token(token)
    if not payload or payload.get("type") != "password_reset":
        raise ValueError("Invalid or expired reset token")

    user_id = UUID(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    user.password_hash = hash_password(new_password)
    await db.commit()
    await db.refresh(user)
    return True
