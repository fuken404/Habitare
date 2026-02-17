from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.core.database.session import engine
from app.core.database.base import Base

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

# --- Health check ---
@app.get("/health", tags=["Sistema"])
async def health():
  return {
    "status": "ok",
    "app": settings.APP_NAME,
    "version": settings.APP_VERSION,
    "environment": settings.ENVIRONMENT,
  }