import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.modules.auth.schemas import MeResponse
from app.modules.auth import service as auth_service
from app.modules.users.models import TipoRol

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> MeResponse:
  return await auth_service.obtener_usuario_actual(token=token, db=db)

def require_roles(*roles: TipoRol):
  """
  Uso: Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN))
  """
  async def _guard(current_user: MeResponse = Depends(get_current_user)) -> MeResponse:
    # Normalizar rol del usuario a string
    user_rol = current_user.rol if isinstance(current_user.rol, str) else current_user.rol.value
    allowed_roles = [r.value for r in roles]
    
    if user_rol not in allowed_roles:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tienes permisos para esta operación",
      )
    return current_user
  return _guard

def get_tenant_id(current_user: MeResponse = Depends(get_current_user)) -> uuid.UUID:
  if not current_user.tenant_id:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Usuario sin conjunto asignado",
    )
  return current_user.tenant_id