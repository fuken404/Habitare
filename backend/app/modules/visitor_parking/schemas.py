import uuid
from datetime import datetime
from pydantic import BaseModel

class ParqueaderoVisitanteCreate(BaseModel):
  ingreso_visita_id: uuid.UUID
  numero: str  # número del espacio asignado

class ParqueaderoVisitanteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  ingreso_visita_id: uuid.UUID
  numero: str
  fecha_hora_asignacion: datetime
  fecha_hora_liberacion: datetime | None
  
  model_config = {"from_attributes": True}