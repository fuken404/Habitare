import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.visitor_parking import repository as repo
from app.modules.visitor_parking.models import LugarParqueaderoVisitante, ParqueaderoVisitante
from app.modules.visitor_parking.schemas import (
    LugarParqueaderoVisitanteCreate, LugarParqueaderoVisitanteResponse,
    ParqueaderoVisitanteCreate, ParqueaderoVisitanteResponse,
  )


# ──────────────────────────────────────────────
#   LUGARES
# ──────────────────────────────────────────────

async def listar_lugares(
    tenant_id: uuid.UUID, db: AsyncSession
  ) -> list[LugarParqueaderoVisitanteResponse]:
  lugares = await repo.get_lugares_by_tenant(db, tenant_id)

  # IDs ocupados actualmente
  from sqlalchemy import select as sa_select
  ocupados_result = await db.execute(
    sa_select(ParqueaderoVisitante.lugar_id).where(
      ParqueaderoVisitante.tenant_id == tenant_id,
      ParqueaderoVisitante.lugar_id.isnot(None),
      ParqueaderoVisitante.fecha_hora_liberacion.is_(None),
    )
  )
  ocupados_ids = set(ocupados_result.scalars().all())

  items = []
  for lugar in lugares:
    data = LugarParqueaderoVisitanteResponse.model_validate(lugar)
    data.is_ocupado = lugar.id in ocupados_ids
    items.append(data)
  return items


async def crear_lugar(
    tenant_id: uuid.UUID, data: LugarParqueaderoVisitanteCreate, db: AsyncSession
  ) -> LugarParqueaderoVisitanteResponse:
  lugar = await repo.create_lugar(db, {
    "tenant_id": tenant_id,
    "numero": data.numero,
    "tipo": data.tipo,
  })
  return LugarParqueaderoVisitanteResponse.model_validate(lugar)


async def desactivar_lugar(
    lugar_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  lugar = await repo.get_lugar_by_id(db, tenant_id, lugar_id)
  if not lugar:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lugar no encontrado")
  # Verificar que no esté ocupado
  activo = await repo.get_parqueadero_visitante_activo(db, tenant_id, lugar_id)
  if activo:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se puede desactivar un lugar que está ocupado actualmente"
    )
  await repo.deactivate_lugar(db, lugar)


# ──────────────────────────────────────────────
#   ASIGNACIONES
# ──────────────────────────────────────────────

async def listar_activos(
    tenant_id: uuid.UUID, db: AsyncSession
  ) -> list[ParqueaderoVisitanteResponse]:
  items = await repo.get_parqueaderos_activos(db, tenant_id)
  return [ParqueaderoVisitanteResponse.from_orm_with_visitante(p) for p in items]


async def asignar(
    tenant_id: uuid.UUID, data: ParqueaderoVisitanteCreate, db: AsyncSession
  ) -> ParqueaderoVisitanteResponse:

  # Resolver lugar: explícito o auto-asignar
  if data.lugar_id:
    lugar = await repo.get_lugar_by_id(db, tenant_id, data.lugar_id)
    if not lugar:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lugar no encontrado")
    if not lugar.is_activo:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="El lugar está inactivo"
      )
    ocupado = await repo.get_parqueadero_visitante_activo(db, tenant_id, data.lugar_id)
    if ocupado:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"El espacio '{lugar.numero}' ya está ocupado"
      )
  else:
    tipo = data.tipo_vehiculo or "carro"
    lugar = await repo.get_lugar_disponible(db, tenant_id, tipo)
    if not lugar:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="No hay lugares disponibles para este tipo de vehículo"
      )

  pv = await repo.create_parqueadero_visitante(db, {
    "tenant_id": tenant_id,
    "ingreso_visita_id": data.ingreso_visita_id,
    "lugar_id": lugar.id,
    "tipo_vehiculo": data.tipo_vehiculo,
    "placa": data.placa,
    "fecha_hora_asignacion": datetime.now(),
  })

  # Recargar con lugar para la respuesta
  result = await db.execute(
    select(ParqueaderoVisitante)
    .where(ParqueaderoVisitante.id == pv.id)
    .options(selectinload(ParqueaderoVisitante.lugar))
  )
  pv = result.scalar_one()
  return ParqueaderoVisitanteResponse.from_orm_with_visitante(pv)


async def liberar(
    pv_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> ParqueaderoVisitanteResponse:
  from app.modules.visitors.models import IngresoVisita
  result = await db.execute(
    select(ParqueaderoVisitante)
    .where(
      ParqueaderoVisitante.id == pv_id,
      ParqueaderoVisitante.tenant_id == tenant_id,
    )
    .options(
      selectinload(ParqueaderoVisitante.lugar),
      selectinload(ParqueaderoVisitante.ingreso_visita)
      .selectinload(IngresoVisita.visitante),
    )
  )
  pv = result.scalar_one_or_none()
  if not pv:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
  if pv.fecha_hora_liberacion:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El espacio ya fue liberado"
    )
  pv = await repo.liberar_parqueadero_visitante(db, pv)
  return ParqueaderoVisitanteResponse.from_orm_with_visitante(pv)
