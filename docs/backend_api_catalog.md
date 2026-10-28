# Cine Connect — Complete Backend API Catalog & Developer Manual

**Version:** 1.0.0 (Production-Ready Local Architecture)  
**Framework:** FastAPI 0.115+, SQLAlchemy 2.0 (Async), PostgreSQL 16, Redis 7, MinIO/S3  
**Base URL:** `http://localhost:8000/api/v1`  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI), `http://localhost:8000/redoc` (ReDoc)

---

## 1. Authentication Architecture & Workflows

Cine Connect operates with two dedicated account models:
1. **Talent**: Individual actors, cinematographers, directors, editors, writers, stunt performers, and craft crew.
2. **Production**: Film and commercial production houses, studios, and casting agencies.

Both account types authenticate strictly using **Email and Password**. Mobile phone numbers are collected during sign-up for contact records but are **not verified via OTP** in this local development release.

---

### A. Talent Registration & Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor Talent as Talent User
    participant Frontend as Talent UI
    participant Backend as FastAPI Backend
    participant DB as PostgreSQL (public.users)

    Talent->>Frontend: Selects "Sign Up as Talent"
    Talent->>Frontend: Enters Name, Email, Mobile Number, Password
    Frontend->>Backend: POST /api/v1/auth/register/talent
    Note over Backend: Validates email, mobile format & uniqueness.<br/>Hashes password via Argon2.<br/>Assigns account_type="talent".
    Backend->>DB: INSERT INTO users (account_type="talent", phone_verified=false, ...)
    Backend-->>Frontend: 201 Created (TokenResponse with user info)
    Frontend-->>Talent: "Registration successful! Please sign in."
    Talent->>Frontend: Enters Email and Password
    Frontend->>Backend: POST /api/v1/auth/login
    Backend->>DB: SELECT * FROM users WHERE email = ...
    Note over Backend: Verifies Argon2 password hash.
    Backend-->>Frontend: 200 OK (access_token, refresh_token, user: {account_type: "talent"})
    Frontend->>Talent: Redirects to Talent Dashboard
```

#### Talent Registration Request
`POST /api/v1/auth/register/talent`
```json
{
  "name": "Aryan Sharma",
  "email": "aryan.sharma@cineconnect.com",
  "phone": "+919876543210",
  "password": "StrongPassword123!",
  "craft": "Actor",
  "location": "Mumbai, Maharashtra"
}
```
#### Talent Registration Response (`201 Created`)
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "e6a21390-394e-4f76-805c-dfb69c79e602",
    "email": "aryan.sharma@cineconnect.com",
    "phone": "+919876543210",
    "name": "Aryan Sharma",
    "account_type": "talent",
    "role": "Actor",
    "production_house_id": null,
    "production_house_name": null,
    "email_verified": false,
    "phone_verified": false,
    "identity_verified": false
  }
}
```

---

### B. Production House Registration & Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor Producer as Production House
    participant Frontend as Production UI
    participant Backend as FastAPI Backend
    participant DB as PostgreSQL (users + production_houses)

    Producer->>Frontend: Selects "Register Production House"
    Producer->>Frontend: Enters Company Name, Email, Mobile Number, Password
    Frontend->>Backend: POST /api/v1/auth/register/production
    Note over Backend: Atomic Transaction begins.<br/>Validates email, phone uniqueness.<br/>Creates User (account_type="production").<br/>Creates ProductionHouse (user_id=user.id).
    Backend->>DB: INSERT INTO users ... RETURNING id
    Backend->>DB: INSERT INTO production_houses (user_id=user.id, company_name=...)
    Note over DB: Transaction committed atomically.
    Backend-->>Frontend: 201 Created (TokenResponse with production_house_id)
    Frontend-->>Producer: "Registration successful! Please sign in."
    Producer->>Frontend: Enters Email and Password
    Frontend->>Backend: POST /api/v1/auth/login
    Backend->>DB: SELECT * FROM users JOIN production_houses ...
    Backend-->>Frontend: 200 OK (access_token, refresh_token, user: {account_type: "production"})
    Frontend->>Producer: Redirects to Production Studio Dashboard
