import uuid
from datetime import datetime, date
from pydantic import BaseModel
from app.modules.parking.models import (
    TipoParqueadero, TipoVehiculoResidente, EstadoSorteo
  )

# ======================================
#         PARQUEADERO RESIDENTE
# ======================================

class ParqueaderoCreate(BaseModel):
  numero: str
  tipo: TipoParqueadero
  nivel: int | None = None

class ParqueaderoUpdate(BaseModel):
  numero: str | None = None
  tipo: TipoParqueadero | None = None
  nivel: int | None = None

class ParqueaderoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  numero: str
  tipo: TipoParqueadero
  nivel: int | None
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

# ======================================
#           SORTEO DE ROTACIÓN
# ======================================

class SorteoCreate(BaseModel):
  fecha_sorteo: date
  n_cupos: int

class ParticipacionCreate(BaseModel):
  unidad_id: uuid.UUID

class ParticipacionResponse(BaseModel):
  id: uuid.UUID
  unidad_id: uuid.UUID
  es_ganador: bool
  
  model_config = {"from_attributes": True}

class SorteoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  fecha_sorteo: date
  estado: EstadoSorteo
  n_cupos: int
  participaciones: list[ParticipacionResponse]
  created_at: datetime
  
  model_config = {"from_attributes": True}
