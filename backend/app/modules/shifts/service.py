import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.shifts import repository as repo
from app.modules.shifts.schemas import (
    TurnoCreate, TurnoUpdate, TurnoResponse, TurnoListResponse,
  )

async def listar_turnos(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID | None,
    desde: datetime | None,
    hasta: datetime | None,
    db: AsyncSession,
  ) -> list[TurnoListResponse]:
  items = await repo.get_turnos(db, tenant_id, usuario_id, desde, hasta)
  return [TurnoListResponse.model_validate(t) for t in items]

async def obtener_turno(
    turno_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> TurnoResponse:
  turno = await repo.get_turno_by_id(db, turno_id, tenant_id)
  if not turno:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turno no encontrado")
  return TurnoResponse.model_validate(turno)

async def crear_turno(
    tenant_id: uuid.UUID, data: TurnoCreate, db: AsyncSession
  ) -> TurnoResponse:
  solapados = await repo.get_turnos_solapados(
    db, tenant_id, data.usuario_id, data.fecha_inicio, data.fecha_fin
  )
  if solapados:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El usuario ya tiene un turno asignado en ese rango de fechas"
    )
  turno = await repo.create_turno(db, {"tenant_id": tenant_id, **data.model_dump()})
  return TurnoResponse.model_validate(turno)


async def actualizar_turno(
    turno_id: uuid.UUID, tenant_id: uuid.UUID,
    data: TurnoUpdate, db: AsyncSession
  ) -> TurnoResponse:
  turno = await repo.get_turno_by_id(db, turno_id, tenant_id)
  if not turno:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turno no encontrado")
  cambios = data.model_dump(exclude_none=True)
  # Si se está modificando el rango, re-validar solapamiento excluyendo el turno actual
  nueva_inicio = cambios.get("fecha_inicio", turno.fecha_inicio)
  nueva_fin    = cambios.get("fecha_fin",    turno.fecha_fin)
  nuevo_usuario = cambios.get("usuario_id",  turno.usuario_id)
  solapados = await repo.get_turnos_solapados(
    db, tenant_id, nuevo_usuario, nueva_inicio, nueva_fin,
    excluir_id=turno_id
  )
  if solapados:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El rango actualizado se solapa con otro turno del mismo usuario"
    )
  turno = await repo.update_turno(db, turno, cambios)
  return TurnoResponse.model_validate(turno)


async def eliminar_turno(
    turno_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  turno = await repo.get_turno_by_id(db, turno_id, tenant_id)
  if not turno:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turno no encontrado")
  await repo.delete_turno(db, turno)
