import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.events import repository as repo

async def emit(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    tipo_evento: str,
    agregado_tipo: str,
    agregado_id: uuid.UUID,
    payload: dict,
  ) -> None:
  """
  Escribe un evento en el outbox dentro de la transacción activa.
  El worker lo procesará y publicará en Pub/Sub de forma asíncrona.
  Uso desde cualquier service:
    await outbox.emit(
      db,
      tenant_id=tenant_id,
      tipo_evento="reserva.creada",
      agregado_tipo="ReservaZonaComun",
      agregado_id=reserva.id,
      payload={"estado": "confirmada", "zona_comun_id": str(reserva.zona_comun_id)},
    )
  """
  await repo.create_evento(
    db,
    tenant_id=tenant_id,
    tipo_evento=tipo_evento,
    agregado_tipo=agregado_tipo,
    agregado_id=agregado_id,
    payload=payload,
  )