```

#### Production Registration Request
`POST /api/v1/auth/register/production`
```json
{
  "company_name": "Dharma Productions",
  "email": "contact@dharmaproductions.com",
  "phone": "+919820011223",
  "password": "StudioPassword123!",
  "location": "Mumbai, Maharashtra",
  "description": "Premier Indian film production and distribution company"
}
```
#### Production Registration Response (`201 Created`)
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "c71a3248-26fe-4f10-928d-2948bb109012",
    "email": "contact@dharmaproductions.com",
    "phone": "+919820011223",
    "name": "Dharma Productions",
    "account_type": "production",
    "role": "production",
    "production_house_id": "b3e94212-0012-4aa8-9f3b-821937402911",
    "production_house_name": "Dharma Productions",
    "email_verified": false,
    "phone_verified": false,
    "identity_verified": false
  }
}
```

---

### C. Shared Authentication Rules & Role Separation

1. **Email and Password Required**: Email addresses must be valid RFC-5322 format and unique across all accounts. Passwords must be at least 8 characters long and are hashed using **Argon2** before storage.
2. **Mobile Number Collected Without OTP**: Mobile numbers are normalized to E.164-compatible strings and validated for uniqueness across accounts. `phone_verified` is initialized to `False`. Zero SMS credentials or OTP gateways are required locally.
3. **Role Guards**:
   - `require_talent`: Enforced on talent applications (`POST /applications`), portfolio modifications (`/users/me/portfolio`), and skills editing (`/users/me/skills`). Production accounts attempting these receive `403 Forbidden`.
   - `require_production`: Enforced on production house creation (`POST /production-houses`), project creation (`POST /projects`), casting call creation (`POST /opportunities`), applicant reviewing (`PATCH /applications/{id}/status`), and collaborator invites (`POST /projects/{id}/collaborations`). Talent accounts attempting these receive `403 Forbidden`.
4. **Token Security & Revocation**: JWT access tokens have a 15-minute lifespan. Refresh tokens are long-lived (7 days) and support cryptographic rotation. Calling `POST /auth/logout` adds the refresh token to a Redis blacklist with a TTL matching token expiration.
5. **Permanently Removed OTP Endpoints**:
   - `POST /api/v1/auth/otp/send` — REMOVED
   - `POST /api/v1/auth/otp/verify` — REMOVED

---

## 2. API Catalog by Module

### Module 1: Auth & Identity

#### 1. `POST /api/v1/auth/register/talent`
- **Purpose**: Register a new Talent account.
- **Auth**: None (Public).
- **Request**: `RegisterTalentRequest` (`email`, `password`, `phone`, `name`, optional `craft`, `location`).
- **Response**: `TokenResponse` (`201 Created`).
- **Errors**: `400 Bad Request` (duplicate email or phone), `422 Unprocessable Entity` (validation failure).

#### 2. `POST /api/v1/auth/register/production`
- **Purpose**: Register a new Production account and automatically create its associated `ProductionHouse` profile.
- **Auth**: None (Public).
- **Request**: `RegisterProductionRequest` (`company_name`, `email`, `phone`, `password`, optional `location`, `description`).
- **Response**: `TokenResponse` (`201 Created`).
- **Errors**: `400 Bad Request` (duplicate email or phone), `422 Unprocessable Entity` (validation failure).

#### 3. `POST /api/v1/auth/register`
- **Purpose**: Unified registration endpoint supporting both talent and production.
- **Auth**: None (Public).
- **Request**: `RegisterEmailRequest` (`email`, `password`, `name`, optional `phone`, `account_type`).
- **Response**: `TokenResponse` (`201 Created`).

#### 4. `POST /api/v1/auth/login`
- **Purpose**: Sign in with email and password for both account types.
- **Auth**: None (Public).
- **Request**: `LoginEmailRequest` (`email`, `password`).
- **Response**: `TokenResponse` (`200 OK`) with user profile and production house metadata if applicable.
- **Errors**: `401 Unauthorized` ("Invalid email or password").

#### 5. `POST /api/v1/auth/refresh`
- **Purpose**: Exchange a valid refresh token for a new access token and refresh token pair.
- **Auth**: None (Valid Refresh Token in body).
- **Request**: `RefreshTokenRequest` (`refresh_token`).
- **Response**: `200 OK` (`access_token`, `refresh_token`, `token_type`).
- **Errors**: `401 Unauthorized` (invalid or revoked token).

