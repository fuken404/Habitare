import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.parking.schemas import (
    ConfigParqueaderoResponse, ConfigParqueaderoUpdate,
    ParqueaderoCreate, ParqueaderoUpdate, ParqueaderoResponse,
    ParqueaderoEstadoResponse,
    VehiculoResidenteCreate, VehiculoResidenteUpdate, VehiculoResidenteResponse,
    AsignacionCreate, AsignacionResponse,
    SorteoCreate, ParticipacionCreate, SorteoResponse,
    SorteoActivoResponse, InscripcionSorteoCreate,
  )
from app.modules.parking import service as parking_service

router = APIRouter(prefix="/parking", tags=["Parqueaderos"])

_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_OPERACION = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_TODOS = (TipoRol.RESIDENTE, TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#         CONFIGURACIÓN
# ======================================

@router.get("/config", response_model=ConfigParqueaderoResponse)
async def obtener_config(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.get_config(tenant_id, db)

@router.patch("/config", response_model=ConfigParqueaderoResponse)
async def actualizar_config(
    body: ConfigParqueaderoUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.update_config(tenant_id, body, db)

# ======================================
#         PARQUEADEROS
# ======================================

@router.get("/estado", response_model=list[ParqueaderoEstadoResponse])
async def estado_parqueaderos(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.estado_parqueaderos(tenant_id, db)

@router.get("/parqueaderos", response_model=list[ParqueaderoResponse])
async def listar_parqueaderos(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.listar_parqueaderos(tenant_id, db)

@router.post("/parqueaderos", response_model=ParqueaderoResponse, status_code=status.HTTP_201_CREATED)
async def crear_parqueadero(
    body: ParqueaderoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.crear_parqueadero(tenant_id, body, db)

@router.patch("/parqueaderos/{parqueadero_id}", response_model=ParqueaderoResponse)
async def actualizar_parqueadero(
    parqueadero_id: uuid.UUID,
    body: ParqueaderoUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.actualizar_parqueadero(parqueadero_id, tenant_id, body, db)

@router.delete("/parqueaderos/{parqueadero_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_parqueadero(
    parqueadero_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await parking_service.eliminar_parqueadero(parqueadero_id, tenant_id, db)

# ======================================
#         VEHÍCULOS RESIDENTES
# ======================================

@router.get("/vehiculos", response_model=list[VehiculoResidenteResponse])
async def listar_vehiculos(
    unidad_id: uuid.UUID | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.listar_vehiculos(tenant_id, unidad_id, db)

@router.post("/vehiculos", response_model=VehiculoResidenteResponse, status_code=status.HTTP_201_CREATED)
async def registrar_vehiculo(
    body: VehiculoResidenteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.registrar_vehiculo(tenant_id, body, db)

@router.patch("/vehiculos/{vehiculo_id}", response_model=VehiculoResidenteResponse)
async def actualizar_vehiculo(
    vehiculo_id: uuid.UUID,
    body: VehiculoResidenteUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.actualizar_vehiculo(vehiculo_id, tenant_id, body, db)

@router.delete("/vehiculos/{vehiculo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_vehiculo(
    vehiculo_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await parking_service.eliminar_vehiculo(vehiculo_id, tenant_id, db)

# ======================================
#         ASIGNACIONES
# ======================================

@router.get("/asignaciones", response_model=list[AsignacionResponse])
async def listar_asignaciones(
    solo_activas: bool = Query(default=False),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.listar_asignaciones(tenant_id, solo_activas, db)

@router.post("/asignaciones", response_model=AsignacionResponse, status_code=status.HTTP_201_CREATED)
async def asignar_parqueadero(
    body: AsignacionCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.asignar_parqueadero(tenant_id, body, db)

@router.delete("/asignaciones/{parqueadero_id}/liberar", status_code=status.HTTP_204_NO_CONTENT)
async def liberar_parqueadero(
    parqueadero_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await parking_service.liberar_parqueadero(parqueadero_id, tenant_id, db)

# ======================================
#         SORTEOS DE ROTACIÓN
# ======================================

@router.get("/sorteos/activo", response_model=SorteoActivoResponse)
async def obtener_sorteo_activo(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.obtener_sorteo_activo(tenant_id, current_user.unidad_id, db)

@router.post("/sorteos/{sorteo_id}/inscribirse", response_model=SorteoActivoResponse)
async def inscribirse_sorteo(
    sorteo_id: uuid.UUID,
    body: InscripcionSorteoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.inscribirse_sorteo(sorteo_id, tenant_id, current_user.unidad_id, body, db)

@router.get("/sorteos", response_model=list[SorteoResponse])
async def listar_sorteos(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.listar_sorteos(tenant_id, db)

@router.post("/sorteos", response_model=SorteoResponse, status_code=status.HTTP_201_CREATED)
async def crear_sorteo(
    body: SorteoCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.crear_sorteo(tenant_id, body, db)

@router.post("/sorteos/{sorteo_id}/participantes", response_model=SorteoResponse)
async def agregar_participante(
    sorteo_id: uuid.UUID,
    body: ParticipacionCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await parking_service.agregar_participacion(sorteo_id, tenant_id, body.unidad_id, db)

@router.post("/sorteos/{sorteo_id}/ejecutar", response_model=SorteoResponse)
async def ejecutar_sorteo(
    sorteo_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Ejecuta el sorteo: selecciona aleatoriamente los ganadores según n_cupos
  y marca el sorteo como EJECUTADO. Operación irreversible.
  """
  return await parking_service.ejecutar_sorteo(sorteo_id, tenant_id, db)