import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.subscriptions import repository as repo
from app.modules.subscriptions.models import EstadoSuscripcion, EstadoPagoSuscripcion
from app.modules.subscriptions.schemas import (
    PlanCreate, PlanUpdate, PlanResponse,
    SuscripcionCreate, SuscripcionUpdate, SuscripcionResponse,
    PagoSuscripcionCreate, PagoSuscripcionResponse,
  )

# ======================================
#          PLANES
# ======================================

async def listar_planes(
    solo_activos: bool, db: AsyncSession
  ) -> list[PlanResponse]:
  items = await repo.get_planes(db, solo_activos)
  return [PlanResponse.model_validate(p) for p in items]

async def crear_plan(data: PlanCreate, db: AsyncSession) -> PlanResponse:
  plan = await repo.create_plan(db, data.model_dump())
  return PlanResponse.model_validate(plan)

async def actualizar_plan(
    plan_id: uuid.UUID, data: PlanUpdate, db: AsyncSession
  ) -> PlanResponse:
  plan = await repo.get_plan_by_id(db, plan_id)
  if not plan:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan no encontrado")
  plan = await repo.update_plan(db, plan, data.model_dump(exclude_none=True))
  return PlanResponse.model_validate(plan)

# ======================================
#          SUSCRIPCIONES
# ======================================

async def listar_suscripciones(db: AsyncSession) -> list[SuscripcionResponse]:
  items = await repo.get_suscripciones(db)
  return [SuscripcionResponse.model_validate(s) for s in items]

async def obtener_suscripcion_tenant(
    tenant_id: uuid.UUID, db: AsyncSession
  ) -> SuscripcionResponse:
  suscripcion = await repo.get_suscripcion_by_tenant(db, tenant_id)
  if not suscripcion:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="No existe suscripción para este tenant"
    )
  return SuscripcionResponse.model_validate(suscripcion)

async def crear_suscripcion(
    data: SuscripcionCreate, db: AsyncSession
  ) -> SuscripcionResponse:
  # Validar que el tenant no tenga suscripción activa
  existente = await repo.get_suscripcion_by_tenant(db, data.tenant_id)
  if existente and existente.estado == EstadoSuscripcion.ACTIVA:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El tenant ya tiene una suscripción activa"
    )
  # Validar que el plan exista y esté activo
  plan = await repo.get_plan_by_id(db, data.plan_id)
  if not plan or not plan.is_activo:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Plan no encontrado o inactivo"
    )
  suscripcion = await repo.create_suscripcion(db, {
    "estado": EstadoSuscripcion.ACTIVA,
    **data.model_dump(),
  })
  return SuscripcionResponse.model_validate(suscripcion)

async def actualizar_suscripcion(
    suscripcion_id: uuid.UUID, data: SuscripcionUpdate, db: AsyncSession
  ) -> SuscripcionResponse:
  suscripcion = await repo.get_suscripcion_by_id(db, suscripcion_id)
  if not suscripcion:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suscripción no encontrada")
  if suscripcion.estado == EstadoSuscripcion.CANCELADA:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se puede modificar una suscripción cancelada"
    )
  suscripcion = await repo.update_suscripcion(db, suscripcion, data.model_dump(exclude_none=True))
  return SuscripcionResponse.model_validate(suscripcion)

async def cancelar_suscripcion(
    suscripcion_id: uuid.UUID, db: AsyncSession
  ) -> SuscripcionResponse:
  suscripcion = await repo.get_suscripcion_by_id(db, suscripcion_id)
  if not suscripcion:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suscripción no encontrada")
  if suscripcion.estado == EstadoSuscripcion.CANCELADA:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="La suscripción ya está cancelada"
    )
  suscripcion = await repo.update_suscripcion(
    db, suscripcion, {"estado": EstadoSuscripcion.CANCELADA}
  )
  return SuscripcionResponse.model_validate(suscripcion)

# ======================================
#          PAGOS SUSCRIPCIÓN
# ======================================

async def listar_pagos(
    suscripcion_id: uuid.UUID, db: AsyncSession
  ) -> list[PagoSuscripcionResponse]:
  items = await repo.get_pagos_suscripcion(db, suscripcion_id)
  return [PagoSuscripcionResponse.model_validate(p) for p in items]

async def registrar_pago(
    suscripcion_id: uuid.UUID,
    tenant_id: uuid.UUID,
    data: PagoSuscripcionCreate,
    db: AsyncSession,
  ) -> PagoSuscripcionResponse:
  suscripcion = await repo.get_suscripcion_by_id(db, suscripcion_id)
  if not suscripcion:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suscripción no encontrada")
  if suscripcion.estado == EstadoSuscripcion.CANCELADA:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se puede registrar un pago en una suscripción cancelada"
    )
  pago = await repo.create_pago_suscripcion(db, {
    "suscripcion_id": suscripcion_id,
    "tenant_id": tenant_id,
    "estado": EstadoPagoSuscripcion.PENDIENTE,
    **data.model_dump(),
  })
  return PagoSuscripcionResponse.model_validate(pago)

async def completar_pago(
    suscripcion_id: uuid.UUID, pago_id: uuid.UUID, db: AsyncSession
  ) -> PagoSuscripcionResponse:
  pago = await repo.get_pago_by_id(db, pago_id)
  if not pago or pago.suscripcion_id != suscripcion_id:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
  if pago.estado != EstadoPagoSuscripcion.PENDIENTE:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"Solo se pueden completar pagos PENDIENTES, estado actual: '{pago.estado}'"
    )
  pago = await repo.update_pago_suscripcion(
    db, pago, {"estado": EstadoPagoSuscripcion.COMPLETADO}
  )
  return PagoSuscripcionResponse.model_validate(pago)

async def fallar_pago(
    suscripcion_id: uuid.UUID, pago_id: uuid.UUID, db: AsyncSession
  ) -> PagoSuscripcionResponse:
  pago = await repo.get_pago_by_id(db, pago_id)
  if not pago or pago.suscripcion_id != suscripcion_id:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
  if pago.estado != EstadoPagoSuscripcion.PENDIENTE:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="Solo se pueden marcar como fallidos pagos PENDIENTES"
    )
  pago = await repo.update_pago_suscripcion(
    db, pago, {"estado": EstadoPagoSuscripcion.FALLIDO}
  )
  return PagoSuscripcionResponse.model_validate(pago)