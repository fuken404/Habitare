import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.billing.models import EstadoFactura
from app.modules.billing.schemas import (
    FacturaCreate, FacturaUpdate, FacturaResponse, FacturaListResponse,
    PagoCreate, PagoResponse,
  )
from app.modules.billing import service as billing_service

router = APIRouter(prefix="/billing", tags=["Facturación"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_TODOS = (TipoRol.RESIDENTE, TipoRol.RECEPCION,
                TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#   1. FACTURAS — rutas estáticas
# ======================================

@router.get("/facturas", response_model=list[FacturaListResponse])
async def listar_facturas(
    unidad_id: uuid.UUID | None = Query(default=None),
    estado: EstadoFactura | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await billing_service.listar_facturas(tenant_id, unidad_id, estado, db)

@router.post("/facturas", response_model=FacturaResponse, status_code=status.HTTP_201_CREATED)
async def crear_factura(
    body: FacturaCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await billing_service.crear_factura(tenant_id, body, db)

# ======================================
#   2. FACTURAS — rutas con /{factura_id}
# ======================================

@router.get("/facturas/{factura_id}", response_model=FacturaResponse)
async def obtener_factura(
    factura_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await billing_service.obtener_factura(factura_id, tenant_id, db)

@router.patch("/facturas/{factura_id}", response_model=FacturaResponse)
async def actualizar_factura(
    factura_id: uuid.UUID,
    body: FacturaUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Solo editable si está PENDIENTE o VENCIDA."""
  return await billing_service.actualizar_factura(factura_id, tenant_id, body, db)

@router.post("/facturas/{factura_id}/void", response_model=FacturaResponse)
async def anular_factura(
    factura_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Falla si la factura tiene pagos aprobados."""
  return await billing_service.anular_factura(factura_id, tenant_id, db)

# ======================================
#   3. PAGOS — anidados bajo /facturas/{id}
# ======================================

@router.get("/facturas/{factura_id}/pagos", response_model=list[PagoResponse])
async def listar_pagos(
    factura_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await billing_service.listar_pagos_factura(factura_id, tenant_id, db)

@router.post("/facturas/{factura_id}/pagos", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_pago(
    factura_id: uuid.UUID,
    body: PagoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Registra un pago en estado PENDIENTE.
  Un admin debe aprobarlo explícitamente vía /approve.
  """
  return await billing_service.registrar_pago(factura_id, tenant_id, body, db)

@router.post("/facturas/{factura_id}/pagos/{pago_id}/approve", response_model=PagoResponse)
async def aprobar_pago(
    factura_id: uuid.UUID,
    pago_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """Aprueba el pago y marca la factura como PAGADA automáticamente."""
  return await billing_service.aprobar_pago(factura_id, pago_id, tenant_id, db)

@router.post("/facturas/{factura_id}/pagos/{pago_id}/reject", response_model=PagoResponse)
async def rechazar_pago(
    factura_id: uuid.UUID,
    pago_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await billing_service.rechazar_pago(factura_id, pago_id, tenant_id, db)