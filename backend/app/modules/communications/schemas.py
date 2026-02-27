import uuid
from datetime import datetime
from pydantic import BaseModel, model_validator
from app.modules.communications.models import (
    TipoComunicado, EstadoComunicado, TipoSegmentacion
  )

# ======================================
#          SEGMENTACIÓN
# ======================================

class SegmentacionCreate(BaseModel):
  tipo: TipoSegmentacion
  torre_id: uuid.UUID | None = None
  unidad_id: uuid.UUID | None = None
  rol_id: uuid.UUID | None = None
  
  @model_validator(mode="after")
  def validar_referencia(self) -> "SegmentacionCreate":
    if self.tipo == TipoSegmentacion.TORRE and not self.torre_id:
      raise ValueError("Se requiere torre_id para segmentación por TORRE")
    if self.tipo == TipoSegmentacion.UNIDAD and not self.unidad_id:
      raise ValueError("Se requiere unidad_id para segmentación por UNIDAD")
    if self.tipo == TipoSegmentacion.ROL and not self.rol_id:
      raise ValueError("Se requiere rol_id para segmentación por ROL")
    return self

class SegmentacionResponse(BaseModel):
  id: uuid.UUID
  tipo: TipoSegmentacion
  torre_id: uuid.UUID | None
  unidad_id: uuid.UUID | None
  rol_id: uuid.UUID | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#          COMUNICADO
# ======================================

class ComunicadoCreate(BaseModel):
  titulo: str
  contenido: str
  tipo: TipoComunicado
  segmentaciones: list[SegmentacionCreate]
  
  @model_validator(mode="after")
  def validar_segmentaciones(self) -> "ComunicadoCreate":
    if not self.segmentaciones:
      raise ValueError("El comunicado debe tener al menos una segmentación")
    return self

class ComunicadoUpdate(BaseModel):
  titulo: str | None = None
  contenido: str | None = None
  tipo: TipoComunicado | None = None

class ComunicadoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  autor_id: uuid.UUID
  titulo: str
  contenido: str
  tipo: TipoComunicado
  estado: EstadoComunicado
  fecha_publicacion: datetime | None
  segmentaciones: list[SegmentacionResponse]
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

class ComunicadoListResponse(BaseModel):
  id: uuid.UUID
  titulo: str
  tipo: TipoComunicado
  estado: EstadoComunicado
  autor_id: uuid.UUID
  fecha_publicacion: datetime | None
  created_at: datetime
  
  model_config = {"from_attributes": True}