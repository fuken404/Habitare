import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.modules.notifications.models import (
    Notificacion, EstadoNotificacion, CanalNotificacion
  )


async def get_notificaciones_usuario(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    solo_pendientes: bool = False,
  ) -> list[Notificacion]:
  query = (
    select(Notificacion)
    .where(
      Notificacion.tenant_id == tenant_id,
      Notificacion.usuario_id == usuario_id,
    )
    .order_by(Notificacion.created_at.desc())
  )
  if solo_pendientes:
    query = query.where(Notificacion.estado_app == EstadoNotificacion.PENDIENTE)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_notificacion_by_id(
    db: AsyncSession, notif_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Notificacion | None:
  result = await db.execute(
    select(Notificacion).where(
      Notificacion.id == notif_id,
      Notificacion.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def create_notificacion(
    db: AsyncSession, data: dict
  ) -> Notificacion:
  notif = Notificacion(**data)
  db.add(notif)
  await db.flush()
  await db.refresh(notif)
  return notif

async def marcar_leida(
    db: AsyncSession, notif: Notificacion
  ) -> Notificacion:
  notif.estado_app = EstadoNotificacion.ENVIADA
  await db.flush()
  await db.refresh(notif)
  return notif

async def marcar_todas_leidas(
    db: AsyncSession, tenant_id: uuid.UUID, usuario_id: uuid.UUID
  ) -> int:
  result = await db.execute(
    update(Notificacion)
    .where(
      Notificacion.tenant_id == tenant_id,
      Notificacion.usuario_id == usuario_id,
      Notificacion.estado_app == EstadoNotificacion.PENDIENTE,
    )
    .values(estado_app=EstadoNotificacion.ENVIADA)
  )
  await db.flush()
  return result.rowcount

async def delete_notificacion(
    db: AsyncSession, notif: Notificacion
  ) -> None:
  await db.delete(notif)
  await db.flush()

async def marcar_estado_correo(
    db: AsyncSession, notif_id: uuid.UUID, estado: EstadoNotificacion
  ) -> None:
  """Usado por el worker de email al confirmar/fallar el envío."""
  result = await db.execute(
    select(Notificacion).where(Notificacion.id == notif_id)
  )
  notif = result.scalar_one_or_none()
  if notif:
    notif.estado_correo = estado
    await db.flush()
