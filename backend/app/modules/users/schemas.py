import uuid
from datetime import datetime, date
from pydantic import BaseModel, EmailStr
from app.modules.users.models import TipoDocumento, TipoRol

# ======================================
#               USUARIO
# ======================================

class UsuarioCreate(BaseModel):
  email: EmailStr
  nombre: str
  apellido: str
  tipo_documento: TipoDocumento
  n_documento: str
  telefono: str | None = None
  password: str = "Habitare2024!"

class UsuarioUpdate(BaseModel):
  nombre: str | None = None
  apellido: str | None = None
  email: EmailStr | None = None
  telefono: str | None = None
  avatar_url: str | None = None

class UsuarioAdminUpdate(BaseModel):
  is_activo: bool | None = None
  email_verificado: bool | None = None

class CambiarPasswordRequest(BaseModel):
  password_actual: str
  password_nueva: str

class UsuarioResponse(BaseModel):
  id: uuid.UUID
  email: str
  nombre: str
  apellido: str
  tipo_documento: TipoDocumento
  n_documento: str
  telefono: str | None
  avatar_url: str | None
  is_activo: bool
  email_verificado: bool
  fecha_ultimo_acceso: datetime | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#           TENANT_USUARIO
# ======================================

class StaffListResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  apellido: str
  email: str
  tipo_documento: TipoDocumento
  n_documento: str
  telefono: str | None
  avatar_url: str | None
  rol: str
  fecha_inicio: date
  created_at: datetime
  fecha_salida: date | None = None

  model_config = {"from_attributes": True}

class AsignarUsuarioTenant(BaseModel):
    usuario_id: uuid.UUID
    unidad_id: uuid.UUID | None = None
    rol: TipoRol
    fecha_inicio: date
    fecha_fin: date | None = None


class ResidenteListResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  apellido: str
  email: str
  tipo_documento: TipoDocumento
  n_documento: str
  telefono: str | None
  avatar_url: str | None
  is_activo: bool
  unidad_id: uuid.UUID
  numero_unidad: str | None
  nombre_torre: str | None
  created_at: datetime
  fecha_salida: date | None = None

  model_config = {"from_attributes": True}

class MembresiaResponse(BaseModel):
    id: uuid.UUID
    usuario_id: uuid.UUID
    tenant_id: uuid.UUID
    unidad_id: uuid.UUID
    rol: TipoRol
    is_activa: bool
    fecha_inicio: date
    fecha_fin: date | None
    created_at: datetime
    
    model_config = {"from_attributes": True}
