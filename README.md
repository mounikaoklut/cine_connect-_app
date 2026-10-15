# CineConnect — User Portal 🎬✨

Connecting Film & Media Talent (actors, cinematographers, editors, sound engineers, directors, writers) with top production houses and opportunities.

---

## 🛠 Technology Stack

- **Web:** Next.js 15+ (App Router) + React + TypeScript + Vanilla CSS (cinematic dark mode)
- **Mobile:** Flutter (Android & iOS)
- **Backend:** Python 3.12 + FastAPI (Async REST + WebSocket)
- **Database:** PostgreSQL 16 with `pgvector`
- **Cache:** Redis 7 (Sessions, OTPs, rate-limits, feed cache, chat pub/sub)
- **Media:** AWS S3 (or MinIO locally) + CloudFront CDN
- **Search:** OpenSearch 2.x
- **DevOps:** Docker Compose, GitHub Actions, AWS ECS/ECR

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### 2. Start Infrastructure (PostgreSQL, Redis, MinIO, Backend)
```bash
docker compose up -d
```

- **FastAPI Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI OpenAPI Schema:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Pass: `minioadmin123`)

### 3. Run Backend Locally (Without Docker)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Run Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests:
```bash
cd backend
pytest tests/ -v
```

---

## 📑 Roadmap & Phases
- **Phase 1 (Active):** Auth, Profile, Skills, Experience, Portfolio, Media Upload
- **Phase 2:** Job Marketplace (OpenSearch), Apply, Status Pipeline Tracker
- **Phase 3:** Real-time Chat (WebSocket) & Push Notifications
- **Phase 4:** AI Job Recommendations (`pgvector` cosine similarity + re-ranker)
- **Phase 5:** Social Network (Posts, Reels, Stories, Follows)
- **Phase 6:** Voice Assistant (STT → Intent LLM → API → TTS)
- **Phase 7:** Launch, Security Audits, and Production Deployment
