import uuid
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.appointments import repository
from app.modules.appointments.models import EstadoCita
from app.modules.appointments.schemas import (
  DisponibilidadCreate, DisponibilidadResponse,
  CitaCreate, CitaUpdate, CitaResponse,
)


async def listar_disponibilidades(
    tenant_id: uuid.UUID,
    db: AsyncSession,
    fecha: date | None = None,
    solo_futuras: bool = False,
) -> list[DisponibilidadResponse]:
  slots = await repository.get_disponibilidades(db, tenant_id, fecha, solo_futuras)
  result = []
  for slot, cupos_disp in slots:
    resp = DisponibilidadResponse.model_validate(slot)
    resp.cupos_disponibles = cupos_disp
    result.append(resp)
  return result


async def crear_disponibilidad(
    body: DisponibilidadCreate,
    creado_por: uuid.UUID,
    tenant_id: uuid.UUID,
    db: AsyncSession,
) -> DisponibilidadResponse:
  data = {
    "tenant_id": tenant_id,
    "creado_por": creado_por,
    "fecha": body.fecha,
    "hora_inicio": body.hora_inicio,
    "hora_fin": body.hora_fin,
    "cupos_totales": body.cupos_totales,
  }
  slot = await repository.create_disponibilidad(db, data)
  resp = DisponibilidadResponse.model_validate(slot)
  resp.cupos_disponibles = slot.cupos_totales
  return resp


async def listar_citas(
    tenant_id: uuid.UUID,
    db: AsyncSession,
    residente_id: uuid.UUID | None = None,
    estado: EstadoCita | None = None,
) -> list[CitaResponse]:
  citas = await repository.get_citas(db, tenant_id, residente_id, estado)
  return [CitaResponse.from_orm_cita(c) for c in citas]


async def solicitar_cita(
    body: CitaCreate,
    residente_id: uuid.UUID,
    tenant_id: uuid.UUID,
    db: AsyncSession,
    unidad_id: uuid.UUID | None = None,
) -> CitaResponse:
  # Verificar cupos disponibles
  activas = await repository.count_citas_activas(db, body.disponibilidad_id)
  # Necesitamos obtener el slot para saber cupos_totales
  slots = await repository.get_disponibilidades(db, tenant_id)
  slot = next((s for s, _ in slots if s.id == body.disponibilidad_id), None)
  if not slot:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Franja de disponibilidad no encontrada")
  if activas >= slot.cupos_totales:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No hay cupos disponibles en esta franja")

  data = {
    "tenant_id": tenant_id,
    "disponibilidad_id": body.disponibilidad_id,
    "residente_id": residente_id,
    "unidad_id": unidad_id,
    "motivo": body.motivo,
  }
  cita = await repository.create_cita(db, data)
  return CitaResponse.from_orm_cita(cita)


async def actualizar_cita(
    cita_id: uuid.UUID,
    body: CitaUpdate,
    tenant_id: uuid.UUID,
    db: AsyncSession,
) -> CitaResponse:
  cita = await repository.get_cita_by_id(db, cita_id, tenant_id)
  if not cita:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")
  data = body.model_dump(exclude_unset=True)
  cita = await repository.update_cita(db, cita, data)
  return CitaResponse.from_orm_cita(cita)
