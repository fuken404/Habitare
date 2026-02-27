import uuid
from datetime import datetime
from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.audit import repository as repo
from app.modules.audit.schemas import (
    MinutaCreate, MinutaResponse,
    ArchivoCreate, ArchivoResponse, ArchivoListResponse,
  )

# ======================================
#   API INTERNA — MinutaSistema
# ======================================

async def registrar_accion(
    tenant_id: uuid.UUID,
    data: MinutaCreate,
    db: AsyncSession,
  ) -> None:
  """
  Registra una acción de auditoría. Append-only, sin retorno al caller.
  Uso desde cualquier service:
    await audit_service.registrar_accion(
      tenant_id,
      MinutaCreate(
        usuario_id=current_user.id,
        accion="paquete.entregado",
        entidad_tipo="Paquete",
        entidad_id=paquete.id,
        detalles=f"Entregado a {receptor}",
        ip_address=request.client.host,
      ),
      db,
    )
  """
  await repo.create_minuta(db, {"tenant_id": tenant_id, **data.model_dump()})

# ======================================
#   API PÚBLICA — Consulta minutas
# ======================================

async def listar_minutas(
    tenant_id: uuid.UUID,
    entidad_tipo: str | None,
    entidad_id: uuid.UUID | None,
    usuario_id: uuid.UUID | None,
    desde: datetime | None,
    hasta: datetime | None,
    limite: int,
    db: AsyncSession,
  ) -> list[MinutaResponse]:
  items = await repo.get_minutas(
    db, tenant_id, entidad_tipo, entidad_id,
    usuario_id, desde, hasta, limite
  )
  return [MinutaResponse.model_validate(m) for m in items]

# ======================================
#   API INTERNA + PÚBLICA — Archivos
# ======================================

async def registrar_archivo(
    tenant_id: uuid.UUID,
    data: ArchivoCreate,
    db: AsyncSession,
  ) -> ArchivoResponse:
  """
  Registra un archivo ya subido a GCS.
  El caller es responsable de subir primero el binario a GCS
  y luego llamar este método con la ruta resultante.
  """
  archivo = await repo.create_archivo(db, {"tenant_id": tenant_id, **data.model_dump()})
  return ArchivoResponse.model_validate(archivo)

async def listar_archivos_entidad(
    tenant_id: uuid.UUID,
    entidad_tipo: str,
    entidad_id: uuid.UUID,
    db: AsyncSession,
  ) -> list[ArchivoListResponse]:
  items = await repo.get_archivos_entidad(db, tenant_id, entidad_tipo, entidad_id)
  return [ArchivoListResponse.model_validate(a) for a in items]

async def eliminar_archivo(
    archivo_id: uuid.UUID,
    tenant_id: uuid.UUID,
    db: AsyncSession,
  ) -> None:
  archivo = await repo.get_archivo_by_id(db, archivo_id, tenant_id)
  if not archivo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado")
  if archivo.eliminado:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El archivo ya fue eliminado"
    )
  await repo.soft_delete_archivo(db, archivo)