import uuid
from datetime import datetime
from pydantic import BaseModel
from app.modules.pqrs.models import EstadoPQRS, PrioridadPQRS, TipoPQRS

# ======================================
#          CATEGORÍA PQRS
# ======================================

class CategoriaPQRSCreate(BaseModel):
  nombre: str
  descripcion: str | None = None

class CategoriaPQRSUpdate(BaseModel):
  nombre: str | None = None
  descripcion: str | None = None
  is_activa: bool | None = None

class CategoriaPQRSResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  descripcion: str | None
  is_activa: bool
  created_at: datetime

  model_config = {"from_attributes": True}

# ======================================
#            ADJUNTOS PQRS
# ======================================

class AdjuntoCreate(BaseModel):
  nombre: str
  mime_type: str | None = None
  contenido_b64: str

class AdjuntoResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  mime_type: str | None
  contenido_b64: str
  created_at: datetime

  model_config = {"from_attributes": True}

# ======================================
#               PQRS
# ======================================

class PQRSCreate(BaseModel):
  tipo: TipoPQRS
  asunto: str
  descripcion: str
  prioridad: PrioridadPQRS = PrioridadPQRS.MEDIA
  unidad_id: uuid.UUID
  adjuntos: list[AdjuntoCreate] = []

class PQRSUpdate(BaseModel):
  asunto: str | None = None
  descripcion: str | None = None
  prioridad: PrioridadPQRS | None = None
  estado: EstadoPQRS | None = None

class MensajePQRSResponse(BaseModel):
  id: uuid.UUID
  autor_id: uuid.UUID
  contenido: str
  is_interno: bool
  created_at: datetime

  model_config = {"from_attributes": True}

class PQRSResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID
  categoria_id: uuid.UUID | None
  tipo: TipoPQRS | None
  radicado_por: uuid.UUID
  asunto: str
  descripcion: str
  estado: EstadoPQRS
  prioridad: PrioridadPQRS
  numero_radicado: str | None
  fecha_primera_respuesta: datetime | None
  fecha_resolucion: datetime | None
  mensajes: list[MensajePQRSResponse]
  adjuntos: list[AdjuntoResponse]
  created_at: datetime
  updated_at: datetime

  model_config = {"from_attributes": True}

class PQRSListResponse(BaseModel):
  id: uuid.UUID
  categoria_id: uuid.UUID | None
  tipo: TipoPQRS | None
  asunto: str
  estado: EstadoPQRS
  prioridad: PrioridadPQRS
  radicado_por: uuid.UUID
  unidad_id: uuid.UUID
  created_at: datetime

  model_config = {"from_attributes": True}

# ======================================
#           MENSAJE PQRS
# ======================================

class MensajePQRSCreate(BaseModel):
  contenido: str
  is_interno: bool = False  # True = nota privada, solo visible para administración
