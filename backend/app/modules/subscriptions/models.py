import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Date, Numeric, ForeignKey, Enum as SQLEnum, TIMESTAMP, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant

# ======================================
#             CREACIÓN ENUMS
# ======================================

class EstadoSuscripcion(str, enum.Enum):
  ACTIVA = "activa"
  VENCIDA = "vencida"
  SUSPENDIDA = "suspendida"
  CANCELADA = "cancelada"

class EstadoPagoSuscripcion(str, enum.Enum):
  PENDIENTE = "pendiente"
  COMPLETADO = "completado"
  FALLIDO = "fallido"
  REEMBOLSADO = "reembolsado"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class Plan(Base):
  __tablename__ = "planes"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  nombre: Mapped[str] = mapped_column(String(100), nullable=False)
  descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
  precio_mensual: Mapped[float] = mapped_column(Numeric(10,2), nullable=False)
  is_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  suscripciones: Mapped[list["Suscripcion"]] = relationship(back_populates="plan")

class Suscripcion(Base):
  __tablename__ = "suscripciones"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("tenants.id", ondelete="CASCADE"),
    nullable=False,
    unique=True
  )
  plan_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("planes.id", ondelete="RESTRICT"),
    nullable=False
  )
  fecha_inicio: Mapped[datetime] = mapped_column(Date, nullable=False)
  fecha_fin: Mapped[datetime] = mapped_column(Date, nullable=False)
  estado: Mapped[EstadoSuscripcion] = mapped_column(
    SQLEnum(EstadoSuscripcion, name="estado_suscripcion_enum"),
    server_default="ACTIVA",
    nullable=False
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)

class PagoSuscripcion(Base):
  __tablename__ = "pago_suscripcion"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("tenants.id", ondelete="CASCADE"),
    nullable=False,
    unique=True
  )
  suscripcion_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("suscripciones.id", ondelete="CASCADE"),
    nullable=False
  )
  monto: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
  fecha_pago: Mapped[datetime] = mapped_column(Date, nullable=False)
  estado: Mapped[EstadoPagoSuscripcion] = mapped_column(
    SQLEnum(EstadoPagoSuscripcion, name="estado_pago_suscripcion_enum"),
    server_default="PENDIENTE",
    nullable=False
  )
  referencia_pago: Mapped[str | None] = mapped_column(String(255), nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  suscripcion: Mapped["Suscripcion"] = relationship(back_populates="pagos")