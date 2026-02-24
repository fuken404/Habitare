import uuid
from datetime import datetime
from pydantic import BaseModel
from app.modules.packages.models import EstadoPaquete

class PaqueteCreate(BaseModel):
  unidad_id: uuid.UUID
  descripcion: str | None = None  # campo libre opcional para identificar el paquete

class PaqueteEntregaCreate(BaseModel):
  # El residente que retira (puede ser cualquier persona de la unidad)
  recibido_por_residente: str | None = None  # nombre de quien retira, para el registro

class PaqueteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID
  recibido_por: uuid.UUID
  entregado_por: uuid.UUID | None
  fecha_recepcion: datetime
  fecha_entrega: datetime | None
  estado: EstadoPaquete
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

class PaqueteListResponse(BaseModel):
  """Vista resumida para listados."""
  id: uuid.UUID
  unidad_id: uuid.UUID
  estado: EstadoPaquete
  fecha_recepcion: datetime
  fecha_entrega: datetime | None
  
  model_config = {"from_attributes": True}