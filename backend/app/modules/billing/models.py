import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Date, Numeric, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant, Unidad

# ======================================
#             CREACIÓN ENUMS
# ======================================

class EstadoFactura(str, enum.Enum):
  PENDIENTE = "pendiente"
  PAGADA = "pagada"
  VENCIDA = "vencida"
  ANULADA = "anulada"

class EstadoPago(str, enum.Enum):
  PENDIENTE = "pendiente"
  APROBADO = "aprobado"
  RECHAZADO = "rechazado"

class MetodoPago(str, enum.Enum):
  EFECTIVO = "efectivo"
  TRANSFERENCIA = "transferencia"
  TARJETA = "tarjeta"
  CHEQUE = "cheque"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class Factura(Base):
  __tablename__ = "facturas"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("tenants.id", ondelete="CASCADE"),
    nullable=False
  )
  unidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="CASCADE"),
    nullable=False
  )
  numero_factura: Mapped[str] = mapped_column(String(50), nullable=False)
  periodo: Mapped[str] = mapped_column(String(50), nullable=False)
  fecha_emision: Mapped[datetime] = mapped_column(Date, nullable=False)
  fecha_vencimiento: Mapped[datetime] = mapped_column(Date, nullable=False)
  monto_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
  descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
  estado: Mapped[EstadoFactura] = mapped_column(
    SQLEnum(EstadoFactura, name="estado_factura_enum"),
    server_default="PENDIENTE",
    nullable=False
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  unidad: Mapped["Unidad"] = relationship()
  pagos: Mapped[list["Pago"]] = relationship(back_populates="factura")

class Pago(Base):
  __tablename__ = "pagos"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("tenants.id", ondelete="CASCADE"),
    nullable=False
  )
  factura_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("facturas.id", ondelete="CASCADE"),
    nullable=False
  )
  unidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="CASCADE"),
    nullable=False
  )
  monto: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
  fecha_pago: Mapped[datetime] = mapped_column(Date, nullable=False)
  metodo_pago: Mapped[MetodoPago] = mapped_column(
    SQLEnum(MetodoPago, name="metodo_pago_enum"),
    nullable=False
  )
  referencia: Mapped[str | None] = mapped_column(String(255), nullable=True)
  estado: Mapped[EstadoPago] = mapped_column(
    SQLEnum(EstadoPago, name="estado_pago_enum"),
    server_default="PENDIENTE",
    nullable=False
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  factura: Mapped["Factura"] = relationship(back_populates="pagos")
  unidad: Mapped["Unidad"] = relationship()
  transacciones: Mapped[list["TransaccionPago"]] = relationship(back_populates="pago")

class TransaccionPago(Base):
  __tablename__ = "transacciones_pago"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  pago_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("pagos.id", ondelete="CASCADE"),
    nullable=False
  )
  gateway: Mapped[str] = mapped_column(String(100), nullable=False)
  referencia_externa: Mapped[str] = mapped_column(String(255), nullable=False)
  estado: Mapped[str] = mapped_column(String(50), nullable=False)
  respuesta_gateway: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  pago: Mapped["Pago"] = relationship(back_populates="transacciones")