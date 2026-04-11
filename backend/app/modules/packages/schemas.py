import uuid
from datetime import datetime
from pydantic import BaseModel
from app.modules.packages.models import EstadoPaquete

class PaqueteCreate(BaseModel):
  unidad_id: uuid.UUID

class PaqueteEntregaCreate(BaseModel):
  retirado_por_nombre: str | None = None

class PaqueteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID
  recibido_por: uuid.UUID
  entregado_por: uuid.UUID | None
  retirado_por_nombre: str | None
  fecha_recepcion: datetime
  fecha_entrega: datetime | None
  estado: EstadoPaquete
  created_at: datetime
  updated_at: datetime

  model_config = {"from_attributes": True}

class PaqueteListResponse(BaseModel):
  id: uuid.UUID
  unidad_id: uuid.UUID
  estado: EstadoPaquete
  retirado_por_nombre: str | None = None
  fecha_recepcion: datetime
  fecha_entrega: datetime | None = None
  numero_unidad: str | None = None
  nombre_torre: str | None = None

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_with_unidad(cls, p) -> "PaqueteListResponse":
    obj = cls.model_validate(p)
    if p.unidad:
      obj.numero_unidad = p.unidad.numero
      if p.unidad.torre:
        obj.nombre_torre = p.unidad.torre.nombre
    return obj
