import uuid
import random
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.parking import repository as repo
from app.modules.parking.models import EstadoSorteo
from app.modules.parking.schemas import (
    ParqueaderoCreate, ParqueaderoUpdate, ParqueaderoResponse,
    VehiculoResidenteCreate, VehiculoResidenteUpdate, VehiculoResidenteResponse,
    AsignacionCreate, AsignacionResponse,
    SorteoCreate, SorteoResponse,
    SorteoActivoResponse, InscripcionSorteoCreate,
  )

# ======================================
#         PARQUEADEROS
# ======================================

async def listar_parqueaderos(tenant_id: uuid.UUID, db: AsyncSession) -> list[ParqueaderoResponse]:
  items = await repo.get_parqueaderos(db, tenant_id)
  return [ParqueaderoResponse.model_validate(p) for p in items]

async def crear_parqueadero(
    tenant_id: uuid.UUID, data: ParqueaderoCreate, db: AsyncSession
  ) -> ParqueaderoResponse:
  parqueadero = await repo.create_parqueadero(db, {"tenant_id": tenant_id, **data.model_dump()})
  return ParqueaderoResponse.model_validate(parqueadero)

async def actualizar_parqueadero(
    parqueadero_id: uuid.UUID, tenant_id: uuid.UUID,
    data: ParqueaderoUpdate, db: AsyncSession
  ) -> ParqueaderoResponse:
  parqueadero = await repo.get_parqueadero_by_id(db, parqueadero_id, tenant_id)
  if not parqueadero:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parqueadero no encontrado")
  parqueadero = await repo.update_parqueadero(db, parqueadero, data.model_dump(exclude_none=True))
  return ParqueaderoResponse.model_validate(parqueadero)

async def eliminar_parqueadero(
    parqueadero_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  parqueadero = await repo.get_parqueadero_by_id(db, parqueadero_id, tenant_id)
  if not parqueadero:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parqueadero no encontrado")
  ocupado = await repo.get_asignacion_activa_parqueadero(db, parqueadero_id)
  if ocupado:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El parqueadero tiene una asignación activa — libéralo antes de eliminarlo"
    )
  await repo.delete_parqueadero(db, parqueadero)

# ======================================
#         VEHÍCULOS RESIDENTES
# ======================================

async def listar_vehiculos(
    tenant_id: uuid.UUID, unidad_id: uuid.UUID | None, db: AsyncSession
  ) -> list[VehiculoResidenteResponse]:
  items = await repo.get_vehiculos_by_tenant(db, tenant_id, unidad_id)
  return [VehiculoResidenteResponse.model_validate(v) for v in items]

async def registrar_vehiculo(
    tenant_id: uuid.UUID, data: VehiculoResidenteCreate, db: AsyncSession
  ) -> VehiculoResidenteResponse:
  existente = await repo.get_vehiculo_by_placa(db, data.placa, tenant_id)
  if existente:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"La placa '{data.placa.upper()}' ya está registrada en este conjunto"
    )
  vehiculo = await repo.create_vehiculo(db, {"tenant_id": tenant_id, **data.model_dump()})
  return VehiculoResidenteResponse.model_validate(vehiculo)

async def actualizar_vehiculo(
    vehiculo_id: uuid.UUID, tenant_id: uuid.UUID,
    data: VehiculoResidenteUpdate, db: AsyncSession
  ) -> VehiculoResidenteResponse:
  vehiculo = await repo.get_vehiculo_by_id(db, vehiculo_id, tenant_id)
  if not vehiculo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")
  vehiculo = await repo.update_vehiculo(db, vehiculo, data.model_dump(exclude_none=True))
  return VehiculoResidenteResponse.model_validate(vehiculo)

async def eliminar_vehiculo(
    vehiculo_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  vehiculo = await repo.get_vehiculo_by_id(db, vehiculo_id, tenant_id)
  if not vehiculo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")
  await repo.delete_vehiculo(db, vehiculo)

# ======================================
#         ASIGNACIONES
# ======================================

async def listar_asignaciones(
    tenant_id: uuid.UUID, solo_activas: bool, db: AsyncSession
  ) -> list[AsignacionResponse]:
  items = await repo.get_asignaciones_by_tenant(db, tenant_id, solo_activas)
  return [AsignacionResponse.model_validate(a) for a in items]

async def asignar_parqueadero(
    tenant_id: uuid.UUID, data: AsignacionCreate, db: AsyncSession
  ) -> AsignacionResponse:
  parqueadero = await repo.get_parqueadero_by_id(db, data.parqueadero_id, tenant_id)
  if not parqueadero:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parqueadero no encontrado")

  activa = await repo.get_asignacion_activa_parqueadero(db, data.parqueadero_id)
  if activa:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El parqueadero ya tiene una asignación activa"
    )

  asignacion = await repo.create_asignacion(db, {
    "tenant_id": tenant_id,
    "parqueadero_id": data.parqueadero_id,
    "unidad_id": data.unidad_id,
    "is_activa": True,
    "fecha_inicio": data.fecha_inicio,
    "fecha_fin": data.fecha_fin,
  })
  return AsignacionResponse.model_validate(asignacion)

async def liberar_parqueadero(
    parqueadero_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  parqueadero = await repo.get_parqueadero_by_id(db, parqueadero_id, tenant_id)
  if not parqueadero:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parqueadero no encontrado")
  asignacion = await repo.get_asignacion_activa_parqueadero(db, parqueadero_id)
  if not asignacion:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El parqueadero no tiene asignación activa"
    )
  await repo.desactivar_asignacion(db, asignacion)

