import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.parking.models import (
    ParqueaderoResidente, VehiculoResidente,
    AsignacionParqueaderoResidente, SorteoRotacion,
    ParticipacionRotacion, EstadoSorteo
  )
from app.modules.tenants.models import Unidad, Torre, Tenant

# ======================================
#         CONFIGURACIÓN TENANT
# ======================================

async def get_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> Tenant | None:
  result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
  return result.scalar_one_or_none()

async def update_tenant_config(db: AsyncSession, tenant: Tenant, data: dict) -> Tenant:
  for key, value in data.items():
    setattr(tenant, key, value)
  await db.flush()
  await db.refresh(tenant)
  return tenant

# ======================================
#         PARQUEADERO RESIDENTE
# ======================================

async def get_estado_parqueaderos(
    db: AsyncSession, tenant_id: uuid.UUID
  ) -> tuple[list[ParqueaderoResidente], dict]:
  parq_result = await db.execute(
    select(ParqueaderoResidente)
    .where(ParqueaderoResidente.tenant_id == tenant_id)
    .order_by(ParqueaderoResidente.numero)
  )
  parqueaderos = list(parq_result.scalars().all())

  asig_result = await db.execute(
    select(AsignacionParqueaderoResidente, Unidad, Torre)
    .outerjoin(Unidad, Unidad.id == AsignacionParqueaderoResidente.unidad_id)
    .outerjoin(Torre, Torre.id == Unidad.torre_id)
    .where(
      AsignacionParqueaderoResidente.tenant_id == tenant_id,
      AsignacionParqueaderoResidente.is_activa == True,
    )
  )
  asig_map: dict = {}
  for asig, unidad, torre in asig_result.all():
    asig_map[asig.parqueadero_id] = {
      "unidad_id": unidad.id if unidad else None,
      "numero_unidad": unidad.numero if unidad else None,
      "nombre_torre": torre.nombre if torre else None,
    }
  return parqueaderos, asig_map

async def get_parqueaderos(db: AsyncSession, tenant_id: uuid.UUID) -> list[ParqueaderoResidente]:
  result = await db.execute(
    select(ParqueaderoResidente)
    .where(ParqueaderoResidente.tenant_id == tenant_id)
    .order_by(ParqueaderoResidente.numero)
  )
  return list(result.scalars().all())

