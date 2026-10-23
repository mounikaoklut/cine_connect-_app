import json
import time
import urllib.error
import urllib.request

BASE = "http://localhost:8000"
results = []


def test_req(method, path, body=None, token=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode()
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode()
        try:
            err_json = json.loads(content)
        except Exception:
            err_json = content
        return e.code, err_json
    except Exception as e:
        return 0, str(e)


print("=== RUNNING FULL CICONNECT ENDPOINT VERIFICATION ===")

# 1. Health
s, r = test_req("GET", "/health")
results.append(("GET /health", s, s == 200))

# 2. Skills Catalog
s, r = test_req("GET", "/api/v1/users/skills/catalog")
results.append(("GET /api/v1/users/skills/catalog", s, s == 200 and isinstance(r, list)))
skills_cat = r if isinstance(r, list) else []

# 3. Register
ts = int(time.time())
test_email = f"talent_{ts}@cineconnect.com"
s, r = test_req(
    "POST",
    "/api/v1/auth/register",
    {"email": test_email, "password": "Password123!", "name": "Christopher Nolan"},
)
results.append(("POST /api/v1/auth/register", s, s == 201))
access_token = r.get("access_token") if s == 201 else None
refresh_token = r.get("refresh_token") if s == 201 else None
user_id = r.get("user", {}).get("id") if s == 201 else None

# 4. Login
s, r = test_req("POST", "/api/v1/auth/login", {"email": test_email, "password": "Password123!"})
results.append(("POST /api/v1/auth/login", s, s == 200))
if s == 200:
    access_token = r.get("access_token")

# 5. OTP Send
test_phone = f"+1555{ts % 10000000:07d}"
s, r = test_req("POST", "/api/v1/auth/otp/send", {"phone": test_phone})
results.append(("POST /api/v1/auth/otp/send", s, s == 200))

# Extract dev otp if present
otp = "123456"
if "Dev preview: " in str(r):
    otp = str(r).split("Dev preview: ")[1].split(")")[0]

# 6. OTP Verify
s, r = test_req("POST", "/api/v1/auth/otp/verify", {"phone": test_phone, "otp": otp})
results.append(("POST /api/v1/auth/otp/verify", s, s == 200))

# 7. Refresh token
if refresh_token:
    s, r = test_req("POST", "/api/v1/auth/refresh", {"refresh_token": refresh_token})
    results.append(("POST /api/v1/auth/refresh", s, s == 200))

# 8. Forgot password
s, r = test_req("POST", "/api/v1/auth/forgot-password", {"email": test_email})
results.append(("POST /api/v1/auth/forgot-password", s, s == 200))

# 9. Google auth stub
s, r = test_req("POST", "/api/v1/auth/google", {"id_token": "dummy-token"})
results.append(("POST /api/v1/auth/google", s, s == 200))

# 10. Profile GET /me
s, r = test_req("GET", "/api/v1/users/me", token=access_token)
results.append(("GET /api/v1/users/me", s, s == 200))

# 11. Profile PATCH /me
s, r = test_req(
    "PATCH",
    "/api/v1/users/me",
    {
        "bio": "Director and Writer",
        "primary_craft": "direction",
        "city": "Los Angeles",
        "state": "CA",
    },
    token=access_token,
)
results.append(("PATCH /api/v1/users/me", s, s == 200))

# 12. Completeness
s, r = test_req("GET", "/api/v1/users/me/completeness", token=access_token)
results.append(("GET /api/v1/users/me/completeness", s, s == 200))

# 13. Public Profile
if user_id:
    s, r = test_req("GET", f"/api/v1/users/{user_id}/public")
    results.append((f"GET /api/v1/users/{user_id}/public", s, s == 200))

# 14. Skills PUT /me/skills & GET /me/skills
skill_id = skills_cat[0]["id"] if skills_cat else 1
s, r = test_req(
    "PUT",
    "/api/v1/users/me/skills",
    {"skills": [{"skill_id": skill_id, "proficiency": "expert"}]},
    token=access_token,
)
results.append(("PUT /api/v1/users/me/skills", s, s == 200))

s, r = test_req("GET", "/api/v1/users/me/skills", token=access_token)
results.append(("GET /api/v1/users/me/skills", s, s == 200))

# 15. Experience POST, GET, PATCH, DELETE
s, r = test_req(
    "POST",
    "/api/v1/users/me/experience",
    {
        "title": "Director",
        "company": "Syncopy Films",
        "role_type": "contract",
        "start_date": "2010-01-01",
        "description": "Oppenheimer",
    },
    token=access_token,
)
results.append(("POST /api/v1/users/me/experience", s, s == 201))
exp_id = r.get("id") if s == 201 else None

s, r = test_req("GET", "/api/v1/users/me/experience", token=access_token)
results.append(("GET /api/v1/users/me/experience", s, s == 200))

if exp_id:
    s, r = test_req(
        "PATCH",
        f"/api/v1/users/me/experience/{exp_id}",
        {"title": "Lead Director"},
        token=access_token,
    )
    results.append(("PATCH /api/v1/users/me/experience/{id}", s, s == 200))
    s, r = test_req(
        "DELETE", f"/api/v1/users/me/experience/{exp_id}", token=access_token
    )
    results.append(("DELETE /api/v1/users/me/experience/{id}", s, s == 204))

# 16. Portfolio POST, GET, PATCH, REORDER, DELETE
s, r = test_req(
    "POST",
    "/api/v1/users/me/portfolio",
    {
        "title": "Oppenheimer Reel",
        "type": "showreel",
        "s3_url": "http://localhost:9000/cineconnect-media/showreel.mp4",
        "is_public": True,
    },
    token=access_token,
)
results.append(("POST /api/v1/users/me/portfolio", s, s == 201))
item_id = r.get("id") if s == 201 else None

s, r = test_req("GET", "/api/v1/users/me/portfolio", token=access_token)
results.append(("GET /api/v1/users/me/portfolio", s, s == 200))

if item_id:
    s, r = test_req(
        "PATCH",
        f"/api/v1/users/me/portfolio/{item_id}",
        {"title": "Updated Oppenheimer Reel"},
        token=access_token,
    )
    results.append(("PATCH /api/v1/users/me/portfolio/{id}", s, s == 200))
    s, r = test_req(
        "PUT",
        "/api/v1/users/me/portfolio/reorder",
        {"item_ids": [item_id]},
        token=access_token,
    )
    results.append(("PUT /api/v1/users/me/portfolio/reorder", s, s == 200))
    s, r = test_req(
        "DELETE", f"/api/v1/users/me/portfolio/{item_id}", token=access_token
    )
    results.append(("DELETE /api/v1/users/me/portfolio/{id}", s, s == 204))

# 17. Media Upload URL
s, r = test_req(
    "POST",
    "/api/v1/media/upload-url",
    {
        "filename": "showreel.mp4",
        "content_type": "video/mp4",
        "purpose": "portfolio",
    },
    token=access_token,
)
results.append(("POST /api/v1/media/upload-url", s, s == 200))

print("\n" + "=" * 65)
print(f"{'ENDPOINT':<45} | {'STATUS':<6} | {'RESULT':<6}")
print("=" * 65)
all_pass = True
for name, status, passed in results:
    badge = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"{name:<45} | {status:<6} | {badge}")
print("=" * 65)
if all_pass:
    print("ALL APIS ARE VERIFIED AND WORKING PROPERLY!")
else:
    print("SOME APIS FAILED!")
