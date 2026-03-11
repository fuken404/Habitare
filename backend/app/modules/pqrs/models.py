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

class EstadoPQRS(str, enum.Enum):
  ABIERTA = "abierta"
  EN_PROCESO = "en_proceso"
  RESUELTA = "resuelta"
  CERRADA = "cerrada"
  RECHAZADA = "rechazada"

class PrioridadPQRS(str, enum.Enum):
  BAJA = "baja"
  MEDIA = "media"
  ALTA = "alta"
  URGENTE = "urgente"

class TipoPQRS(str, enum.Enum):
  PETICION = "peticion"
  QUEJA = "queja"
  RECLAMO = "reclamo"
  SUGERENCIA = "sugerencia"

# ======================================
#            CREACIÓN MODELOS
# ======================================

class CategoriaPQRS(Base):
  __tablename__ = "categorias_pqrs"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  nombre: Mapped[str] = mapped_column(String(100), nullable=False)
  descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
  is_activa: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # ── Relationships ─────────────────────────────────────────────────────────
  pqrs: Mapped[list["PQRS"]] = relationship(back_populates="categoria")

class PQRS(Base):
  __tablename__ = "pqrs"
  
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
  tipo: Mapped[TipoPQRS | None] = mapped_column(
    SQLEnum(TipoPQRS, name="tipo_pqrs_enum"),
    nullable=True
  )
  categoria_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("categorias_pqrs.id", ondelete="RESTRICT"),
    nullable=True
  )
  radicado_por: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  asunto: Mapped[str] = mapped_column(String(255), nullable=False)
  descripcion: Mapped[str] = mapped_column(Text, nullable=False)
  estado: Mapped[EstadoPQRS] = mapped_column(
    SQLEnum(EstadoPQRS, name="estado_pqrs_enum"),
    server_default="ABIERTA",
    nullable=False
  )
  prioridad: Mapped[PrioridadPQRS] = mapped_column(
    SQLEnum(PrioridadPQRS, name="prioridad_pqrs_enum"),
    server_default="MEDIA",
    nullable=False
  )
  numero_radicado: Mapped[str | None] = mapped_column(String(30), unique=True, nullable=True)
  fecha_primera_respuesta: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  fecha_resolucion: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  unidad: Mapped["Unidad"] = relationship()
  categoria: Mapped["CategoriaPQRS | None"] = relationship(back_populates="pqrs")
  usuario: Mapped["Usuario"] = relationship()
  mensajes: Mapped[list["MensajePQRS"]] = relationship(back_populates="pqrs")
  adjuntos: Mapped[list["AdjuntoPQRS"]] = relationship(back_populates="pqrs")

class MensajePQRS(Base):
  __tablename__ = "mensajes_pqrs"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  pqrs_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("pqrs.id", ondelete="CASCADE"),
    nullable=False
  )
  autor_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="SET NULL"),
    nullable=False
  )
  contenido: Mapped[str] = mapped_column(Text, nullable=False)
  is_interno: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # ── Relationships ─────────────────────────────────────────────────────────
  pqrs: Mapped["PQRS"] = relationship(back_populates="mensajes")
  autor: Mapped["Usuario"] = relationship()

class AdjuntoPQRS(Base):
  __tablename__ = "adjuntos_pqrs"

  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  pqrs_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("pqrs.id", ondelete="CASCADE"),
    nullable=False
  )
  nombre: Mapped[str] = mapped_column(String(255), nullable=False)
  mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
  contenido_b64: Mapped[str] = mapped_column(Text, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)

  # ── Relationships ─────────────────────────────────────────────────────────
  pqrs: Mapped["PQRS"] = relationship(back_populates="adjuntos")