# Cine Connect — Complete Backend API Audit & Gap Analysis

**Date:** October 2026  
**Auditor:** Senior Backend Architect & FastAPI Engineer  
**System:** Cine Connect Backend (FastAPI, SQLAlchemy 2.0 Async, PostgreSQL 16, Redis 7, MinIO / S3)

---

## 1. Executive Summary

This document presents a comprehensive, whole-system architectural audit of the Cine Connect backend API following the full implementation of the authentication redesign and backend API surface completion.

### Key Audit Findings & Architectural Decisions

1. **Authentication Redesign & OTP Removal**:
   - Cine Connect supports two distinct account types: **Talent** and **Production**.
   - Both account types authenticate exclusively via **Email and Password**.
   - Mobile numbers are collected during registration for identity and contact records but are **not OTP-verified** in the local development environment.
   - Mobile OTP authentication routes (`POST /api/v1/auth/otp/send` and `POST /api/v1/auth/otp/verify`), OTP schemas, and OTP rate-limiting configurations have been completely removed from the active application and OpenAPI schema.
   - Phone numbers are stored in normalized E.164-compatible format with `phone_verified=False` by default.
   - Password security is strictly preserved using **Argon2** password hashing (with bcrypt fallback).

2. **Talent vs. Production Account Separation**:
   - **Talent Accounts**:
     - Registration collects: Full Name, Email, Mobile Number, Password, and optional Craft & Location (`POST /api/v1/auth/register/talent`).
     - Automatically assigned `account_type="talent"` and `role="talent"` (or selected craft).
     - Restricted from creating production houses, projects, or publishing casting calls.
     - Authorized to manage talent profiles, skills catalog selections, work experiences, portfolio media assets (`public.portfolio_media`), and submit casting applications.
   - **Production Accounts**:
     - Registration collects: Production House Name, Email, Mobile Number, Password, and optional Headquarters Location & Description (`POST /api/v1/auth/register/production`).
     - Automatically assigned `account_type="production"` and `role="production"`.
     - In **one atomic database transaction**, creates both the User account and its owned `ProductionHouse` record in `public.production_houses`.
     - Ensures no orphaned production house records and prevents duplicate production house creation during retry attempts.
     - Restricted from submitting talent applications to casting calls.
     - Authorized to manage production houses, projects, casting opportunities, and review applicant submissions.

3. **Database Schema & Table Alignment**:
   - The PostgreSQL database (`CineConnect`) has 11 active core tables:
     `users`, `production_houses`, `projects`, `opportunities`, `applications`, `collaborations`, `connections`, `portfolio_media`, `posts`, `interactions`, `messages`.
   - All active API endpoints are strictly aligned with these actual database tables.
   - Talent attributes (`full_name`, `role`, `location`, `bio`, `experience_years`, `phone`, `account_type`) are stored directly on `public.users`.
   - Portfolio media assets are stored in `public.portfolio_media` and connected directly to `User.id`.
   - No destructive migrations or table drops are permitted; existing database relationships and records are preserved.

4. **Complete API Surface**:
   - 70 active, documented HTTP endpoints across 50 OpenAPI paths in 9 functional modules.
   - Zero broken or unreachable routes.
   - Full test suite passing with 20 comprehensive automated tests covering Talent, Production, Role restrictions, Security guards, Social, Messaging, Token revocation, and OpenAPI regression.

---

## 2. API Surface Catalog & Audit Matrix

The table below catalogs every API endpoint inspected, including user role requirements, authorization guards, related database tables, implementation and test status, architectural decisions, and technical rationales.

