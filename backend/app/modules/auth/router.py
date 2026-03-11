from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.modules.auth.schemas import TokenResponse, RefreshTokenRequest, MeResponse, ForgotPasswordRequest, VerifyResetCodeRequest, ResetPasswordRequest, MessageResponse
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

@router.post("/forgot-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
  """Genera y envía un código de verificación al correo del usuario."""
  await auth_service.solicitar_reset_password(email=body.email, db=db)
  return {"message": "Si el correo está registrado, recibirás las instrucciones en breve."}

@router.post("/verify-reset-code", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def verify_reset_code(body: VerifyResetCodeRequest, db: AsyncSession = Depends(get_db)):
  """Valida que el código de verificación sea correcto y no haya expirado."""
  await auth_service.verificar_reset_code(email=body.email, codigo=body.codigo, db=db)
  return {"message": "Código válido."}

@router.post("/reset-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
  """Restablece la contraseña usando el código de verificación."""
  await auth_service.reset_password(
    email=body.email,
    codigo=body.codigo,
    nueva_password=body.nueva_password,
    db=db,
  )
  return {"message": "Contraseña actualizada exitosamente."}