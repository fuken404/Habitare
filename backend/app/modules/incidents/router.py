import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.incidents.models import EstadoIncidente
from app.modules.incidents.schemas import (
    TipoIncidenteCreate, TipoIncidenteUpdate, TipoIncidenteResponse,
    IncidenteCreate, IncidenteUpdate, IncidenteResponse, IncidenteListResponse,
    ActualizacionCreate, ActualizacionResponse,
  )
from app.modules.incidents import service as incidents_service

router = APIRouter(prefix="/incidents", tags=["Incidentes"])

_ROLES_ADMIN   = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_REPORTE = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN, TipoRol.RESIDENTE)

# ======================================
#         TIPOS DE INCIDENTE
# ======================================

@router.get("/tipos", response_model=list[TipoIncidenteResponse])
async def listar_tipos(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_REPORTE)),
    db: AsyncSession = Depends(get_db),
  ):
  return await incidents_service.listar_tipos(tenant_id, db)

@router.post("/tipos", response_model=TipoIncidenteResponse, status_code=status.HTTP_201_CREATED)
async def crear_tipo(
    body: TipoIncidenteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await incidents_service.crear_tipo(tenant_id, body, db)

@router.patch("/tipos/{tipo_id}", response_model=TipoIncidenteResponse)
async def actualizar_tipo(
    tipo_id: uuid.UUID,
    body: TipoIncidenteUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await incidents_service.actualizar_tipo(tipo_id, tenant_id, body, db)

@router.delete("/tipos/{tipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_tipo(
    tipo_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await incidents_service.eliminar_tipo(tipo_id, tenant_id, db)

# ======================================
#             INCIDENTES
# ======================================

@router.get("", response_model=list[IncidenteListResponse])
async def listar_incidentes(
    estado: EstadoIncidente | None = Query(default=None),
    unidad_id: uuid.UUID | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_REPORTE)),
    db: AsyncSession = Depends(get_db),
  ):
  # Si el usuario es RESIDENTE, forzar filtro a su propia unidad
  effective_unidad_id = unidad_id
  if current_user.rol == TipoRol.RESIDENTE and current_user.unidad_id is not None:
    effective_unidad_id = current_user.unidad_id
  # Para SEGURIDAD, excluir incidentes cerrados/resueltos
  excluir_cerrados = current_user.rol == TipoRol.SEGURIDAD
  return await incidents_service.listar_incidentes(tenant_id, estado, effective_unidad_id, db, excluir_cerrados)

@router.get("/{incidente_id}", response_model=IncidenteResponse)
async def obtener_incidente(
    incidente_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_REPORTE)),
    db: AsyncSession = Depends(get_db),
  ):
  return await incidents_service.obtener_incidente(incidente_id, tenant_id, db)

@router.post("", response_model=IncidenteResponse, status_code=status.HTTP_201_CREATED)
async def crear_incidente(
    body: IncidenteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_REPORTE)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Reporta un nuevo incidente. Se registra automáticamente en estado REPORTADO
  y se crea la primera entrada en la bitácora.
  """
  return await incidents_service.crear_incidente(tenant_id, current_user.id, body, db)

@router.patch("/{incidente_id}", response_model=IncidenteResponse)
async def actualizar_incidente(
    incidente_id: uuid.UUID,
    body: IncidenteUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_REPORTE)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Actualiza datos o estado del incidente. Los cambios de estado
  siguen un flujo validado: REPORTADO → EN_ATENCION → RESUELTO → CERRADO.
  Cada cambio de estado queda registrado automáticamente en la bitácora.
  """
  return await incidents_service.actualizar_incidente(
    incidente_id, tenant_id, current_user.id, body, db
  )

# ======================================
#        BITÁCORA / ACTUALIZACIONES
# ======================================

@router.post("/{incidente_id}/actualizaciones", response_model=ActualizacionResponse, status_code=status.HTTP_201_CREATED)
async def agregar_actualizacion(
    incidente_id: uuid.UUID,
    body: ActualizacionCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_REPORTE)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Agrega una nota manual a la bitácora del incidente.
  No permitido sobre incidentes en estado CERRADO.
  """
  return await incidents_service.agregar_actualizacion(
    incidente_id, tenant_id, current_user.id, body, db
  )