import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import get_current_user, require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.packages.models import EstadoPaquete
from app.modules.packages.schemas import (
    PaqueteCreate, PaqueteResponse, PaqueteListResponse
  )
from app.modules.packages import service as packages_service

router = APIRouter(prefix="/paquetes", tags=["Paquetería"])

_ROLES_OPERACION = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN, TipoRol.RESIDENTE)

@router.get("", response_model=list[PaqueteListResponse])
async def listar_paquetes(
    estado: EstadoPaquete | None = Query(default=None, description="Filtrar por estado"),
    unidad_id: uuid.UUID | None = Query(default=None, description="Filtrar por unidad"),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await packages_service.listar_paquetes(tenant_id, estado, unidad_id, db)

@router.get("/{paquete_id}", response_model=PaqueteResponse)
async def obtener_paquete(
    paquete_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await packages_service.obtener_paquete(paquete_id, tenant_id, db)

@router.post("", response_model=PaqueteResponse, status_code=status.HTTP_201_CREATED)
async def registrar_paquete(
    body: PaqueteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Registra la llegada de un paquete para una unidad.
  Queda en estado PENDIENTE hasta que el residente lo retire.
  """
  return await packages_service.registrar_paquete(
    tenant_id, current_user.id, body, db
  )

@router.patch("/{paquete_id}/entregar", response_model=PaqueteResponse)
async def entregar_paquete(
    paquete_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Solo aplica sobre paquetes en estado PENDIENTE.
  Marca el paquete como RETIRADO. Registra quién lo entregó y a qué hora.
  """
  return await packages_service.entregar_paquete(
    paquete_id, tenant_id, current_user.id, db
  )