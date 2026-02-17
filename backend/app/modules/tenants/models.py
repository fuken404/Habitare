import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Integer, Numeric, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

# ======================================
#             CREACIÓN ENUMS
# ======================================

class TipoUnidad(str, enum.Enum):
  APARTAMENTO = "apartamento"
  CASA = "casa"
  LOCAL = "local"
  OFICINA = "oficina"
  OTRO = "otro"

# ======================================
#            CREACIÓN TENANT
# ======================================

class Tenant(Base):
  __tablename__ = "tenants"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  nombre: Mapped[str] = mapped_column(String(255), nullable=False)
  nit: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
  direccion: Mapped[str | None] = mapped_column(Text, nullable=True)
  telefono: Mapped[str | None] = mapped_column(String(50), nullable=True)
  email: Mapped[str | None] = mapped_column(String(255), nullable=True)
  is_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  torres: Mapped[list["Torre"]] = relationship(back_populates="tenant")
  unidades: Mapped[list["Unidad"]] = relationship(back_populates="tenant")
  #suscripcion: Mapped["Suscripcion"] = relationship(back_populates="tenant")

# ======================================
#            CREACIÓN TORRES
# ======================================

class Torre(Base):
  __tablename__ = "torres"
  
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
  n_pisos: Mapped[int | None] = mapped_column(Integer, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship(back_populates="torres")
  unidades: Mapped[list["Unidad"]] = relationship(back_populates="torre")

# ======================================
#           CREACIÓN UNIDADES
# ======================================

class Unidad(Base):
  __tablename__ = "unidades"
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
  torre_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("torres.id", ondelete="SET NULL"),
    nullable=True
  )
  numero: Mapped[str] = mapped_column(String(50), nullable=False)
  tipo: Mapped[TipoUnidad] = mapped_column(
    SQLEnum(TipoUnidad, name="tipo_unidad_enum"),
    nullable=False
  )
  area_m2: Mapped[float | None] = mapped_column(Numeric(10,2), nullable=True)
  piso: Mapped[int | None] = mapped_column(Integer, nullable=True)
  habitada: Mapped[bool] = mapped_column(Boolean, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship(back_populates="unidades")
  torre: Mapped["Torre | None"] = relationship(back_populates="unidades")