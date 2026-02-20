from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.modules.auth.schemas import TokenResponse, RefreshTokenRequest, MeResponse
from app.modules.auth import service as auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
  """
  Autenticación con email y password.
  Retorna access_token (30 min) y refresh_token (7 días).
  """
  return await auth_service.autenticar_usuario(
    email=form_data.username,
    password=form_data.password,
    db=db,
  )

@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def refresh(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
  """
  Rota el refresh_token y emite nuevos tokens.
  """
  return await auth_service.refrescar_token(
    refresh_token=body.refresh_token,
    db=db,
  )

@router.get("/me", response_model=MeResponse, status_code=status.HTTP_200_OK)
async def me(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
  """
  Retorna el perfil del usuario autenticado.
  """
  return await auth_service.obtener_usuario_actual(token=token, db=db)