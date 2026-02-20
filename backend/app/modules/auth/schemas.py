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
  
  model_config = {"from_attributes": True}

class TokenPayload(BaseModel):
  sub: str # usuario_id
  tenant_id: str | None = None
  rol: str | None = None
  type: Literal["access", "refresh"]
  exp: int
  iat: int