#### 6. `POST /api/v1/auth/logout`
- **Purpose**: Invalidate current refresh token by storing it in Redis blacklist.
- **Auth**: None (Refresh Token in body).
- **Request**: `LogoutRequest` (`refresh_token`).
- **Response**: `MessageResponse` (`200 OK`).

#### 7. `POST /api/v1/auth/verify-email`
- **Purpose**: Verify email address using verification token.
- **Auth**: None (Token in body).
- **Request**: `VerifyEmailRequest` (`token`).
- **Response**: `MessageResponse` (`200 OK`).

#### 8. `POST /api/v1/auth/resend-email-verification`
- **Purpose**: Resend email verification token.
- **Auth**: None / Authenticated.
- **Request**: `ResendVerificationRequest` (`email`).
- **Response**: `MessageResponse` (`200 OK`).

#### 9. `POST /api/v1/auth/forgot-password`
- **Purpose**: Request password reset instructions.
- **Auth**: None (Public).
- **Request**: `ForgotPasswordRequest` (`email`).
- **Response**: `MessageResponse` (`200 OK`).

#### 10. `POST /api/v1/auth/reset-password`
- **Purpose**: Reset password using recovery token.
- **Auth**: None (Public).
- **Request**: `ResetPasswordRequest` (`token`, `new_password`).
- **Response**: `MessageResponse` (`200 OK`).

#### 11. `POST /api/v1/auth/google`
- **Purpose**: Google OAuth ID token exchange stub.
- **Auth**: None (Public).

---

### Module 2: Profile, Skills & Portfolio

#### 12. `GET /api/v1/users`
- **Purpose**: Discover and search talent profiles.
- **Auth**: None (Public).
- **Query Params**: `q` (keyword), `role` (craft), `location` (city), `account_type` (default: "talent"), `limit`, `offset`.
- **Response**: `list[PublicProfileResponse]` (`200 OK`).

#### 13. `GET /api/v1/users/me`
- **Purpose**: Get authenticated user's profile directly from `public.users`.
- **Auth**: Bearer Token.
- **Response**: `CurrentUserResponse` (`200 OK`).

#### 14. `PATCH /api/v1/users/me`
- **Purpose**: Update profile attributes (`full_name`, `role`, `location`, `bio`, `experience_years`, `phone`).
- **Auth**: Bearer Token.
- **Response**: `CurrentUserResponse` (`200 OK`).

#### 15. `DELETE /api/v1/users/me`
- **Purpose**: Delete current user account with password authorization.
- **Auth**: Bearer Token.
- **Request**: `AccountDeleteRequest` (`password`).
- **Response**: `200 OK`.

#### 16. `GET /api/v1/users/me/completeness`
- **Purpose**: Calculate profile completeness score and suggestions based on name, bio, craft, phone, location, and portfolio.
- **Auth**: Bearer Token.
- **Response**: `CompletenessResponse` (`200 OK`).

#### 17. `GET /api/v1/users/{user_id}/public`
- **Purpose**: Get public talent profile by user ID.
- **Auth**: None (Public).
- **Response**: `PublicProfileResponse` (`200 OK`).

#### 18. `GET /api/v1/users/skills/catalog`
- **Purpose**: Retrieve standard catalog of film and media craft skills.
- **Auth**: None (Public).
- **Response**: `list[SkillListResponse]` (`200 OK`).

#### 19. `GET /api/v1/users/me/skills`
- **Purpose**: Retrieve skills of authenticated talent.
- **Auth**: Bearer Token.
- **Response**: `list[SkillResponse]` (`200 OK`).

#### 20. `PUT /api/v1/users/me/skills`
- **Purpose**: Update skills of authenticated talent.
- **Auth**: Bearer Token (`require_talent`).
- **Request**: `SkillsUpdateRequest` (`skills: list[{skill_id, proficiency}]`).
- **Response**: `list[SkillResponse]` (`200 OK`).

#### 21. `GET /api/v1/users/me/experience`
- **Purpose**: List work experience credits.
- **Auth**: Bearer Token.
- **Response**: `list[ExperienceResponse]` (`200 OK`).

