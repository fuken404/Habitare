import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.common_areas.models import EstadoReserva
from app.modules.common_areas.schemas import (
    ZonaComunCreate, ZonaComunUpdate, ZonaComunResponse, ZonaComunListResponse,
    HorarioCreate,
    ReservaCreate, ReservaUpdate, ReservaResponse, ReservaListResponse,
  )
from app.modules.common_areas import service as common_service

router = APIRouter(prefix="/common-areas", tags=["Zonas Comunes"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_TODOS = (TipoRol.RESIDENTE, TipoRol.SEGURIDAD, TipoRol.RECEPCION,
                TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#   1. ZONAS — rutas sin parámetro
# ======================================

@router.get("", response_model=list[ZonaComunListResponse])
async def listar_zonas(
    todas: bool = Query(default=False, description="Incluir zonas inactivas"),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await common_service.listar_zonas(tenant_id, db, solo_activas=not todas)

@router.post("", response_model=ZonaComunResponse, status_code=status.HTTP_201_CREATED)
async def crear_zona(
    body: ZonaComunCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await common_service.crear_zona(tenant_id, body, db)

# ======================================
#   2. RESERVAS — rutas estáticas
#      DEBEN ir ANTES de /{zona_id}
# ======================================

@router.get("/reservas", response_model=list[ReservaListResponse])
async def listar_reservas(
    zona_id: uuid.UUID | None = Query(default=None),
    estado: EstadoReserva | None = Query(default=None),
    fecha: date | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await common_service.listar_reservas(tenant_id, zona_id, estado, fecha, db)

@router.post("/reservas", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
async def crear_reserva(
    body: ReservaCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Crea una reserva. Si la zona requiere aprobación queda en PENDIENTE,
  si no, se confirma automáticamente.
  Valida: zona activa, horario del día, capacidad y solapamiento.
  """
  return await common_service.crear_reserva(tenant_id, current_user.id, body, db)

@router.get("/reservas/{reserva_id}", response_model=ReservaResponse)
async def obtener_reserva(
    reserva_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await common_service.obtener_reserva(reserva_id, tenant_id, db)

@router.patch("/reservas/{reserva_id}", response_model=ReservaResponse)
async def actualizar_reserva(
    reserva_id: uuid.UUID,
    body: ReservaUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Admin: PENDIENTE → CONFIRMADA / CANCELADA; CONFIRMADA → COMPLETADA / CANCELADA.
  Residente: solo puede CANCELAR su propia reserva.
  """
  return await common_service.actualizar_reserva(
    reserva_id, tenant_id, current_user.id, current_user.rol, body, db
  )

@router.delete("/reservas/{reserva_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancelar_reserva(
    reserva_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """Cancela directamente sin necesidad de enviar body."""
  await common_service.cancelar_reserva(
    reserva_id, tenant_id, current_user.id, current_user.rol, db
  )

# ======================================
#   3. ZONAS — rutas con /{zona_id}
#      DEBEN ir DESPUÉS de /reservas
# ======================================

@router.get("/{zona_id}", response_model=ZonaComunResponse)
async def obtener_zona(
    zona_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await common_service.obtener_zona(zona_id, tenant_id, db)

@router.patch("/{zona_id}", response_model=ZonaComunResponse)
async def actualizar_zona(
    zona_id: uuid.UUID,
    body: ZonaComunUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await common_service.actualizar_zona(zona_id, tenant_id, body, db)

@router.delete("/{zona_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_zona(
    zona_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await common_service.eliminar_zona(zona_id, tenant_id, db)

@router.post("/{zona_id}/horarios", response_model=ZonaComunResponse, status_code=status.HTTP_201_CREATED)
async def agregar_horario(
    zona_id: uuid.UUID,
    body: HorarioCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Agrega disponibilidad a la zona para un día de la semana.
  Máximo un horario por día. Para modificar: eliminar y volver a crear.
  """
  return await common_service.agregar_horario(zona_id, tenant_id, body, db)

@router.delete("/{zona_id}/horarios/{horario_id}", response_model=ZonaComunResponse)
async def eliminar_horario(
    zona_id: uuid.UUID,
    horario_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await common_service.eliminar_horario(zona_id, horario_id, tenant_id, db)