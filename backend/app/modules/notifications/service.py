import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications import repository as repo
from app.modules.notifications.models import (
    TipoNotificacion, CanalNotificacion, EstadoNotificacion
  )
from app.modules.notifications.schemas import (
    NotificacionCreate, NotificacionResponse, NotificacionListResponse
  )

# ======================================
#   API INTERNA — usada por otros módulos
# ======================================

async def crear_notificacion(
    tenant_id: uuid.UUID,
    data: NotificacionCreate,
    db: AsyncSession,
  ) -> NotificacionResponse:
  """
  Crea una notificación para un usuario específico.
  Llamar desde otros servicios tras eventos de negocio.
  Ejemplo desde packages/service.py:
    await notif_service.crear_notificacion(
      tenant_id,
      NotificacionCreate(
        usuario_id=residente_id,
        titulo="Paquete disponible",
        mensaje=f"Tienes un paquete de {remitente} en recepción.",
        tipo=TipoNotificacion.INFO,
        canal=CanalNotificacion.PUSH,
        entidad_tipo="paquete",
        entidad_id=paquete.id,
      ),
      db,
    )
  """
  notif = await repo.create_notificacion(db, {
    "tenant_id": tenant_id,
    **data.model_dump(),
    "estado_app": EstadoNotificacion.PENDIENTE,
    "estado_correo": EstadoNotificacion.PENDIENTE,
  })
  return NotificacionResponse.model_validate(notif)

# ======================================
#   API PÚBLICA — consumida por el cliente
# ======================================

async def listar_notificaciones(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    solo_pendientes: bool,
    db: AsyncSession,
  ) -> list[NotificacionListResponse]:
  items = await repo.get_notificaciones_usuario(db, tenant_id, usuario_id, solo_pendientes)
  return [NotificacionListResponse.model_validate(n) for n in items]

async def obtener_notificacion(
    notif_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    db: AsyncSession,
  ) -> NotificacionResponse:
  notif = await repo.get_notificacion_by_id(db, notif_id, tenant_id)
  if not notif:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada")
  if notif.usuario_id != usuario_id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso a esta notificación")
  return NotificacionResponse.model_validate(notif)


async def marcar_leida(
    notif_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    db: AsyncSession,
  ) -> NotificacionResponse:
  notif = await repo.get_notificacion_by_id(db, notif_id, tenant_id)
  if not notif:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada")
  if notif.usuario_id != usuario_id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso a esta notificación")
  if notif.estado_app == EstadoNotificacion.ENVIADA:
    return NotificacionResponse.model_validate(notif)  # idempotente
  notif = await repo.marcar_leida(db, notif)
  return NotificacionResponse.model_validate(notif)

async def marcar_todas_leidas(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    db: AsyncSession,
  ) -> dict:
  count = await repo.marcar_todas_leidas(db, tenant_id, usuario_id)
  return {"marcadas": count}

async def eliminar_notificacion(
    notif_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    db: AsyncSession,
  ) -> None:
  notif = await repo.get_notificacion_by_id(db, notif_id, tenant_id)
  if not notif:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada")
  if notif.usuario_id != usuario_id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso a esta notificación")
  await repo.delete_notificacion(db, notif)
