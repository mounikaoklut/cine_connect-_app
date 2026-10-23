"""Tests for Production Houses, Projects, Collaborations, Opportunities, and Applications."""

import uuid
from datetime import date, timedelta
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_production_houses_and_projects_full_flow(client: AsyncClient):
    # Setup owner and other user
    owner_uid = uuid.uuid4().hex[:8]
    owner_email = f"owner_{owner_uid}@cineconnect.com"
    reg_owner = await client.post("/api/v1/auth/register", json={"email": owner_email, "password": "Password123!", "name": "PH Owner", "phone": f"+9198{uuid.uuid4().int % 100000000:08d}", "account_type": "production"})
    owner_token = reg_owner.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    other_uid = uuid.uuid4().hex[:8]
    other_email = f"other_{other_uid}@cineconnect.com"
    reg_other = await client.post("/api/v1/auth/register", json={"email": other_email, "password": "Password123!", "name": "Other User", "phone": f"+9197{uuid.uuid4().int % 100000000:08d}", "account_type": "production"})
    other_token = reg_other.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # 1. Create Production House
    ph_res = await client.post(
        "/api/v1/production-houses",
        headers=owner_headers,
        json={
            "company_name": f"Apex Studios {owner_uid}",
            "description": "Leading film production house in Mumbai",
            "location": "Mumbai",
            "specialization": "Feature Films",
        },
    )
    assert ph_res.status_code == 201
    ph_data = ph_res.json()
    ph_id = ph_data["id"]
    assert ph_data["company_name"] == f"Apex Studios {owner_uid}"

    # 2. Unauthorized update check
    bad_patch = await client.patch(
        f"/api/v1/production-houses/{ph_id}",
        headers=other_headers,
        json={"company_name": "Hacked Studios"},
    )
    assert bad_patch.status_code == 403

    # 3. Create Project under Production House
    proj_res = await client.post(
        "/api/v1/projects",
        headers=owner_headers,
        json={
            "production_house_id": ph_id,
            "title": "Project Tiger 2026",
            "description": "Big budget spy thriller",
            "status": "pre-production",
            "start_date": str(date.today() + timedelta(days=30)),
        },
    )
    assert proj_res.status_code == 201
    proj_data = proj_res.json()
    project_id = proj_data["id"]
    assert proj_data["title"] == "Project Tiger 2026"

    # 4. Collaboration invite
    talent_uid = uuid.uuid4().hex[:8]
    reg_talent = await client.post(
        "/api/v1/auth/register",
        json={"email": f"talent_{talent_uid}@cineconnect.com", "password": "Password123!", "name": "Talent Actor"},
    )
    talent_id = reg_talent.json()["user"]["id"]
    talent_token = reg_talent.json()["access_token"]
    talent_headers = {"Authorization": f"Bearer {talent_token}"}

    collab_invite = await client.post(
        f"/api/v1/projects/{project_id}/collaborations",
        headers=owner_headers,
        json={"talent_id": talent_id},
    )
    assert collab_invite.status_code == 201
    collab_data = collab_invite.json()
    collab_id = collab_data["id"]
    assert collab_data["status"] == "invited"

    # 5. Talent accepts collaboration
    accept_res = await client.patch(
        f"/api/v1/collaborations/{collab_id}/status",
        headers=talent_headers,
        json={"status": "accepted"},
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "accepted"

    # 6. Create Opportunity
    opp_res = await client.post(
        "/api/v1/opportunities",
        headers=owner_headers,
        json={
            "project_id": project_id,
            "production_house_id": ph_id,
            "title": "Lead Antagonist Role",
            "requirements": "Athletic build, age 28-40, martial arts background",
            "deadline": str(date.today() + timedelta(days=14)),
            "status": "open",
        },
    )
    assert opp_res.status_code == 201
    opp_data = opp_res.json()
    opp_id = opp_data["id"]
    assert opp_data["title"] == "Lead Antagonist Role"

    # 7. Talent applies for Opportunity
    app_res = await client.post(
        "/api/v1/applications",
        headers=talent_headers,
        json={
            "opportunity_id": opp_id,
            "cover_letter": "I have 8 years of martial arts experience and stunt training.",
        },
    )
    assert app_res.status_code == 201
    app_data = app_res.json()
    app_id = app_data["id"]
    assert app_data["status"] == "pending"

    # 8. Duplicate application should return 409 Conflict
    dup_app = await client.post(
        "/api/v1/applications",
        headers=talent_headers,
        json={
            "opportunity_id": opp_id,
            "cover_letter": "Trying to apply again",
        },
    )
    assert dup_app.status_code == 409

    # 9. List talent's submitted applications
    my_apps = await client.get("/api/v1/applications/me", headers=talent_headers)
    assert my_apps.status_code == 200
    assert any(a["id"] == app_id for a in my_apps.json())

    # 10. Owner reviews applications for opportunity
    opp_apps = await client.get(f"/api/v1/opportunities/{opp_id}/applications", headers=owner_headers)
    assert opp_apps.status_code == 200
    assert any(a["id"] == app_id for a in opp_apps.json())

    # 11. Owner updates application status to "shortlisted"
    status_update = await client.patch(
        f"/api/v1/applications/{app_id}/status",
        headers=owner_headers,
        json={"status": "shortlisted"},
    )
    assert status_update.status_code == 200
    assert status_update.json()["status"] == "shortlisted"

    # 12. Delete opportunity (owner only)
    del_opp = await client.delete(f"/api/v1/opportunities/{opp_id}", headers=owner_headers)
    assert del_opp.status_code == 204

    # 13. Delete project (owner only)
    del_proj = await client.delete(f"/api/v1/projects/{project_id}", headers=owner_headers)
    assert del_proj.status_code == 204

    # 14. Delete production house (owner only)
    del_ph = await client.delete(f"/api/v1/production-houses/{ph_id}", headers=owner_headers)
    assert del_ph.status_code == 204
