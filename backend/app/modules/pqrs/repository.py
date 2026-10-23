import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from sqlalchemy.orm import selectinload

from app.modules.pqrs.models import CategoriaPQRS, PQRS, MensajePQRS, AdjuntoPQRS, EstadoPQRS, TipoPQRS
from app.modules.incidents.models import TipoIncidente
from app.modules.tenants.models import Unidad, Torre
from app.modules.users.models import Usuario

# ======================================
#        TIPO DE INCIDENTE
# ======================================

async def get_tipos_incidente(db: AsyncSession, tenant_id: uuid.UUID) -> list[TipoIncidente]:
  result = await db.execute(
    select(TipoIncidente)
    .where(TipoIncidente.tenant_id == tenant_id)
    .order_by(TipoIncidente.nombre)
  )
  return list(result.scalars().all())

async def get_tipo_incidente_by_id(
    db: AsyncSession, tipo_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> TipoIncidente | None:
  result = await db.execute(
    select(TipoIncidente).where(
      TipoIncidente.id == tipo_id,
      TipoIncidente.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def create_tipo_incidente(db: AsyncSession, data: dict) -> TipoIncidente:
  tipo = TipoIncidente(**data)
  db.add(tipo)
  await db.flush()
  await db.refresh(tipo)
  return tipo

async def update_tipo_incidente(
    db: AsyncSession, tipo: TipoIncidente, data: dict
  ) -> TipoIncidente:
  for key, value in data.items():
    setattr(tipo, key, value)
  tipo.updated_at = datetime.now()
  await db.flush()
  await db.refresh(tipo)
  return tipo

async def delete_tipo_incidente(db: AsyncSession, tipo: TipoIncidente) -> None:
  await db.delete(tipo)
  await db.flush()

# ======================================
#          CATEGORÍA PQRS
# ======================================

async def get_categorias(
    db: AsyncSession, solo_activas: bool = True
  ) -> list[CategoriaPQRS]:
  query = select(CategoriaPQRS).order_by(CategoriaPQRS.nombre)
  if solo_activas:
    query = query.where(CategoriaPQRS.is_activa == True)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_categoria_by_id(
    db: AsyncSession, categoria_id: uuid.UUID
  ) -> CategoriaPQRS | None:
  result = await db.execute(
    select(CategoriaPQRS).where(CategoriaPQRS.id == categoria_id)
  )
  return result.scalar_one_or_none()

async def create_categoria(db: AsyncSession, data: dict) -> CategoriaPQRS:
  categoria = CategoriaPQRS(**data)
  db.add(categoria)
  await db.flush()
  await db.refresh(categoria)
  return categoria

async def update_categoria(
    db: AsyncSession, categoria: CategoriaPQRS, data: dict
  ) -> CategoriaPQRS:
  for key, value in data.items():
    setattr(categoria, key, value)
  categoria.updated_at = datetime.now()
  await db.flush()
  await db.refresh(categoria)
  return categoria

# ======================================
#               PQRS
# ======================================

async def get_pqrs_list(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    estado: EstadoPQRS | None = None,
    unidad_id: uuid.UUID | None = None,
    tipo: TipoPQRS | None = None,
  ) -> list[PQRS]:
  query = (
    select(PQRS)
    .where(PQRS.tenant_id == tenant_id)
    .options(
      selectinload(PQRS.usuario),
      selectinload(PQRS.unidad).selectinload(Unidad.torre),
    )
    .order_by(PQRS.created_at.desc())
  )
  if estado:
    query = query.where(PQRS.estado == estado)
  if unidad_id:
    query = query.where(PQRS.unidad_id == unidad_id)
  if tipo:
    query = query.where(PQRS.tipo == tipo)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_pqrs_by_id(
    db: AsyncSession, pqrs_id: uuid.UUID, tenant_id: uuid.UUID,
    include_internos: bool = True
  ) -> PQRS | None:
  result = await db.execute(
    select(PQRS)
    .where(PQRS.id == pqrs_id, PQRS.tenant_id == tenant_id)
    .options(
      selectinload(PQRS.mensajes).selectinload(MensajePQRS.autor),
      selectinload(PQRS.adjuntos),
    )
  )
  pqrs = result.scalar_one_or_none()
  # Filtrar mensajes internos si el solicitante es residente
  if pqrs and not include_internos:
    pqrs.mensajes = [m for m in pqrs.mensajes if not m.is_interno]
  return pqrs

async def count_pqrs_by_year(db: AsyncSession, tenant_id: uuid.UUID, year: int) -> int:
  result = await db.execute(
    select(func.count()).select_from(PQRS).where(
      PQRS.tenant_id == tenant_id,
      extract("year", PQRS.created_at) == year,
    )
  )
  return result.scalar() or 0

async def create_pqrs(db: AsyncSession, data: dict) -> PQRS:
  pqrs = PQRS(**data)
  db.add(pqrs)
  await db.flush()
  await db.refresh(pqrs)
  return pqrs

async def update_pqrs(db: AsyncSession, pqrs: PQRS, data: dict) -> PQRS:
  for key, value in data.items():
    setattr(pqrs, key, value)
  pqrs.updated_at = datetime.now()
  await db.flush()
  await db.refresh(pqrs)
  return pqrs

# ======================================
#           MENSAJE PQRS
# ======================================

async def create_adjunto(
    db: AsyncSession,
    pqrs_id: uuid.UUID,
    nombre: str,
    mime_type: str | None,
    contenido_b64: str,
  ) -> AdjuntoPQRS:
  adjunto = AdjuntoPQRS(
    pqrs_id=pqrs_id,
    nombre=nombre,
    mime_type=mime_type,
    contenido_b64=contenido_b64,
  )
  db.add(adjunto)
  await db.flush()
  return adjunto

async def create_mensaje(
    db: AsyncSession,
    pqrs_id: uuid.UUID,
    autor_id: uuid.UUID,
    contenido: str,
    is_interno: bool = False,
  ) -> MensajePQRS:
  mensaje = MensajePQRS(
    pqrs_id=pqrs_id,
    autor_id=autor_id,
    contenido=contenido,
    is_interno=is_interno,
  )
  db.add(mensaje)
  await db.flush()
  await db.refresh(mensaje)
  return mensaje
