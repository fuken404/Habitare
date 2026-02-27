import uuid
from datetime import datetime
from pydantic import BaseModel

# ======================================
#          MINUTA SISTEMA
# ======================================

class MinutaCreate(BaseModel):
  """Uso interno — llamado desde middleware o servicios, no desde el router."""
  usuario_id: uuid.UUID
  accion: str
  entidad_tipo: str
  entidad_id: uuid.UUID
  detalles: str | None = None
  ip_address: str | None = None
  user_agent: str | None = None

class MinutaResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  usuario_id: uuid.UUID
  accion: str
  entidad_tipo: str
  entidad_id: uuid.UUID
  detalles: str | None
  ip_address: str | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#          ARCHIVO
# ======================================

class ArchivoCreate(BaseModel):
  """Uso interno — llamado desde servicios al subir adjuntos a GCS."""
  nombre: str
  ruta_storage: str
  tipo_mime: str
  tamanio_bytes: int
  entidad_tipo: str
  entidad_id: uuid.UUID
  subido_por: uuid.UUID

class ArchivoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  nombre: str
  ruta_storage: str
  tipo_mime: str
  tamanio_bytes: int
  entidad_tipo: str
  entidad_id: uuid.UUID
  subido_por: uuid.UUID
  eliminado: bool
  fecha_eliminacion: datetime | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

class ArchivoListResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  tipo_mime: str
  tamanio_bytes: int
  entidad_tipo: str
  entidad_id: uuid.UUID
  eliminado: bool
  created_at: datetime
  
  model_config = {"from_attributes": True}