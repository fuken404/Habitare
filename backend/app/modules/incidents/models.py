import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, ForeignKey, Enum as SQLEnum, TIMESTAMP
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

class EstadoIncidente(str, enum.Enum):
  REPORTADO = "reportado"
  EN_ATENCION = "en_atencion"
  RESUELTO = "resuelto"
  CERRADO = "cerrado"

class SeveridadIncidente(str, enum.Enum):
  BAJA = "baja"
  MEDIA = "media"
  ALTA = "alta"
  CRITICA = "critica"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class TipoIncidente(Base):
  __tablename__ = "tipos_incidente"
  
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
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  incidentes: Mapped[list["Incidente"]] = relationship(back_populates="tipo")

class Incidente(Base):
  __tablename__ = "incidentes"
  
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
  tipo_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("tipos_incidente.id", ondelete="RESTRICT"),
    nullable=False
  )
  unidad_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="SET NULL"),
    nullable=True
  )
  reportado_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  titulo: Mapped[str] = mapped_column(String(255), nullable=False)
  descripcion: Mapped[str] = mapped_column(Text, nullable=False)
  ubicacion: Mapped[str | None] = mapped_column(String(255), nullable=True)
  estado: Mapped[EstadoIncidente] = mapped_column(
    SQLEnum(EstadoIncidente, name="estado_incidente_enum"),
    server_default="REPORTADO",
    nullable=False
  )
  severidad: Mapped[SeveridadIncidente] = mapped_column(
    SQLEnum(SeveridadIncidente, name="severidad_incidente_enum"),
    server_default="MEDIA",
    nullable=False
  )
  numero_radicado: Mapped[str | None] = mapped_column(String(30), unique=True, nullable=True)
  fecha_resolucion: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  tipo: Mapped["TipoIncidente"] = relationship(back_populates="incidentes")
  unidad: Mapped["Unidad | None"] = relationship()
  usuario: Mapped["Usuario"] = relationship()
  actualizaciones: Mapped[list["ActualizacionIncidente"]] = relationship(back_populates="incidente")

class ActualizacionIncidente(Base):
  __tablename__ = "actualizaciones_incidente"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  incidente_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("incidentes.id", ondelete="CASCADE"),
    nullable=False
  )
  usuario_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  descripcion: Mapped[str] = mapped_column(Text, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  incidente: Mapped["Incidente"] = relationship(back_populates="actualizaciones")
  usuario: Mapped["Usuario"] = relationship()