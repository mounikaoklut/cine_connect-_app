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
    assert "Dev token:" in msg
    token = msg.split("Dev token: ")[1].strip(")")

    # Verify email with token
    verify_res = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert verify_res.status_code == 200
    assert "verified" in verify_res.json()["message"].lower()


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
