import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.communications import repository as repo
from app.modules.communications.models import EstadoComunicado
from app.modules.communications.schemas import (
    ComunicadoCreate, ComunicadoUpdate, ComunicadoResponse, ComunicadoListResponse,
    SegmentacionCreate, SegmentacionResponse,
)

_ESTADOS_FINALES = {EstadoComunicado.ARCHIVADO}

# ======================================
#          COMUNICADOS
# ======================================

async def listar_comunicados(
    tenant_id: uuid.UUID,
    estado: EstadoComunicado | None,
    db: AsyncSession,
  ) -> list[ComunicadoListResponse]:
  items = await repo.get_comunicados(db, tenant_id, estado)
  return [ComunicadoListResponse.from_orm_comunicado(c) for c in items]

async def obtener_comunicado(
    comunicado_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> ComunicadoResponse:
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  if not comunicado:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado")
  return ComunicadoResponse.model_validate(comunicado)

async def crear_comunicado(
    tenant_id: uuid.UUID,
    autor_id: uuid.UUID,
    data: ComunicadoCreate,
    db: AsyncSession,
  ) -> ComunicadoResponse:
  comunicado = await repo.create_comunicado(db, {
    "tenant_id": tenant_id,
    "autor_id": autor_id,
    "titulo": data.titulo,
    "contenido": data.contenido,
    "tipo": data.tipo,
    "estado": EstadoComunicado.BORRADOR,
  })
  for seg in data.segmentaciones:
    await repo.create_segmentacion(db, comunicado.id, seg.model_dump())
  comunicado = await repo.get_comunicado_by_id(db, comunicado.id, tenant_id)
  return ComunicadoResponse.model_validate(comunicado)

async def actualizar_comunicado(
    comunicado_id: uuid.UUID,
    tenant_id: uuid.UUID,
    data: ComunicadoUpdate,
    db: AsyncSession,
  ) -> ComunicadoResponse:
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  if not comunicado:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado")
  if comunicado.estado != EstadoComunicado.BORRADOR:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="Solo se pueden editar comunicados en estado BORRADOR"
    )
  comunicado = await repo.update_comunicado(db, comunicado, data.model_dump(exclude_none=True))
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  return ComunicadoResponse.model_validate(comunicado)

async def publicar_comunicado(
    comunicado_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> ComunicadoResponse:
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  if not comunicado:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado")
  if comunicado.estado != EstadoComunicado.BORRADOR:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"No se puede publicar un comunicado en estado '{comunicado.estado}'"
    )
  if not comunicado.segmentaciones:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="El comunicado debe tener al menos una segmentación antes de publicarse"
      )
  comunicado = await repo.update_comunicado(db, comunicado, {
    "estado": EstadoComunicado.PUBLICADO,
    "fecha_publicacion": datetime.now(),
  })
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  return ComunicadoResponse.model_validate(comunicado)

async def archivar_comunicado(
    comunicado_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> ComunicadoResponse:
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  if not comunicado:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado")
  if comunicado.estado == EstadoComunicado.ARCHIVADO:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El comunicado ya está archivado"
    )
  comunicado = await repo.update_comunicado(db, comunicado, {
    "estado": EstadoComunicado.ARCHIVADO,
  })
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  return ComunicadoResponse.model_validate(comunicado)

async def eliminar_comunicado(
    comunicado_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  if not comunicado:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado")
  if comunicado.estado == EstadoComunicado.PUBLICADO:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se puede eliminar un comunicado PUBLICADO — archívalo primero"
    )
  await repo.delete_comunicado(db, comunicado)

# ======================================
#          SEGMENTACIONES
# ======================================

async def reemplazar_segmentaciones(
    comunicado_id: uuid.UUID,
    tenant_id: uuid.UUID,
    segmentaciones: list[SegmentacionCreate],
    db: AsyncSession,
  ) -> ComunicadoResponse:
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  if not comunicado:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado")
  if comunicado.estado != EstadoComunicado.BORRADOR:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="Solo se pueden modificar segmentaciones de comunicados en BORRADOR"
    )
  if not segmentaciones:
    raise HTTPException(
      status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
      detail="Debe incluir al menos una segmentación"
    )
  await repo.delete_segmentaciones(db, comunicado_id)
  for seg in segmentaciones:
    await repo.create_segmentacion(db, comunicado_id, seg.model_dump())
  comunicado = await repo.get_comunicado_by_id(db, comunicado_id, tenant_id)
  return ComunicadoResponse.model_validate(comunicado)
