import uuid
from datetime import datetime, date, time
from pydantic import BaseModel, model_validator
from app.modules.common_areas.models import DiaSemana, EstadoReserva

# ======================================
#          ZONA COMÚN
# ======================================

class ZonaComunCreate(BaseModel):
  nombre: str
  descripcion: str | None = None
  capacidad_maxima: int | None = None
  requiere_aprobacion: bool = False

class ZonaComunUpdate(BaseModel):
  nombre: str | None = None
  descripcion: str | None = None
  capacidad_maxima: int | None = None
  requiere_aprobacion: bool | None = None
  is_activa: bool | None = None

class HorarioResponse(BaseModel):
  id: uuid.UUID
  dia_semana: DiaSemana
  hora_inicio: time
  hora_fin: time
  
  model_config = {"from_attributes": True}

class ZonaComunResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  nombre: str
  descripcion: str | None
  capacidad_maxima: int | None
  requiere_aprobacion: bool
  is_activa: bool
  horarios: list[HorarioResponse]
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

class ZonaComunListResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  capacidad_maxima: int | None
  requiere_aprobacion: bool
  is_activa: bool
  
  model_config = {"from_attributes": True}

# ======================================
#          HORARIO ZONA COMÚN
# ======================================

class HorarioCreate(BaseModel):
  dia_semana: DiaSemana
  hora_inicio: time
  hora_fin: time
  
  @model_validator(mode="after")
  def validar_rango(self) -> "HorarioCreate":
    if self.hora_fin <= self.hora_inicio:
      raise ValueError("hora_fin debe ser posterior a hora_inicio")
    return self

# ======================================
#          RESERVA ZONA COMÚN
# ======================================

class ReservaCreate(BaseModel):
  zona_comun_id: uuid.UUID
  unidad_id: uuid.UUID
  fecha_reserva: date
  hora_inicio: time
  hora_fin: time
  n_asistentes: int | None = None
  observaciones: str | None = None
  
  @model_validator(mode="after")
  def validar_rango(self) -> "ReservaCreate":
    if self.hora_fin <= self.hora_inicio:
      raise ValueError("hora_fin debe ser posterior a hora_inicio")
    return self

class ReservaUpdate(BaseModel):
  estado: EstadoReserva | None = None
  observaciones: str | None = None

class ReservaResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    zona_comun_id: uuid.UUID
    unidad_id: uuid.UUID
    usuario_id: uuid.UUID
    fecha_reserva: date
    hora_inicio: time
    hora_fin: time
    n_asistentes: int | None
    observaciones: str | None
    estado: EstadoReserva
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}

class ReservaListResponse(BaseModel):
  id: uuid.UUID
  zona_comun_id: uuid.UUID
  unidad_id: uuid.UUID
  fecha_reserva: date
  hora_inicio: time
  hora_fin: time
  estado: EstadoReserva
  nombre_residente: str | None = None
  numero_unidad: str | None = None
  nombre_torre: str | None = None

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_with_residente(cls, reserva) -> "ReservaListResponse":
    obj = cls.model_validate(reserva)
    if reserva.usuario:
      apellido = reserva.usuario.apellido or ""
      obj.nombre_residente = f"{reserva.usuario.nombre} {apellido}".strip()
    if reserva.unidad:
      obj.numero_unidad = reserva.unidad.numero
      if reserva.unidad.torre:
        obj.nombre_torre = reserva.unidad.torre.nombre
    return obj