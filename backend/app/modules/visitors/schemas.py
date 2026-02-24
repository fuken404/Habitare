import uuid
from datetime import datetime, date
from pydantic import BaseModel
from app.modules.visitors.models import (
    TipoDocumentoVisitante, EstadoAutorizacion, TipoVehiculo
  )

# ======================================
#             VISITANTE
# ======================================

class VisitanteCreate(BaseModel):
  tipo_documento: TipoDocumentoVisitante
  n_documento: str
  nombre: str
  apellido: str | None = None

class VisitanteResponse(BaseModel):
  id: uuid.UUID
  tipo_documento: TipoDocumentoVisitante
  n_documento: str
  nombre: str
  apellido: str | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#           VEHÍCULO VISITANTE
# ======================================

class VehiculoCreate(BaseModel):
  tipo: TipoVehiculo
  placa: str
  marca: str | None = None
  modelo: str | None = None
  color: str | None = None

class VehiculoResponse(BaseModel):
  id: uuid.UUID
  tipo: TipoVehiculo
  placa: str
  marca: str | None
  modelo: str | None
  color: str | None
  
  model_config = {"from_attributes": True}

# ======================================
#         AUTORIZACIÓN DE VISITA
# ======================================

class AutorizacionCreate(BaseModel):
  visitante: VisitanteCreate
  unidad_id: uuid.UUID
  fecha_visita: date
  requiere_parqueadero: bool = False
  vehiculos: list[VehiculoCreate] = []

class AutorizacionUpdate(BaseModel):
  fecha_visita: date | None = None
  requiere_parqueadero: bool | None = None
  estado: EstadoAutorizacion | None = None

class AutorizacionResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID
  visitante: VisitanteResponse
  autorizado_por: uuid.UUID
  fecha_visita: date
  requiere_parqueadero: bool
  estado: EstadoAutorizacion
  vehiculos: list[VehiculoResponse]
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#           INGRESO DE VISITA
# ======================================

class IngresoCreate(BaseModel):
  visitante_documento: str                  # buscar visitante por documento
  autorizacion_id: uuid.UUID | None = None  # opcional: visita sin preautorización

class IngresoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  autorizacion_id: uuid.UUID | None
  visitante: VisitanteResponse
  registrado_por: uuid.UUID
  fecha_hora_ingreso: datetime
  created_at: datetime
  
  model_config = {"from_attributes": True}
