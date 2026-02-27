from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.core.database.session import engine
from app.core.database.base import Base

from app.modules.auth.router import router as auth_router
from app.modules.tenants.router import router as tenants_router
from app.modules.users.router import router as users_router
from app.modules.visitors.router import router as visitors_router
from app.modules.packages.router import router as packages_router
from app.modules.parking.router import router as parking_router
from app.modules.visitor_parking.router import router as visitor_parking_router
from app.modules.incidents.router import router as incidents_router
from app.modules.pqrs.router import router as pqrs_router
from app.modules.common_areas.router import router as common_areas_router
from app.modules.shifts.router import router as shifts_router

# --- Lifespan ---
# Reemplaza los eventos on_startup / on_shutdown (deprecados en FastAPI >= 0.93)
# Todo lo que esté antes del yield corre al arrancar.
# Todo lo que esté después corre al apagar.

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Startup
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
  yield
  
  # Shutdown
  await engine.dispose

# --- Aplicación ---
app = FastAPI(
  title=settings.APP_NAME,
  version=settings.APP_VERSION,
  docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
  redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
  lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.ALLOWED_ORIGINS,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# --- Declaración de las rutas de negocio ---
app.include_router(auth_router)
app.include_router(tenants_router)
app.include_router(users_router)
app.include_router(visitors_router)
app.include_router(packages_router)
app.include_router(parking_router)
app.include_router(visitor_parking_router)
app.include_router(incidents_router)
app.include_router(pqrs_router)
app.include_router(common_areas_router)
app.include_router(shifts_router)

# --- Health check ---
@app.get("/health", tags=["Sistema"])
async def health():
  return {
    "status": "ok",
    "app": settings.APP_NAME,
    "version": settings.APP_VERSION,
    "environment": settings.ENVIRONMENT,
  }