import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.visitor_parking import repository as repo
from app.modules.visitor_parking.schemas import (
    ParqueaderoVisitanteCreate, ParqueaderoVisitanteResponse
  )

async def listar_activos(
    tenant_id: uuid.UUID, db: AsyncSession
  ) -> list[ParqueaderoVisitanteResponse]:
  items = await repo.get_parqueaderos_activos(db, tenant_id)
  return [ParqueaderoVisitanteResponse.model_validate(p) for p in items]

async def asignar(
    tenant_id: uuid.UUID, data: ParqueaderoVisitanteCreate, db: AsyncSession
  ) -> ParqueaderoVisitanteResponse:
  ocupado = await repo.get_parqueadero_visitante_activo(db, tenant_id, data.numero)
  if ocupado:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"El espacio '{data.numero}' ya está ocupado"
    )
  pv = await repo.create_parqueadero_visitante(db, {
    "tenant_id": tenant_id,
    "ingreso_visita_id": data.ingreso_visita_id,
    "numero": data.numero,
    "fecha_hora_asignacion": datetime.utcnow(),
  })
  return ParqueaderoVisitanteResponse.model_validate(pv)

async def liberar(
    pv_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> ParqueaderoVisitanteResponse:
  from sqlalchemy import select
  from app.modules.visitor_parking.models import ParqueaderoVisitante
  result = await db.execute(
    select(ParqueaderoVisitante).where(
      ParqueaderoVisitante.id == pv_id,
      ParqueaderoVisitante.tenant_id == tenant_id,
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
  return ParqueaderoVisitanteResponse.model_validate(pv)
