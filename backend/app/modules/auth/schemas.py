import uuid
from typing import Literal
from pydantic import BaseModel, EmailStr, Field
from app.modules.users.models import TipoRol

# ===========================
#   REQUEST (POST) SCHEMAS
# ===========================

class LoginRequest(BaseModel):
  email: EmailStr
  password: str = Field(..., min_lenght=8)

class RefreshTokenRequest(BaseModel):
  refresh_token: str

# ===========================
#   RESPONSE (GET) SCHEMAS
# ===========================

class TokenResponse(BaseModel):
  access_token: str
  refresh_token: str
  token_type: str = "bearer"
  expires_in: int # segundos

class MeResponse(BaseModel):
  id: uuid.UUID
  email: str
  nombre: str
  apellido: str
  rol: TipoRol
  tenant_id: uuid.UUID | None
  unidad_id: uuid.UUID | None = None
  nombre_conjunto: str | None = None
  nombre_torre: str | None = None
  numero_unidad: str | None = None

  model_config = {"from_attributes": True}

class TokenPayload(BaseModel):
  sub: str # usuario_id
  tenant_id: str | None = None
  rol: str | None = None
  unidad_id: str | None = None
  type: Literal["access", "refresh"]
  exp: int
  iat: int

class ForgotPasswordRequest(BaseModel):
  email: EmailStr

class VerifyResetCodeRequest(BaseModel):
  email: EmailStr
  codigo: str

class ResetPasswordRequest(BaseModel):
  email: EmailStr
  codigo: str
  nueva_password: str = Field(..., min_length=6)

class MessageResponse(BaseModel):
  message: str