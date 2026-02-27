import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.subscriptions.schemas import (
    PlanCreate, PlanUpdate, PlanResponse,
    SuscripcionCreate, SuscripcionUpdate, SuscripcionResponse,
    PagoSuscripcionCreate, PagoSuscripcionResponse,
)
from app.modules.subscriptions import service as sub_service

router = APIRouter(prefix="/subscriptions", tags=["Suscripciones"])

_SUPERADMIN  = (TipoRol.SUPERADMIN,)
_ADMIN_UP    = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#   1. PLANES (catálogo — SUPERADMIN)
# ======================================

@router.get("/plans", response_model=list[PlanResponse])
async def listar_planes(
    solo_activos: bool = Query(default=True),
    _: MeResponse = Depends(require_roles(*_ADMIN_UP)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.listar_planes(solo_activos, db)

@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def crear_plan(
    body: PlanCreate,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.crear_plan(body, db)

@router.patch("/plans/{plan_id}", response_model=PlanResponse)
async def actualizar_plan(
    plan_id: uuid.UUID,
    body: PlanUpdate,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.actualizar_plan(plan_id, body, db)

# ======================================
#   2. SUSCRIPCIONES (SUPERADMIN)
# ======================================

@router.get("", response_model=list[SuscripcionResponse])
async def listar_suscripciones(
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Lista todas las suscripciones de la plataforma."""
  return await sub_service.listar_suscripciones(db)

@router.get("/me", response_model=SuscripcionResponse)
async def obtener_mi_suscripcion(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ADMIN_UP)),
    db: AsyncSession = Depends(get_db),
  ):
  """El admin del conjunto consulta la suscripción de su propio tenant."""
  return await sub_service.obtener_suscripcion_tenant(tenant_id, db)

@router.post("", response_model=SuscripcionResponse, status_code=status.HTTP_201_CREATED)
async def crear_suscripcion(
    body: SuscripcionCreate,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.crear_suscripcion(body, db)

@router.patch("/{suscripcion_id}", response_model=SuscripcionResponse)
async def actualizar_suscripcion(
    suscripcion_id: uuid.UUID,
    body: SuscripcionUpdate,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.actualizar_suscripcion(suscripcion_id, body, db)

@router.post("/{suscripcion_id}/cancel", response_model=SuscripcionResponse)
async def cancelar_suscripcion(
    suscripcion_id: uuid.UUID,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Cancela la suscripción permanentemente. Acción irreversible."""
  return await sub_service.cancelar_suscripcion(suscripcion_id, db)

# ======================================
#   3. PAGOS SUSCRIPCIÓN
# ======================================

@router.get("/{suscripcion_id}/payments", response_model=list[PagoSuscripcionResponse])
async def listar_pagos(
    suscripcion_id: uuid.UUID,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.listar_pagos(suscripcion_id, db)

@router.post("/{suscripcion_id}/payments", response_model=PagoSuscripcionResponse, status_code=status.HTTP_201_CREATED)
async def registrar_pago(
    suscripcion_id: uuid.UUID,
    body: PagoSuscripcionCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.registrar_pago(suscripcion_id, tenant_id, body, db)

@router.post("/{suscripcion_id}/payments/{pago_id}/complete", response_model=PagoSuscripcionResponse)
async def completar_pago(
    suscripcion_id: uuid.UUID,
    pago_id: uuid.UUID,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.completar_pago(suscripcion_id, pago_id, db)

@router.post("/{suscripcion_id}/payments/{pago_id}/fail", response_model=PagoSuscripcionResponse)
async def fallar_pago(
    suscripcion_id: uuid.UUID,
    pago_id: uuid.UUID,
    _: MeResponse = Depends(require_roles(*_SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await sub_service.fallar_pago(suscripcion_id, pago_id, db)