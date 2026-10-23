import uuid
import enum
from datetime import datetime, date, time
from sqlalchemy import String, Text, Integer, ForeignKey, Enum as SQLEnum, TIMESTAMP, Date, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant, Unidad
  from app.modules.users.models import Usuario


class EstadoCita(str, enum.Enum):
  SOLICITADA  = "solicitada"
  CONFIRMADA  = "confirmada"
  RECHAZADA   = "rechazada"
  COMPLETADA  = "completada"


class DisponibilidadAdmin(Base):
  __tablename__ = "disponibilidades_admin"

  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
  )
  creado_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=False
  )
  fecha: Mapped[date] = mapped_column(Date, nullable=False)
  hora_inicio: Mapped[time] = mapped_column(Time, nullable=False)
  hora_fin: Mapped[time] = mapped_column(Time, nullable=False)
  cupos_totales: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)

  tenant:  Mapped["Tenant"]   = relationship()
  creador: Mapped["Usuario"]  = relationship()
  citas:   Mapped[list["CitaAdmin"]] = relationship(back_populates="disponibilidad")


class CitaAdmin(Base):
  __tablename__ = "citas_admin"

  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
  )
  disponibilidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("disponibilidades_admin.id", ondelete="CASCADE"), nullable=False
  )
  residente_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False
  )
  unidad_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True), ForeignKey("unidades.id", ondelete="SET NULL"), nullable=True
  )
  motivo: Mapped[str] = mapped_column(Text, nullable=False)
  estado: Mapped[EstadoCita] = mapped_column(
    SQLEnum(EstadoCita, name="estado_cita_enum"),
    nullable=False, default=EstadoCita.SOLICITADA,
  )
  observaciones_admin: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)

  tenant:         Mapped["Tenant"]             = relationship()
  disponibilidad: Mapped["DisponibilidadAdmin"] = relationship(back_populates="citas")
  residente:      Mapped["Usuario"]             = relationship(foreign_keys=[residente_id])
  unidad:         Mapped["Unidad | None"]       = relationship()
