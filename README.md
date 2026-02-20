

---

# Habitare Backend - Setup Guide

## Prerequisitos
- Python 3.12 (Con UV en caso de ser necesario)
- Docker y Docker Compose
- PostgreSQL 16 (via Docker)

## Configuración inicial

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd Habitare
```

### 2. Configurar variables de entorno

**`.env`** (copia en raíz global y directorio backend)
```env
# =================================
#             APLICACIÓN
# =================================

APP_NAME=Habitare API
APP_VERSION=0.1.0
ENVIRONMENT=development # puede ser (development, staging o production)
DEBUG=True

# =================================
#           BASE DE DATOS
# =================================

# --- PostgreSQL ---
POSTGRES_DB=habitare_db
POSTGRES_USER=habitare_admin
POSTGRES_PASSWORD=
POSTGRES_PORT=5432

# --- PgAdmin ---
PGADMIN_EMAIL=admin@habitare.com
PGADMIN_PASSWORD=
PGADMIN_PORT=5050

# =================================
#             BACKEND
# =================================

BACKEND_PORT=8000

# --- JWT ---
JWT_SECRET_KEY=<generar con: `python -c "import secrets; print(secrets.token_hex(32))"`>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# --- CORS ---
ALLOWED_ORIGINS=["http://localhost:3000"]

# --- Rate limiting ---
RATE_LIMIT_PER_MINUTE=60
```

### 3. Levantar servicios con Docker

**Desde la raíz del proyecto:**
```bash
docker compose up -d
```

Verifica que los servicios estén healthy:
```bash
docker compose ps
```

Servicios disponibles:
- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050`
- Backend API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

### 3.1. Backups de la base de datos
**Crear backup**
```bash
docker exec habitare-db pg_dump -U habitare_admin habitare_db > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

***Restaurar backup**
```bash
docker exec -i habitare-db psql -U habitare_admin habitare_db < -/backups/backup_[..el_archivo..]
```

### 4. Desarrollo local del backend

**Entrar a la carpeta backend:**
```bash
cd backend
```

**Crear entorno virtual:**
```bash
python -m venv env
source env/bin/activate
```

**Instalar dependencias:**
```bash
pip install -r requirements.txt
```

**Verificar Alembic:**
```bash
alembic current
```

**Crear Migraciones Alembic**
```bash
alembic revision --autogenerate -m "nombre_del_archivo_a_generar"
```

**Aplicar alembic a la base de datos**
```bash
alembic upgrade head
```

**Correr backend en desarrollo:**
```bash
uvicorn app.main:app --reload
```

### 5. Estado actual del proyecto

**✅ Completado Feb 19, 2026:**
- Infraestructura base (Docker, PostgreSQL, pgAdmin)
- Configuración de FastAPI + SQLAlchemy + Alembic
- Modelos SQLAlchemy

## Comandos útiles

**Docker:**
```bash
docker compose up -d           # Levantar servicios
docker compose down            # Detener servicios
docker compose logs backend    # Ver logs del backend
docker compose ps              # Estado de servicios
```

**Alembic:**
```bash
alembic current                              # Versión actual
alembic revision --autogenerate -m "msg"     # Generar migración
alembic upgrade head                         # Aplicar migraciones
alembic downgrade -1                         # Revertir última migración
```

**Backend:**
```bash
uvicorn app.main:app --reload               # Desarrollo
uvicorn app.main:app --reload --port 8001   # Cambiar puerto
```

## Estructura del proyecto
```
Habitare/
├── .env                          # Variables Docker Compose
├── docker-compose.yml            # Orquestación de servicios
├── database/
│   └── init/
│       └── 01-schema.sql         # DDL inicial (42 tablas)
└── backend/
    ├── .env                      # Variables desarrollo local
    ├── Dockerfile
    ├── requirements.txt
    ├── alembic.ini
    ├── migrations/
    │   ├── env.py
    │   └── versions/
    │       └── 02e3cba95f6c_add_tenant_and_user_models.py
    └── app/
        ├── main.py
        ├── config.py
        ├── core/
        │   └── database/
        │       ├── base.py
        │       └── session.py
        └── modules/
            ├── tenants/
            │   ├── __init__.py
            │   └── models.py
            └── users/
                ├── __init__.py
                └── models.py
```

## Notas importantes

1. **Dos `.env` necesarios:** Uno en la raíz (Docker) y otro en `backend/` (desarrollo local)
2. **POSTGRES_HOST difiere:** 
   - Docker: `POSTGRES_HOST=postgres` (nombre del servicio)
   - Local: `POSTGRES_HOST=localhost` (puerto mapeado)
3. **Migrations pendientes:** NO correr `alembic upgrade head` hasta terminar todos los modelos
4. **Generar JWT_SECRET_KEY:** `python -c "import secrets; print(secrets.token_hex(32))"`
5. **Migraciones fallidas:**
    - ENUMS: `fix_migration.py` actualiza la migración para permitir ENUMs, en caso de fallar, crear la migración con la base de datos vacía (sin tablas)
