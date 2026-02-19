import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, ForeignKey, Enum as SQLEnum, TIMESTAMP
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

class TipoNotificacion(str, enum.Enum):
  INFO = "info"
  ALERTA = "alerta"
  URGENTE = "urgente"
  SISTEMA = "sistema"

class CanalNotificacion(str, enum.Enum):
  PUSH = "push"
  EMAIL = "email"

class EstadoNotificacion(str, enum.Enum):
  PENDIENTE = "pendiente"
  ENVIADA = "enviada"
  FALLIDA = "fallida"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class Notificacion(Base):
  __tablename__ = "notificaciones"
  
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
  titulo: Mapped[str] = mapped_column(String(255), nullable=False)
  mensaje: Mapped[str] = mapped_column(Text, nullable=False)
  tipo: Mapped[TipoNotificacion] = mapped_column(
    SQLEnum(TipoNotificacion, name="tipo_notificacion_enum"),
    nullable=False
  )
  canal: Mapped[CanalNotificacion] = mapped_column(
    SQLEnum(CanalNotificacion, name="canal_notificacion_enum"),
    nullable=False
  )
  estado_app: Mapped[EstadoNotificacion] = mapped_column(
    SQLEnum(EstadoNotificacion, name="estado_notificacion_app_enum"),
    default="pendiente",
    nullable=False
  )
  estado_correo: Mapped[EstadoNotificacion] = mapped_column(
    SQLEnum(EstadoNotificacion, name="estado_notificacion_correo_enum"),
    default="pendiente",
    nullable=False
  )
  entidad_tipo: Mapped[str | None] = mapped_column(String(100), nullable=True)              # "paquete", "pqrs", "comunicado", etc.
  entidad_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)   # ID del registro específico
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  usuario: Mapped["Usuario"] = relationship()