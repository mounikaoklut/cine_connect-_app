"""Auth service: business logic for registration, login, OTP, and password reset."""

from uuid import UUID

from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, Profile
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_otp,
    decode_token,
    create_password_reset_token,
)
from app.config import get_settings
from app.redis import get_redis

settings = get_settings()


async def register_with_email(
    db: AsyncSession, email: str, password: str, name: str
) -> tuple[User, str, str]:
    """Register a new user with email and password.

    Returns:
        Tuple of (user, access_token, refresh_token)

    Raises:
        ValueError if email already registered.
    """
    # Check if email exists
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")

    # Create user
    user = User(
        email=email,
        password_hash=hash_password(password),
        auth_provider="email",
    )
    db.add(user)
    await db.flush()  # Get the user.id

    # Create empty profile with name
    profile = Profile(user_id=user.id, name=name)
    db.add(profile)
    await db.flush()

    # Generate tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return user, access_token, refresh_token


async def login_with_email(
    db: AsyncSession, email: str, password: str
) -> tuple[User, str, str]:
    """Authenticate with email and password.

    Returns:
        Tuple of (user, access_token, refresh_token)

    Raises:
        ValueError if credentials are invalid.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return user, access_token, refresh_token


async def send_otp(phone: str) -> str:
    """Generate and store an OTP for the given phone number.

    Returns:
        The generated OTP (in dev; in prod, send via SMS and don't return).

    Raises:
        ValueError if rate limited.
    """
    r = get_redis()

    # Check rate limit
    attempts_key = f"otp_attempts:{phone}"
    attempts = await r.get(attempts_key)
    if attempts and int(attempts) >= settings.OTP_MAX_ATTEMPTS:
        raise ValueError("Too many OTP attempts. Try again later.")

    # Generate and store OTP
    otp = generate_otp()
    otp_key = f"otp:{phone}"
    await r.set(otp_key, otp, ex=settings.OTP_EXPIRE_SECONDS)

    # Increment attempt counter
    await r.incr(attempts_key)
    await r.expire(attempts_key, settings.OTP_RATE_LIMIT_SECONDS)

    # TODO: In production, send OTP via Twilio/MSG91 instead of returning it
    return otp


async def verify_otp_and_login(
    db: AsyncSession, phone: str, otp: str
) -> tuple[User, str, str]:
    """Verify OTP and login/register the user.

    Returns:
        Tuple of (user, access_token, refresh_token)

    Raises:
        ValueError if OTP is invalid or expired.
    """
    r = get_redis()
    otp_key = f"otp:{phone}"

    stored_otp = await r.get(otp_key)
    if not stored_otp or stored_otp != otp:
        raise ValueError("Invalid or expired OTP")

    # Delete the used OTP
    await r.delete(otp_key)

    # Find or create user
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()

    if not user:
        # New user — register
        user = User(
            phone=phone,
            auth_provider="phone",
            phone_verified=True,
        )
        db.add(user)
        await db.flush()

        # Create empty profile
        profile = Profile(user_id=user.id)
        db.add(profile)
        await db.flush()
    else:
        # Existing user — mark phone verified
        user.phone_verified = True

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return user, access_token, refresh_token


async def refresh_tokens(refresh_token_str: str) -> tuple[str, str]:
    """Validate a refresh token and issue new token pair.

    Returns:
        Tuple of (new_access_token, new_refresh_token)

    Raises:
        ValueError if token is invalid.
    """
    payload = decode_token(refresh_token_str)
    if not payload or payload.get("type") != "refresh":
        raise ValueError("Invalid refresh token")

    user_id = UUID(payload["sub"])
    new_access = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)

    return new_access, new_refresh


async def request_password_reset(db: AsyncSession, email: str) -> str | None:
    """Generate a password reset token for the given email.

    Returns:
        Reset token if user exists, None otherwise.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        return None  # Don't reveal whether email exists

    return create_password_reset_token(user.id)


async def reset_password(db: AsyncSession, token: str, new_password: str) -> bool:
    """Reset password using a valid reset token.

    Returns:
        True if successful.

    Raises:
        ValueError if token is invalid.
    """
    payload = decode_token(token)
    if not payload or payload.get("type") != "password_reset":
        raise ValueError("Invalid or expired reset token")

    user_id = UUID(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise ValueError("User not found")

    user.password_hash = hash_password(new_password)
    return True
