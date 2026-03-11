import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import get_current_user, require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.users.schemas import (
  UsuarioCreate, UsuarioUpdate,
  UsuarioResponse, AsignarUsuarioTenant, MembresiaResponse,
  CambiarPasswordRequest,
)
from app.modules.users import service as users_service

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.get("", response_model=list[UsuarioResponse])
async def listar_usuarios(
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db),
  ):
  return await users_service.listar_usuarios_tenant(tenant_id, db)

@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def crear_usuario(
  body: UsuarioCreate,
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db),
  ):
  return await users_service.crear_usuario(body, db)

@router.get("/me", response_model=UsuarioResponse)
async def mi_perfil(
  current_user: MeResponse = Depends(get_current_user),
  db: AsyncSession = Depends(get_db),
  ):
  return await users_service.obtener_usuario(current_user.id, db)

@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def obtener_usuario(
  usuario_id: uuid.UUID,
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db),
  ):
  return await users_service.obtener_usuario(usuario_id, db)

@router.patch("/{usuario_id}", response_model=UsuarioResponse)
async def actualizar_usuario(
  usuario_id: uuid.UUID,
  body: UsuarioUpdate,
  current_user: MeResponse = Depends(get_current_user),
  db: AsyncSession = Depends(get_db),
  ):
  # Un usuario solo puede editar su propio perfil, salvo admins
  if current_user.id != usuario_id and current_user.rol not in [
    TipoRol.ADMINISTRACION.value, TipoRol.SUPERADMIN.value
  ]:
    from fastapi import HTTPException
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")
  return await users_service.actualizar_usuario(usuario_id, body, db)

@router.post("/me/cambiar-password", status_code=status.HTTP_204_NO_CONTENT)
async def cambiar_password(
  body: CambiarPasswordRequest,
  current_user: MeResponse = Depends(get_current_user),
  db: AsyncSession = Depends(get_db),
):
  await users_service.cambiar_password(current_user.id, body, db)

@router.post("/asignar", response_model=MembresiaResponse, status_code=status.HTTP_201_CREATED)
async def asignar_usuario(
  body: AsignarUsuarioTenant,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db),
  ):
  return await users_service.asignar_a_tenant(tenant_id, body, db)

@router.delete("/{usuario_id}/remover", status_code=status.HTTP_204_NO_CONTENT)
async def remover_usuario(
  usuario_id: uuid.UUID,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db),
  ):
  await users_service.remover_de_tenant(usuario_id, tenant_id, db)
