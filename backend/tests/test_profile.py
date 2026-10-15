"""Unit tests for profile, experience, skills, and completeness scoring."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_profile_and_completeness_flow(client: AsyncClient):
    # 1. Register a user
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "director@cineconnect.com",
            "password": "StrongPassword123!",
            "name": "Karan Johar",
        },
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check initial profile
    me_res = await client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["profile"]["name"] == "Karan Johar"

    # 3. Update profile craft and bio
    update_res = await client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={
            "primary_craft": "Director",
            "bio": "Experienced film director with multiple blockbuster feature films in Bollywood and global cinema.",
            "city": "Mumbai",
            "state": "Maharashtra",
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["primary_craft"] == "Director"
    assert update_res.json()["city"] == "Mumbai"

    # 4. Check completeness score increases
    comp_res = await client.get("/api/v1/users/me/completeness", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["score"] > 0
    assert isinstance(comp_data["suggestions"], list)

    # 5. Add an experience
    exp_res = await client.post(
        "/api/v1/users/me/experience",
        headers=headers,
        json={
            "title": "Lead Director",
            "company": "Dharma Productions",
            "role_type": "Full-time",
            "description": "Directed feature films and managed production crew of 150+ members.",
        },
    )
    assert exp_res.status_code == 201
    exp_data = exp_res.json()
    assert exp_data["title"] == "Lead Director"

    # 6. Check experiences list
    exp_list = await client.get("/api/v1/users/me/experience", headers=headers)
    assert exp_list.status_code == 200
    assert len(exp_list.json()) == 1
