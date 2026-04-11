import uuid
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator
from app.modules.billing.models import EstadoFactura, EstadoPago, MetodoPago

# ======================================
#          FACTURA
# ======================================

class FacturaCreate(BaseModel):
  unidad_id: uuid.UUID
  numero_factura: str
  periodo: str
  fecha_emision: date
  fecha_vencimiento: date
  monto_total: Decimal
  descripcion: str | None = None
  
  @field_validator("monto_total")
  @classmethod
  def validar_monto(cls, v: Decimal) -> Decimal:
    if v <= 0:
      raise ValueError("monto_total debe ser mayor a 0")
    return v

class FacturaUpdate(BaseModel):
  descripcion: str | None = None
  fecha_vencimiento: date | None = None

class PagoListResponse(BaseModel):
  id: uuid.UUID
  monto: Decimal
  fecha_pago: date
  metodo_pago: MetodoPago
  referencia: str | None = None
  estado: EstadoPago

  model_config = {"from_attributes": True}

class FacturaResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  unidad_id: uuid.UUID
  numero_factura: str
  periodo: str
  fecha_emision: date
  fecha_vencimiento: date
  monto_total: Decimal
  descripcion: str | None
  estado: EstadoFactura
  pagos: list[PagoListResponse]
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

class FacturaListResponse(BaseModel):
  id: uuid.UUID
  unidad_id: uuid.UUID
  numero_factura: str
  periodo: str
  fecha_vencimiento: date
  monto_total: Decimal
  estado: EstadoFactura
  numero_unidad: str | None = None
  nombre_torre: str | None = None

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_factura(cls, f: object) -> "FacturaListResponse":
    obj = cls.model_validate(f)
    if hasattr(f, "unidad") and f.unidad:  # type: ignore[union-attr]
      obj.numero_unidad = f.unidad.numero  # type: ignore[union-attr]
      if f.unidad.torre:  # type: ignore[union-attr]
        obj.nombre_torre = f.unidad.torre.nombre  # type: ignore[union-attr]
    return obj

# ======================================
#          PAGO
# ======================================

class PagoCreate(BaseModel):
  monto: Decimal
  fecha_pago: date
  metodo_pago: MetodoPago
  referencia: str | None = None
  
  @field_validator("monto")
  @classmethod
  def validar_monto(cls, v: Decimal) -> Decimal:
    if v <= 0:
      raise ValueError("monto debe ser mayor a 0")
    return v

class TransaccionResponse(BaseModel):
  id: uuid.UUID
  gateway: str
  referencia_externa: str
  estado: str
  created_at: datetime
  
  model_config = {"from_attributes": True}

class PagoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  factura_id: uuid.UUID
  unidad_id: uuid.UUID
  monto: Decimal
  fecha_pago: date
  metodo_pago: MetodoPago
  referencia: str | None
  estado: EstadoPago
  transacciones: list[TransaccionResponse]
  created_at: datetime
  updated_at: datetime
  
  model_config = {"from_attributes": True}

# ======================================
#          TRANSACCIÓN (uso interno)
# ======================================

class TransaccionCreate(BaseModel):
  gateway: str
  referencia_externa: str
  estado: str
  respuesta_gateway: str | None = None