import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.modules.tenants.models import TipoUnidad

# ======================================
#               TENANT
# ======================================
class TenantCreate(BaseModel):
  nombre: str
  nit: str | None = None
  direccion: str | None = None
  telefono: str | None = None
  email: EmailStr | None = None

class TenantUpdate(BaseModel):
  nombre: str | None = None
  nit: str | None = None
  direccion: str | None = None
  telefono: str | None = None
  email: EmailStr | None = None
  is_activo: bool | None = None

class TenantResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  nit: str | None
  direccion: str | None
  telefono: str | None
  email: str | None
  is_activo: bool
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#                 TORRE
# ======================================

class TorreCreate(BaseModel):
  nombre: str
  n_pisos: int | None = None

class TorreUpdate(BaseModel):
  nombre: str | None = None
  n_pisos: int | None = None

class TorreResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  nombre: str
  n_pisos: int | None
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#                 UNIDAD
# ======================================

class UnidadCreate(BaseModel):
  torre_id: uuid.UUID | None = None
  numero: str
  tipo: TipoUnidad
  area_m2: float | None = None
  piso: int | None = None
  habitada: bool = False

class UnidadUpdate(BaseModel):
  torre_id: uuid.UUID | None = None
  numero: str | None = None
  tipo: TipoUnidad | None = None
  area_m2: float | None = None
  piso: int | None = None
  habitada: bool | None = None

class UnidadResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  torre_id: uuid.UUID | None
  numero: str
  tipo: TipoUnidad
  area_m2: float | None
  piso: int | None
  habitada: bool
  created_at: datetime
  updated_at: datetime

  model_config = {"from_attributes": True}

class ResidenteUnidadItem(BaseModel):
  id: uuid.UUID
  nombre: str
  apellido: str
  avatar_url: str | None

class UnidadDetalleResponse(BaseModel):
  id: uuid.UUID
  numero: str
  tipo: TipoUnidad
  area_m2: float | None
  piso: int | None
  habitada: bool
  torre_id: uuid.UUID | None
  nombre_torre: str | None
  residentes: list[ResidenteUnidadItem]
  created_at: datetime

  model_config = {"from_attributes": True}