#### 22. `POST /api/v1/users/me/experience`
- **Purpose**: Add work experience credit.
- **Auth**: Bearer Token (`require_talent`).
- **Request**: `ExperienceCreate` (`title`, `company`, `role_type`, `start_date`, `end_date`, `description`).
- **Response**: `ExperienceResponse` (`201 Created`).

#### 23. `PATCH /api/v1/users/me/experience/{exp_id}`
- **Purpose**: Update work experience credit.
- **Auth**: Bearer Token (`require_talent`).

#### 24. `DELETE /api/v1/users/me/experience/{exp_id}`
- **Purpose**: Delete work experience credit.
- **Auth**: Bearer Token (`require_talent`).

#### 25. `GET /api/v1/users/me/portfolio`
- **Purpose**: List portfolio media assets from `public.portfolio_media`.
- **Auth**: Bearer Token.
- **Response**: `list[PortfolioMediaResponse]` (`200 OK`).

#### 26. `POST /api/v1/users/me/portfolio`
- **Purpose**: Add portfolio asset to `public.portfolio_media`.
- **Auth**: Bearer Token (`require_talent`).
- **Request**: `PortfolioMediaCreate` (`title`, `media_url`, `media_type`).
- **Response**: `PortfolioMediaResponse` (`201 Created`).

#### 27. `PATCH /api/v1/users/me/portfolio/{item_id}`
- **Purpose**: Update title or media type of portfolio asset.
- **Auth**: Bearer Token (`require_talent`).

#### 28. `DELETE /api/v1/users/me/portfolio/{item_id}`
- **Purpose**: Delete portfolio asset.
- **Auth**: Bearer Token (`require_talent`).

#### 29. `PUT /api/v1/users/me/portfolio/reorder`
- **Purpose**: Reorder portfolio assets.
- **Auth**: Bearer Token (`require_talent`).

---

### Module 3: Production Houses & Projects

#### 30. `POST /api/v1/production-houses`
- **Purpose**: Register a new production house entity.
- **Auth**: Bearer Token (`require_production`).
- **Request**: `ProductionHouseCreate` (`company_name`, `description`, `location`, `specialization`).
- **Response**: `ProductionHouseResponse` (`201 Created`).

#### 31. `GET /api/v1/production-houses`
- **Purpose**: List production companies with optional `mine_only` filter.
- **Auth**: None (Public) / Authenticated.
- **Response**: `list[ProductionHouseResponse]` (`200 OK`).

#### 32. `GET /api/v1/production-houses/{ph_id}`
- **Purpose**: Retrieve details of a production house.
- **Auth**: None (Public).

#### 33. `PATCH /api/v1/production-houses/{ph_id}`
- **Purpose**: Update company profile (Owner only).
- **Auth**: Bearer Token (Owner).

#### 34. `DELETE /api/v1/production-houses/{ph_id}`
- **Purpose**: Delete production house and associated projects (Owner only).
- **Auth**: Bearer Token (Owner).

#### 35. `POST /api/v1/projects`
- **Purpose**: Create a film or media project under an owned production house.
- **Auth**: Bearer Token (`require_production`).
- **Request**: `ProjectCreate` (`production_house_id`, `title`, `description`, `status`, `start_date`).
- **Response**: `ProjectResponse` (`201 Created`).

#### 36. `GET /api/v1/projects`
- **Purpose**: List projects, optionally filtered by `production_house_id`.
- **Auth**: None (Public).

#### 37. `GET /api/v1/projects/{project_id}`
- **Purpose**: Get project details by ID.
- **Auth**: None (Public).

#### 38. `PATCH /api/v1/projects/{project_id}`
- **Purpose**: Update project status or details (Owner only).
- **Auth**: Bearer Token (Owner).

#### 39. `DELETE /api/v1/projects/{project_id}`
- **Purpose**: Delete project and associated opportunities (Owner only).
- **Auth**: Bearer Token (Owner).

---

### Module 4: Collaborations

#### 40. `POST /api/v1/projects/{project_id}/collaborations`
- **Purpose**: Invite talent to collaborate on a film project.
- **Auth**: Bearer Token (`require_production`).
- **Request**: `CollaborationCreate` (`talent_id`).
- **Response**: `CollaborationResponse` (`201 Created`).

#### 41. `GET /api/v1/projects/{project_id}/collaborations`
- **Purpose**: List all collaborators on a project.
- **Auth**: None (Public) / Authenticated.

