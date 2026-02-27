import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.shifts.schemas import (
    TurnoCreate, TurnoUpdate, TurnoResponse, TurnoListResponse,
  )
from app.modules.shifts import service as shifts_service

router = APIRouter(prefix="/shifts", tags=["Turnos"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_STAFF = (TipoRol.SEGURIDAD, TipoRol.RECEPCION,
                TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

@router.get("", response_model=list[TurnoListResponse])
async def listar_turnos(
    usuario_id: uuid.UUID | None = Query(default=None),
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_STAFF)),
    db: AsyncSession = Depends(get_db),
  ):
  return await shifts_service.listar_turnos(tenant_id, usuario_id, desde, hasta, db)

@router.get("/{turno_id}", response_model=TurnoResponse)
async def obtener_turno(
    turno_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_STAFF)),
    db: AsyncSession = Depends(get_db),
  ):
  return await shifts_service.obtener_turno(turno_id, tenant_id, db)

@router.post("", response_model=TurnoResponse, status_code=status.HTTP_201_CREATED)
async def crear_turno(
    body: TurnoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Crea un turno para un usuario de staff.
  Valida solapamiento con otros turnos del mismo usuario.
  """
  return await shifts_service.crear_turno(tenant_id, body, db)

@router.patch("/{turno_id}", response_model=TurnoResponse)
async def actualizar_turno(
    turno_id: uuid.UUID,
    body: TurnoUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await shifts_service.actualizar_turno(turno_id, tenant_id, body, db)

@router.delete("/{turno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_turno(
    turno_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await shifts_service.eliminar_turno(turno_id, tenant_id, db)