# ======================================
#         SORTEO DE ROTACIÓN
# ======================================

async def obtener_sorteo_activo(
    tenant_id: uuid.UUID, unidad_id: uuid.UUID, db: AsyncSession
  ) -> SorteoActivoResponse:
  sorteo = await repo.get_sorteo_activo(db, tenant_id)
  if not sorteo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay sorteos programados en este momento")
  ya_inscrito = any(p.unidad_id == unidad_id for p in sorteo.participaciones)
  return SorteoActivoResponse(
    id=sorteo.id,
    fecha_sorteo=sorteo.fecha_sorteo,
    n_cupos=sorteo.n_cupos,
    n_inscritos=len(sorteo.participaciones),
    ya_inscrito=ya_inscrito,
    estado=sorteo.estado,
  )

async def inscribirse_sorteo(
    sorteo_id: uuid.UUID, tenant_id: uuid.UUID,
    unidad_id: uuid.UUID, data: InscripcionSorteoCreate, db: AsyncSession
  ) -> SorteoActivoResponse:
  sorteo = await repo.get_sorteo_by_id(db, sorteo_id, tenant_id)
  if not sorteo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sorteo no encontrado")
  if sorteo.estado != EstadoSorteo.PROGRAMADO:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El sorteo ya no está disponible para inscripción")
  ya_inscrita = any(p.unidad_id == unidad_id for p in sorteo.participaciones)
  if ya_inscrita:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya estás inscrito en este sorteo")
  # Registrar vehículo si no existe con esa placa para esta unidad
  existente = await repo.get_vehiculo_by_placa(db, data.placa, tenant_id)
  if not existente:
    await repo.create_vehiculo(db, {
      "tenant_id": tenant_id,
      "unidad_id": unidad_id,
      "tipo": data.tipo_vehiculo,
      "placa": data.placa,
      "marca": data.marca,
      "modelo": data.modelo,
      "color": data.color,
    })
  await repo.add_participacion(db, sorteo_id, unidad_id)
  sorteo = await repo.get_sorteo_by_id(db, sorteo_id, tenant_id)
  return SorteoActivoResponse(
    id=sorteo.id,
    fecha_sorteo=sorteo.fecha_sorteo,
    n_cupos=sorteo.n_cupos,
    n_inscritos=len(sorteo.participaciones),
    ya_inscrito=True,
    estado=sorteo.estado,
  )

async def listar_sorteos(tenant_id: uuid.UUID, db: AsyncSession) -> list[SorteoResponse]:
  items = await repo.get_sorteos(db, tenant_id)
  return [SorteoResponse.model_validate(s) for s in items]


async def crear_sorteo(
    tenant_id: uuid.UUID, data: SorteoCreate, db: AsyncSession
  ) -> SorteoResponse:
  sorteo = await repo.create_sorteo(db, {
    "tenant_id": tenant_id,
    "fecha_sorteo": data.fecha_sorteo,
    "n_cupos": data.n_cupos,
    "estado": EstadoSorteo.PROGRAMADO,
  })
  sorteo = await repo.get_sorteo_by_id(db, sorteo.id, tenant_id)
  return SorteoResponse.model_validate(sorteo)

async def ejecutar_sorteo(
    sorteo_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> SorteoResponse:
  sorteo = await repo.get_sorteo_by_id(db, sorteo_id, tenant_id)
  if not sorteo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sorteo no encontrado")
  if sorteo.estado != EstadoSorteo.PROGRAMADO:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"El sorteo ya está en estado '{sorteo.estado}'"
    )
  if not sorteo.participaciones:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El sorteo no tiene participantes registrados"
    )

  # Selección aleatoria respetando n_cupos
  participantes = sorteo.participaciones
  ganadores = random.sample(participantes, min(sorteo.n_cupos, len(participantes)))
  ganadores_ids = {g.id for g in ganadores}

  for p in participantes:
    p.es_ganador = p.id in ganadores_ids

  await db.flush()  # ← persiste los cambios de es_ganador antes de actualizar el estado

  await repo.update_sorteo(db, sorteo, {"estado": EstadoSorteo.EJECUTADO})
  sorteo = await repo.get_sorteo_by_id(db, sorteo_id, tenant_id)
  return SorteoResponse.model_validate(sorteo)

async def agregar_participacion(
    sorteo_id: uuid.UUID, tenant_id: uuid.UUID,
    unidad_id: uuid.UUID, db: AsyncSession
  ) -> SorteoResponse:
  sorteo = await repo.get_sorteo_by_id(db, sorteo_id, tenant_id)
  if not sorteo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sorteo no encontrado")
  if sorteo.estado != EstadoSorteo.PROGRAMADO:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="Solo se pueden agregar participantes a sorteos en estado PROGRAMADO"
    )
  ya_inscrita = any(p.unidad_id == unidad_id for p in sorteo.participaciones)
  if ya_inscrita:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="La unidad ya está inscrita en este sorteo"
    )
  await repo.add_participacion(db, sorteo_id, unidad_id)
  sorteo = await repo.get_sorteo_by_id(db, sorteo_id, tenant_id)
  return SorteoResponse.model_validate(sorteo)
