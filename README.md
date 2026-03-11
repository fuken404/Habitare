# Habitare

Sistema de gestión de conjuntos residenciales. Permite a residentes gestionar visitas, pagos, PQRS, novedades, reservas de zonas comunes, paquetes y más desde una app móvil.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | FastAPI + Python 3.12 |
| Base de datos | PostgreSQL 16 |
| ORM | SQLAlchemy (async) + Alembic |
| Mobile | Flutter (Dart ≥ 3.2.0) |
| Estado (mobile) | Riverpod |
| Navegación (mobile) | GoRouter |
| HTTP (mobile) | Dio |
| Infraestructura | Docker + Docker Compose |
| Email | SMTP (Gmail App Password) |

---

## Estructura del proyecto

```
Habitare/
├── .env                          # Variables de entorno para Docker Compose
├── docker-compose.yml            # Orquestación de servicios
├── WOMPI_INTEGRATION.md          # Guía para integración de pagos (pendiente)
├── database/
│   └── init/
│       └── 01-schema.sql         # DDL inicial
├── backend/                      # API FastAPI
│   ├── .env                      # Variables de entorno locales
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── migrations/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── dependencies.py
│       ├── core/
│       │   ├── database/
│       │   ├── security.py
│       │   └── email.py          # Envío de emails via SMTP
│       └── modules/
│           ├── auth/             # Login, JWT, refresh token, recuperación de contraseña
│           ├── users/            # Perfil, cambio de contraseña, membresías
│           ├── tenants/          # Conjuntos, torres, unidades
│           ├── visitors/         # Registro y gestión de visitas
│           ├── incidents/        # Reporte de novedades (con número de radicado)
│           ├── pqrs/             # Peticiones, quejas, reclamos y sugerencias
│           ├── common_areas/     # Zonas comunes y reservas
│           ├── communications/   # Comunicados del conjunto
│           ├── notifications/    # Notificaciones en app
│           ├── packages/         # Paquetes y correspondencia
│           ├── parking/          # Sorteo de parqueaderos
│           ├── billing/          # Facturación (portal de pagos pendiente)
│           ├── subscriptions/    # Suscripciones de conjuntos
│           ├── audit/            # Auditoría de acciones
│           ├── events/           # Eventos del conjunto
│           ├── shifts/           # Turnos de portería
│           ├── external_personnel/ # Personal externo
│           └── visitor_parking/  # Parqueadero de visitantes
└── mobile/                       # App Flutter
    ├── pubspec.yaml
    └── lib/
        ├── main.dart
        ├── core/
        │   ├── network/          # ApiClient (Dio) + AuthInterceptor
        │   ├── router/           # GoRouter con redirect guard
        │   ├── theme/            # AppColors, AppTextStyles, AppTheme
        │   └── utils/
        └── features/
            ├── auth/             # Login + recuperación de contraseña (4 pasos)
            ├── dashboard/        # Pantalla principal + modal de notificaciones
            ├── visitors/         # Lista, detalle y creación de visitas
            ├── billing/          # Historial de pagos
            ├── communications/   # Comunicados + detalle
            ├── incidents/        # Reporte de novedades
            ├── pqrs/             # Lista, formulario, detalle y éxito
            ├── common_areas/     # Reserva de zonas comunes
            ├── packages/         # Paquetes recibidos
            ├── parking/          # Sorteo de parqueadero
            ├── notifications/    # Proveedor y modal de notificaciones
            └── profile/          # Perfil, ajustes y menú "Más"
```

---

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd Habitare
```

### 2. Configurar variables de entorno

Crea el archivo `.env` en la raíz del proyecto (usado por Docker Compose):

```env
# =================================
#             APLICACIÓN
# =================================
APP_NAME=Habitare API
APP_VERSION=0.1.0
ENVIRONMENT=development
DEBUG=True

# =================================
#           BASE DE DATOS
# =================================
POSTGRES_DB=habitare_db
POSTGRES_USER=habitare_admin
POSTGRES_PASSWORD=tu_password
POSTGRES_PORT=5432
POSTGRES_HOST=postgres

# --- PgAdmin ---
PGADMIN_EMAIL=admin@habitare.com
PGADMIN_PASSWORD=tu_password
PGADMIN_PORT=5050

# =================================
#             BACKEND
# =================================
BACKEND_PORT=8000

# --- JWT ---
JWT_SECRET_KEY=<generar con: python -c "import secrets; print(secrets.token_hex(32))">
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# --- CORS ---
ALLOWED_ORIGINS=["http://localhost:3000"]

# --- Rate limiting ---
RATE_LIMIT_PER_MINUTE=60

