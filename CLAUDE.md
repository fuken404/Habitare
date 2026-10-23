# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

## Project Overview

Habitare is a residential complex management system with three layers:
- **Backend**: FastAPI (Python 3.12) + PostgreSQL 16 + SQLAlchemy async + Alembic
- **Mobile**: Flutter (Dart ≥ 3.2.0) — resident-facing app
- **Web**: React 18 + TypeScript + Vite + MUI — admin/reception dashboard

---

## Development Commands

### Infrastructure (Docker)

```bash
docker compose up -d                          # Start all services
docker compose down                           # Stop services
docker compose logs backend -f               # Stream backend logs
docker compose ps                             # Check service health
```

Services: Backend API at `http://localhost:8000`, Swagger at `http://localhost:8000/docs`, PgAdmin at `http://localhost:5050`.

### Backend (local dev)

```bash
cd backend
source env/bin/activate                       # Activate venv
uvicorn app.main:app --reload                 # Run dev server
```

For local dev, set `POSTGRES_HOST=localhost` in `backend/.env` (Docker uses `postgres`).

### Alembic migrations

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
```

### Web frontend

```bash
cd web
npm install
npm run dev                                   # Dev server
npm run build                                 # Production build
npm run lint                                  # ESLint
```

Configure `web/.env` with `VITE_API_BASE_URL=http://localhost:8000`.

### Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

Update `mobile/lib/core/constants/app_constants.dart` → `baseUrl`:
- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`
- Physical device: local network IP (e.g. `http://192.168.1.99:8000`)

---

## Environment Setup

Two separate `.env` files are required:

1. **Root `.env`** — used by Docker Compose (sets `POSTGRES_HOST=postgres`)
2. **`backend/.env`** — used for local development (sets `POSTGRES_HOST=localhost`)

Key variables: `JWT_SECRET_KEY`, `POSTGRES_*`, `SMTP_*`. Set `SMTP_ENABLED=False` in dev to skip real emails (codes print to logs instead).

---

## Architecture

### Backend module pattern

Each module under `backend/app/modules/<name>/` follows:
- `models.py` — SQLAlchemy ORM models extending `Base`
- `schemas.py` — Pydantic request/response schemas
- `repository.py` — async DB queries (raw SQLAlchemy)
- `service.py` — business logic, calls repository
- `router.py` — FastAPI router, dependency injection, role guards

All enums in models use **lowercase string values** (e.g. `"abierta"`, `"critica"`). Flutter and the web frontend must send lowercase enum values.

### Authentication & authorization

- JWT Bearer tokens; access token expires in 30 min, refresh in 7 days.
- Mobile auto-logs out after 20 min of inactivity.
- Role guard pattern: `Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN))` in routers.
- `get_tenant_id` dependency extracts the tenant UUID from the authenticated user — all data is tenant-scoped.
- Roles: `SUPERADMIN`, `ADMINISTRACION`, `RECEPCION`, `SEGURIDAD`, `RESIDENTE`.

### Web frontend structure

```
web/src/
  core/
    api/client.ts        # axios instance with Bearer token interceptor (401 → logout)
    auth/authStore.ts    # Zustand persisted store (user + accessToken)
    router/AppRouter.tsx # Role-based routing: /recepcion, /admin, /superadmin paths
  features/<name>/
    api/                 # API call functions using apiClient
    components/
    pages/
  shared/layout/         # AppShell, Sidebar, TopBar
  types/models.ts        # Shared TypeScript types
```

Role-based routing: authenticated routes live under `/recepcion`, `/admin`, or `/superadmin`. `RequireAuth` wraps each route group and redirects on role mismatch.

### Mobile (Flutter) feature structure

```
mobile/lib/
  core/
    network/             # ApiClient (Dio singleton) + AuthInterceptor
    router/              # GoRouter with redirect guard
    theme/               # AppColors, AppTextStyles
  features/<name>/
    data/
      datasources/       # HTTP calls via ApiClient
      models/            # JSON deserialization
      repositories/      # Concrete repo implementations
    domain/              # Domain models, abstract repos
    presentation/
      providers/         # Riverpod providers
      screens/
      widgets/
```

State management: Riverpod (`flutter_riverpod`). Navigation: GoRouter. HTTP: Dio with token injection via `AuthInterceptor`. Tokens stored in `flutter_secure_storage`.

### Docker: no volume mount for backend code

The backend container does **not** mount source files. After editing backend code, apply changes with:

```bash
docker cp <file> habitare-backend:/app/app/<path>
docker restart habitare-backend
```

---

## Key Notes

- **Radicado numbers**: incidents use `NOV-YYYY-NNN`, PQRS use `PQRS-YYYY-NNN` — generated server-side.
- **Payments (Wompi)**: not yet implemented. See `WOMPI_INTEGRATION.md` for the planned approach.
- **Web security module** (`web/src/features/security/`): manages external personnel and security reports — distinct from the mobile security feature.
- **incidents module** is registered in `main.py` but not yet imported — check `backend/app/modules/incidents/` if working on that module.
