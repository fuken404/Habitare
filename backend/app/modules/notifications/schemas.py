import uuid
from datetime import datetime
from pydantic import BaseModel
from app.modules.notifications.models import (
    TipoNotificacion, CanalNotificacion, EstadoNotificacion
  )

class NotificacionCreate(BaseModel):
  """Uso interno — llamado desde otros servicios, no desde el router."""
  usuario_id: uuid.UUID
  titulo: str
  mensaje: str
  tipo: TipoNotificacion
  canal: CanalNotificacion
  entidad_tipo: str | None = None
  entidad_id: uuid.UUID | None = None

class NotificacionResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  usuario_id: uuid.UUID
  titulo: str
  mensaje: str
  tipo: TipoNotificacion
  canal: CanalNotificacion
  estado_app: EstadoNotificacion
  estado_correo: EstadoNotificacion
  entidad_tipo: str | None
  entidad_id: uuid.UUID | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

class NotificacionListResponse(BaseModel):
  id: uuid.UUID
  titulo: str
  tipo: TipoNotificacion
  canal: CanalNotificacion
  estado_app: EstadoNotificacion
  entidad_tipo: str | None
  entidad_id: uuid.UUID | None
  created_at: datetime
  
  model_config = {"from_attributes": True}
