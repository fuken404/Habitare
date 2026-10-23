import uuid
from datetime import datetime, date, time
from pydantic import BaseModel

from app.modules.appointments.models import EstadoCita


class DisponibilidadCreate(BaseModel):
  fecha: date
  hora_inicio: time
  hora_fin: time
  cupos_totales: int = 1


class DisponibilidadResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  fecha: date
  hora_inicio: time
  hora_fin: time
  cupos_totales: int
  cupos_disponibles: int = 0
  created_at: datetime

  model_config = {"from_attributes": True}


class CitaCreate(BaseModel):
  disponibilidad_id: uuid.UUID
  motivo: str


class CitaUpdate(BaseModel):
  estado: EstadoCita | None = None
  observaciones_admin: str | None = None


class CitaResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  disponibilidad_id: uuid.UUID
  residente_id: uuid.UUID
  motivo: str
  estado: EstadoCita
  observaciones_admin: str | None
  created_at: datetime
  # denormalized from disponibilidad
  fecha: date | None = None
  hora_inicio: time | None = None
  hora_fin: time | None = None
  # denormalized from residente / unidad
  nombre_residente: str | None = None
  numero_unidad: str | None = None
  nombre_torre: str | None = None

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_cita(cls, c: object) -> "CitaResponse":
    obj = cls.model_validate(c)
    if hasattr(c, "disponibilidad") and c.disponibilidad:  # type: ignore[union-attr]
      obj.fecha       = c.disponibilidad.fecha        # type: ignore[union-attr]
      obj.hora_inicio = c.disponibilidad.hora_inicio  # type: ignore[union-attr]
      obj.hora_fin    = c.disponibilidad.hora_fin     # type: ignore[union-attr]
    if hasattr(c, "residente") and c.residente:  # type: ignore[union-attr]
      obj.nombre_residente = f"{c.residente.nombre} {c.residente.apellido or ''}".strip()  # type: ignore[union-attr]
    if hasattr(c, "unidad") and c.unidad:  # type: ignore[union-attr]
      obj.numero_unidad = c.unidad.numero  # type: ignore[union-attr]
      if c.unidad.torre:  # type: ignore[union-attr]
        obj.nombre_torre = c.unidad.torre.nombre  # type: ignore[union-attr]
    return obj
