import uuid
from datetime import datetime
from pydantic import BaseModel
from app.modules.pqrs.models import EstadoPQRS, PrioridadPQRS, TipoPQRS, SeveridadIncidente

# ======================================
#        TIPO DE INCIDENTE
# ======================================

class TipoIncidenteCreate(BaseModel):
  nombre: str
  descripcion: str | None = None

class TipoIncidenteUpdate(BaseModel):
  nombre: str | None = None
  descripcion: str | None = None

class TipoIncidenteResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  descripcion: str | None
  created_at: datetime

  model_config = {"from_attributes": True}

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
  unidad_id: uuid.UUID | None = None
  adjuntos: list[AdjuntoCreate] = []
  # Campos específicos de incidentes
  ubicacion: str | None = None
  severidad: SeveridadIncidente | None = None
  tipo_incidente_id: uuid.UUID | None = None

class PQRSUpdate(BaseModel):
  asunto: str | None = None
  descripcion: str | None = None
  prioridad: PrioridadPQRS | None = None
  estado: EstadoPQRS | None = None
  severidad: SeveridadIncidente | None = None

class MensajePQRSResponse(BaseModel):
  id: uuid.UUID
  autor_id: uuid.UUID
  nombre_autor: str | None = None
  contenido: str
  is_interno: bool
  created_at: datetime

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_mensaje(cls, m: object) -> "MensajePQRSResponse":
    obj = cls.model_validate(m)
    if hasattr(m, "autor") and m.autor:  # type: ignore[union-attr]
      obj.nombre_autor = f"{m.autor.nombre} {m.autor.apellido or ''}".strip()  # type: ignore[union-attr]
    return obj

class PQRSResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID | None
  categoria_id: uuid.UUID | None
  tipo_incidente_id: uuid.UUID | None
  tipo: TipoPQRS | None
  radicado_por: uuid.UUID
  asunto: str
  descripcion: str
  estado: EstadoPQRS
  prioridad: PrioridadPQRS
  severidad: SeveridadIncidente | None
  ubicacion: str | None
  numero_radicado: str | None
  fecha_primera_respuesta: datetime | None
  fecha_resolucion: datetime | None
  mensajes: list[MensajePQRSResponse]
  adjuntos: list[AdjuntoResponse]
  created_at: datetime
  updated_at: datetime

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_pqrs(cls, pqrs: object) -> "PQRSResponse":
    obj = cls.model_validate(pqrs)
    enriched = [MensajePQRSResponse.from_orm_mensaje(m) for m in pqrs.mensajes]  # type: ignore[union-attr]
    return obj.model_copy(update={"mensajes": enriched})

class PQRSListResponse(BaseModel):
  id: uuid.UUID
  numero_radicado: str | None
  categoria_id: uuid.UUID | None
  tipo_incidente_id: uuid.UUID | None
  tipo: TipoPQRS | None
  asunto: str
  estado: EstadoPQRS
  prioridad: PrioridadPQRS
  severidad: SeveridadIncidente | None
  ubicacion: str | None
  radicado_por: uuid.UUID
  nombre_radicador: str | None = None
  unidad_id: uuid.UUID | None
  numero_unidad: str | None = None
  nombre_torre: str | None = None
  created_at: datetime

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_pqrs(cls, p: object) -> "PQRSListResponse":
    obj = cls.model_validate(p)
    if hasattr(p, "usuario") and p.usuario:  # type: ignore[union-attr]
      obj.nombre_radicador = f"{p.usuario.nombre} {p.usuario.apellido or ''}".strip()  # type: ignore[union-attr]
    if hasattr(p, "unidad") and p.unidad:  # type: ignore[union-attr]
      obj.numero_unidad = p.unidad.numero  # type: ignore[union-attr]
      if p.unidad.torre:  # type: ignore[union-attr]
        obj.nombre_torre = p.unidad.torre.nombre  # type: ignore[union-attr]
    return obj

# ======================================
#           MENSAJE PQRS
# ======================================

class MensajePQRSCreate(BaseModel):
  contenido: str
  is_interno: bool = False  # True = nota privada, solo visible para administración
