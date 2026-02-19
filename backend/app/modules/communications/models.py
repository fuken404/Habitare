import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant, Torre, Unidad
  from app.modules.users.models import Usuario, Rol

# ======================================
#             CREACIÓN ENUMS
# ======================================

class TipoComunicado(str, enum.Enum):
  INFORMATIVO = "informativo"
  URGENTE = "urgente"
  EVENTO = "evento"
  MANTENIMIENTO = "mantenimiento"

class EstadoComunicado(str, enum.Enum):
  BORRADOR = "borrador"
  PUBLICADO = "publicado"
  ARCHIVADO = "archivado"

class TipoSegmentacion(str, enum.Enum):
  TODOS = "todos"
  TORRE = "torre"
  UNIDAD = "unidad"
  ROL = "rol"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class Comunicado(Base):
  __tablename__ = "comunicados"
  
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
  autor_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  titulo: Mapped[str] = mapped_column(String(255), nullable=False)
  contenido: Mapped[str] = mapped_column(Text, nullable=False)
  tipo: Mapped[TipoComunicado] = mapped_column(
    SQLEnum(TipoComunicado, name="tipo_comunicado_enum"),
    nullable=False
  )
  estado: Mapped[EstadoComunicado] = mapped_column(
    SQLEnum(EstadoComunicado, name="estado_comunicado_enum"),
    server_default="BORRADOR",
    nullable=False
  )
  fecha_publicacion: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  autor: Mapped["Usuario"] = relationship()
  segmentaciones: Mapped[list["SegmentacionComunicado"]] = relationship(back_populates="comunicado")

class SegmentacionComunicado(Base):
  __tablename__ = "segmentaciones_comunicado"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  comunicado_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("comunicados.id", ondelete="CASCADE"),
    nullable=False
  )
  tipo: Mapped[TipoSegmentacion] = mapped_column(
    SQLEnum(TipoSegmentacion, name="tipo_segmentacion_enum"),
    nullable=False
  )
  torre_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("torres.id", ondelete="CASCADE"),
    nullable=True
  )
  unidad_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="CASCADE"),
    nullable=True
  )
  rol_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("roles.id", ondelete="CASCADE"),
    nullable=True
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  comunicado: Mapped["Comunicado"] = relationship(back_populates="segmentaciones")
  torre: Mapped["Torre | None"] = relationship()
  unidad: Mapped["Unidad | None"] = relationship()
  rol: Mapped["Rol | None"] = relationship()