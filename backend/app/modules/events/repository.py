import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.events.models import EventoOutbox, EstadoEvento

async def create_evento(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    tipo_evento: str,
    agregado_tipo: str,
    agregado_id: uuid.UUID,
    payload: dict,
  ) -> EventoOutbox:
  import json
  evento = EventoOutbox(
    tenant_id=tenant_id,
    tipo_evento=tipo_evento,
    agregado_tipo=agregado_tipo,
    agregado_id=agregado_id,
    payload=json.dumps(payload, default=str),
    estado=EstadoEvento.PENDIENTE,
  )
  db.add(evento)
  await db.flush()
  return evento

async def get_pendientes(
    db: AsyncSession, limite: int = 50
  ) -> list[EventoOutbox]:
  result = await db.execute(
    select(EventoOutbox)
    .where(EventoOutbox.estado == EstadoEvento.PENDIENTE)
    .order_by(EventoOutbox.created_at.asc())
    .limit(limite)
  )
  return list(result.scalars().all())

async def get_fallidos(
    db: AsyncSession, max_intentos: int = 3
  ) -> list[EventoOutbox]:
  result = await db.execute(
    select(EventoOutbox)
    .where(
      EventoOutbox.estado == EstadoEvento.FALLIDO,
      EventoOutbox.intentos < max_intentos,
    )
    .order_by(EventoOutbox.created_at.asc())
  )
  return list(result.scalars().all())

async def marcar_procesado(
    db: AsyncSession, evento: EventoOutbox
  ) -> None:
  evento.estado = EstadoEvento.PROCESADO
  evento.fecha_procesado = datetime.now(timezone.utc)
  await db.flush()

async def marcar_fallido(
    db: AsyncSession, evento: EventoOutbox, error: str
  ) -> None:
  evento.intentos += 1
  evento.estado = EstadoEvento.FALLIDO
  evento.error = error
  await db.flush()

async def get_evento_by_id(
    db: AsyncSession, evento_id: uuid.UUID
  ) -> EventoOutbox | None:
  result = await db.execute(
    select(EventoOutbox).where(EventoOutbox.id == evento_id)
  )
  return result.scalar_one_or_none()