import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant
  from app.modules.users.models import Usuario

# ======================================
#            CREACIÓN MODELOS
# ======================================
class MinutaSistema(Base):
  __tablename__ = "minutas_sistema"
  
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
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  accion: Mapped[str] = mapped_column(String(100), nullable=False)
  entidad_tipo: Mapped[str] = mapped_column(String(100), nullable=False)
  entidad_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
  detalles: Mapped[str | None] = mapped_column(Text, nullable=True)
  ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
  user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  usuario: Mapped["Usuario"] = relationship()


class Archivo(Base):
  __tablename__ = "archivos"
  
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
  nombre: Mapped[str] = mapped_column(String(255), nullable=False)
  ruta_storage: Mapped[str] = mapped_column(Text, nullable=False)
  tipo_mime: Mapped[str] = mapped_column(String(100), nullable=False)
  tamanio_bytes: Mapped[int] = mapped_column(nullable=False)
  entidad_tipo: Mapped[str] = mapped_column(String(100), nullable=False)
  entidad_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
  subido_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=False
  )
  eliminado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
  fecha_eliminacion: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # ── Relationships ─────────────────────────────────────────────────────────
  tenant: Mapped["Tenant"] = relationship()
  usuario: Mapped["Usuario"] = relationship()