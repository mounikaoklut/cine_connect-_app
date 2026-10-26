"""Comprehensive tests for Talent & Production authentication, security, and OpenAPI regression."""

import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.production_house import ProductionHouse


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Verify system health liveness probe."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# ============================================================================
# TALENT REGISTRATION & LOGIN TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_talent_registration_and_login_flow(client: AsyncClient, db_session: AsyncSession):
    """Talent registration collects email, password, mobile number, and name (no OTP)."""
    uid = uuid.uuid4().hex[:8]
    email = f"talent_{uid}@cineconnect.com"
    password = "StrongPassword123!"
    phone = f"+9198{uuid.uuid4().int % 100000000:08d}"
    name = f"Ranbir Kapoor {uid}"

    # 1. Successful Talent registration via /api/v1/auth/register/talent
    payload = {
        "email": email,
        "password": password,
        "phone": phone,
        "name": name,
        "craft": "Actor",
        "location": "Mumbai",
    }
    reg_res = await client.post("/api/v1/auth/register/talent", json=payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    user_data = reg_data["user"]
    assert user_data["email"] == email
    assert user_data["name"] == name
    assert user_data["account_type"] == "talent"
    assert user_data["role"] == "Actor"
    assert user_data["phone_verified"] is False
    assert user_data["email_verified"] is False

    # 2. Verify database record
    user_db = (
        await db_session.execute(select(User).where(User.email == email))
    ).scalar_one()
    assert user_db.account_type == "talent"
    assert user_db.phone_verified is False
    assert user_db.password_hash != password
    assert user_db.password_hash.startswith(("$argon2", "$2b$"))

    # 3. Successful login with email and password (no OTP)
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == email
    assert login_data["user"]["account_type"] == "talent"

    # 4. Duplicate email rejection
    dup_res = await client.post(
        "/api/v1/auth/register/talent",
        json={
            "email": email,
            "password": "AnotherPassword123!",
            "phone": f"+9199{uuid.uuid4().int % 100000000:08d}",
            "name": "Duplicate Talent",
        },
    )
    assert dup_res.status_code == 400
    assert "email already registered" in dup_res.json()["detail"].lower()

    # 5. Invalid credentials rejection
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401
    assert "invalid email or password" in bad_login.json()["detail"].lower()


@pytest.mark.asyncio
async def test_talent_required_field_validation(client: AsyncClient):
    """Validation errors for missing required fields in Talent registration."""
    # Missing email
    res1 = await client.post(
        "/api/v1/auth/register/talent",
        json={"password": "Password123!", "phone": "+919876543210", "name": "No Email"},
    )
    assert res1.status_code == 422

    # Missing password
    res2 = await client.post(
        "/api/v1/auth/register/talent",
        json={"email": "nopass@cineconnect.com", "phone": "+919876543210", "name": "No Password"},
    )
    assert res2.status_code == 422

    # Missing phone
    res3 = await client.post(
        "/api/v1/auth/register/talent",
        json={"email": "nophone@cineconnect.com", "password": "Password123!", "name": "No Phone"},
    )
    assert res3.status_code == 422

    # Missing name
    res4 = await client.post(
        "/api/v1/auth/register/talent",
        json={"email": "noname@cineconnect.com", "password": "Password123!", "phone": "+919876543210"},
    )
    assert res4.status_code == 422


# ============================================================================
# PRODUCTION REGISTRATION & LOGIN TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_production_registration_and_login_flow(client: AsyncClient, db_session: AsyncSession):
    """Production registration creates user and associated production-house atomically (no OTP)."""
    uid = uuid.uuid4().hex[:8]
    email = f"prod_{uid}@cineconnect.com"
    password = "ProdPassword123!"
    phone = f"+9197{uuid.uuid4().int % 100000000:08d}"
    company_name = f"Excel Entertainment {uid}"

    # 1. Successful Production registration
    payload = {
        "company_name": company_name,
        "email": email,
        "phone": phone,
        "password": password,
        "location": "Mumbai, Maharashtra",
        "description": "Leading Indian cinema production studio",
    }
    reg_res = await client.post("/api/v1/auth/register/production", json=payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    user_data = reg_data["user"]
    assert user_data["email"] == email
    assert user_data["account_type"] == "production"
    assert user_data["role"] == "production"
    assert user_data["production_house_id"] is not None
    assert user_data["production_house_name"] == company_name
    assert user_data["phone_verified"] is False

    # 2. Verify database records and ownership relationship
    user_db = (
        await db_session.execute(select(User).where(User.email == email))
    ).scalar_one()
    assert user_db.account_type == "production"

    ph_db = (
        await db_session.execute(
            select(ProductionHouse).where(ProductionHouse.user_id == user_db.id)
        )
    ).scalar_one()
    assert ph_db.company_name == company_name
    assert ph_db.user_id == user_db.id

    # 3. Successful login with email and password
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["email"] == email
    assert login_data["user"]["account_type"] == "production"
    assert login_data["user"]["production_house_name"] == company_name

    # 4. Duplicate email rejection
    dup_res = await client.post(
        "/api/v1/auth/register/production",
        json={
            "company_name": "Another Studio",
            "email": email,
            "phone": f"+9196{uuid.uuid4().int % 100000000:08d}",
            "password": "Password123!",
        },
    )
    assert dup_res.status_code == 400
    assert "email already registered" in dup_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_production_retry_no_duplicate_house(client: AsyncClient, db_session: AsyncSession):
    """Retrying registration with duplicate credentials must not create duplicate production houses."""
    uid = uuid.uuid4().hex[:8]
    email = f"retry_{uid}@cineconnect.com"
    phone = f"+9195{uuid.uuid4().int % 100000000:08d}"
    company_name = f"Red Chillies {uid}"

    # Initial registration
    payload = {
        "company_name": company_name,
        "email": email,
        "phone": phone,
        "password": "Password123!",
    }
    res1 = await client.post("/api/v1/auth/register/production", json=payload)
    assert res1.status_code == 201

    # Retry same payload -> rejected
    res2 = await client.post("/api/v1/auth/register/production", json=payload)
    assert res2.status_code == 400

    # Verify only ONE production house exists for this company
    ph_list = (
        await db_session.execute(
            select(ProductionHouse).where(ProductionHouse.company_name == company_name)
        )
    ).scalars().all()
    assert len(ph_list) == 1


# ============================================================================
# SECURITY, ROLE RESTRICTIONS & OPENAPI REGRESSION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_role_based_access_restrictions(client: AsyncClient):
    """Enforce separate permissions: Talent cannot access Production operations, and vice versa."""
    # 1. Register Talent account
    talent_uid = uuid.uuid4().hex[:8]
    talent_res = await client.post(
        "/api/v1/auth/register/talent",
        json={
            "email": f"talent_role_{talent_uid}@cineconnect.com",
            "password": "Password123!",
            "phone": f"+9194{uuid.uuid4().int % 100000000:08d}",
            "name": "Actor Role Tester",
        },
    )
    talent_token = talent_res.json()["access_token"]
    talent_headers = {"Authorization": f"Bearer {talent_token}"}

    # 2. Register Production account
    prod_uid = uuid.uuid4().hex[:8]
    prod_res = await client.post(
        "/api/v1/auth/register/production",
        json={
            "company_name": f"Studio Role Tester {prod_uid}",
            "email": f"prod_role_{prod_uid}@cineconnect.com",
            "phone": f"+9193{uuid.uuid4().int % 100000000:08d}",
            "password": "Password123!",
        },
    )
    prod_token = prod_res.json()["access_token"]
    prod_headers = {"Authorization": f"Bearer {prod_token}"}
    ph_id = prod_res.json()["user"]["production_house_id"]

    # Production creates Project & Opportunity
    proj_res = await client.post(
        "/api/v1/projects",
        headers=prod_headers,
        json={"production_house_id": ph_id, "title": "Test Production Role Movie"},
    )
    assert proj_res.status_code == 201
    project_id = proj_res.json()["id"]

    opp_res = await client.post(
        "/api/v1/opportunities",
        headers=prod_headers,
        json={"project_id": project_id, "production_house_id": ph_id, "title": "Lead Role Casting"},
    )
    assert opp_res.status_code == 201
    opp_id = opp_res.json()["id"]

    # RESTRICTION A: Talent CANNOT create production houses
    bad_ph = await client.post(
        "/api/v1/production-houses",
        headers=talent_headers,
        json={"company_name": "Unauthorized PH"},
    )
    assert bad_ph.status_code == 403
    assert "restricted to production accounts" in bad_ph.json()["detail"].lower()

    # RESTRICTION B: Talent CANNOT create projects
    bad_proj = await client.post(
        "/api/v1/projects",
        headers=talent_headers,
        json={"production_house_id": ph_id, "title": "Unauthorized Project"},
    )
    assert bad_proj.status_code == 403

    # RESTRICTION C: Talent CANNOT post opportunities
    bad_opp = await client.post(
        "/api/v1/opportunities",
        headers=talent_headers,
        json={"project_id": project_id, "production_house_id": ph_id, "title": "Unauthorized Opp"},
    )
    assert bad_opp.status_code == 403

    # RESTRICTION D: Production CANNOT apply for opportunities (Talent only)
    bad_app = await client.post(
        "/api/v1/applications",
        headers=prod_headers,
        json={"opportunity_id": opp_id, "cover_letter": "Production applying?"},
    )
    assert bad_app.status_code == 403
    assert "restricted to talent accounts" in bad_app.json()["detail"].lower()

    # ALLOWED: Talent applies for opportunity
    good_app = await client.post(
        "/api/v1/applications",
        headers=talent_headers,
        json={"opportunity_id": opp_id, "cover_letter": "I am perfect for this role"},
    )
    assert good_app.status_code == 201


@pytest.mark.asyncio
async def test_jwt_security_guards(client: AsyncClient):
    """Verify protection against invalid and expired JWT tokens."""
    # 1. Missing Authorization header
    res_no_auth = await client.get("/api/v1/users/me")
    assert res_no_auth.status_code in (401, 403)

    # 2. Invalid / malformed bearer token
    res_bad_auth = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": "Bearer not-a-real-jwt-token"},
    )
    assert res_bad_auth.status_code == 401


@pytest.mark.asyncio
async def test_otp_routes_completely_absent_from_openapi(client: AsyncClient):
    """Confirm that OTP endpoints are completely removed from the OpenAPI schema."""
    res = await client.get("/openapi.json")
    assert res.status_code == 200
    openapi = res.json()
    paths = openapi.get("paths", {})

    # OTP routes must not exist in registered paths
    assert "/api/v1/auth/otp/send" not in paths
    assert "/api/v1/auth/otp/verify" not in paths

    # Confirm no path contains 'otp'
    for path in paths:
        assert "/otp" not in path.lower(), f"Unexpected OTP endpoint found in OpenAPI schema: {path}"


@pytest.mark.asyncio
async def test_otp_endpoints_return_404(client: AsyncClient):
    """Direct HTTP requests to removed OTP endpoints must return 404 Not Found."""
    send_res = await client.post("/api/v1/auth/otp/send", json={"phone": "+919876543210"})
    assert send_res.status_code == 404

    verify_res = await client.post("/api/v1/auth/otp/verify", json={"phone": "+919876543210", "otp": "123456"})
    assert verify_res.status_code == 404


@pytest.mark.asyncio
async def test_duplicate_mobile_number_handling(client: AsyncClient):
    """Ensure duplicate non-empty mobile numbers are rejected consistently."""
    uid = uuid.uuid4().hex[:8]
    phone = f"+9192{uuid.uuid4().int % 100000000:08d}"

    # 1. Register first Talent user
    res1 = await client.post(
        "/api/v1/auth/register/talent",
        json={
            "email": f"first_{uid}@cineconnect.com",
            "password": "Password123!",
            "phone": phone,
            "name": "First User",
        },
    )
    assert res1.status_code == 201

    # 2. Attempt to register another Talent with identical phone
    res2 = await client.post(
        "/api/v1/auth/register/talent",
        json={
            "email": f"second_{uid}@cineconnect.com",
            "password": "Password123!",
            "phone": phone,
            "name": "Second User",
        },
    )
    assert res2.status_code == 400
    assert "mobile number already registered" in res2.json()["detail"].lower()

    # 3. Attempt to register Production with alternate formatted phone (no leading +)
    unnorm_phone = phone.lstrip("+")
    res3 = await client.post(
        "/api/v1/auth/register/production",
        json={
            "company_name": f"Duplicate Phone Studio {uid}",
            "email": f"prod_dup_{uid}@cineconnect.com",
            "phone": unnorm_phone,
            "password": "Password123!",
        },
    )
    assert res3.status_code == 400
    assert "mobile number already registered" in res3.json()["detail"].lower()


@pytest.mark.asyncio
async def test_refresh_token_claims_preservation_and_validation(client: AsyncClient, db_session: AsyncSession):
    """Ensure token refresh validates user existence, preserves claims, and rejects invalid tokens."""
    from jose import jwt
    from app.config import get_settings
    from app.utils.security import decode_token
    settings = get_settings()

    uid = uuid.uuid4().hex[:8]
    email = f"refresh_user_{uid}@cineconnect.com"
    password = "StrongPassword123!"
    phone = f"+9191{uuid.uuid4().int % 100000000:08d}"

    # 1. Register talent user with a distinct role
    reg_res = await client.post(
        "/api/v1/auth/register/talent",
        json={
            "email": email,
            "password": password,
            "phone": phone,
            "name": f"Director {uid}",
            "craft": "Director",
        },
    )
    assert reg_res.status_code == 201
    refresh_token = reg_res.json()["refresh_token"]

    # 2. Refresh tokens
    ref_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    new_access = ref_data["access_token"]
    assert "refresh_token" in ref_data

    # 3. Verify preserved claims in access token
    claims = decode_token(new_access)
    assert claims is not None
    assert claims.get("account_type") == "talent"
    assert claims.get("role") == "Director"

    # 4. Use new access token to query /users/me
    me_res = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {new_access}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

    # 5. Reject malformed refresh token (garbage string)
    bad_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": "not-a-token"})
    assert bad_res.status_code == 401

    # 6. Reject refresh token with malformed UUID subject
    malformed_sub_token = jwt.encode(
        {"sub": "invalid-uuid-subject", "type": "refresh"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    bad_sub_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": malformed_sub_token})
    assert bad_sub_res.status_code == 401

    # 7. Reject refresh token for nonexistent user ID
    fake_user_id = str(uuid.uuid4())
    fake_user_token = jwt.encode(
        {"sub": fake_user_id, "type": "refresh"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    fake_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": fake_user_token})
    assert fake_res.status_code == 401

    # 8. Reject access token passed to refresh endpoint
    wrong_type_token = jwt.encode(
        {"sub": str(reg_res.json()["user"]["id"]), "type": "access"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    wrong_type_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": wrong_type_token})
    assert wrong_type_res.status_code == 401


@pytest.mark.asyncio
async def test_malformed_token_subject_returns_401(client: AsyncClient):
    """Ensure malformed UUID token subject returns HTTP 401 rather than HTTP 500."""
    from jose import jwt
    from app.config import get_settings
    settings = get_settings()

    malformed_token = jwt.encode(
        {"sub": "not-a-uuid-string", "type": "access"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    res = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {malformed_token}"})
    assert res.status_code == 401
    assert "invalid token subject format" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_account_type_missing_or_unexpected_rejected(client: AsyncClient, db_session: AsyncSession):
    """Ensure require_talent and require_production reject users with missing or unexpected account types with HTTP 403."""
    from app.utils.security import create_access_token, hash_password
    uid = uuid.uuid4().hex[:8]

    # Create user with unknown / null account_type
    odd_user = User(
        email=f"odd_{uid}@cineconnect.com",
        full_name="Odd User",
        password_hash=hash_password("Password123!"),
        phone=f"+9190{uuid.uuid4().int % 100000000:08d}",
        account_type="admin",  # Neither talent nor production
        role="viewer",
    )
    db_session.add(odd_user)
    await db_session.commit()
    await db_session.refresh(odd_user)

    token = create_access_token(odd_user.id, {"account_type": odd_user.account_type, "role": odd_user.role})
    headers = {"Authorization": f"Bearer {token}"}

    # Calling talent-restricted endpoint -> 403
    talent_res = await client.post(
        "/api/v1/applications",
        headers=headers,
        json={"opportunity_id": str(uuid.uuid4()), "cover_letter": "Odd applicant"},
    )
    assert talent_res.status_code == 403
    assert "restricted to talent" in talent_res.json()["detail"].lower()

    # Calling production-restricted endpoint -> 403
    prod_res = await client.post(
        "/api/v1/projects",
        headers=headers,
        json={"title": "Odd Project"},
    )
    assert prod_res.status_code == 403
    assert "restricted to production" in prod_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_production_registration_transaction_rollback(client: AsyncClient, db_session: AsyncSession):
    """Ensure production registration rolls back atomically if production house record creation fails."""
    from unittest.mock import patch
    from app.services import auth_service

    uid = uuid.uuid4().hex[:8]
    email = f"rollback_{uid}@cineconnect.com"
    phone = f"+9189{uuid.uuid4().int % 100000000:08d}"
    company_name = f"Failed Studio {uid}"

    # Simulate an error right before commit in register_production
    with patch("app.services.auth_service.ProductionHouse", side_effect=RuntimeError("Simulated PH creation error")):
        with pytest.raises(RuntimeError, match="Simulated PH creation error"):
            await auth_service.register_production(
                db=db_session,
                company_name=company_name,
                email=email,
                phone=phone,
                password="Password123!",
            )

    # Verify that the User record was ROLLED BACK and does NOT exist in DB
    user_db = (
        await db_session.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    assert user_db is None

    # Verify that no ProductionHouse record was saved
    ph_db = (
        await db_session.execute(select(ProductionHouse).where(ProductionHouse.company_name == company_name))
    ).scalar_one_or_none()
    assert ph_db is None
