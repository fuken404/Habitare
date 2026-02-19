import uuid
import enum
from datetime import datetime, time
from sqlalchemy import String, Boolean, Text, Integer, Time, Date, ForeignKey, Enum as SQLEnum, TIMESTAMP
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

class DiaSemana(str, enum.Enum):
  LUNES = "lunes"
  MARTES = "martes"
  MIERCOLES = "miercoles"
  JUEVES = "jueves"
  VIERNES = "viernes"
  SABADO = "sabado"
  DOMINGO = "domingo"

class EstadoReserva(str, enum.Enum):
  PENDIENTE = "pendiente"
  CONFIRMADA = "confirmada"
  CANCELADA = "cancelada"
  COMPLETADA = "completada"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class ZonaComun(Base):
  __tablename__ = "zonas_comunes"
  
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
  nombre: Mapped[str] = mapped_column(String(100), nullable=False)
  descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
  capacidad_maxima: Mapped[int | None] = mapped_column(Integer, nullable=True)
  requiere_aprobacion: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
  is_activa: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  horarios: Mapped[list["HorarioZonaComun"]] = relationship(back_populates="zona_comun")
  reservas: Mapped[list["ReservaZonaComun"]] = relationship(back_populates="zona_comun")

class HorarioZonaComun(Base):
  __tablename__ = "horarios_zona_comun"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  zona_comun_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("zonas_comunes.id", ondelete="CASCADE"),
    nullable=False
  )
  dia_semana: Mapped[DiaSemana] = mapped_column(
    SQLEnum(DiaSemana, name="dia_semana_enum"),
    nullable=False
  )
  hora_inicio: Mapped[time] = mapped_column(Time, nullable=False)
  hora_fin: Mapped[time] = mapped_column(Time, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  zona_comun: Mapped["ZonaComun"] = relationship(back_populates="horarios")

class ReservaZonaComun(Base):
  __tablename__ = "reservas_zona_comun"
  
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
  zona_comun_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("zonas_comunes.id", ondelete="CASCADE"),
    nullable=False
  )
  unidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="CASCADE"),
    nullable=False
  )
  usuario_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  fecha_reserva: Mapped[datetime] = mapped_column(Date, nullable=False)
  hora_inicio: Mapped[time] = mapped_column(Time, nullable=False)
  hora_fin: Mapped[time] = mapped_column(Time, nullable=False)
  n_asistentes: Mapped[int | None] = mapped_column(Integer, nullable=True)
  observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
  estado: Mapped[EstadoReserva] = mapped_column(
    SQLEnum(EstadoReserva, name="estado_reserva_enum"),
    server_default="PENDIENTE",
    nullable=False
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  zona_comun: Mapped["ZonaComun"] = relationship(back_populates="reservas")
  unidad: Mapped["Unidad"] = relationship()
  usuario: Mapped["Usuario"] = relationship()