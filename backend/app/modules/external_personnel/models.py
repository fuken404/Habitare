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

class TipoDocumentoExterno(str, enum.Enum):
  CC = "CC"
  CE = "CE"
  PA = "PA"
  TI = "TI"
  OTRO = "otro"

class TipoPersonalExterno(str, enum.Enum):
  MANTENIMIENTO = "mantenimiento"
  LIMPIEZA = "limpieza"
  MENSAJERIA = "mensajeria"
  PROVEEDOR = "proveedor"
  CONTRATISTA = "contratista"
  OTRO = "otro"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class IngresoExterno(Base):
  __tablename__ = "ingresos_externos"
  
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
  registrado_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  tipo_documento: Mapped[TipoDocumentoExterno] = mapped_column(
    SQLEnum(TipoDocumentoExterno, name="tipo_documento_externo_enum"),
    nullable=False
  )
  n_documento: Mapped[str] = mapped_column(String(50), nullable=False)
  nombre: Mapped[str] = mapped_column(String(255), nullable=False)
  tipo_personal: Mapped[TipoPersonalExterno] = mapped_column(
    SQLEnum(TipoPersonalExterno, name="tipo_personal_externo_enum"),
    nullable=False
  )
  empresa: Mapped[str | None] = mapped_column(String(255), nullable=True)
  motivo: Mapped[str] = mapped_column(Text, nullable=False)
  fecha_hora_ingreso: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
  fecha_hora_salida: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  usuario: Mapped["Usuario"] = relationship()