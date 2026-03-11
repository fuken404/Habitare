import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import get_current_user, require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.visitors.schemas import (
  AutorizacionCreate, AutorizacionUpdate, AutorizacionResponse,
  IngresoCreate, IngresoResponse,
)
from app.modules.visitors import service as visitors_service

router = APIRouter(prefix="/visitors", tags=["Visitantes"])

_ROLES_OPERACION = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN, TipoRol.RESIDENTE)
_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#         AUTORIZACIONES DE VISITA
# ======================================

@router.get("/autorizaciones", response_model=list[AutorizacionResponse])
async def listar_autorizaciones(
    fecha: date | None = Query(default=None, description="Filtrar por fecha (YYYY-MM-DD)"),
    unidad_id: uuid.UUID | None = Query(default=None, description="Filtrar por unidad"),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  # Si el usuario es RESIDENTE, forzar filtro a su propia unidad
  effective_unidad_id = unidad_id
  if current_user.rol == TipoRol.RESIDENTE and current_user.unidad_id is not None:
    effective_unidad_id = current_user.unidad_id
  return await visitors_service.listar_autorizaciones(tenant_id, fecha, db, effective_unidad_id)

@router.get("/autorizaciones/{autorizacion_id}", response_model=AutorizacionResponse)
async def obtener_autorizacion(
    autorizacion_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await visitors_service.obtener_autorizacion(autorizacion_id, tenant_id, db)

@router.post("/autorizaciones", response_model=AutorizacionResponse, status_code=status.HTTP_201_CREATED)
async def crear_autorizacion(
    body: AutorizacionCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Crea una autorización de visita. Si el visitante ya existe por número de
  documento, lo reutiliza. Registra vehículos si aplica.
  """
  return await visitors_service.crear_autorizacion(
    tenant_id, current_user.id, body, db
  )

@router.patch("/autorizaciones/{autorizacion_id}", response_model=AutorizacionResponse)
async def actualizar_autorizacion(
    autorizacion_id: uuid.UUID,
    body: AutorizacionUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await visitors_service.actualizar_autorizacion(autorizacion_id, tenant_id, body, db)

@router.delete("/autorizaciones/{autorizacion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancelar_autorizacion(
    autorizacion_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  await visitors_service.cancelar_autorizacion(autorizacion_id, tenant_id, db)

# ======================================
#           INGRESOS DE VISITA
# ======================================

@router.get("/ingresos", response_model=list[IngresoResponse])
async def listar_ingresos(
    fecha: date | None = Query(default=None, description="Filtrar por fecha (YYYY-MM-DD)"),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await visitors_service.listar_ingresos(tenant_id, fecha, db)

@router.post("/ingresos", response_model=IngresoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_ingreso(
    body: IngresoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Registra el ingreso físico de un visitante. Busca automáticamente
  si tiene autorización activa para hoy y la marca como utilizada.
  """
  return await visitors_service.registrar_ingreso(
    tenant_id, current_user.id, body, db
  )