| Method & Path | Purpose & User Role | Auth / Authz Requirement | Related DB Tables | Implemented & Tested | Decision | Reason for Decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/register/talent` | Register Talent account (Talent) | Public | `users` | Implemented, Tested | **Keep** | Core requirement for Talent onboarding (name, email, mobile, password, craft, location) without OTP verification. |
| `POST /api/v1/auth/register/production` | Register Production company & owner account (Production) | Public | `users`, `production_houses` | Implemented, Tested | **Keep** | Core requirement for Production onboarding; atomically creates User and ProductionHouse records in one transaction. |
| `POST /api/v1/auth/register` | Unified / legacy registration endpoint (Any) | Public | `users`, `production_houses` | Implemented, Tested | **Merge Duplicate** | Preserved for backward compatibility with legacy clients; routes dynamically by `account_type`. |
| `POST /api/v1/auth/login` | Email/password login returning JWT tokens (Any) | Public | `users`, `production_houses` | Implemented, Tested | **Keep** | Primary email/password login route using Argon2 password hashing; returns access and refresh tokens. |
| `POST /api/v1/auth/refresh` | Rotate access and refresh token pair (Any) | Bearer Token (Refresh) | `users` | Implemented, Tested | **Keep** | Maintains session continuity while enforcing short-lived access tokens (15m) and claim preservation. |
| `POST /api/v1/auth/logout` | Revoke refresh token and invalidate session (Any) | Bearer Token | Redis Token Blacklist | Implemented, Tested | **Keep** | Ensures instant session invalidation by blacklisting refresh tokens in Redis. |
| `POST /api/v1/auth/verify-email` | Confirm email ownership via verification token (Public) | Public | `users` | Implemented, Tested | **Keep** | Standard security requirement; optional/configurable in local development. |
| `POST /api/v1/auth/resend-email-verification` | Resend verification token to registered email (Public) | Public / Bearer | `users` | Implemented, Tested | **Keep** | User self-service flow if email verification token expires. |
| `POST /api/v1/auth/forgot-password` | Request password recovery reset token (Public) | Public | `users` | Implemented, Tested | **Keep** | Required password recovery capability; generates time-limited reset tokens. |
| `POST /api/v1/auth/reset-password` | Set new password using valid reset token (Public) | Public | `users` | Implemented, Tested | **Keep** | Completes password recovery without exposing current password hashes. |
| `POST /api/v1/auth/google` | Google OAuth token exchange stub (Public) | Public | `users` | Implemented (Stub) | **Defer** | Social OAuth is optional and deferred; core email/password auth is the standard path. |
| `POST /api/v1/auth/otp/send` | Mobile SMS OTP dispatch | Public | None | Removed, Tested (404) | **Remove** | Requirement to remove mobile OTP verification from active API surface for local dev. |
| `POST /api/v1/auth/otp/verify` | Mobile SMS OTP verification & login | Public | None | Removed, Tested (404) | **Remove** | Requirement to remove mobile OTP verification from active API surface for local dev. |
| `GET /api/v1/users` | Search and discover talent profiles by craft, name, city (Public/All) | Public | `users` | Implemented, Tested | **Keep** | Essential discovery feature for casting directors and producers to find talent. |
| `GET /api/v1/users/me` | Retrieve currently authenticated user profile (Authenticated) | Bearer Token | `users` | Implemented, Tested | **Keep** | Core profile retrieval for dashboard, navigation, and identity checks. |
| `PATCH /api/v1/users/me` | Update authenticated user's profile details & phone (Authenticated) | Bearer Token (Self) | `users` | Implemented, Tested | **Keep** | Enables users to update bio, location, craft, and mobile number. |
| `DELETE /api/v1/users/me` | Delete authenticated user account with password verification (Authenticated) | Bearer Token (Self) | `users` (cascading) | Implemented, Tested | **Keep** | GDPR/DPDP account lifecycle compliance with password re-authentication. |
| `GET /api/v1/users/me/completeness` | Calculate profile completeness percentage & suggestions (Authenticated) | Bearer Token | `users`, `portfolio_media` | Implemented, Tested | **Keep** | Guides talent users to complete profile fields to improve casting discovery. |
| `GET /api/v1/users/{user_id}/public` | Retrieve public profile view of any talent user (Public) | Public | `users` | Implemented, Tested | **Keep** | Shareable public link for casting directors, collaborators, and external visitors. |
| `GET /api/v1/users/skills/catalog` | List standard film/media skills catalog (Public) | Public | In-memory catalog | Implemented, Tested | **Keep** | Standardized taxonomy of cinematic skills across acting, camera, editing, sound, and stunts. |
| `GET /api/v1/users/me/skills` | Get current user's skills list (Authenticated) | Bearer Token | `users` (role-based) | Implemented, Tested | **Keep** | Allows talent to inspect their configured skills. |
| `PUT /api/v1/users/me/skills` | Update/replace talent skills list (Talent Only) | Bearer Token (`require_talent`) | `users` | Implemented, Tested | **Keep** | Allows talent to update competencies against the catalog. |
| `GET /api/v1/users/me/experience` | List authenticated user's work experience / credits (Authenticated) | Bearer Token | `users` | Implemented, Tested | **Keep** | Displays career history and industry credits for talent. |
| `POST /api/v1/users/me/experience` | Add a work experience / credit entry (Talent Only) | Bearer Token (`require_talent`) | `users` | Implemented, Tested | **Keep** | Allows talent to log production credits and past films. |
| `PATCH /api/v1/users/me/experience/{exp_id}` | Update work experience entry (Talent Only) | Bearer Token (`require_talent`, Owner) | `users` | Implemented, Tested | **Keep** | Enables editing credit details. |
| `DELETE /api/v1/users/me/experience/{exp_id}` | Delete work experience entry (Talent Only) | Bearer Token (`require_talent`, Owner) | `users` | Implemented, Tested | **Keep** | Allows removing obsolete or incorrect credits. |
| `GET /api/v1/users/me/portfolio` | List portfolio media assets (photos, reels, docs) (Authenticated) | Bearer Token | `portfolio_media` | Implemented, Tested | **Keep** | Direct retrieval of portfolio items linked to talent. |
| `POST /api/v1/users/me/portfolio` | Add new portfolio media asset (Talent Only) | Bearer Token (`require_talent`) | `portfolio_media` | Implemented, Tested | **Keep** | Allows talent to attach showreels, headshots, and media to their portfolio. |
| `PATCH /api/v1/users/me/portfolio/{item_id}` | Update portfolio asset metadata (title, type) (Talent Only) | Bearer Token (`require_talent`, Owner) | `portfolio_media` | Implemented, Tested | **Keep** | Allows editing portfolio item title or media type. |
| `DELETE /api/v1/users/me/portfolio/{item_id}` | Delete portfolio asset (Talent Only) | Bearer Token (`require_talent`, Owner) | `portfolio_media` | Implemented, Tested | **Keep** | Allows talent to remove media from their portfolio. |
| `PUT /api/v1/users/me/portfolio/reorder` | Reorder display sorting of portfolio assets (Talent Only) | Bearer Token (`require_talent`) | `portfolio_media` | Implemented, Tested | **Keep** | Customizes presentation order of headshots and showreels. |
| `POST /api/v1/production-houses` | Create a new production company profile (Production Only) | Bearer Token (`require_production`) | `production_houses` | Implemented, Tested | **Keep** | Allows production users to set up company profile and specialization. |
| `GET /api/v1/production-houses` | List production houses with optional `mine_only` filter (Public / Auth) | Public / Bearer Token | `production_houses` | Implemented, Tested | **Keep** | Directory of production houses for talent and filmmakers. |
| `GET /api/v1/production-houses/{ph_id}` | Get details for a specific production house (Public) | Public | `production_houses` | Implemented, Tested | **Keep** | Public profile view of a production company. |
| `PATCH /api/v1/production-houses/{ph_id}` | Update production house details (Owner Only) | Bearer Token (Owner) | `production_houses` | Implemented, Tested | **Keep** | Studio owners can update company name, location, and specialization. |
| `DELETE /api/v1/production-houses/{ph_id}` | Delete production house and associated projects (Owner Only) | Bearer Token (Owner) | `production_houses`, `projects` | Implemented, Tested | **Keep** | Full lifecycle management for production companies. |
| `POST /api/v1/projects` | Create film/media project under owned studio (Production Only) | Bearer Token (`require_production`, Owner) | `projects`, `production_houses` | Implemented, Tested | **Keep** | Core feature for producers to create film/series/commercial projects. |
| `GET /api/v1/projects` | List projects with optional production house filter (Public) | Public | `projects` | Implemented, Tested | **Keep** | Discover active productions and slate of films. |
| `GET /api/v1/projects/{project_id}` | Get project details by ID (Public) | Public | `projects` | Implemented, Tested | **Keep** | Public view of film details, status, and timeline. |
| `PATCH /api/v1/projects/{project_id}` | Update project details, timeline, or status (Owner Only) | Bearer Token (Owner) | `projects`, `production_houses` | Implemented, Tested | **Keep** | Track project progression (development, pre-production, filming, post). |
| `DELETE /api/v1/projects/{project_id}` | Delete project and child records (Owner Only) | Bearer Token (Owner) | `projects`, `opportunities`, `collaborations` | Implemented, Tested | **Keep** | Clean removal of obsolete projects. |
| `POST /api/v1/projects/{project_id}/collaborations` | Invite talent to collaborate on a project (Production Only) | Bearer Token (`require_production`, Owner) | `collaborations`, `projects`, `users` | Implemented, Tested | **Keep** | Key collaboration loop connecting producers directly with talent. |
| `GET /api/v1/projects/{project_id}/collaborations` | List collaborators and crew attached to a project (Public/Auth) | Public | `collaborations`, `projects`, `users` | Implemented, Tested | **Keep** | Shows project cast and crew roster. |
| `GET /api/v1/collaborations/me` | List project collaboration invitations received by talent (Talent Only) | Bearer Token (`require_talent`) | `collaborations`, `projects`, `users` | Implemented, Tested | **Keep** | Talent notification dashboard for project offers. |
| `PATCH /api/v1/collaborations/{collab_id}/status` | Accept or decline collaboration invite (Talent Only) | Bearer Token (`require_talent`, Recipient) | `collaborations` | Implemented, Tested | **Keep** | Talent response to production invitations. |
| `POST /api/v1/opportunities` | Create a casting call or job posting (Production Only) | Bearer Token (`require_production`, Owner) | `opportunities`, `projects`, `production_houses` | Implemented, Tested | **Keep** | Primary business feature: publishing casting calls and crew requirements. |
| `GET /api/v1/opportunities` | List & filter casting calls by project, studio, status (Public) | Public | `opportunities` | Implemented, Tested | **Keep** | Discovery marketplace for talent seeking roles. |
| `GET /api/v1/opportunities/{opp_id}` | Get opportunity details, requirements, and deadline (Public) | Public | `opportunities` | Implemented, Tested | **Keep** | Full casting call breakdown. |
| `PATCH /api/v1/opportunities/{opp_id}` | Update opportunity requirements or status (Owner Only) | Bearer Token (Owner) | `opportunities`, `production_houses` | Implemented, Tested | **Keep** | Modify requirements or close casting calls. |
| `DELETE /api/v1/opportunities/{opp_id}` | Delete opportunity and associated applications (Owner Only) | Bearer Token (Owner) | `opportunities`, `applications` | Implemented, Tested | **Keep** | Remove closed or cancelled casting notices. |
| `GET /api/v1/opportunities/{opp_id}/applications` | List talent applications for a casting call (Owner Only) | Bearer Token (`require_production`, Owner) | `applications`, `opportunities`, `production_houses` | Implemented, Tested | **Keep** | Producers review submissions and audition tapes. |
| `POST /api/v1/applications` | Apply for a casting call / job opportunity (Talent Only) | Bearer Token (`require_talent`) | `applications`, `opportunities` | Implemented, Tested | **Keep** | Primary talent workflow for submitting auditions. |
| `GET /api/v1/applications/me` | List current talent user's submitted applications (Talent Only) | Bearer Token (`require_talent`) | `applications` | Implemented, Tested | **Keep** | Talent application tracking pipeline. |
| `GET /api/v1/applications/{app_id}` | Get application details (Applicant or Studio Owner Only) | Bearer Token (Applicant or Owner) | `applications`, `opportunities`, `production_houses` | Implemented, Tested | **Keep** | Detailed review of applicant note and status. |
| `PATCH /api/v1/applications/{app_id}/status` | Shortlist, accept, or reject application (Owner Only) | Bearer Token (`require_production`, Owner) | `applications`, `opportunities`, `production_houses` | Implemented, Tested | **Keep** | Producer applicant decision pipeline. |
| `POST /api/v1/connections/{target_user_id}` | Send connection/follow request (Authenticated) | Bearer Token | `connections`, `users` | Implemented, Tested | **Keep** | Professional networking between film industry peers. |
| `GET /api/v1/connections` | List user's connections and pending requests (Authenticated) | Bearer Token | `connections` | Implemented, Tested | **Keep** | Network management and pending request reviews. |
| `PATCH /api/v1/connections/{conn_id}` | Accept or decline connection request (Recipient Only) | Bearer Token (Recipient) | `connections` | Implemented, Tested | **Keep** | User controls who joins their network. |
| `DELETE /api/v1/connections/{conn_id}` | Disconnect or cancel request (Participant) | Bearer Token (Participant) | `connections` | Implemented, Tested | **Keep** | Allows removing unwanted connections. |
| `POST /api/v1/posts` | Create a community feed post (Authenticated) | Bearer Token | `posts` | Implemented, Tested | **Keep** | Feed content sharing for BTS shots, updates, and reels. |
| `GET /api/v1/posts` | List community feed posts with interaction counts (Public / Auth) | Public | `posts`, `interactions` | Implemented, Tested | **Keep** | Discover community updates and industry trends. |
| `GET /api/v1/posts/{post_id}` | Get single post details with likes/comments (Public) | Public | `posts`, `interactions` | Implemented, Tested | **Keep** | Detailed post view with comment thread. |
| `DELETE /api/v1/posts/{post_id}` | Delete authored post (Author Only) | Bearer Token (Author) | `posts`, `interactions` | Implemented, Tested | **Keep** | Content ownership control. |
| `POST /api/v1/posts/{post_id}/interactions` | Like or comment on a feed post (Authenticated) | Bearer Token | `interactions`, `posts` | Implemented, Tested | **Keep** | Social engagement and feedback. |
| `DELETE /api/v1/posts/{post_id}/interactions/{interaction_id}` | Remove like or comment (Author Only) | Bearer Token (Author) | `interactions` | Implemented, Tested | **Keep** | Allows removing own reaction or comment. |
| `POST /api/v1/messages` | Send direct message or collaboration note (Authenticated) | Bearer Token | `messages`, `users`, `collaborations` | Implemented, Tested | **Keep** | Direct 1-on-1 industry communication. |
| `GET /api/v1/messages/conversations` | List user's active conversations & previews (Authenticated) | Bearer Token | `messages`, `users` | Implemented, Tested | **Keep** | Inbox summary for messaging UI. |
| `GET /api/v1/messages/{other_user_id}` | Get chronological message thread history (Participant Only) | Bearer Token (Participant) | `messages`, `users` | Implemented, Tested | **Keep** | Thread view for active conversations. |
| `POST /api/v1/media/upload-url` | Generate presigned S3/MinIO upload URL (Authenticated) | Bearer Token | S3 / MinIO Storage | Implemented, Tested | **Keep** | Secure direct-to-cloud file uploads without proxying heavy binary data through API. |
| `DELETE /api/v1/media/{file_key:path}` | Delete uploaded file from storage (Owner Only) | Bearer Token (Owner) | S3 / MinIO Storage | Implemented, Tested | **Keep** | Asset cleanup when media is removed. |
| `GET /health` | Service liveness health check (Public) | Public | None | Implemented, Tested | **Keep** | DevOps liveness probe. |
| `GET /ready` | Service readiness check validating DB & Redis (Public) | Public | `users` (DB ping), Redis ping | Implemented, Tested | **Keep** | DevOps readiness probe. |

---

## 3. Analysis of Workflow Coverage & Potential Gaps

### Talent Workflow Coverage
1. **Sign-up & Login**: `POST /api/v1/auth/register/talent` and `POST /api/v1/auth/login` collect email, password, phone, name, and craft. Zero OTP needed.
2. **Profile & Portfolio**: `GET /api/v1/users/me`, `PATCH /api/v1/users/me`, `GET /api/v1/users/me/completeness`, skills catalog (`GET /skills/catalog`, `GET/PUT /me/skills`), work experience (`GET/POST/PATCH/DELETE /me/experience`), and portfolio media (`GET/POST/PATCH/DELETE /me/portfolio`, `PUT /me/portfolio/reorder`).
3. **Casting & Applications**: `GET /api/v1/opportunities` (browse casting calls), `POST /api/v1/applications` (apply), `GET /api/v1/applications/me` (track status).
4. **Project Invitations**: `GET /api/v1/collaborations/me` (view invitations), `PATCH /api/v1/collaborations/{id}/status` (accept/decline).
5. **Networking & Chat**: Connections, social posts, likes, comments, and direct messaging with production houses.

### Production Workflow Coverage
1. **Sign-up & Login**: `POST /api/v1/auth/register/production` and `POST /api/v1/auth/login` atomically create both User and ProductionHouse records with company name, email, phone, and password.
2. **Studio Management**: `POST/GET/PATCH/DELETE /api/v1/production-houses`.
3. **Project Slate**: `POST/GET/PATCH/DELETE /api/v1/projects`.
4. **Casting & Auditions**: `POST/GET/PATCH/DELETE /api/v1/opportunities`, `GET /opportunities/{id}/applications`, and `PATCH /applications/{id}/status` (shortlist, accept, reject).
5. **Crew Collaborations**: `POST /projects/{id}/collaborations` (invite talent), `GET /projects/{id}/collaborations` (list crew).
6. **Communication**: Direct messages to applicants and collaborators.

**Gap Analysis Verdict**: All essential Talent and Production workflows are fully covered by the 70 active API operations across the 11 database tables. No additional endpoints are missing or required.

---

## 4. Final Endpoint Counts & Inventory Breakdown

### Breakdown by Decision:
- **Kept Endpoints**: 68 endpoints
- **Merged Duplicate Endpoints**: 1 endpoint (`POST /api/v1/auth/register` - unified registration kept for legacy callers but merged conceptually into role-specific registration)
- **Deferred Endpoints**: 1 endpoint (`POST /api/v1/auth/google` - third-party OAuth stub deferred for future social sprint)
- **Removed Endpoints**: 2 endpoints (`POST /api/v1/auth/otp/send` and `POST /api/v1/auth/otp/verify` - completely removed from API surface and verified returning 404)
- **Newly Added Endpoints**: 0 invented endpoints (as required by prompt: "Do not invent endpoints merely to increase the API count")
- **Active Operations in Live API Surface**: 70 HTTP operations across 50 unique OpenAPI paths.

### Counts by HTTP Method (Live Active Surface):
- **POST**: 23
- **GET**: 26 (including `/health` and `/ready`, excluding FastAPI doc endpoints)
- **PATCH**: 9
- **DELETE**: 10
- **PUT**: 2
- **Total Operations**: 70

### Counts by Feature Module (Live Active Surface):
1. **Auth & Identity**: 11 active operations (Kept: 9, Merged: 1, Deferred: 1, Removed: 2)
2. **User Profile & Discovery**: 6 active operations (Kept: 6)
3. **Skills Taxonomy & Management**: 3 active operations (Kept: 3)
4. **Work Experience & Credits**: 4 active operations (Kept: 4)
5. **Portfolio Media Assets**: 5 active operations (Kept: 5)
6. **Production Houses Management**: 5 active operations (Kept: 5)
7. **Film Project Management**: 5 active operations (Kept: 5)
8. **Project Collaborations**: 4 active operations (Kept: 4)
9. **Opportunities & Casting Calls**: 6 active operations (Kept: 6)
10. **Talent Applications**: 4 active operations (Kept: 4)
11. **Connections & Networking**: 4 active operations (Kept: 4)
12. **Feed Posts & Community Interactions**: 6 active operations (Kept: 6)
13. **Direct Messaging & History**: 3 active operations (Kept: 3)
14. **Direct Media Storage (S3/MinIO)**: 2 active operations (Kept: 2)
15. **DevOps Health & Readiness Probes**: 2 active operations (Kept: 2)

---

## 5. Database Schema & Migration Status

- **PostgreSQL Tables (11 active)**:
  `users`, `production_houses`, `projects`, `opportunities`, `applications`, `collaborations`, `connections`, `portfolio_media`, `posts`, `interactions`, `messages`.
- **Database Migrations Required**: **None**.
- **Rationale**: The live database schema already contains all 11 tables with all necessary foreign keys, unique constraints, and nullable attributes. No schema changes, table drops, or resets were performed or required, adhering strictly to the zero-data-loss principle.

---

## 6. Test Results Summary

Full backend test suite executed using `.venv\Scripts\pytest -v`:
- **Total Tests:** 20 passed, 0 failed.
- **Coverage Areas:**
  - Talent registration, validation, phone normalization, and login.
  - Production registration, atomic production house creation, retry idempotency, and login.
  - Role-based authorization enforcement (`require_talent` and `require_production` returning 403 on role mismatch).
  - JWT security guards: expired token rejection, malformed UUID subject returning HTTP 401 (not HTTP 500), and invalid token types.
  - Complete absence of OTP endpoints from OpenAPI schema and HTTP 404 confirmation.
  - Duplicate email and duplicate mobile number rejection.
  - Refresh token claims preservation (`account_type`, `role`), Redis revocation blacklist, and account deletion.
  - Profile management, completeness scoring, and portfolio media CRUD.
  - Production houses, film projects, casting calls, and application submission/status pipelines.
  - Professional connections, posts, comments, likes, and direct messaging history.
  - Platform liveness (`/health`) and readiness (`/ready`) checking PostgreSQL and Redis connectivity.
