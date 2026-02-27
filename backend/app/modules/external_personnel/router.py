import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.external_personnel.models import TipoPersonalExterno
from app.modules.external_personnel.schemas import (
    IngresoExternoCreate, IngresoExternoUpdate, SalidaExternoRequest,
    IngresoExternoResponse, IngresoExternoListResponse,
  )
from app.modules.external_personnel import service as ext_service

router = APIRouter(prefix="/external-personnel", tags=["Personal Externo"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_STAFF = (TipoRol.SEGURIDAD, TipoRol.RECEPCION,
                TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

@router.get("", response_model=list[IngresoExternoListResponse])
async def listar_ingresos(
    activos: bool | None = Query(default=None, description="true=sin salida, false=con salida"),
    tipo_personal: TipoPersonalExterno | None = Query(default=None),
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_STAFF)),
    db: AsyncSession = Depends(get_db),
  ):
  return await ext_service.listar_ingresos(tenant_id, activos, tipo_personal, desde, hasta, db)

@router.get("/{ingreso_id}", response_model=IngresoExternoResponse)
async def obtener_ingreso(
    ingreso_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_STAFF)),
    db: AsyncSession = Depends(get_db),
  ):
  return await ext_service.obtener_ingreso(ingreso_id, tenant_id, db)

@router.post("", response_model=IngresoExternoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_ingreso(
    body: IngresoExternoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_STAFF)),
    db: AsyncSession = Depends(get_db),
  ):
  return await ext_service.registrar_ingreso(tenant_id, current_user.id, body, db)

@router.patch("/{ingreso_id}", response_model=IngresoExternoResponse)
async def actualizar_ingreso(
    ingreso_id: uuid.UUID,
    body: IngresoExternoUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_STAFF)),
    db: AsyncSession = Depends(get_db),
  ):
  """Edita empresa, motivo u observaciones. No modifica fechas."""
  return await ext_service.actualizar_ingreso(ingreso_id, tenant_id, body, db)

@router.post("/{ingreso_id}/checkout", response_model=IngresoExternoResponse)
async def registrar_salida(
    ingreso_id: uuid.UUID,
    body: SalidaExternoRequest,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_STAFF)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Registra la salida del personal externo.
  Falla si la salida ya fue registrada previamente.
  """
  return await ext_service.registrar_salida(ingreso_id, tenant_id, body, db)