import uuid
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator
from app.modules.subscriptions.models import EstadoSuscripcion, EstadoPagoSuscripcion

# ======================================
#          PLAN
# ======================================

class PlanCreate(BaseModel):
  nombre: str
  descripcion: str | None = None
  precio_mensual: Decimal
  
  @field_validator("precio_mensual")
  @classmethod
  def validar_precio(cls, v: Decimal) -> Decimal:
    if v <= 0:
      raise ValueError("precio_mensual debe ser mayor a 0")
    return v

class PlanUpdate(BaseModel):
  nombre: str | None = None
  descripcion: str | None = None
  precio_mensual: Decimal | None = None
  is_activo: bool | None = None

class PlanResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  descripcion: str | None
  precio_mensual: Decimal
  is_activo: bool
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#          SUSCRIPCIÓN
# ======================================

class SuscripcionCreate(BaseModel):
  tenant_id: uuid.UUID
  plan_id: uuid.UUID
  fecha_inicio: date
  fecha_fin: date
  
  @field_validator("fecha_fin")
  @classmethod
  def validar_fechas(cls, v: date, info) -> date:
    if "fecha_inicio" in info.data and v <= info.data["fecha_inicio"]:
      raise ValueError("fecha_fin debe ser posterior a fecha_inicio")
    return v

class SuscripcionUpdate(BaseModel):
  plan_id: uuid.UUID | None = None
  fecha_fin: date | None = None
  estado: EstadoSuscripcion | None = None

class SuscripcionResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  plan_id: uuid.UUID
  fecha_inicio: date
  fecha_fin: date
  estado: EstadoSuscripcion
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#          PAGO SUSCRIPCIÓN
# ======================================

class PagoSuscripcionCreate(BaseModel):
  monto: Decimal
  fecha_pago: date
  referencia_pago: str | None = None
  
  @field_validator("monto")
  @classmethod
  def validar_monto(cls, v: Decimal) -> Decimal:
    if v <= 0:
      raise ValueError("monto debe ser mayor a 0")
    return v

class PagoSuscripcionResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  suscripcion_id: uuid.UUID
  monto: Decimal
  fecha_pago: date
  estado: EstadoPagoSuscripcion
  referencia_pago: str | None
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}