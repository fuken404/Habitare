import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.users.models import Usuario, TenantUsuario, Rol, TipoRol
from app.core.security import hash_password

async def get_usuario_by_id(db: AsyncSession, usuario_id: uuid.UUID) -> Usuario | None:
  result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
  return result.scalar_one_or_none()

async def get_usuario_by_email(db: AsyncSession, email: str) -> Usuario | None:
  result = await db.execute(select(Usuario).where(Usuario.email == email))
  return result.scalar_one_or_none()

async def get_usuarios_by_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> list[Usuario]:
  result = await db.execute(
    select(Usuario)
    .join(TenantUsuario, TenantUsuario.usuario_id == Usuario.id)
    .where(TenantUsuario.tenant_id == tenant_id, TenantUsuario.is_activa == True)
    .order_by(Usuario.nombre)
  )
  return list(result.scalars().unique().all())

async def create_usuario(db: AsyncSession, data: dict) -> Usuario:
  data["password"] = hash_password(data["password"])
  usuario = Usuario(**data)
  db.add(usuario)
  await db.flush()
  await db.refresh(usuario)
  return usuario

async def update_usuario(db: AsyncSession, usuario: Usuario, data: dict) -> Usuario:
  for key, value in data.items():
    setattr(usuario, key, value)
  usuario.updated_at = datetime.utcnow()
  await db.flush()
  await db.refresh(usuario)
  return usuario

async def get_rol_by_nombre(db: AsyncSession, tipo_rol: TipoRol) -> Rol | None:
  result = await db.execute(
    select(Rol).where(Rol.nombre == tipo_rol, Rol.is_activo == True)
  )
  return result.scalar_one_or_none()

async def asignar_usuario_tenant(db: AsyncSession, data: dict) -> TenantUsuario:
  membresia = TenantUsuario(**data)
  db.add(membresia)
  await db.flush()
  await db.refresh(membresia)
  return membresia

async def get_membresia(
  db: AsyncSession, usuario_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> TenantUsuario | None:
  result = await db.execute(
    select(TenantUsuario).where(
      TenantUsuario.usuario_id == usuario_id,
      TenantUsuario.tenant_id == tenant_id,
      TenantUsuario.is_activa == True,
    )
  )
  return result.scalar_one_or_none()

async def desactivar_membresia(db: AsyncSession, membresia: TenantUsuario) -> None:
  membresia.is_activa = False
  membresia.updated_at = datetime.utcnow()
  await db.flush()