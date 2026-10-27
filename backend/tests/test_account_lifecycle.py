"""Tests for account lifecycle: token revocation/logout, email verification, and account deletion."""

import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_logout_and_token_revocation(client: AsyncClient):
    uid = uuid.uuid4().hex[:8]
    email = f"session_{uid}@cineconnect.com"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "name": "Session Tester"},
    )
    tokens = reg.json()
    refresh_token = tokens["refresh_token"]

    # Refresh works initially
    ref_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200
    new_refresh = ref_res.json()["refresh_token"]

    # Logout revokes refresh token
    logout_res = await client.post("/api/v1/auth/logout", json={"refresh_token": new_refresh})
    assert logout_res.status_code == 200

    # Attempting to refresh with revoked token fails
    bad_ref = await client.post("/api/v1/auth/refresh", json={"refresh_token": new_refresh})
    assert bad_ref.status_code == 401
    assert "revoked" in bad_ref.json()["detail"].lower()


@pytest.mark.asyncio
async def test_email_verification_flow(client: AsyncClient):
    """Test standard email verification flow via resend endpoint without exposing token in response."""
    from app.utils.security import create_email_verification_token
    uid = uuid.uuid4().hex[:8]
    email = f"verify_{uid}@cineconnect.com"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "name": "Verify Tester"},
    )
    assert reg.status_code == 201

    # Request email verification token
    resend = await client.post("/api/v1/auth/resend-email-verification", json={"email": email})
    assert resend.status_code == 200
    msg = resend.json()["message"]
    # Token must NOT be exposed in API responses
    assert "dev token" not in msg.lower()
    assert "verification instructions have been sent" in msg.lower()

    # Generate valid verification token and verify email
    token = create_email_verification_token(email)
    verify_res = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert verify_res.status_code == 200
    assert "verified" in verify_res.json()["message"].lower()


@pytest.mark.asyncio
async def test_email_verification_token_with_surrounding_and_embedded_whitespace(client: AsyncClient):
    """Confirm valid JWT with surrounding and embedded whitespace/newlines is accepted."""
    from app.utils.security import create_email_verification_token
    uid = uuid.uuid4().hex[:8]
    email = f"whitespace_{uid}@cineconnect.com"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "name": "Whitespace Tester"},
    )
    assert reg.status_code == 201

    token = create_email_verification_token(email)
    parts = token.split(".")
    # Construct a token with leading, trailing, and embedded line breaks and spaces
    token_with_whitespace = f"  \n\t {parts[0]} .\n\t {parts[1]} .\r\n {parts[2]} \n\n "

    verify_res = await client.post("/api/v1/auth/verify-email", json={"token": token_with_whitespace})
    assert verify_res.status_code == 200
    assert "verified" in verify_res.json()["message"].lower()



