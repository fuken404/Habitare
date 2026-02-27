import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.notifications.schemas import (
    NotificacionResponse, NotificacionListResponse
  )
from app.modules.notifications import service as notif_service

router = APIRouter(prefix="/notifications", tags=["Notificaciones"])

_ROLES_TODOS = (TipoRol.RESIDENTE, TipoRol.SEGURIDAD, TipoRol.RECEPCION,
                TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#   1. RUTAS ESTÁTICAS — antes de /{id}
# ======================================

@router.get("", response_model=list[NotificacionListResponse])
async def listar_notificaciones(
    solo_pendientes: bool = Query(default=False, description="Solo notificaciones no leídas"),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """Retorna las notificaciones del usuario autenticado."""
  return await notif_service.listar_notificaciones(
    tenant_id, current_user.id, solo_pendientes, db
  )

@router.post("/read-all", status_code=status.HTTP_200_OK)
async def marcar_todas_leidas(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """Marca todas las notificaciones pendientes del usuario como leídas."""
  return await notif_service.marcar_todas_leidas(tenant_id, current_user.id, db)

# ======================================
#   2. RUTAS CON /{notif_id}
# ======================================

@router.get("/{notif_id}", response_model=NotificacionResponse)
async def obtener_notificacion(
    notif_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await notif_service.obtener_notificacion(
    notif_id, tenant_id, current_user.id, db
  )

@router.post("/{notif_id}/read", response_model=NotificacionResponse)
async def marcar_leida(
    notif_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """Operación idempotente — marcar una notificación ya leída no falla."""
  return await notif_service.marcar_leida(
    notif_id, tenant_id, current_user.id, db
  )

@router.delete("/{notif_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_notificacion(
    notif_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  await notif_service.eliminar_notificacion(
    notif_id, tenant_id, current_user.id, db
  )