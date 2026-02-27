import uuid
from datetime import datetime
from pydantic import BaseModel, model_validator
from app.modules.shifts.models import TipoTurno

class TurnoCreate(BaseModel):
  usuario_id: uuid.UUID
  tipo: TipoTurno
  fecha_inicio: datetime
  fecha_fin: datetime
  observaciones: str | None = None
  
  @model_validator(mode="after")
  def validar_rango(self) -> "TurnoCreate":
    if self.fecha_fin <= self.fecha_inicio:
      raise ValueError("fecha_fin debe ser posterior a fecha_inicio")
    return self

class TurnoUpdate(BaseModel):
  tipo: TipoTurno | None = None
  fecha_inicio: datetime | None = None
  fecha_fin: datetime | None = None
  observaciones: str | None = None
  
  @model_validator(mode="after")
  def validar_rango(self) -> "TurnoUpdate":
    if self.fecha_inicio and self.fecha_fin:
      if self.fecha_fin <= self.fecha_inicio:
        raise ValueError("fecha_fin debe ser posterior a fecha_inicio")
    return self

class TurnoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  usuario_id: uuid.UUID
  tipo: TipoTurno
  fecha_inicio: datetime
  fecha_fin: datetime
  observaciones: str | None
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

class TurnoListResponse(BaseModel):
  id: uuid.UUID
  usuario_id: uuid.UUID
  tipo: TipoTurno
  fecha_inicio: datetime
  fecha_fin: datetime
  
  model_config = {"from_attributes": True}
