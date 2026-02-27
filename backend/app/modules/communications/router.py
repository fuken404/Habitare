import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.communications.models import EstadoComunicado
from app.modules.communications.schemas import (
    ComunicadoCreate, ComunicadoUpdate, ComunicadoResponse, ComunicadoListResponse,
    SegmentacionCreate,
)
from app.modules.communications import service as comms_service

router = APIRouter(prefix="/communications", tags=["Comunicados"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_TODOS = (TipoRol.RESIDENTE, TipoRol.SEGURIDAD, TipoRol.RECEPCION,
                TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#   1. RUTAS ESTÁTICAS — antes de /{id}
# ======================================

@router.get("", response_model=list[ComunicadoListResponse])
async def listar_comunicados(
    estado: EstadoComunicado | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await comms_service.listar_comunicados(tenant_id, estado, db)

@router.post("", response_model=ComunicadoResponse, status_code=status.HTTP_201_CREATED)
async def crear_comunicado(
    body: ComunicadoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Crea un comunicado en estado BORRADOR con sus segmentaciones iniciales.
  Requiere al menos una segmentación.
  """
  return await comms_service.crear_comunicado(tenant_id, current_user.id, body, db)

# ======================================
#   2. RUTAS CON /{comunicado_id}
# ======================================

@router.get("/{comunicado_id}", response_model=ComunicadoResponse)
async def obtener_comunicado(
    comunicado_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await comms_service.obtener_comunicado(comunicado_id, tenant_id, db)

@router.patch("/{comunicado_id}", response_model=ComunicadoResponse)
async def actualizar_comunicado(
    comunicado_id: uuid.UUID,
    body: ComunicadoUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Solo editable en estado BORRADOR."""
  return await comms_service.actualizar_comunicado(comunicado_id, tenant_id, body, db)

@router.delete("/{comunicado_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_comunicado(
    comunicado_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """No permitido si está PUBLICADO. Archivar primero."""
  await comms_service.eliminar_comunicado(comunicado_id, tenant_id, db)

@router.post("/{comunicado_id}/publish", response_model=ComunicadoResponse)
async def publicar_comunicado(
    comunicado_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  BORRADOR → PUBLICADO. Registra fecha_publicacion.
  Falla si no tiene segmentaciones.
  """
  return await comms_service.publicar_comunicado(comunicado_id, tenant_id, db)

@router.post("/{comunicado_id}/archive", response_model=ComunicadoResponse)
async def archivar_comunicado(
    comunicado_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """BORRADOR o PUBLICADO → ARCHIVADO."""
  return await comms_service.archivar_comunicado(comunicado_id, tenant_id, db)

@router.put("/{comunicado_id}/segmentaciones", response_model=ComunicadoResponse)
async def reemplazar_segmentaciones(
    comunicado_id: uuid.UUID,
    body: list[SegmentacionCreate],
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Reemplaza todas las segmentaciones del comunicado.
  Solo en estado BORRADOR. Requiere al menos una segmentación.
  """
  return await comms_service.reemplazar_segmentaciones(comunicado_id, tenant_id, body, db)