import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.visitor_parking.schemas import (
    ParqueaderoVisitanteCreate, ParqueaderoVisitanteResponse
  )
from app.modules.visitor_parking import service as vp_service

router = APIRouter(prefix="/parqueadero-visitantes", tags=["Parqueadero Visitantes"])

_ROLES_OPERACION = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

@router.get("", response_model=list[ParqueaderoVisitanteResponse])
async def listar_activos(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.listar_activos(tenant_id, db)

@router.post("", response_model=ParqueaderoVisitanteResponse, status_code=status.HTTP_201_CREATED)
async def asignar(
    body: ParqueaderoVisitanteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.asignar(tenant_id, body, db)

@router.patch("/{pv_id}/liberar", response_model=ParqueaderoVisitanteResponse)
async def liberar(
    pv_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.liberar(pv_id, tenant_id, db)