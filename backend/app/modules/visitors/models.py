import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Date, Time, ForeignKey, Enum as SQLEnum, TIMESTAMP, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant, Unidad
  from app.modules.users.models import Usuario

# ======================================
#             CREACIÓN ENUMS
# ======================================

class TipoDocumentoVisitante(str, enum.Enum):
  CC = "CC"
  CE = "CE"
  PA = "PA"
  TI = "TI"
  OTRO = "otro"

class EstadoAutorizacion(str, enum.Enum):
  PENDIENTE = "pendiente"
  ACTIVA = "activa"
  UTILIZADA = "utilizada"
  VENCIDA = "vencida"
  CANCELADA = "cancelada"

class TipoVehiculo(str, enum.Enum):
  AUTOMOVIL = "automovil"
  MOTOCICLETA = "motocicleta"
  OTRO = "otro"

# ======================================
#           CREACIÓN MODELOS
# ======================================

class Visitante(Base):
  __tablename__ = "visitantes"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  tipo_documento: Mapped[str] = mapped_column(
    SQLEnum(TipoDocumentoVisitante, name="tipo_documento_visitante_enum"),
    nullable=False
  )
  n_documento: Mapped[str] = mapped_column(String(50), nullable=False)
  nombre: Mapped[str] = mapped_column(String(255), nullable=False)
  apellido: Mapped[str | None] = mapped_column(String(255), nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  autorizaciones: Mapped[list["AutorizacionVisita"]] = relationship(back_populates="visitante")
  ingresos: Mapped[list["IngresoVisita"]] = relationship(back_populates="visitante")

class AutorizacionVisita(Base):
  __tablename__ = "autorizacion_visitas"
  
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
  visitante_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("visitantes.id", ondelete="CASCADE"),
    nullable=False
  )
  autorizado_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  fecha_visita: Mapped[datetime] = mapped_column(Date, nullable=False)
  requiere_parqueadero: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
  estado: Mapped[EstadoAutorizacion] = mapped_column(
    SQLEnum(EstadoAutorizacion, name="estado_autorizacion_enum"),
    server_default="PENDIENTE",
    nullable=False
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  unidad: Mapped["Unidad"] = relationship()
  visitante: Mapped["Visitante"] = relationship(back_populates="autorizaciones")
  usuario: Mapped["Usuario"] = relationship()
  vehiculos: Mapped[list["VehiculoVisitante"]] = relationship(back_populates="autorizacion")
  ingresos: Mapped[list["IngresoVisita"]] = relationship(back_populates="autorizacion")

class VehiculoVisitante(Base):
  __tablename__ = "vehiculo_visitante"
  
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
  autorizacion_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("autorizacion_visitas.id", ondelete="CASCADE"),
    nullable=False
  )
  tipo: Mapped[TipoVehiculo] = mapped_column(
    SQLEnum(TipoVehiculo, name="tipo_vehiculo_enum"),
    nullable=False
  )
  placa: Mapped[str] = mapped_column(String(20), nullable=False)
  marca: Mapped[str | None] = mapped_column(String(100), nullable=True)
  modelo: Mapped[str | None] = mapped_column(String(100), nullable=True)
  color: Mapped[str | None] = mapped_column(String(50), nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  autorizacion: Mapped["AutorizacionVisita"] = relationship(back_populates="vehiculos")

class IngresoVisita(Base):
  __tablename__ = "ingreso_visita"
  
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
  autorizacion_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("autorizacion_visitas.id", ondelete="SET NULL"),
    nullable=True
  )
  visitante_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("visitantes.id", ondelete="CASCADE"),
    nullable=False
  )
  registrado_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  fecha_hora_ingreso: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  autorizacion: Mapped["AutorizacionVisita | None"] = relationship(back_populates="ingresos")
  visitante: Mapped["Visitante"] = relationship(back_populates="ingresos")
  usuario: Mapped["Usuario"] = relationship()