async def get_parqueadero_by_id(
    db: AsyncSession, parqueadero_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> ParqueaderoResidente | None:
  result = await db.execute(
    select(ParqueaderoResidente).where(
      ParqueaderoResidente.id == parqueadero_id,
      ParqueaderoResidente.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def create_parqueadero(db: AsyncSession, data: dict) -> ParqueaderoResidente:
  parqueadero = ParqueaderoResidente(**data)
  db.add(parqueadero)
  await db.flush()
  await db.refresh(parqueadero)
  return parqueadero

async def update_parqueadero(
    db: AsyncSession, parqueadero: ParqueaderoResidente, data: dict
  ) -> ParqueaderoResidente:
  for key, value in data.items():
    setattr(parqueadero, key, value)
  parqueadero.updated_at = datetime.now()
  await db.flush()
  await db.refresh(parqueadero)
  return parqueadero

async def delete_parqueadero(db: AsyncSession, parqueadero: ParqueaderoResidente) -> None:
  await db.delete(parqueadero)
  await db.flush()

# ======================================
#          VEHÍCULO RESIDENTE
# ======================================

async def get_vehiculos_by_tenant(
    db: AsyncSession, tenant_id: uuid.UUID, unidad_id: uuid.UUID | None = None
  ) -> list[VehiculoResidente]:
  query = select(VehiculoResidente).where(VehiculoResidente.tenant_id == tenant_id)
  if unidad_id:
    query = query.where(VehiculoResidente.unidad_id == unidad_id)
  result = await db.execute(query.order_by(VehiculoResidente.placa))
  return list(result.scalars().all())

async def get_vehiculo_by_id(
    db: AsyncSession, vehiculo_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> VehiculoResidente | None:
  result = await db.execute(
    select(VehiculoResidente).where(
      VehiculoResidente.id == vehiculo_id,
      VehiculoResidente.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def get_vehiculo_by_placa(
    db: AsyncSession, placa: str, tenant_id: uuid.UUID
  ) -> VehiculoResidente | None:
  result = await db.execute(
    select(VehiculoResidente).where(
      VehiculoResidente.placa == placa.upper(),
      VehiculoResidente.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def create_vehiculo(db: AsyncSession, data: dict) -> VehiculoResidente:
  data["placa"] = data["placa"].upper()
  vehiculo = VehiculoResidente(**data)
  db.add(vehiculo)
  await db.flush()
  await db.refresh(vehiculo)
  return vehiculo

async def update_vehiculo(
    db: AsyncSession, vehiculo: VehiculoResidente, data: dict
) -> VehiculoResidente:
  for key, value in data.items():
    setattr(vehiculo, key, value)
  vehiculo.updated_at = datetime.now()
  await db.flush()
  await db.refresh(vehiculo)
  return vehiculo

async def delete_vehiculo(db: AsyncSession, vehiculo: VehiculoResidente) -> None:
  await db.delete(vehiculo)
  await db.flush()

# ======================================
#           ASIGNACIÓN PARQUEADERO
# ======================================

async def get_asignacion_activa_parqueadero(
    db: AsyncSession, parqueadero_id: uuid.UUID
  ) -> AsignacionParqueaderoResidente | None:
  result = await db.execute(
    select(AsignacionParqueaderoResidente).where(
      AsignacionParqueaderoResidente.parqueadero_id == parqueadero_id,
      AsignacionParqueaderoResidente.is_activa == True,
    )
  )
  return result.scalar_one_or_none()

async def get_asignaciones_by_tenant(
    db: AsyncSession, tenant_id: uuid.UUID, solo_activas: bool = False
  ) -> list[AsignacionParqueaderoResidente]:
  query = select(AsignacionParqueaderoResidente).where(
    AsignacionParqueaderoResidente.tenant_id == tenant_id
  )
  if solo_activas:
    query = query.where(AsignacionParqueaderoResidente.is_activa == True)
  result = await db.execute(query.order_by(AsignacionParqueaderoResidente.fecha_inicio.desc()))
  return list(result.scalars().all())

async def create_asignacion(db: AsyncSession, data: dict) -> AsignacionParqueaderoResidente:
  asignacion = AsignacionParqueaderoResidente(**data)
  db.add(asignacion)
  await db.flush()
  await db.refresh(asignacion)
  return asignacion

async def desactivar_asignacion(
    db: AsyncSession, asignacion: AsignacionParqueaderoResidente
  ) -> None:
  asignacion.is_activa = False
  asignacion.fecha_fin = datetime.now()
  asignacion.updated_at = datetime.now()
  await db.flush()

# ======================================
#           SORTEO DE ROTACIÓN
# ======================================

async def get_sorteo_activo(
    db: AsyncSession, tenant_id: uuid.UUID
  ) -> SorteoRotacion | None:
  result = await db.execute(
    select(SorteoRotacion)
    .where(SorteoRotacion.tenant_id == tenant_id, SorteoRotacion.estado == EstadoSorteo.PROGRAMADO)
    .options(selectinload(SorteoRotacion.participaciones).selectinload(ParticipacionRotacion.unidad))
    .order_by(SorteoRotacion.fecha_sorteo.asc())
    .limit(1)
  )
  return result.scalar_one_or_none()

async def get_sorteos(db: AsyncSession, tenant_id: uuid.UUID) -> list[SorteoRotacion]:
  result = await db.execute(
    select(SorteoRotacion)
    .where(SorteoRotacion.tenant_id == tenant_id)
    .options(selectinload(SorteoRotacion.participaciones).selectinload(ParticipacionRotacion.unidad))
    .order_by(SorteoRotacion.fecha_sorteo.desc())
  )
  return list(result.scalars().all())

async def get_sorteo_by_id(
    db: AsyncSession, sorteo_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> SorteoRotacion | None:
  result = await db.execute(
    select(SorteoRotacion)
    .where(SorteoRotacion.id == sorteo_id, SorteoRotacion.tenant_id == tenant_id)
    .options(selectinload(SorteoRotacion.participaciones).selectinload(ParticipacionRotacion.unidad))
  )
  return result.scalar_one_or_none()

async def create_sorteo(db: AsyncSession, data: dict) -> SorteoRotacion:
  sorteo = SorteoRotacion(**data)
  db.add(sorteo)
  await db.flush()
  await db.refresh(sorteo)
  return sorteo

async def add_participacion(
    db: AsyncSession, sorteo_id: uuid.UUID, unidad_id: uuid.UUID
  ) -> ParticipacionRotacion:
  participacion = ParticipacionRotacion(sorteo_id=sorteo_id, unidad_id=unidad_id)
  db.add(participacion)
  await db.flush()
  return participacion

async def update_sorteo(
    db: AsyncSession, sorteo: SorteoRotacion, data: dict
  ) -> SorteoRotacion:
  for key, value in data.items():
    setattr(sorteo, key, value)
  sorteo.updated_at = datetime.now()
  await db.flush()
  await db.refresh(sorteo)
  return sorteo