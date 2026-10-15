"""Unit tests for authentication endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    # 1. Register
    reg_payload = {
        "email": "actor_test@cineconnect.com",
        "password": "Password123!",
        "name": "Aryan Sharma",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "actor_test@cineconnect.com"
    assert data["user"]["name"] == "Aryan Sharma"

    # 2. Login
    login_payload = {
        "email": "actor_test@cineconnect.com",
        "password": "Password123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["name"] == "Aryan Sharma"

    # 3. Duplicate register should fail
    dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    # Register first
    reg_payload = {
        "email": "editor@cineconnect.com",
        "password": "CorrectPassword123!",
        "name": "Pooja Hegde",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # Login with wrong password
    bad_login = {
        "email": "editor@cineconnect.com",
        "password": "WrongPassword!",
    }
    res = await client.post("/api/v1/auth/login", json=bad_login)
    assert res.status_code == 401
