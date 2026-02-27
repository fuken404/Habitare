
import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.events import repository as repo
from app.modules.events.models import EstadoEvento

logger = logging.getLogger(__name__)

MAX_INTENTOS = 3

async def procesar_outbox(db: AsyncSession) -> None:
  """
  Procesa hasta 50 eventos pendientes por ciclo.
  Para cada evento llama a _publicar_en_pubsub().
  En caso de error incrementa intentos; tras MAX_INTENTOS lo deja en FALLIDO definitivo.
  """
  pendientes = await repo.get_pendientes(db, limite=50)
  for evento in pendientes:
    try:
      await _publicar_en_pubsub(evento)
      await repo.marcar_procesado(db, evento)
      logger.info(f"[outbox] Evento procesado: {evento.tipo_evento} / {evento.id}")
    except Exception as exc:
      error_msg = str(exc)
      logger.error(f"[outbox] Error procesando {evento.id}: {error_msg}")
      await repo.marcar_fallido(db, evento, error_msg)
  # Reintentar fallidos con intentos restantes
  fallidos = await repo.get_fallidos(db, max_intentos=MAX_INTENTOS)
  for evento in fallidos:
    try:
      await _publicar_en_pubsub(evento)
      await repo.marcar_procesado(db, evento)
    except Exception as exc:
      await repo.marcar_fallido(db, evento, str(exc))
  await db.commit()

async def _publicar_en_pubsub(evento) -> None:
  """
  Stub de publicación a GCP Pub/Sub.
  Reemplazar con el cliente real de google-cloud-pubsub.
  from google.cloud import pubsub_v1
  publisher = pubsub_v1.PublisherClient()
  topic_path = publisher.topic_path(GCP_PROJECT_ID, evento.tipo_evento.replace(".", "-"))
  data = evento.payload.encode("utf-8")
  publisher.publish(topic_path, data=data, tenant_id=str(evento.tenant_id))
  """
  payload = json.loads(evento.payload)
  logger.debug(
    f"[pubsub:stub] tipo={evento.tipo_evento} "
    f"agregado={evento.agregado_tipo}:{evento.agregado_id} "
    f"payload={payload}"
  )
