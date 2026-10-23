"""Unit tests for user profile, portfolio media, skills catalog, and completeness."""

import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_profile_portfolio_and_completeness_flow(client: AsyncClient):
    uid = uuid.uuid4().hex[:8]
    email = f"director_{uid}@cineconnect.com"

    # 1. Register a user
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "StrongPassword123!",
            "name": f"Karan Johar {uid}",
        },
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check initial profile
    me_res = await client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["full_name"] == f"Karan Johar {uid}"
    assert me_data["email"] == email

    # 3. Update profile craft, location, bio
    update_res = await client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={
            "role": "Director",
            "bio": "Experienced film director with multiple blockbuster feature films.",
            "location": "Mumbai, Maharashtra",
            "experience_years": 15,
        },
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["role"] == "Director"
    assert updated_data["location"] == "Mumbai, Maharashtra"
    assert updated_data["experience_years"] == 15

    # 4. Check completeness score increases
    comp_res = await client.get("/api/v1/users/me/completeness", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["score"] > 50
    assert isinstance(comp_data["suggestions"], list)

    # 5. Add portfolio media asset
    port_res = await client.post(
        "/api/v1/users/me/portfolio",
        headers=headers,
        json={
            "title": "Director Showreel 2026",
            "media_url": "https://cdn.cineconnect.com/reels/showreel_2026.mp4",
            "media_type": "video",
        },
    )
    assert port_res.status_code == 201
    port_data = port_res.json()
    assert port_data["title"] == "Director Showreel 2026"
    assert port_data["media_type"] == "video"
    item_id = port_data["id"]

    # 6. List portfolio media
    list_res = await client.get("/api/v1/users/me/portfolio", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 1
    assert any(i["id"] == item_id for i in items)

    # 7. Update portfolio item
    patch_port = await client.patch(
        f"/api/v1/users/me/portfolio/{item_id}",
        headers=headers,
        json={"title": "Updated Director Showreel"},
    )
    assert patch_port.status_code == 200
    assert patch_port.json()["title"] == "Updated Director Showreel"

    # 8. Delete portfolio item
    del_port = await client.delete(f"/api/v1/users/me/portfolio/{item_id}", headers=headers)
    assert del_port.status_code == 204

    # 9. Skills catalog
    skills_res = await client.get("/api/v1/users/skills/catalog")
    assert skills_res.status_code == 200
    catalog = skills_res.json()
    assert len(catalog) > 0
    assert any(s["name"] == "Method Acting" for s in catalog)
