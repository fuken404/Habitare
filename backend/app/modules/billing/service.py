import uuid
from datetime import datetime, timezone
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing import repository as repo
from app.modules.billing.models import EstadoFactura, EstadoPago
from app.modules.billing.schemas import (
    FacturaCreate, FacturaUpdate, FacturaResponse, FacturaListResponse,
    PagoCreate, PagoResponse,
    TransaccionCreate,
  )

# ======================================
#          FACTURAS
# ======================================

async def listar_facturas(
    tenant_id: uuid.UUID,
    unidad_id: uuid.UUID | None,
    estado: EstadoFactura | None,
    db: AsyncSession,
  ) -> list[FacturaListResponse]:
  items = await repo.get_facturas(db, tenant_id, unidad_id, estado)
  return [FacturaListResponse.model_validate(f) for f in items]

async def obtener_factura(
    factura_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> FacturaResponse:
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  if not factura:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
  return FacturaResponse.model_validate(factura)

async def crear_factura(
    tenant_id: uuid.UUID, data: FacturaCreate, db: AsyncSession
  ) -> FacturaResponse:
  factura = await repo.create_factura(db, {
    "tenant_id": tenant_id,
    "estado": EstadoFactura.PENDIENTE,
    **data.model_dump(),
  })
  factura = await repo.get_factura_by_id(db, factura.id, tenant_id)
  return FacturaResponse.model_validate(factura)

async def actualizar_factura(
    factura_id: uuid.UUID, tenant_id: uuid.UUID,
    data: FacturaUpdate, db: AsyncSession,
  ) -> FacturaResponse:
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  if not factura:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
  if factura.estado in (EstadoFactura.PAGADA, EstadoFactura.ANULADA):
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"No se puede editar una factura en estado '{factura.estado}'"
    )
  factura = await repo.update_factura(db, factura, data.model_dump(exclude_none=True))
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  return FacturaResponse.model_validate(factura)

async def anular_factura(
    factura_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> FacturaResponse:
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  if not factura:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
  if factura.estado == EstadoFactura.ANULADA:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="La factura ya está anulada"
    )
  pagos_aprobados = [p for p in factura.pagos if p.estado == EstadoPago.APROBADO]
  if pagos_aprobados:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se puede anular una factura con pagos aprobados"
    )
  factura = await repo.update_factura(db, factura, {"estado": EstadoFactura.ANULADA})
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  return FacturaResponse.model_validate(factura)

async def marcar_vencida(
    factura_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> FacturaResponse:
  """Llamado por un scheduler que revisa facturas vencidas diariamente."""
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  if not factura:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
  if factura.estado != EstadoFactura.PENDIENTE:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"Solo se pueden vencer facturas PENDIENTES, estado actual: '{factura.estado}'"
    )
  factura = await repo.update_factura(db, factura, {"estado": EstadoFactura.VENCIDA})
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  return FacturaResponse.model_validate(factura)

# ======================================
#          PAGOS
# ======================================

async def listar_pagos_factura(
    factura_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> list[PagoResponse]:
  items = await repo.get_pagos_factura(db, factura_id, tenant_id)
  return [PagoResponse.model_validate(p) for p in items]

async def registrar_pago(
    factura_id: uuid.UUID,
    tenant_id: uuid.UUID,
    data: PagoCreate,
    db: AsyncSession,
  ) -> PagoResponse:
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  if not factura:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
  if factura.estado in (EstadoFactura.PAGADA, EstadoFactura.ANULADA):
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"No se puede registrar un pago en una factura '{factura.estado}'"
    )
  if data.monto > Decimal(str(factura.monto_total)):
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"El monto del pago ({data.monto}) supera el total de la factura ({factura.monto_total})"
      )
  pago = await repo.create_pago(db, {
    "tenant_id": tenant_id,
    "factura_id": factura_id,
    "unidad_id": factura.unidad_id,
    "estado": EstadoPago.PENDIENTE,
    **data.model_dump(),
  })
  pago = await repo.get_pago_by_id(db, pago.id, tenant_id)
  return PagoResponse.model_validate(pago)

async def aprobar_pago(
    factura_id: uuid.UUID,
    pago_id: uuid.UUID,
    tenant_id: uuid.UUID,
    db: AsyncSession,
  ) -> PagoResponse:
  pago = await repo.get_pago_by_id(db, pago_id, tenant_id)
  if not pago or pago.factura_id != factura_id:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
  if pago.estado != EstadoPago.PENDIENTE:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"Solo se pueden aprobar pagos PENDIENTES, estado actual: '{pago.estado}'"
    )
  pago = await repo.update_pago(db, pago, {"estado": EstadoPago.APROBADO})
  # Marcar factura como PAGADA automáticamente
  factura = await repo.get_factura_by_id(db, factura_id, tenant_id)
  if factura and factura.estado != EstadoFactura.PAGADA:
    await repo.update_factura(db, factura, {"estado": EstadoFactura.PAGADA})
  pago = await repo.get_pago_by_id(db, pago_id, tenant_id)
  return PagoResponse.model_validate(pago)

async def rechazar_pago(
    factura_id: uuid.UUID,
    pago_id: uuid.UUID,
    tenant_id: uuid.UUID,
    db: AsyncSession,
) -> PagoResponse:
  pago = await repo.get_pago_by_id(db, pago_id, tenant_id)
  if not pago or pago.factura_id != factura_id:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
  if pago.estado != EstadoPago.PENDIENTE:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="Solo se pueden rechazar pagos PENDIENTES"
    )
  pago = await repo.update_pago(db, pago, {"estado": EstadoPago.RECHAZADO})
  pago = await repo.get_pago_by_id(db, pago_id, tenant_id)
  return PagoResponse.model_validate(pago)

# ======================================
#      TRANSACCIONES (uso interno)
# ======================================

async def registrar_transaccion(
    pago_id: uuid.UUID, data: TransaccionCreate, db: AsyncSession
  ) -> None:
  """
  Registra el log del gateway de pago. Append-only.
  Llamar desde el webhook del gateway externo.
  """
  await repo.create_transaccion(db, pago_id, data.model_dump())