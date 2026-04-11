from sqlalchemy.ext.asyncio import (
  AsyncSession,
  AsyncEngine,
  create_async_engine,
  async_sessionmaker,
)
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator
from app.config import settings

# --- Engine ---
# NullPool en testing para evitar conexiones colgadas entre tests.
# En producción el pool por defecto de SQLAlchemy es suficiente.

def _get_engine(testing: bool = False) -> AsyncEngine:
  kwargs = {
    "echo": settings.DEBUG,
    "future": True,
  }
  if testing:
    kwargs["poolclass"] = NullPool
  
  return create_async_engine(
    settings.db_url,
    connect_args={"server_settings": {"timezone": "America/Bogota"}},
    **kwargs,
  )

engine = _get_engine()

# --- Session factory ---
AsyncSessionLocal = async_sessionmaker(
  bind=engine,
  class_=AsyncSession,
  expire_on_commit=False,     # Evitar lazy loads después de un commit
  autocommit=False,
  autoflush=False,
)

# --- Dependency ---
# Se inyecta en cada endpoint vía FastAPI Depends().
# El yield garantiza que la sesión se cierra aunque el endpoint falle.

async def get_db() -> AsyncGenerator[AsyncSession, None]:
  async with AsyncSessionLocal() as session:
    try:
      yield session
      await session.commit()
    except Exception:
      await session.rollback()
      raise