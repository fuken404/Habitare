import uuid
from datetime import datetime, date
from pydantic import BaseModel
from app.modules.parking.models import (
    TipoParqueadero, TipoVehiculoResidente, EstadoSorteo
  )

# ======================================
#         CONFIGURACIÓN PARQUEADERO
# ======================================

class ConfigParqueaderoResponse(BaseModel):
  requiere_sorteo: bool

class ConfigParqueaderoUpdate(BaseModel):
  requiere_sorteo: bool

# ======================================
#         PARQUEADERO RESIDENTE
# ======================================

class ParqueaderoCreate(BaseModel):
  numero: str
  tipo: TipoParqueadero

class ParqueaderoUpdate(BaseModel):
  numero: str | None = None
  tipo: TipoParqueadero | None = None

class ParqueaderoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  numero: str
  tipo: TipoParqueadero
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#          VEHÍCULO RESIDENTE
# ======================================

class VehiculoResidenteCreate(BaseModel):
  unidad_id: uuid.UUID
  tipo: TipoVehiculoResidente
  placa: str
  marca: str | None = None
  modelo: str | None = None
  color: str | None = None

class VehiculoResidenteUpdate(BaseModel):
  marca: str | None = None
  modelo: str | None = None
  color: str | None = None

class VehiculoResidenteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID
  tipo: TipoVehiculoResidente
  placa: str
  marca: str | None
  modelo: str | None
  color: str | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#           ASIGNACIÓN PARQUEADERO
# ======================================

class AsignacionCreate(BaseModel):
  parqueadero_id: uuid.UUID
  unidad_id: uuid.UUID
  fecha_inicio: datetime
  fecha_fin: datetime | None = None

class AsignacionResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  parqueadero_id: uuid.UUID
  unidad_id: uuid.UUID
  is_activa: bool
  fecha_inicio: datetime
  fecha_fin: datetime | None
  created_at: datetime

  model_config = {"from_attributes": True}

class ParqueaderoEstadoResponse(BaseModel):
  id: uuid.UUID
  numero: str
  tipo: TipoParqueadero
  is_ocupado: bool
  unidad_id: uuid.UUID | None
  numero_unidad: str | None
  nombre_torre: str | None

# ======================================
#           SORTEO DE ROTACIÓN
# ======================================

class SorteoActivoResponse(BaseModel):
  id: uuid.UUID
  fecha_sorteo: date
  n_cupos: int
  n_inscritos: int
  ya_inscrito: bool
  estado: EstadoSorteo

class InscripcionSorteoCreate(BaseModel):
  tipo_vehiculo: TipoVehiculoResidente
  placa: str
  marca: str | None = None
  modelo: str | None = None
  color: str | None = None

class SorteoCreate(BaseModel):
  fecha_sorteo: date
  fecha_limite_inscripcion: date | None = None
  n_cupos: int

class ParticipacionCreate(BaseModel):
  unidad_id: uuid.UUID

class ParticipacionResponse(BaseModel):
  id: uuid.UUID
  unidad_id: uuid.UUID
  numero_unidad: str | None = None
  es_ganador: bool

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_participacion(cls, p: object) -> "ParticipacionResponse":
    obj = cls.model_validate(p)
    if hasattr(p, "unidad") and p.unidad:  # type: ignore[union-attr]
      obj.numero_unidad = p.unidad.numero  # type: ignore[union-attr]
    return obj

class SorteoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  fecha_sorteo: date
  fecha_limite_inscripcion: date | None
  estado: EstadoSorteo
  n_cupos: int
  participaciones: list[ParticipacionResponse]
  created_at: datetime

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_sorteo(cls, s: object) -> "SorteoResponse":
    obj = cls.model_validate(s)
    enriched = [ParticipacionResponse.from_orm_participacion(p) for p in s.participaciones]  # type: ignore[union-attr]
    return obj.model_copy(update={"participaciones": enriched})
