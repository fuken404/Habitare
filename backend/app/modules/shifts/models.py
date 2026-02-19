import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant
  from app.modules.users.models import Usuario

# ======================================
#             CREACIÓN ENUMS
# ======================================

class TipoTurno(str, enum.Enum):
  DIURNO = "diurno"
  NOCTURNO = "nocturno"
  TARDE = "tarde"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class Turno(Base):
  __tablename__ = "turnos"
  
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
  usuario_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="CASCADE"),
    nullable=False
  )
  tipo: Mapped[TipoTurno] = mapped_column(
    SQLEnum(TipoTurno, name="tipo_turno_enum"),
    nullable=False
  )
  fecha_inicio: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
  fecha_fin: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
  observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  usuario: Mapped["Usuario"] = relationship()