#### 42. `GET /api/v1/collaborations/me`
- **Purpose**: List all project collaboration invitations received by the current talent.
- **Auth**: Bearer Token (`require_talent`).

#### 43. `PATCH /api/v1/collaborations/{collab_id}/status`
- **Purpose**: Accept or decline collaboration invitation.
- **Auth**: Bearer Token (`require_talent`).
- **Request**: `CollaborationUpdate` (`status: "accepted" | "declined"`).

---

### Module 5: Opportunities & Applications

#### 44. `POST /api/v1/opportunities`
- **Purpose**: Create a casting call or crew job opportunity under a project.
- **Auth**: Bearer Token (`require_production`).
- **Request**: `OpportunityCreate` (`project_id`, `production_house_id`, `title`, `requirements`, `deadline`, `status`).
- **Response**: `OpportunityResponse` (`201 Created`).

#### 45. `GET /api/v1/opportunities`
- **Purpose**: Browse and search open opportunities.
- **Auth**: None (Public).
- **Query Params**: `project_id`, `production_house_id`, `status`.

#### 46. `GET /api/v1/opportunities/{opp_id}`
- **Purpose**: Get details of an opportunity.
- **Auth**: None (Public).

#### 47. `PATCH /api/v1/opportunities/{opp_id}`
- **Purpose**: Update opportunity requirements or deadline (Owner only).
- **Auth**: Bearer Token (Owner).

#### 48. `DELETE /api/v1/opportunities/{opp_id}`
- **Purpose**: Close or delete opportunity (Owner only).
- **Auth**: Bearer Token (Owner).

#### 49. `GET /api/v1/opportunities/{opp_id}/applications`
- **Purpose**: List all talent applications submitted for an opportunity.
- **Auth**: Bearer Token (`require_production`, Owner).
- **Response**: `list[ApplicationResponse]` (`200 OK`).

#### 50. `POST /api/v1/applications`
- **Purpose**: Submit an application for an open casting call.
- **Auth**: Bearer Token (`require_talent`).
- **Request**: `ApplicationCreate` (`opportunity_id`, `cover_letter`).
- **Validation**: Rejects if opportunity deadline passed, status not open, or duplicate application exists.
- **Response**: `ApplicationResponse` (`201 Created`).

#### 51. `GET /api/v1/applications/me`
- **Purpose**: List all applications submitted by the current talent.
- **Auth**: Bearer Token (`require_talent`).

#### 52. `GET /api/v1/applications/{app_id}`
- **Purpose**: Retrieve application details.
- **Auth**: Bearer Token (Applicant or Company Owner).

#### 53. `PATCH /api/v1/applications/{app_id}/status`
- **Purpose**: Update application review status (`shortlisted`, `accepted`, `rejected`).
- **Auth**: Bearer Token (`require_production`, Owner).

---

### Module 6: Social & Feed

#### 54. `POST /api/v1/connections/{target_user_id}`
- **Purpose**: Send a connection or follow request to another talent/producer.
- **Auth**: Bearer Token.
- **Response**: `ConnectionResponse` (`201 Created`).

#### 55. `GET /api/v1/connections`
- **Purpose**: List user's connections and pending requests.
- **Auth**: Bearer Token.

#### 56. `PATCH /api/v1/connections/{conn_id}`
- **Purpose**: Accept or decline a connection request (Recipient only).
- **Auth**: Bearer Token.

#### 57. `DELETE /api/v1/connections/{conn_id}`
- **Purpose**: Remove a connection or cancel request.
- **Auth**: Bearer Token.

#### 58. `POST /api/v1/posts`
- **Purpose**: Create a feed post with caption and media URL.
- **Auth**: Bearer Token.
- **Request**: `PostCreate` (`caption`, `media_url`).
- **Response**: `PostResponse` (`201 Created`).

#### 59. `GET /api/v1/posts`
- **Purpose**: List community feed posts with real-time likes and comments count.
- **Auth**: None (Public) / Authenticated.

#### 60. `GET /api/v1/posts/{post_id}`
- **Purpose**: Get single post with interaction counts.
- **Auth**: None (Public).

