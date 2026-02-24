import uuid
from datetime import datetime
from pydantic import BaseModel
from app.modules.incidents.models import EstadoIncidente, SeveridadIncidente

# ======================================
#          TIPO DE INCIDENTE
# ======================================

class TipoIncidenteCreate(BaseModel):
  nombre: str
  descripcion: str | None = None

class TipoIncidenteUpdate(BaseModel):
  nombre: str | None = None
  descripcion: str | None = None

class TipoIncidenteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  nombre: str
  descripcion: str | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#             INCIDENTE
# ======================================

class IncidenteCreate(BaseModel):
  tipo_id: uuid.UUID
  titulo: str
  descripcion: str
  severidad: SeveridadIncidente = SeveridadIncidente.MEDIA
  ubicacion: str | None = None
  unidad_id: uuid.UUID | None = None

class IncidenteUpdate(BaseModel):
  titulo: str | None = None
  descripcion: str | None = None
  severidad: SeveridadIncidente | None = None
  ubicacion: str | None = None
  estado: EstadoIncidente | None = None


class ActualizacionResponse(BaseModel):
  id: uuid.UUID
  usuario_id: uuid.UUID
  descripcion: str
  created_at: datetime
  
  model_config = {"from_attributes": True}

class IncidenteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  tipo_id: uuid.UUID
  unidad_id: uuid.UUID | None
  reportado_por: uuid.UUID
  titulo: str
  descripcion: str
  ubicacion: str | None
  estado: EstadoIncidente
  severidad: SeveridadIncidente
  fecha_resolucion: datetime | None
  actualizaciones: list[ActualizacionResponse]
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

class IncidenteListResponse(BaseModel):
  id: uuid.UUID
  tipo_id: uuid.UUID
  titulo: str
  estado: EstadoIncidente
  severidad: SeveridadIncidente
  reportado_por: uuid.UUID
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#        ACTUALIZACIÓN DE INCIDENTE
# ======================================

class ActualizacionCreate(BaseModel):
  descripcion: str
