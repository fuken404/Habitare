import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import get_current_user, require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.trasteos.models import EstadoTrasteo
from app.modules.trasteos.schemas import TrasteoCreate, TrasteoUpdate, TrasteoResponse
from app.modules.trasteos import service as trasteos_service

router = APIRouter(prefix="/trasteos", tags=["Trasteos"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_CONSULTA = (TipoRol.ADMINISTRACION, TipoRol.RECEPCION, TipoRol.SEGURIDAD, TipoRol.SUPERADMIN)


@router.get("", response_model=list[TrasteoResponse])
async def listar_trasteos(
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(*_ROLES_CONSULTA)),
  db: AsyncSession = Depends(get_db),
  fecha: date | None = Query(default=None),
  estado: EstadoTrasteo | None = Query(default=None),
):
  return await trasteos_service.listar_trasteos(tenant_id, db, fecha, estado)


@router.post("", response_model=TrasteoResponse, status_code=201)
async def crear_trasteo(
  body: TrasteoCreate,
  current_user: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  db: AsyncSession = Depends(get_db),
):
  return await trasteos_service.crear_trasteo(body, current_user.id, tenant_id, db)


@router.patch("/{trasteo_id}", response_model=TrasteoResponse)
async def actualizar_trasteo(
  trasteo_id: uuid.UUID,
  body: TrasteoUpdate,
  _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  db: AsyncSession = Depends(get_db),
):
  return await trasteos_service.actualizar_trasteo(trasteo_id, body, tenant_id, db)
