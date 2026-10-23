"""Authentication router for Talent & Production registration, login, token management, and password recovery."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    RegisterTalentRequest,
    RegisterProductionRequest,
    RegisterEmailRequest,
    LoginEmailRequest,
    RefreshTokenRequest,
    LogoutRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
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
    "/register/talent",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Talent account",
)
async def register_talent_endpoint(
    data: RegisterTalentRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new Talent user with email, password, mobile number, and full name.

    No OTP verification is required in this local environment.
    """
    try:
        user, access_token, refresh_token = await auth_service.register_talent(
            db=db,
            email=data.email,
            password=data.password,
            phone=data.phone,
            name=data.name,
            craft=data.craft,
            location=data.location,
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserBrief(
                id=user.id,
                email=user.email,
                phone=user.phone,
                name=user.full_name,
                account_type=user.account_type,
                role=user.role,
                email_verified=user.email_verified,
                phone_verified=user.phone_verified,
                identity_verified=user.identity_verified,
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/register/production",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Production account and house profile",
)
async def register_production_endpoint(
    data: RegisterProductionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new Production company account with company name, email, mobile number, and password.

    Creates both the Production user account and its associated production-house profile in one atomic transaction.
    No OTP verification is required.
    """
    try:
        user, ph, access_token, refresh_token = await auth_service.register_production(
            db=db,
            company_name=data.company_name,
            email=data.email,
            phone=data.phone,
            password=data.password,
            location=data.location,
            description=data.description,
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserBrief(
                id=user.id,
                email=user.email,
                phone=user.phone,
                name=user.full_name,
                account_type=user.account_type,
                role=user.role,
                production_house_id=ph.id,
                production_house_name=ph.company_name,
                email_verified=user.email_verified,
                phone_verified=user.phone_verified,
                identity_verified=user.identity_verified,
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Unified email registration endpoint",
)
async def register(
    data: RegisterEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    """Backward-compatible registration endpoint supporting both talent and production accounts."""
    try:
        user, ph, access_token, refresh_token = await auth_service.register_with_email(
            db,
            email=data.email,
            password=data.password,
            name=data.name,
            phone=data.phone,
            account_type=data.account_type,
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserBrief(
                id=user.id,
                email=user.email,
                phone=user.phone,
                name=user.full_name or data.name,
                account_type=user.account_type,
                role=user.role,
                production_house_id=ph.id if ph else None,
                production_house_name=ph.company_name if ph else None,
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
    """Authenticate either Talent or Production account using email and password.

    Returns JWT token pair and user information including account type and role.
    """
    try:
        user, ph, access_token, refresh_token = await auth_service.login_with_email(
            db, email=data.email, password=data.password
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserBrief(
                id=user.id,
                email=user.email,
                phone=user.phone,
                name=user.full_name,
                account_type=user.account_type,
                role=user.role,
                production_house_id=ph.id if ph else None,
                production_house_name=ph.company_name if ph else None,
                email_verified=user.email_verified,
                phone_verified=user.phone_verified,
                identity_verified=user.identity_verified,
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post(
    "/refresh",
    response_model=dict,
    summary="Refresh access token using refresh token",
)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Exchange a valid refresh token for a new access and refresh token pair."""
    try:
        new_access, new_refresh = await auth_service.refresh_tokens(db, data.refresh_token)
        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Revoke refresh token and logout",
)
async def logout(data: LogoutRequest):
    """Revoke the current refresh token by blacklisting it in Redis."""
    if data.refresh_token:
        try:
            await auth_service.revoke_refresh_token(data.refresh_token)
        except Exception:
            pass
    return MessageResponse(message="Successfully logged out")


@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Verify email address with token",
)
async def verify_email_endpoint(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """Verify user's registered email using a verification token."""
    try:
        await auth_service.verify_email(db, data.token)
        return MessageResponse(message="Email address verified successfully")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/resend-email-verification",
    response_model=MessageResponse,
    summary="Resend email verification link/token",
)
async def resend_email_verification_endpoint(
    data: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate and dispatch a new email verification token."""
    token = await auth_service.resend_email_verification(db, email=data.email)
    msg = "If the email is registered, verification instructions have been sent."
    if token:
        msg += f" (Dev token: {token})"
    return MessageResponse(message=msg)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request password reset link/token",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Initiate password recovery for a registered email address."""
    token = await auth_service.request_password_reset(db, data.email)
    msg = "If the email is registered, password reset instructions have been sent."
    if token:
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
    """Update password using a valid reset token."""
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
    """Google OAuth token exchange endpoint."""
    return MessageResponse(message="Google OAuth endpoint ready for client integration.")