# =================================
#              EMAIL (SMTP)
# =================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=Habitare <tu_correo@gmail.com>
SMTP_ENABLED=True
```

> Para desarrollo sin emails reales, dejar `SMTP_ENABLED=False` — los códigos se imprimen en los logs del contenedor.

> Para Gmail, `SMTP_PASSWORD` debe ser una **App Password** (no la contraseña normal de la cuenta). Generarla en: Cuenta Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones.

### 3. Levantar servicios con Docker

```bash
docker compose up -d
```

```bash
docker compose ps   # verificar que todos estén healthy
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| PgAdmin | http://localhost:5050 |

### 4. Desarrollo local del backend

```bash
cd backend

# Con venv estándar
python -m venv env
source env/bin/activate
pip install -r requirements.txt

# Con uv (más rápido)
uv venv env --python 3.12
source env/bin/activate
uv pip install -r requirements.txt

# Correr en local
uvicorn app.main:app --reload
```

> Para desarrollo local cambiar `POSTGRES_HOST=localhost` en `backend/.env`.

---

## App móvil

### Requisitos

- Flutter SDK ≥ 3.2.0
- Dart ≥ 3.2.0

### Dependencias principales

| Paquete | Uso |
|---|---|
| `flutter_riverpod` | Manejo de estado |
| `go_router` | Navegación |
| `dio` | HTTP client |
| `flutter_secure_storage` | Almacenamiento seguro de tokens |
| `google_fonts` | Fuente Instrument Sans |
| `qr_flutter` | Generación de códigos QR (visitas) |
| `image_picker` | Foto de perfil |
| `intl` | Formato de fechas |

### Correr la app

```bash
cd mobile
flutter pub get
flutter run
```

Asegurarse de que `lib/core/constants/app_constants.dart` apunta al backend correcto (`http://10.0.2.2:8000` para emulador Android, `http://localhost:8000` para iOS simulator).

---

## Módulos implementados

### Backend

| Módulo | Endpoints destacados |
|---|---|
| **auth** | `POST /auth/login`, `/auth/refresh`, `/auth/me`, `/auth/forgot-password`, `/auth/verify-reset-code`, `/auth/reset-password` |
| **users** | `GET /usuarios/me`, `PATCH /usuarios/{id}`, `POST /usuarios/me/cambiar-password` |
| **visitors** | CRUD de visitas, generación de QR |
| **incidents** | Reporte de novedades con número de radicado (`NOV-YYYY-NNN`) |
| **pqrs** | Peticiones/quejas/reclamos con número de radicado (`PQRS-YYYY-NNN`) |
| **common_areas** | Zonas comunes y reservas |
| **communications** | Comunicados del conjunto |
| **notifications** | Listado, marcar como leída, eliminar |
| **packages** | Paquetes y correspondencia |
| **parking** | Sorteo de parqueaderos |

### Mobile (pantallas)

| Feature | Pantallas |
|---|---|
| Auth | Login, Recuperar contraseña (4 pasos) |
| Dashboard | Inicio con notificaciones (badge + modal) |
| Visitantes | Lista, detalle, crear visita |
| Pagos | Historial de facturación |
| Comunicados | Lista y detalle |
| PQRS | Lista, formulario, detalle, éxito |
| Novedades | Reporte, éxito |
| Zonas comunes | Reservar, mis reservas, éxito |
| Paquetes | Lista de paquetes |
| Parqueadero | Sorteo, confirmación |
| Perfil | Ajustar perfil, cambiar contraseña |
| Más | Menú de accesos rápidos |

---

## Comandos útiles

### Docker

```bash
docker compose up -d                          # Levantar servicios
docker compose down                           # Detener servicios
docker compose logs backend -f               # Ver logs en tiempo real
docker compose ps                             # Estado de servicios
docker cp archivo.py habitare-backend:/app/app/ruta/archivo.py  # Actualizar archivo en contenedor
docker restart habitare-backend              # Reiniciar backend
```

### Base de datos

```bash
# Backup
docker exec habitare-db pg_dump -U habitare_admin habitare_db > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar
docker exec -i habitare-db psql -U habitare_admin habitare_db < ./backups/backup_archivo.sql
```

### Alembic

```bash
alembic current                              # Versión actual
alembic revision --autogenerate -m "msg"    # Generar migración
alembic upgrade head                         # Aplicar migraciones
alembic downgrade -1                         # Revertir última migración
```

---

## Notas importantes

1. **Dos `.env` necesarios:** uno en la raíz (Docker Compose) y otro en `backend/` (desarrollo local). Difieren en `POSTGRES_HOST`.
2. **No hay volumen montado en Docker:** cualquier cambio en el código del backend requiere `docker cp` del archivo modificado + `docker restart habitare-backend`.
3. **Enums en Pydantic son lowercase:** al enviar valores desde Flutter usar minúsculas (e.g. `'critica'`, no `'CRITICA'`).
4. **Tokens JWT:** access token expira en 30 min. La app tiene cierre de sesión automático a los 20 minutos de inactividad.
5. **Portal de pagos:** pendiente de implementar con Wompi. Ver `WOMPI_INTEGRATION.md` para el plan detallado.
