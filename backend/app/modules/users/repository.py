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

async def get_usuario_ids_by_rol(
    db: AsyncSession, tenant_id: uuid.UUID, tipo_rol: TipoRol
  ) -> list[uuid.UUID]:
  result = await db.execute(
    select(TenantUsuario.usuario_id)
    .join(Rol, Rol.id == TenantUsuario.rol_id)
    .where(
      TenantUsuario.tenant_id == tenant_id,
      TenantUsuario.is_activa == True,
      Rol.nombre == tipo_rol,
    )
  )
  return list(result.scalars().all())

async def get_residentes_by_unidad(
    db: AsyncSession, unidad_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> list[Usuario]:
  result = await db.execute(
    select(Usuario)
    .join(TenantUsuario, TenantUsuario.usuario_id == Usuario.id)
    .where(
      TenantUsuario.tenant_id == tenant_id,
      TenantUsuario.unidad_id == unidad_id,
      TenantUsuario.is_activa == True,
    )
    .order_by(Usuario.nombre)
  )
  return list(result.scalars().unique().all())

async def get_residentes_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> list[dict]:
  from app.modules.tenants.models import Unidad, Torre
  result = await db.execute(
    select(Usuario, TenantUsuario, Unidad, Torre)
    .join(TenantUsuario, TenantUsuario.usuario_id == Usuario.id)
    .join(Rol, Rol.id == TenantUsuario.rol_id)
    .outerjoin(Unidad, Unidad.id == TenantUsuario.unidad_id)
    .outerjoin(Torre, Torre.id == Unidad.torre_id)
    .where(
      TenantUsuario.tenant_id == tenant_id,
      TenantUsuario.is_activa == True,
      Rol.nombre == TipoRol.RESIDENTE,
    )
    .order_by(Usuario.nombre)
  )
  rows = result.all()
  out = []
  for usuario, membresia, unidad, torre in rows:
    out.append({
      "id": usuario.id,
      "nombre": usuario.nombre,
      "apellido": usuario.apellido,
      "email": usuario.email,
      "tipo_documento": usuario.tipo_documento,
      "n_documento": usuario.n_documento,
      "telefono": usuario.telefono,
      "avatar_url": usuario.avatar_url,
      "is_activo": usuario.is_activo,
      "unidad_id": membresia.unidad_id,
      "numero_unidad": unidad.numero if unidad else None,
      "nombre_torre": torre.nombre if torre else None,
      "created_at": usuario.created_at,
    })
  return out

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
  usuario.updated_at = datetime.now()
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
  from datetime import date
  membresia.is_activa = False
  membresia.fecha_fin = date.today()
  membresia.updated_at = datetime.now()
  await db.flush()

async def get_staff_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> list[dict]:
  """Usuarios activos con rol SEGURIDAD o RECEPCION en el tenant."""
  result = await db.execute(
    select(Usuario, TenantUsuario, Rol)
    .join(TenantUsuario, TenantUsuario.usuario_id == Usuario.id)
    .join(Rol, Rol.id == TenantUsuario.rol_id)
    .where(
      TenantUsuario.tenant_id == tenant_id,
      TenantUsuario.is_activa == True,
      Rol.nombre.in_([TipoRol.SEGURIDAD, TipoRol.RECEPCION]),
    )
    .order_by(Rol.nombre, Usuario.nombre)
  )
  rows = result.all()
  return [
    {
      "id": u.id,
      "nombre": u.nombre,
      "apellido": u.apellido,
      "email": u.email,
      "tipo_documento": u.tipo_documento,
      "n_documento": u.n_documento,
      "telefono": u.telefono,
      "avatar_url": u.avatar_url,
      "rol": m.rol.nombre.value,
      "fecha_inicio": m.fecha_inicio,
      "created_at": u.created_at,
    }
    for u, m, _ in rows
  ]

async def get_staff_inactivos_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> list[dict]:
  """Usuarios inactivos con rol SEGURIDAD o RECEPCION en el tenant."""
  result = await db.execute(
    select(Usuario, TenantUsuario, Rol)
    .join(TenantUsuario, TenantUsuario.usuario_id == Usuario.id)
    .join(Rol, Rol.id == TenantUsuario.rol_id)
    .where(
      TenantUsuario.tenant_id == tenant_id,
      TenantUsuario.is_activa == False,
      Rol.nombre.in_([TipoRol.SEGURIDAD, TipoRol.RECEPCION]),
    )
    .order_by(TenantUsuario.fecha_fin.desc().nullslast())
  )
  rows = result.all()
  return [
    {
      "id": u.id,
      "nombre": u.nombre,
      "apellido": u.apellido,
      "email": u.email,
      "tipo_documento": u.tipo_documento,
      "n_documento": u.n_documento,
      "telefono": u.telefono,
      "avatar_url": u.avatar_url,
      "rol": m.rol.nombre.value,
      "fecha_inicio": m.fecha_inicio,
      "fecha_salida": m.fecha_fin,
      "created_at": u.created_at,
    }
    for u, m, _ in rows
  ]

async def get_residentes_inactivos_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> list[dict]:
  from app.modules.tenants.models import Unidad, Torre
  result = await db.execute(
    select(Usuario, TenantUsuario, Unidad, Torre)
    .join(TenantUsuario, TenantUsuario.usuario_id == Usuario.id)
    .join(Rol, Rol.id == TenantUsuario.rol_id)
    .outerjoin(Unidad, Unidad.id == TenantUsuario.unidad_id)
    .outerjoin(Torre, Torre.id == Unidad.torre_id)
    .where(
      TenantUsuario.tenant_id == tenant_id,
      TenantUsuario.is_activa == False,
      Rol.nombre == TipoRol.RESIDENTE,
    )
    .order_by(TenantUsuario.fecha_fin.desc().nullslast())
  )
  rows = result.all()
  out = []
  for usuario, membresia, unidad, torre in rows:
    out.append({
      "id": usuario.id,
      "nombre": usuario.nombre,
      "apellido": usuario.apellido,
      "email": usuario.email,
      "tipo_documento": usuario.tipo_documento,
      "n_documento": usuario.n_documento,
      "telefono": usuario.telefono,
      "avatar_url": usuario.avatar_url,
      "is_activo": usuario.is_activo,
      "unidad_id": membresia.unidad_id,
      "numero_unidad": unidad.numero if unidad else None,
      "nombre_torre": torre.nombre if torre else None,
      "fecha_salida": membresia.fecha_fin,
      "created_at": usuario.created_at,
    })
  return out