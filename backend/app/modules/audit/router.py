import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.audit.schemas import (
    MinutaResponse, ArchivoResponse, ArchivoListResponse
  )
from app.modules.audit import service as audit_service

router = APIRouter(prefix="/audit", tags=["Auditoría"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_TODOS = (TipoRol.RESIDENTE, TipoRol.SEGURIDAD, TipoRol.RECEPCION,
                TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#          MINUTAS — solo lectura
# ======================================

@router.get("/logs", response_model=list[MinutaResponse])
async def listar_minutas(
    entidad_tipo: str | None = Query(default=None),
    entidad_id: uuid.UUID | None = Query(default=None),
    usuario_id: uuid.UUID | None = Query(default=None),
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    limite: int = Query(default=100, le=500),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Log de auditoría del conjunto. Solo accesible por admins.
  Filtrable por entidad, usuario y rango de fechas.
  """
  return await audit_service.listar_minutas(
    tenant_id, entidad_tipo, entidad_id,
    usuario_id, desde, hasta, limite, db
  )

# ======================================
#          ARCHIVOS
# ======================================

@router.get("/files", response_model=list[ArchivoListResponse])
async def listar_archivos_entidad(
    entidad_tipo: str = Query(...),
    entidad_id: uuid.UUID = Query(...),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
):
  """
  Lista los archivos adjuntos de una entidad específica.
  Ej: ?entidad_tipo=pqrs&entidad_id=<uuid>
  """
  return await audit_service.listar_archivos_entidad(
    tenant_id, entidad_tipo, entidad_id, db
  )

@router.delete("/files/{archivo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_archivo(
    archivo_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Soft-delete — el registro persiste, solo se marca como eliminado."""
  await audit_service.eliminar_archivo(archivo_id, tenant_id, db)
