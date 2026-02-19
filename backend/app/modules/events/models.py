import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Integer, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant

# ======================================
#             CREACIÓN ENUMS
# ======================================

class EstadoEvento(str, enum.Enum):
  PENDIENTE = "pendiente"
  PROCESADO = "procesado"
  FALLIDO = "fallido"

# ======================================
#            CREACIÓN MODELOS
# ======================================
class EventoOutbox(Base):
  __tablename__ = "eventos_outbox"
  
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
  tipo_evento: Mapped[str] = mapped_column(String(100), nullable=False)
  agregado_tipo: Mapped[str] = mapped_column(String(100), nullable=False)
  agregado_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
  payload: Mapped[str] = mapped_column(Text, nullable=False)
  estado: Mapped[EstadoEvento] = mapped_column(
    SQLEnum(EstadoEvento, name="estado_evento_enum"),
    server_default="PENDIENTE",
    nullable=False
  )
  intentos: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  error: Mapped[str | None] = mapped_column(Text, nullable=True)
  fecha_procesado: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()