import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.audit.models import MinutaSistema, Archivo

# ======================================
#          MINUTA
# ======================================

async def create_minuta(db: AsyncSession, data: dict) -> MinutaSistema:
  minuta = MinutaSistema(**data)
  db.add(minuta)
  await db.flush()
  return minuta

async def get_minutas(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    entidad_tipo: str | None = None,
    entidad_id: uuid.UUID | None = None,
    usuario_id: uuid.UUID | None = None,
    desde: datetime | None = None,
    hasta: datetime | None = None,
    limite: int = 100,
  ) -> list[MinutaSistema]:
  query = (
    select(MinutaSistema)
    .where(MinutaSistema.tenant_id == tenant_id)
    .order_by(MinutaSistema.created_at.desc())
    .limit(limite)
  )
  if entidad_tipo:
    query = query.where(MinutaSistema.entidad_tipo == entidad_tipo)
  if entidad_id:
    query = query.where(MinutaSistema.entidad_id == entidad_id)
  if usuario_id:
    query = query.where(MinutaSistema.usuario_id == usuario_id)
  if desde:
    query = query.where(MinutaSistema.created_at >= desde)
  if hasta:
    query = query.where(MinutaSistema.created_at <= hasta)
  result = await db.execute(query)
  return list(result.scalars().all())

# ======================================
#          ARCHIVO
# ======================================

async def create_archivo(db: AsyncSession, data: dict) -> Archivo:
  archivo = Archivo(**data)
  db.add(archivo)
  await db.flush()
  await db.refresh(archivo)
  return archivo

async def get_archivos_entidad(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    entidad_tipo: str,
    entidad_id: uuid.UUID,
    incluir_eliminados: bool = False,
  ) -> list[Archivo]:
  query = (
    select(Archivo)
    .where(
      Archivo.tenant_id == tenant_id,
      Archivo.entidad_tipo == entidad_tipo,
      Archivo.entidad_id == entidad_id,
    )
    .order_by(Archivo.created_at.desc())
  )
  if not incluir_eliminados:
    query = query.where(Archivo.eliminado == False)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_archivo_by_id(
    db: AsyncSession, archivo_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Archivo | None:
  result = await db.execute(
    select(Archivo).where(
      Archivo.id == archivo_id,
      Archivo.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def soft_delete_archivo(
    db: AsyncSession, archivo: Archivo
  ) -> Archivo:
  archivo.eliminado = True
  archivo.fecha_eliminacion = datetime.utcnow()
  await db.flush()
  await db.refresh(archivo)
  return archivo