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

class EstadoPaquete(str, enum.Enum):
  PENDIENTE = "pendiente"
  ENTREGADO = "entregado"
  RETIRADO = "retirado"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class Paquete(Base):
  __tablename__ = "paquetes"

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
  recibido_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  entregado_por: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=True
  )
  fecha_recepcion: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
  fecha_entrega: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  estado: Mapped[EstadoPaquete] = mapped_column(
    SQLEnum(EstadoPaquete, name="estado_paquete_enum"),
    server_default="PENDIENTE",
    nullable=False
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  unidad: Mapped["Unidad"] = relationship()
  usuario_recibio: Mapped["Usuario"] = relationship(foreign_keys=[recibido_por])
  usuario_entrego: Mapped["Usuario | None"] = relationship(foreign_keys=[entregado_por])