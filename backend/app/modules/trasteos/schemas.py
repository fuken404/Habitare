import uuid
from datetime import datetime, date, time
from pydantic import BaseModel

from app.modules.trasteos.models import TipoTrasteo, EstadoTrasteo


class TrasteoCreate(BaseModel):
  unidad_id: uuid.UUID
  fecha_programada: date
  hora_inicio: time
  hora_fin: time
  tipo: TipoTrasteo
  observaciones: str | None = None


class TrasteoUpdate(BaseModel):
  estado: EstadoTrasteo | None = None
  observaciones: str | None = None


class TrasteoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID
  creado_por: uuid.UUID
  fecha_programada: date
  hora_inicio: time
  hora_fin: time
  tipo: TipoTrasteo
  estado: EstadoTrasteo
  observaciones: str | None
  created_at: datetime
  # denormalized
  numero_unidad: str | None = None
  nombre_torre: str | None = None
  nombre_creador: str | None = None

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_trasteo(cls, t: object) -> "TrasteoResponse":
    obj = cls.model_validate(t)
    if hasattr(t, "unidad") and t.unidad:  # type: ignore[union-attr]
      obj.numero_unidad = t.unidad.numero  # type: ignore[union-attr]
      if t.unidad.torre:  # type: ignore[union-attr]
        obj.nombre_torre = t.unidad.torre.nombre  # type: ignore[union-attr]
    if hasattr(t, "creador") and t.creador:  # type: ignore[union-attr]
      obj.nombre_creador = f"{t.creador.nombre} {t.creador.apellido or ''}".strip()  # type: ignore[union-attr]
    return obj
