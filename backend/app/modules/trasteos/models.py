import uuid
import enum
from datetime import datetime, date, time
from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum, TIMESTAMP, Date, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant, Unidad
  from app.modules.users.models import Usuario


class TipoTrasteo(str, enum.Enum):
  ENTRADA = "entrada"
  SALIDA = "salida"


class EstadoTrasteo(str, enum.Enum):
  SOLICITADO = "solicitado"
  AUTORIZADO = "autorizado"
  RECHAZADO = "rechazado"
  COMPLETADO = "completado"


class Trasteo(Base):
  __tablename__ = "trasteos"

  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
  )
  unidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("unidades.id", ondelete="CASCADE"), nullable=False
  )
  creado_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=False
  )
  fecha_programada: Mapped[date] = mapped_column(Date, nullable=False)
  hora_inicio: Mapped[time] = mapped_column(Time, nullable=False)
  hora_fin: Mapped[time] = mapped_column(Time, nullable=False)
  tipo: Mapped[TipoTrasteo] = mapped_column(
    SQLEnum(TipoTrasteo, name="tipo_trasteo_enum"), nullable=False
  )
  estado: Mapped[EstadoTrasteo] = mapped_column(
    SQLEnum(EstadoTrasteo, name="estado_trasteo_enum"),
    nullable=False,
    default=EstadoTrasteo.SOLICITADO,
  )
  observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)

  tenant: Mapped["Tenant"] = relationship()
  unidad: Mapped["Unidad"] = relationship()
  creador: Mapped["Usuario"] = relationship()
