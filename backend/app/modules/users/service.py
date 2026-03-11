import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users import repository as repo
from app.core.security import verify_password, hash_password
from app.modules.users.schemas import (
  UsuarioCreate, UsuarioUpdate, UsuarioAdminUpdate,
  UsuarioResponse, AsignarUsuarioTenant, MembresiaResponse,
  CambiarPasswordRequest,
)

async def listar_usuarios_tenant(tenant_id: uuid.UUID, db: AsyncSession) -> list[UsuarioResponse]:
  usuarios = await repo.get_usuarios_by_tenant(db, tenant_id)
  return [UsuarioResponse.model_validate(u) for u in usuarios]

async def obtener_usuario(usuario_id: uuid.UUID, db: AsyncSession) -> UsuarioResponse:
  usuario = await repo.get_usuario_by_id(db, usuario_id)
  if not usuario:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
  return UsuarioResponse.model_validate(usuario)

async def crear_usuario(data: UsuarioCreate, db: AsyncSession) -> UsuarioResponse:
  existente = await repo.get_usuario_by_email(db, data.email)
  if existente:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya está registrado")
  usuario = await repo.create_usuario(db, data.model_dump())
  return UsuarioResponse.model_validate(usuario)

async def actualizar_usuario(
  usuario_id: uuid.UUID, data: UsuarioUpdate, db: AsyncSession
  ) -> UsuarioResponse:
  usuario = await repo.get_usuario_by_id(db, usuario_id)
  if not usuario:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
  usuario = await repo.update_usuario(db, usuario, data.model_dump(exclude_none=True))
  return UsuarioResponse.model_validate(usuario)


async def asignar_a_tenant(
  tenant_id: uuid.UUID, data: AsignarUsuarioTenant, db: AsyncSession
  ) -> MembresiaResponse:
  usuario = await repo.get_usuario_by_id(db, data.usuario_id)
  if not usuario:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
  existente = await repo.get_membresia(db, data.usuario_id, tenant_id)
  if existente:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El usuario ya pertenece a este conjunto")
  rol = await repo.get_rol_by_nombre(db, data.rol)
  if not rol:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Rol '{data.rol}' no encontrado")

  membresia = await repo.asignar_usuario_tenant(db, {
    "usuario_id": data.usuario_id,
    "tenant_id": tenant_id,
    "unidad_id": data.unidad_id,
    "rol_id": rol.id,
    "fecha_inicio": data.fecha_inicio,
    "fecha_fin": data.fecha_fin,
    "is_activa": True,
  })
  return MembresiaResponse(
    id=membresia.id,
    usuario_id=membresia.usuario_id,
    tenant_id=membresia.tenant_id,
    unidad_id=membresia.unidad_id,
    rol=data.rol,
    is_activa=membresia.is_activa,
    fecha_inicio=membresia.fecha_inicio,
    fecha_fin=membresia.fecha_fin,
    created_at=membresia.created_at,
  )

async def cambiar_password(
  usuario_id: uuid.UUID, data: CambiarPasswordRequest, db: AsyncSession
) -> None:
  usuario = await repo.get_usuario_by_id(db, usuario_id)
  if not usuario:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
  if not verify_password(data.password_actual, usuario.password):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La contraseña actual es incorrecta")
  nuevo_hash = hash_password(data.password_nueva)
  await repo.update_usuario(db, usuario, {"password": nuevo_hash})


async def remover_de_tenant(
  usuario_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  membresia = await repo.get_membresia(db, usuario_id, tenant_id)
  if not membresia:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membresía no encontrada")
  await repo.desactivar_membresia(db, membresia)
