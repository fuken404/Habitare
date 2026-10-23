import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import get_current_user, require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.appointments.models import EstadoCita
from app.modules.appointments.schemas import (
  DisponibilidadCreate, DisponibilidadResponse,
  CitaCreate, CitaUpdate, CitaResponse,
)
from app.modules.appointments import service as appointments_service

router = APIRouter(prefix="/citas", tags=["Citas Admin"])

_ROLES_ADMIN    = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_TODOS    = (TipoRol.RESIDENTE, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)


@router.get("/disponibilidad", response_model=list[DisponibilidadResponse])
async def listar_disponibilidades(
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
  db: AsyncSession = Depends(get_db),
  fecha: date | None = Query(default=None),
  solo_futuras: bool = Query(default=False),
):
  return await appointments_service.listar_disponibilidades(tenant_id, db, fecha, solo_futuras)


@router.post("/disponibilidad", response_model=DisponibilidadResponse, status_code=201)
async def crear_disponibilidad(
  body: DisponibilidadCreate,
  current_user: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  db: AsyncSession = Depends(get_db),
):
  return await appointments_service.crear_disponibilidad(body, current_user.id, tenant_id, db)


@router.get("", response_model=list[CitaResponse])
async def listar_citas(
  current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  db: AsyncSession = Depends(get_db),
  estado: EstadoCita | None = Query(default=None),
):
  # Residentes solo ven sus propias citas
  residente_id = current_user.id if current_user.rol == TipoRol.RESIDENTE.value else None
  return await appointments_service.listar_citas(tenant_id, db, residente_id, estado)


@router.post("", response_model=CitaResponse, status_code=201)
async def solicitar_cita(
  body: CitaCreate,
  current_user: MeResponse = Depends(require_roles(TipoRol.RESIDENTE)),
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  db: AsyncSession = Depends(get_db),
):
  unidad_id = current_user.unidad_id if hasattr(current_user, "unidad_id") else None
  return await appointments_service.solicitar_cita(body, current_user.id, tenant_id, db, unidad_id)


@router.patch("/{cita_id}", response_model=CitaResponse)
async def actualizar_cita(
  cita_id: uuid.UUID,
  body: CitaUpdate,
  _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  db: AsyncSession = Depends(get_db),
):
  return await appointments_service.actualizar_cita(cita_id, body, tenant_id, db)
