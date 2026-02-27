import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.events.models import EstadoEvento, EventoOutbox
from app.modules.events import repository as repo
from app.modules.events.worker import procesar_outbox
from pydantic import BaseModel
from datetime import datetime

class EventoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  tipo_evento: str
  agregado_tipo: str
  agregado_id: uuid.UUID
  payload: str
  estado: EstadoEvento
  intentos: int
  error: str | None
  fecha_procesado: datetime | None
  created_at: datetime
  
  model_config = {"from_attributes": True}

router = APIRouter(prefix="/events", tags=["Eventos Outbox"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

@router.get("", response_model=list[EventoResponse])
async def listar_eventos(
    estado: EstadoEvento | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Lista eventos del outbox. Útil para monitoreo y debug."""
  if estado == EstadoEvento.PENDIENTE or estado is None:
    items = await repo.get_pendientes(db, limite=100)
    if estado is None:
      fallidos = await repo.get_fallidos(db, max_intentos=99)
      items = items + fallidos
  else:
    fallidos = await repo.get_fallidos(db, max_intentos=99)
    items = fallidos
  return [EventoResponse.model_validate(e) for e in items]

@router.post("/process", status_code=status.HTTP_202_ACCEPTED)
async def forzar_procesamiento(
    _: MeResponse = Depends(require_roles(TipoRol.SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Fuerza un ciclo de procesamiento del outbox manualmente.
  Útil en desarrollo o ante backlog de eventos acumulados.
  """
  await procesar_outbox(db)
  return {"detail": "Ciclo de procesamiento ejecutado"}
