"""Authentication router for registration, login, OTP verification, and password reset."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    RegisterEmailRequest,
    LoginEmailRequest,
    OTPSendRequest,
    OTPVerifyRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleAuthRequest,
    TokenResponse,
    UserBrief,
    MessageResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth & Identity"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register with email and password",
)
async def register(
    data: RegisterEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        user, access_token, refresh_token = await auth_service.register_with_email(
            db, email=data.email, password=data.password, name=data.name
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserBrief(
                id=user.id,
                email=user.email,
                name=data.name,
                email_verified=user.email_verified,
                phone_verified=user.phone_verified,
                identity_verified=user.identity_verified,
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
)
async def login(
    data: LoginEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        user, access_token, refresh_token = await auth_service.login_with_email(
            db, email=data.email, password=data.password
        )
        name = user.profile.name if user.profile else None
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserBrief(
                id=user.id,
                email=user.email,
                name=name,
                email_verified=user.email_verified,
                phone_verified=user.phone_verified,
                identity_verified=user.identity_verified,
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post(
    "/otp/send",
    response_model=MessageResponse,
    summary="Send phone OTP",
)
async def send_otp(data: OTPSendRequest):
    try:
        otp = await auth_service.send_otp(phone=data.phone)
        # Note: In dev environment, we display the generated OTP in logs/dev response
        return MessageResponse(message=f"OTP sent successfully (Dev preview: {otp})")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))


@router.post(
    "/otp/verify",
    response_model=TokenResponse,
    summary="Verify phone OTP and authenticate",
)
async def verify_otp(
    data: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        user, access_token, refresh_token = await auth_service.verify_otp_and_login(
            db, phone=data.phone, otp=data.otp
        )
        name = user.profile.name if user.profile else None
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserBrief(
                id=user.id,
                phone=user.phone,
                name=name,
                email_verified=user.email_verified,
                phone_verified=user.phone_verified,
                identity_verified=user.identity_verified,
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/refresh",
    response_model=dict,
    summary="Refresh access token using refresh token",
)
async def refresh_token(data: RefreshTokenRequest):
    try:
        new_access, new_refresh = await auth_service.refresh_tokens(data.refresh_token)
        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request password reset link/token",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    token = await auth_service.request_password_reset(db, data.email)
    # Always return success to prevent email enumeration
    msg = "If the email is registered, password reset instructions have been sent."
    if token:
        # Dev aid
        msg += f" (Dev token: {token})"
    return MessageResponse(message=msg)


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password with reset token",
)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        await auth_service.reset_password(db, data.token, data.new_password)
        return MessageResponse(message="Password has been reset successfully. Please log in.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/google",
    summary="Google OAuth token exchange",
)
async def google_auth(data: GoogleAuthRequest):
    # Google OAuth stub - can verify using google-auth library in production
    return MessageResponse(message="Google OAuth endpoint ready for client integration.")
