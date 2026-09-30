# Polar Knowledge Hub — Deployment & Operations Guide

> **Platforms Supported:** Linux (Ubuntu/Debian), macOS (Apple Silicon / Intel), Docker  
> **Development Ports:** Frontend: `3000` | Backend API: `8000`  
> **Production Ports:** Unified reverse proxy on `80` / `443` (Nginx / Caddy / Cloudflare)

---

## 1. Quick Local Execution

The simplest way to run the platform locally on macOS or Linux is via the included `start.sh` orchestrator:

```bash
# Make executable
chmod +x start.sh

# Run both services concurrently
./start.sh
```

### What `start.sh` Does:
1. Validates Python 3.10+ and Node.js 18+.
2. Configures `apps/api/.env` from `.env.example` if not already present.
3. Creates a virtual environment in `apps/api/.venv` and installs dependencies.
4. Initializes the database and seeds authentic NCPOR sample records.
5. Installs npm dependencies in `apps/web/` and starts the Next.js dev server.
6. Traps `SIGINT`/`SIGTERM` to cleanly terminate both processes on `Ctrl+C`.

---

## 2. Environment Variables Configuration

### 2.1 Backend (`apps/api/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./polar_hub.db` or `postgresql://user:pass@host:5432/polar` |
| `SECRET_KEY` | Secret for signing JWT tokens | `super-secret-jwt-key-for-polar-hub-2026` |
| `GEMINI_API_KEY` | Google AI Studio API key | `AIzaSy...` (optional; falls back to demo mode) |
| `CRAWLER_ALLOWED_DOMAINS` | Domains permitted for scraping | `ncpor.res.in,ncaor.gov.in,ncpor.gov.in` |
| `DEMO_MODE` | Force offline keyword synthesis | `false` |

### 2.2 Frontend (`apps/web/.env.local`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

---

## 3. Production Deployment Architecture

```mermaid
graph TD
    Client[Web Browser / User] -->|HTTPS 443| Nginx[Nginx / Cloudflare CDN]
    Nginx -->|Proxy /| Web[Next.js Production Server - Port 3000]
    Nginx -->|Proxy /api| API[FastAPI Uvicorn Workers - Port 8000]
    API --> DB[(Managed PostgreSQL + pgvector)]
    API --> Gemini[Google Gemini 2.0 API]
```

### 3.1 Docker Compose Specification (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: polar_hub
      POSTGRES_USER: polar_user
      POSTGRES_PASSWORD: PolarHubSecurePassword2026
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://polar_user:PolarHubSecurePassword2026@db:5432/polar_hub
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - db

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:8000
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  pgdata:
```

---

## 4. Production Build Verification

To verify that the frontend builds without TypeScript or bundling errors:

```bash
cd apps/web
npm run build
```

To run FastAPI with multiple production workers:

```bash
cd apps/api
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```
