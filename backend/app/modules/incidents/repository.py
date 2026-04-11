import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, not_
from sqlalchemy.orm import selectinload

from app.modules.users.models import Usuario, TenantUsuario
from app.modules.incidents.models import (
    TipoIncidente, Incidente, ActualizacionIncidente, EstadoIncidente
  )

# ======================================
#          TIPO DE INCIDENTE
# ======================================

async def get_tipos(db: AsyncSession, tenant_id: uuid.UUID) -> list[TipoIncidente]:
  result = await db.execute(
    select(TipoIncidente)
    .where(TipoIncidente.tenant_id == tenant_id)
    .order_by(TipoIncidente.nombre)
  )
  return list(result.scalars().all())

async def get_tipo_by_id(
    db: AsyncSession, tipo_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> TipoIncidente | None:
  result = await db.execute(
    select(TipoIncidente).where(
      TipoIncidente.id == tipo_id,
      TipoIncidente.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def create_tipo(db: AsyncSession, data: dict) -> TipoIncidente:
  tipo = TipoIncidente(**data)
  db.add(tipo)
  await db.flush()
  await db.refresh(tipo)
  return tipo

async def update_tipo(
    db: AsyncSession, tipo: TipoIncidente, data: dict
  ) -> TipoIncidente:
  for key, value in data.items():
    setattr(tipo, key, value)
  tipo.updated_at = datetime.now()
  await db.flush()
  await db.refresh(tipo)
  return tipo

async def delete_tipo(db: AsyncSession, tipo: TipoIncidente) -> None:
  await db.delete(tipo)
  await db.flush()

# ======================================
#             INCIDENTE
# ======================================

async def get_incidentes(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    estado: EstadoIncidente | None = None,
    unidad_id: uuid.UUID | None = None,
    excluir_cerrados: bool = False,
  ) -> list[Incidente]:
  query = (
    select(Incidente)
    .where(Incidente.tenant_id == tenant_id)
    .options(
      selectinload(Incidente.tipo),
      selectinload(Incidente.usuario).selectinload(Usuario.membresias).selectinload(TenantUsuario.rol),
    )
    .order_by(Incidente.created_at.desc())
  )
  if estado:
    query = query.where(Incidente.estado == estado)
  if unidad_id:
    query = query.where(Incidente.unidad_id == unidad_id)
  if excluir_cerrados:
    query = query.where(
      not_(Incidente.estado.in_([EstadoIncidente.CERRADO, EstadoIncidente.RESUELTO]))
    )
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_incidente_by_id(
    db: AsyncSession, incidente_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Incidente | None:
  result = await db.execute(
    select(Incidente)
    .where(Incidente.id == incidente_id, Incidente.tenant_id == tenant_id)
    .options(selectinload(Incidente.actualizaciones))
  )
  return result.scalar_one_or_none()

async def count_incidentes_by_year(db: AsyncSession, tenant_id: uuid.UUID, year: int) -> int:
  result = await db.execute(
    select(func.count()).select_from(Incidente).where(
      Incidente.tenant_id == tenant_id,
      extract("year", Incidente.created_at) == year,
    )
  )
  return result.scalar() or 0

async def create_incidente(db: AsyncSession, data: dict) -> Incidente:
  incidente = Incidente(**data)
  db.add(incidente)
  await db.flush()
  await db.refresh(incidente)
  return incidente

async def update_incidente(
    db: AsyncSession, incidente: Incidente, data: dict
  ) -> Incidente:
  for key, value in data.items():
    setattr(incidente, key, value)
  incidente.updated_at = datetime.now()
  await db.flush()
  await db.refresh(incidente)
  return incidente

# ======================================
#        ACTUALIZACIÓN DE INCIDENTE
# ======================================

async def create_actualizacion(
    db: AsyncSession, incidente_id: uuid.UUID, usuario_id: uuid.UUID, descripcion: str
  ) -> ActualizacionIncidente:
  actualizacion = ActualizacionIncidente(
    incidente_id=incidente_id,
    usuario_id=usuario_id,
    descripcion=descripcion,
  )
  db.add(actualizacion)
  await db.flush()
  await db.refresh(actualizacion)
  return actualizacion
