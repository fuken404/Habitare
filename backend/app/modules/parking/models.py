import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Date, Boolean, Integer, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant, Unidad

# ======================================
#             CREACIÓN ENUMS
# ======================================

class TipoParqueadero(str, enum.Enum):
  CUBIERTO = "cubierto"
  DESCUBIERTO = "descubierto"

class TipoVehiculoResidente(str, enum.Enum):
  AUTOMOVIL = "automovil"
  MOTOCICLETA = "motocicleta"

class EstadoSorteo(str, enum.Enum):
  PROGRAMADO = "programado"
  EJECUTADO = "ejecutado"
  CANCELADO = "cancelado"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class ParqueaderoResidente(Base):
  __tablename__ = "parqueaderos_residentes"
  
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
  numero: Mapped[str] = mapped_column(String(50), nullable=False)
  tipo: Mapped[TipoParqueadero] = mapped_column(
    SQLEnum(TipoParqueadero, name="tipo_parqueadero_enum"),
    nullable=False
  )
  nivel: Mapped[int | None] = mapped_column(Integer, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  asignaciones: Mapped[list["AsignacionParqueaderoResidente"]] = relationship(back_populates="parqueadero")


class VehiculoResidente(Base):
  __tablename__ = "vehiculos_residentes"
  
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
  tipo: Mapped[TipoVehiculoResidente] = mapped_column(
    SQLEnum(TipoVehiculoResidente, name="tipo_vehiculo_residente_enum"),
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
  unidad: Mapped["Unidad"] = relationship()

class AsignacionParqueaderoResidente(Base):
  __tablename__ = "asignaciones_parqueadero_residente"
  
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
  parqueadero_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("parqueaderos_residentes.id", ondelete="CASCADE"),
    nullable=False
  )
  unidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="CASCADE"),
    nullable=False
  )
  is_activa: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  fecha_inicio: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
  fecha_fin: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship() 
  parqueadero: Mapped["ParqueaderoResidente"] = relationship(back_populates="asignaciones")
  unidad: Mapped["Unidad"] = relationship()

class SorteoRotacion(Base):
  __tablename__ = "sorteos_rotacion"
  
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
  fecha_sorteo: Mapped[datetime] = mapped_column(Date, nullable=False)
  estado: Mapped[EstadoSorteo] = mapped_column(
    SQLEnum(EstadoSorteo, name="estado_sorteo_enum"),
    server_default="PROGRAMADO",
    nullable=False
  )
  n_cupos: Mapped[int] = mapped_column(Integer, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  participaciones: Mapped[list["ParticipacionRotacion"]] = relationship(back_populates="sorteo")

class ParticipacionRotacion(Base):
  __tablename__ = "participaciones_rotacion"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  sorteo_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("sorteos_rotacion.id", ondelete="CASCADE"),
    nullable=False
  )
  unidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="CASCADE"),
    nullable=False
  )
  es_ganador: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  sorteo: Mapped["SorteoRotacion"] = relationship(back_populates="participaciones")
  unidad: Mapped["Unidad"] = relationship()