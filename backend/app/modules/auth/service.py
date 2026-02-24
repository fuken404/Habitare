import uuid
from datetime import datetime, timezone, timedelta

from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.modules.users.models import Usuario, TenantUsuario
from app.modules.auth.schemas import TokenResponse, TokenPayload, MeResponse
from fastapi import HTTPException, status
from app.core.security import verify_password

# ======================================
#           UTILIDADES INTERNAS
# ======================================

def _create_token(data: dict, expires_delta: timedelta) -> str:
  payload = data.copy()
  now = datetime.now(timezone.utc)
  payload["exp"] = int((now + expires_delta).timestamp())
  payload["iat"] = int(now.timestamp())
  return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def _decode_token(token: str) -> TokenPayload:
  try:
    raw = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    return TokenPayload(**raw)
  except JWTError:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Token inválido o expirado",
      headers={"WWW-Authenticate": "Bearer"},
    )

# ======================================
#           LÓGICA DE NEGOCIO
# ======================================

async def autenticar_usuario(email: str, password: str, db: AsyncSession) -> TokenResponse:
  result = await db.execute(
    select(Usuario)
    .where(Usuario.email == email, Usuario.is_activo.is_(True))
    .options(selectinload(Usuario.membresias).selectinload(TenantUsuario.rol))
  )
  usuario = result.scalar_one_or_none()
  
  if not usuario or not verify_password(password, usuario.password):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Credenciales incorrectas",
    )
  
  # Obtener membresía activa (puede tener mútiples tenants; se toma la primera activa)
  membresia_activa = max(
    (m for m in usuario.membresias if m.is_activa),
    key=lambda m: m.created_at,
    default=None
  )
  
  tenant_id = str(membresia_activa.tenant_id) if membresia_activa else None
  rol = membresia_activa.rol.nombre.value if membresia_activa else None
  
  access_token = _create_token(
    {"sub": str(usuario.id), "tenant_id": tenant_id, "rol":rol, "type":"access"},
    timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
  )
  refresh_token = _create_token(
    {"sub": str(usuario.id), "type": "refresh"},
    timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
  )
  
  # Actualizar último acceso
  usuario.fecha_ultimo_acceso = datetime.now(timezone.utc)
  await db.flush()
  
  return TokenResponse(
    access_token=access_token,
    refresh_token=refresh_token,
    expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
  )

async def refrescar_token(refresh_token: str, db: AsyncSession) -> TokenResponse:
  payload = _decode_token(refresh_token)
  
  if payload.type != "refresh":
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Token de refresco inválido",
    )
  
  result = await db.execute(
    select(Usuario)
    .where(Usuario.id == uuid.UUID(payload.sub), Usuario.is_activo.is_(True))
    .options(selectinload(Usuario.membresias).selectinload(TenantUsuario.rol))
  )
  usuario = result.scalar_one_or_none()
  
  if not usuario:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
  
  membresia_activa = max(
    (m for m in usuario.membresias if m.is_activa),
    key=lambda m: m.created_at,
    default=None
  )
  tenant_id = str(membresia_activa.tenant_id) if membresia_activa else None
  rol = membresia_activa.rol.nombre.value if membresia_activa else None
  
  new_access = _create_token(
    {"sub": str(usuario.id), "tenant_id": tenant_id, "rol": rol, "type": "access"},
    timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
  )
  
  new_refresh = _create_token(
    {"sub": str(usuario.id), "type": "refresh"},
    timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
  )
  
  return TokenResponse(
    access_token=new_access,
    refresh_token=new_refresh,
    expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
  )

async def obtener_usuario_actual(token: str, db: AsyncSession) -> MeResponse:
  payload = _decode_token(token)
  
  if payload.type != "access":
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de acceso requerido")
  
  result = await db.execute(
    select(Usuario)
    .where(Usuario.id == uuid.UUID(payload.sub), Usuario.is_activo.is_(True))
  )
  usuario = result.scalar_one_or_none()
  
  if not usuario:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
  
  return MeResponse(
    id=usuario.id,
    email=usuario.email,
    nombre=usuario.nombre,
    apellido=usuario.apellido,
    rol=payload.rol,
    tenant_id=uuid.UUID(payload.tenant_id) if payload.tenant_id else None,
  )