#### 61. `DELETE /api/v1/posts/{post_id}`
- **Purpose**: Delete own feed post.
- **Auth**: Bearer Token (Author only).

#### 62. `POST /api/v1/posts/{post_id}/interactions`
- **Purpose**: Like or comment on a feed post.
- **Auth**: Bearer Token.
- **Request**: `InteractionCreate` (`type: "like" | "comment"`, optional `comment`).
- **Response**: `InteractionResponse` (`201 Created`).

#### 63. `DELETE /api/v1/posts/{post_id}/interactions/{interaction_id}`
- **Purpose**: Remove like or comment from post.
- **Auth**: Bearer Token (Author only).

---

### Module 7: Messaging

#### 64. `POST /api/v1/messages`
- **Purpose**: Send direct message or project collaboration message to another user.
- **Auth**: Bearer Token.
- **Request**: `MessageCreate` (`recipient_id`, `body`, optional `collaboration_id`).
- **Response**: `MessageResponse` (`201 Created`).

#### 65. `GET /api/v1/messages/conversations`
- **Purpose**: List active conversations with last message previews and timestamps.
- **Auth**: Bearer Token.
- **Response**: `list[ConversationSummary]` (`200 OK`).

#### 66. `GET /api/v1/messages/{other_user_id}`
- **Purpose**: Retrieve direct message conversation history with a specific user in chronological order.
- **Auth**: Bearer Token.
- **Response**: `list[MessageResponse]` (`200 OK`).

---

### Module 8: Media Service

#### 67. `POST /api/v1/media/upload-url`
- **Purpose**: Generate presigned Amazon S3 or MinIO upload URL for secure client direct upload.
- **Auth**: Bearer Token.
- **Request**: `UploadUrlRequest` (`filename`, `content_type`, `purpose`).
- **Response**: `UploadUrlResponse` (`upload_url`, `file_key`, `cdn_url`).

#### 68. `DELETE /api/v1/media/{file_key:path}`
- **Purpose**: Delete an uploaded media asset from storage.
- **Auth**: Bearer Token (Owner only).

---

### Module 9: Platform & Health

#### 69. `GET /health`
- **Purpose**: Liveness probe returning service name and status.
- **Auth**: None (Public).
- **Response**: `{"status": "healthy", "service": "CineConnect", "environment": "development"}`.

#### 70. `GET /ready`
- **Purpose**: Readiness probe validating real connectivity to PostgreSQL database and Redis cluster.
- **Auth**: None (Public).
- **Response**: `{"status": "ready", "database": "connected", "redis": "connected"}`.

---

## 3. Local Development & Operational Guide

### Environment Configuration (`backend/.env`)

```ini
ENVIRONMENT=development
DEBUG=True
APP_NAME=CineConnect

# PostgreSQL 16
DATABASE_URL=postgresql+asyncpg://postgres:goldberg786@localhost:5432/CineConnect

# Redis 7
REDIS_URL=redis://localhost:6379/0

# JWT Security
JWT_SECRET_KEY=YOUR_PRIVATE_DEVELOPMENT_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# MinIO / AWS S3 Local Storage
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY=YOUR_MINIO_ACCESS_KEY
S3_SECRET_KEY=YOUR_MINIO_SECRET_KEY
S3_BUCKET_NAME=cineconnect-media
S3_REGION=ap-south-1
CDN_BASE_URL=http://localhost:9000/cineconnect-media
```

### Windows Execution Commands

#### 1. Run Automated Test Suite
From the repository root or `backend` directory in PowerShell:
```powershell
cd c:\Users\DELL\cine_connect-_app\backend
..\.venv\Scripts\python.exe -m pytest tests/ -v
```

#### 2. Start Backend FastAPI Server
```powershell
cd c:\Users\DELL\cine_connect-_app\backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Test Endpoints via Swagger UI
Open your browser and navigate to:
```
http://127.0.0.1:8000/docs
```
- Test `POST /api/v1/auth/register/talent` to register a talent user.
- Test `POST /api/v1/auth/register/production` to register a production house and studio.
- Test `POST /api/v1/auth/login` to authenticate and obtain bearer tokens.
- Click the **Authorize** button in Swagger UI and enter `Bearer <access_token>` to test protected endpoints.
- Confirm that no OTP endpoints exist under `/api/v1/auth`.
