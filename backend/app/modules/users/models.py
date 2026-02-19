import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Date, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, INET

from app.core.database.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant, Unidad

# ======================================
#             CREACIÓN ENUMS
# ======================================

class TipoDocumento(str, enum.Enum):
  CC = "CC"
  CE = "CE"
  PA = "PA"
  TI = "TI"
  OTRO = "otro"

class TipoRol(str, enum.Enum):
  RESIDENTE = "residente"
  ADMINISTRACION = "administracion"
  SEGURIDAD = "seguridad"
  RECEPCION = "recepcion"
  SUPERADMIN = "superadmin"

# ======================================
#           CREACIÓN MODELOS
# ======================================

class Usuario(Base):
  __tablename__ = "usuarios"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
  password: Mapped[str] = mapped_column(String(255), nullable=False)
  nombre: Mapped[str] = mapped_column(String(255), nullable=False)
  apellido: Mapped[str] = mapped_column(String(255), nullable=False)
  tipo_documento: Mapped[TipoDocumento] = mapped_column(
    SQLEnum(TipoDocumento, name="tipo_documento_enum"),
    nullable=False
  )
  n_documento: Mapped[str] = mapped_column(String(50), nullable=False)
  telefono: Mapped[str | None] = mapped_column(String(50), nullable=True)
  avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
  is_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  email_verificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
  fecha_ultimo_acceso: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  membresias: Mapped[list["TenantUsuario"]] = relationship(back_populates="usuario")

class Rol(Base):
  __tablename__ = "roles"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  nombre: Mapped[TipoRol] = mapped_column(
    SQLEnum(TipoRol, name="tipo_rol_enum"),
    nullable=False
  )
  descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
  is_activo: Mapped[bool] = mapped_column(Boolean, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ----
  permisos: Mapped[list["RolPermiso"]] = relationship(back_populates="rol")
  membresias: Mapped[list["TenantUsuario"]] = relationship(back_populates="rol")

class Permiso(Base):
  __tablename__ = "permisos"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  codigo: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
  nombre: Mapped[str] = mapped_column(String(255), nullable=False)
  descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
  modulo: Mapped[str] = mapped_column(String(100), nullable=False)
  is_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  roles: Mapped[list["RolPermiso"]] = relationship(back_populates="permiso")

class RolPermiso(Base):
  __tablename__ = "rol_permiso"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  rol_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("roles.id", ondelete="CASCADE"),
    nullable=False
  )
  permiso_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("permisos.id", ondelete="CASCADE"),
    nullable=False
  )
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  rol: Mapped["Rol"] = relationship(back_populates="permisos")
  permiso: Mapped["Permiso"] = relationship(back_populates="roles")

class TenantUsuario(Base):
  __tablename__ = "tenant_usuario"
  
  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
  )
  usuario_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("usuarios.id", ondelete="CASCADE"),
    nullable=False
  )
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("tenants.id", ondelete="CASCADE"),
    nullable=False
  )
  unidad_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("unidades.id", ondelete="SET NULL"),
    nullable=False
  )
  rol_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("roles.id", ondelete="RESTRICT"),
    nullable=False
  )
  is_activa: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  fecha_inicio: Mapped[datetime] = mapped_column(Date, nullable=False)
  fecha_fin: Mapped[datetime | None] = mapped_column(Date, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  
  # --- Relaciones ---
  usuario: Mapped["Usuario"] = relationship(back_populates="membresias")
  tenant: Mapped["Tenant"] = relationship()
  unidad: Mapped["Unidad | None"] = relationship()
  rol: Mapped["Rol"] = relationship(back_populates="membresias")