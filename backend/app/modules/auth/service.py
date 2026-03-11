import uuid
from datetime import datetime, timedelta

from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.modules.users.models import Usuario, TenantUsuario
from app.modules.tenants.models import Tenant, Unidad, Torre
from app.modules.auth.schemas import TokenResponse, TokenPayload, MeResponse
from fastapi import HTTPException, status
from app.core.security import verify_password

# ======================================
#           UTILIDADES INTERNAS
# ======================================

def _create_token(data: dict, expires_delta: timedelta) -> str:
  payload = data.copy()
  now = datetime.utcnow()
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
  unidad_id = str(membresia_activa.unidad_id) if membresia_activa else None

  access_token = _create_token(
    {"sub": str(usuario.id), "tenant_id": tenant_id, "rol": rol, "unidad_id": unidad_id, "type": "access"},
    timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
  )
  refresh_token = _create_token(
    {"sub": str(usuario.id), "type": "refresh"},
    timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
  )
  
  # Actualizar último acceso
  usuario.fecha_ultimo_acceso = datetime.utcnow()
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
  unidad_id = str(membresia_activa.unidad_id) if membresia_activa else None

  new_access = _create_token(
    {"sub": str(usuario.id), "tenant_id": tenant_id, "rol": rol, "unidad_id": unidad_id, "type": "access"},
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
  
  membresia_result = await db.execute(
    select(TenantUsuario)
    .where(
      TenantUsuario.usuario_id == usuario.id,
      TenantUsuario.is_activa.is_(True)
    )
    .order_by(TenantUsuario.created_at.desc())
    .limit(1)
  )
  membresia = membresia_result.scalar_one_or_none()
  unidad_id = membresia.unidad_id if membresia else None

  # Datos del conjunto
  nombre_conjunto: str | None = None
  nombre_torre: str | None = None
  numero_unidad: str | None = None

  if payload.tenant_id:
    tenant_result = await db.execute(
      select(Tenant).where(Tenant.id == uuid.UUID(payload.tenant_id))
    )
    tenant = tenant_result.scalar_one_or_none()
    if tenant:
      nombre_conjunto = tenant.nombre

  if unidad_id:
    unidad_result = await db.execute(
      select(Unidad)
      .where(Unidad.id == unidad_id)
      .options(selectinload(Unidad.torre))
    )
    unidad = unidad_result.scalar_one_or_none()
    if unidad:
      numero_unidad = unidad.numero
      if unidad.torre:
        nombre_torre = unidad.torre.nombre

  return MeResponse(
    id=usuario.id,
    email=usuario.email,
    nombre=usuario.nombre,
    apellido=usuario.apellido,
    rol=payload.rol,
    tenant_id=uuid.UUID(payload.tenant_id) if payload.tenant_id else None,
    unidad_id=unidad_id,
    nombre_conjunto=nombre_conjunto,
    nombre_torre=nombre_torre,
    numero_unidad=numero_unidad,
  )


async def solicitar_reset_password(email: str, db: AsyncSession) -> None:
  import random
  import string
  from datetime import timedelta
  from app.modules.auth.reset_models import PasswordResetCode
  from app.core.email import send_email, build_reset_code_email

  result = await db.execute(
    select(Usuario).where(Usuario.email == email, Usuario.is_activo.is_(True))
  )
  usuario = result.scalar_one_or_none()
  if not usuario:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="No existe una cuenta activa con ese correo electrónico",
    )

  # Invalidar códigos anteriores
  await db.execute(
    select(PasswordResetCode).where(
      PasswordResetCode.usuario_id == usuario.id,
      PasswordResetCode.usado.is_(False),
    )
  )
  codigo = "".join(random.choices(string.digits, k=6))
  expires_at = datetime.utcnow() + timedelta(minutes=15)

  reset_code = PasswordResetCode(
    usuario_id=usuario.id,
    codigo=codigo,
    expires_at=expires_at,
  )
  db.add(reset_code)
  await db.flush()

  await send_email(
    to=email,
    subject="Código de verificación - Habitare",
    html_body=build_reset_code_email(usuario.nombre, codigo),
  )


async def verificar_reset_code(email: str, codigo: str, db: AsyncSession) -> bool:
  from app.modules.auth.reset_models import PasswordResetCode

  result = await db.execute(
    select(Usuario).where(Usuario.email == email, Usuario.is_activo.is_(True))
  )
  usuario = result.scalar_one_or_none()
  if not usuario:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código inválido o expirado")

  result = await db.execute(
    select(PasswordResetCode).where(
      PasswordResetCode.usuario_id == usuario.id,
      PasswordResetCode.codigo == codigo,
      PasswordResetCode.usado.is_(False),
      PasswordResetCode.expires_at > datetime.utcnow(),
    )
  )
  reset_code = result.scalar_one_or_none()
  if not reset_code:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código inválido o expirado")

  return True


async def reset_password(email: str, codigo: str, nueva_password: str, db: AsyncSession) -> None:
  from app.modules.auth.reset_models import PasswordResetCode
  from app.core.security import hash_password

  result = await db.execute(
    select(Usuario).where(Usuario.email == email, Usuario.is_activo.is_(True))
  )
  usuario = result.scalar_one_or_none()
  if not usuario:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código inválido o expirado")

  result = await db.execute(
    select(PasswordResetCode).where(
      PasswordResetCode.usuario_id == usuario.id,
      PasswordResetCode.codigo == codigo,
      PasswordResetCode.usado.is_(False),
      PasswordResetCode.expires_at > datetime.utcnow(),
    )
  )
  reset_code = result.scalar_one_or_none()
  if not reset_code:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código inválido o expirado")

  reset_code.usado = True
  usuario.password = hash_password(nueva_password)
  await db.flush()
