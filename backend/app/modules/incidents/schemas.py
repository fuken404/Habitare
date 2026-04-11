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
  numero_radicado: str | None
  fecha_resolucion: datetime | None
  actualizaciones: list[ActualizacionResponse]
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

class IncidenteListResponse(BaseModel):
  id: uuid.UUID
  numero_radicado: str | None
  tipo_id: uuid.UUID
  tipo_nombre: str
  titulo: str
  estado: EstadoIncidente
  severidad: SeveridadIncidente
  reportado_por: uuid.UUID
  nombre_reportado_por: str | None
  rol_reportado_por: str | None
  created_at: datetime

  @classmethod
  def from_orm_incidente(cls, i: object) -> "IncidenteListResponse":
    nombre = None
    rol = None
    if hasattr(i, "usuario") and i.usuario:  # type: ignore[union-attr]
      nombre = f"{i.usuario.nombre} {i.usuario.apellido or ''}".strip()  # type: ignore[union-attr]
      membresias = getattr(i.usuario, "membresias", [])  # type: ignore[union-attr]
      membresia_activa = next(
        (m for m in membresias if m.tenant_id == i.tenant_id and m.is_activa),  # type: ignore[union-attr]
        None,
      )
      if membresia_activa and membresia_activa.rol:
        rol = membresia_activa.rol.nombre.value
    return cls(
      id=i.id,  # type: ignore[union-attr]
      numero_radicado=i.numero_radicado,  # type: ignore[union-attr]
      tipo_id=i.tipo_id,  # type: ignore[union-attr]
      tipo_nombre=i.tipo.nombre if i.tipo else "",  # type: ignore[union-attr]
      titulo=i.titulo,  # type: ignore[union-attr]
      estado=i.estado,  # type: ignore[union-attr]
      severidad=i.severidad,  # type: ignore[union-attr]
      reportado_por=i.reportado_por,  # type: ignore[union-attr]
      nombre_reportado_por=nombre,
      rol_reportado_por=rol,
      created_at=i.created_at,  # type: ignore[union-attr]
    )

  model_config = {"from_attributes": True}

# ======================================
#        ACTUALIZACIÓN DE INCIDENTE
# ======================================

class ActualizacionCreate(BaseModel):
  descripcion: str
