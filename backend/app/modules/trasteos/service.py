import uuid
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.trasteos import repository
from app.modules.trasteos.models import EstadoTrasteo
from app.modules.trasteos.schemas import TrasteoCreate, TrasteoUpdate, TrasteoResponse


async def listar_trasteos(
    tenant_id: uuid.UUID,
    db: AsyncSession,
    fecha: date | None = None,
    estado: EstadoTrasteo | None = None,
) -> list[TrasteoResponse]:
  trasteos = await repository.get_trasteos(db, tenant_id, fecha, estado)
  return [TrasteoResponse.from_orm_trasteo(t) for t in trasteos]


async def crear_trasteo(
    body: TrasteoCreate,
    creado_por: uuid.UUID,
    tenant_id: uuid.UUID,
    db: AsyncSession,
) -> TrasteoResponse:
  data = {
    "tenant_id": tenant_id,
    "unidad_id": body.unidad_id,
    "creado_por": creado_por,
    "fecha_programada": body.fecha_programada,
    "hora_inicio": body.hora_inicio,
    "hora_fin": body.hora_fin,
    "tipo": body.tipo,
    "observaciones": body.observaciones,
  }
  trasteo = await repository.create_trasteo(db, data)
  return TrasteoResponse.from_orm_trasteo(trasteo)


async def actualizar_trasteo(
    trasteo_id: uuid.UUID,
    body: TrasteoUpdate,
    tenant_id: uuid.UUID,
    db: AsyncSession,
) -> TrasteoResponse:
  trasteo = await repository.get_trasteo_by_id(db, trasteo_id, tenant_id)
  if not trasteo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trasteo no encontrado")
  data = body.model_dump(exclude_unset=True)
  trasteo = await repository.update_trasteo(db, trasteo, data)
  return TrasteoResponse.from_orm_trasteo(trasteo)