@pytest.mark.asyncio
async def test_email_verification_token_validation_guards(client: AsyncClient):
    """Test rejection of invalid, expired, wrong-purpose, and mismatched tokens."""
    from datetime import datetime, timedelta, timezone
    from jose import jwt
    from app.config import get_settings
    from app.utils.security import (
        create_access_token,
        create_password_reset_token,
        create_email_verification_token,
    )

    settings = get_settings()
    uid = uuid.uuid4().hex[:8]
    email = f"guards_{uid}@cineconnect.com"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "name": "Guard Tester"},
    )
    assert reg.status_code == 201
    user_id = uuid.UUID(reg.json()["user"]["id"])

    # 1. Invalid / malformed token
    malformed_res = await client.post("/api/v1/auth/verify-email", json={"token": "not.a.valid.jwt"})
    assert malformed_res.status_code == 400
    assert "invalid or expired" in malformed_res.json()["detail"].lower()

    # 2. Non-UUID hex string with non-existent user
    non_uuid_token = create_email_verification_token("non_existent_user_string")
    non_uuid_res = await client.post("/api/v1/auth/verify-email", json={"token": non_uuid_token})
    assert non_uuid_res.status_code == 400
    assert "user not found" in non_uuid_res.json()["detail"].lower()

    # 3. Expired token
    expired_payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) - timedelta(hours=1),
        "type": "email_verification",
    }
    expired_token = jwt.encode(expired_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    exp_res = await client.post("/api/v1/auth/verify-email", json={"token": expired_token})
    assert exp_res.status_code == 400
    assert "invalid or expired" in exp_res.json()["detail"].lower()

    # 4. Wrong-purpose token: access token
    access_token = create_access_token(user_id)
    wrong_purpose_res1 = await client.post("/api/v1/auth/verify-email", json={"token": access_token})
    assert wrong_purpose_res1.status_code == 400
    assert "invalid verification token purpose" in wrong_purpose_res1.json()["detail"].lower()

    # 5. Wrong-purpose token: password reset token
    reset_token = create_password_reset_token(user_id)
    wrong_purpose_res2 = await client.post("/api/v1/auth/verify-email", json={"token": reset_token})
    assert wrong_purpose_res2.status_code == 400
    assert "invalid verification token purpose" in wrong_purpose_res2.json()["detail"].lower()

    # 6. Mismatched email claim (token claims email_A, user has email_B)
    mismatched_token = create_email_verification_token(user_id, email="different_email@cineconnect.com")
    mismatch_res = await client.post("/api/v1/auth/verify-email", json={"token": mismatched_token})
    assert mismatch_res.status_code == 400
    assert "token email does not match" in mismatch_res.json()["detail"].lower()



@pytest.mark.asyncio
async def test_account_deletion_flow(client: AsyncClient):
    uid = uuid.uuid4().hex[:8]
    email = f"del_{uid}@cineconnect.com"
    password = "DeleteMe123!"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "name": "Delete Tester"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Wrong password fails
    bad_del = await client.request(
        "DELETE",
        "/api/v1/users/me",
        headers=headers,
        json={"password": "WrongPassword!"},
    )
    assert bad_del.status_code == 400

    # Correct password deletes account
    good_del = await client.request(
        "DELETE",
        "/api/v1/users/me",
        headers=headers,
        json={"password": password},
    )
    assert good_del.status_code == 200

    # Cannot login anymore
    login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 401


@pytest.mark.asyncio
async def test_password_reset_and_login_flow(client: AsyncClient):
    """Verify password reset lifecycle: token issuance, malformed subject rejection,
    successful reset, database persistence, rejection of old password, and acceptance of new password
    with case- and whitespace-insensitive email login.
    """
    from datetime import datetime, timedelta, timezone
    from jose import jwt
    from sqlalchemy import select
    from app.config import get_settings
    from app.database import async_session
    from app.models.user import User
    from app.utils.security import create_password_reset_token, verify_password
    settings = get_settings()

    uid = uuid.uuid4().hex[:8]
    email = f"reset_{uid}@cineconnect.com"
    old_password = "InitialPassword123!"
    new_password = "UpdatedPassword456!"

    # 1. Register account
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": old_password, "name": "Reset Flow Tester"},
    )
    assert reg_res.status_code == 201

    # 2. Initial login works
    login_init = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": old_password},
    )
    assert login_init.status_code == 200

    # 3. Create a valid reset token for user
    async with async_session() as db:
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one()
        reset_token = create_password_reset_token(user.id)

    # 4. Malformed non-UUID token subject is safely rejected (HTTP 400, not 500)
    malformed_sub_token = jwt.encode(
        {"sub": "not-a-valid-uuid", "exp": datetime.now(timezone.utc) + timedelta(minutes=30), "type": "password_reset"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    bad_sub_res = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": malformed_sub_token, "new_password": new_password},
    )
    assert bad_sub_res.status_code == 400
    assert "invalid or expired" in bad_sub_res.json()["detail"].lower()

    # 5. Successful reset with valid token (handling whitespace/newlines)
    reset_res = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": f"  \n{reset_token}\n  ", "new_password": new_password},
    )
    assert reset_res.status_code == 200

    # 6. Verify password update is persisted in PostgreSQL
    async with async_session() as db:
        res = await db.execute(select(User).where(User.email == email))
        db_user = res.scalar_one()
        assert verify_password(new_password, db_user.password_hash)
        assert not verify_password(old_password, db_user.password_hash)

    # 7. Old password is rejected
    old_login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": old_password},
    )
    assert old_login.status_code == 401

    # 8. New password succeeds with email case & whitespace variations
    varied_email = f"  {email.upper()}  "
    new_login = await client.post(
        "/api/v1/auth/login",
        json={"email": varied_email, "password": new_password},
    )
    assert new_login.status_code == 200
    assert new_login.json()["user"]["email"] == email

