import uuid
from datetime import datetime, timezone, date, time
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.common_areas import repository as repo
from app.modules.common_areas.models import DiaSemana, EstadoReserva
from app.modules.common_areas.schemas import (
    ZonaComunCreate, ZonaComunUpdate, ZonaComunResponse, ZonaComunListResponse,
    HorarioCreate, HorarioResponse,
    ReservaCreate, ReservaUpdate, ReservaResponse, ReservaListResponse,
  )
from app.modules.users.models import TipoRol

_ROLES_ADMIN     = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_RECEPCION = (TipoRol.RECEPCION,)

# Mapa Python weekday() → DiaSemana
_WEEKDAY_MAP = {
    0: DiaSemana.LUNES, 1: DiaSemana.MARTES, 2: DiaSemana.MIERCOLES,
    3: DiaSemana.JUEVES, 4: DiaSemana.VIERNES,
    5: DiaSemana.SABADO, 6: DiaSemana.DOMINGO,
  }

# ======================================
#          ZONA COMÚN
# ======================================

async def listar_zonas(
    tenant_id: uuid.UUID, db: AsyncSession, solo_activas: bool = True
  ) -> list[ZonaComunListResponse]:
  items = await repo.get_zonas(db, tenant_id, solo_activas)
  return [ZonaComunListResponse.model_validate(z) for z in items]

async def obtener_zona(
    zona_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> ZonaComunResponse:
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  if not zona:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zona común no encontrada")
  return ZonaComunResponse.model_validate(zona)

async def crear_zona(
    tenant_id: uuid.UUID, data: ZonaComunCreate, db: AsyncSession
  ) -> ZonaComunResponse:
  zona = await repo.create_zona(db, {"tenant_id": tenant_id, **data.model_dump()})
  zona = await repo.get_zona_by_id(db, zona.id, tenant_id)
  return ZonaComunResponse.model_validate(zona)

async def actualizar_zona(
    zona_id: uuid.UUID, tenant_id: uuid.UUID,
    data: ZonaComunUpdate, db: AsyncSession
  ) -> ZonaComunResponse:
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  if not zona:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zona común no encontrada")
  zona = await repo.update_zona(db, zona, data.model_dump(exclude_none=True))
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  return ZonaComunResponse.model_validate(zona)

async def eliminar_zona(
    zona_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  if not zona:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zona común no encontrada")
  if zona.reservas:
    activas = [
      r for r in zona.reservas
      if r.estado in (EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA)
    ]
    if activas:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="La zona tiene reservas activas — cancélalas antes de eliminarla"
      )
  await repo.delete_zona(db, zona)

# ======================================
#          HORARIOS
# ======================================

async def agregar_horario(
    zona_id: uuid.UUID, tenant_id: uuid.UUID,
    data: HorarioCreate, db: AsyncSession
  ) -> ZonaComunResponse:
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  if not zona:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zona común no encontrada")
  # Validar que no exista ya un horario para ese día en la zona
  duplicado = any(h.dia_semana == data.dia_semana for h in zona.horarios)
  if duplicado:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"Ya existe un horario para '{data.dia_semana}' en esta zona"
    )
  await repo.create_horario(db, zona_id, data.model_dump())
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  return ZonaComunResponse.model_validate(zona)

async def eliminar_horario(
    zona_id: uuid.UUID, horario_id: uuid.UUID,
    tenant_id: uuid.UUID, db: AsyncSession
  ) -> ZonaComunResponse:
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  if not zona:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zona común no encontrada")
  horario = await repo.get_horario_by_id(db, horario_id)
  if not horario or horario.zona_comun_id != zona_id:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")
  await repo.delete_horario(db, horario)
  zona = await repo.get_zona_by_id(db, zona_id, tenant_id)
  return ZonaComunResponse.model_validate(zona)

# ======================================
#          RESERVAS
# ======================================

async def listar_reservas(
    tenant_id: uuid.UUID,
    zona_id: uuid.UUID | None,
    estado: EstadoReserva | None,
    fecha: date | None,
    db: AsyncSession,
  ) -> list[ReservaListResponse]:
  items = await repo.get_reservas(db, tenant_id, zona_id, estado, fecha)
  return [ReservaListResponse.from_orm_with_residente(r) for r in items]

async def obtener_reserva(
    reserva_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> ReservaResponse:
  reserva = await repo.get_reserva_by_id(db, reserva_id, tenant_id)
  if not reserva:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
  return ReservaResponse.model_validate(reserva)

async def crear_reserva(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: ReservaCreate,
    db: AsyncSession,
  ) -> ReservaResponse:
  zona = await repo.get_zona_by_id(db, data.zona_comun_id, tenant_id)
  if not zona:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zona común no encontrada")
  if not zona.is_activa:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="La zona común está inactiva"
    )
  # Validar que el día de la reserva tenga horario configurado
  dia = _WEEKDAY_MAP[data.fecha_reserva.weekday()]
  horario_dia = next((h for h in zona.horarios if h.dia_semana == dia), None)
  if not horario_dia:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"La zona no tiene horario configurado para '{dia}'"
    )
  # Validar que la reserva esté dentro del horario permitido
  if data.hora_inicio < horario_dia.hora_inicio or data.hora_fin > horario_dia.hora_fin:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=(
        f"La reserva debe estar dentro del horario permitido: "
        f"{horario_dia.hora_inicio} – {horario_dia.hora_fin}"
      )
    )
  # Validar capacidad
  if zona.capacidad_maxima and data.n_asistentes:
    if data.n_asistentes > zona.capacidad_maxima:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"El número de asistentes supera la capacidad máxima ({zona.capacidad_maxima})"
      )
  # Validar solapamiento con reservas existentes
  solapadas = await repo.get_reservas_solapadas(
    db, data.zona_comun_id, data.fecha_reserva,
    data.hora_inicio, data.hora_fin
  )
  if solapadas:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="El horario solicitado se solapa con una reserva existente"
    )
  # Estado inicial según si requiere aprobación
  estado_inicial = (
    EstadoReserva.PENDIENTE if zona.requiere_aprobacion
    else EstadoReserva.CONFIRMADA
  )
  reserva = await repo.create_reserva(db, {
    "tenant_id": tenant_id,
    "usuario_id": usuario_id,
    "estado": estado_inicial,
    **data.model_dump(),
  })
  return ReservaResponse.model_validate(reserva)

async def actualizar_reserva(
    reserva_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    rol_usuario: TipoRol,
    data: ReservaUpdate,
    db: AsyncSession,
  ) -> ReservaResponse:
  reserva = await repo.get_reserva_by_id(db, reserva_id, tenant_id)
  if not reserva:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
  cambios = data.model_dump(exclude_none=True)
  es_admin     = rol_usuario in _ROLES_ADMIN
  es_recepcion = rol_usuario in _ROLES_RECEPCION
  if "estado" in cambios:
    nuevo_estado = cambios["estado"]
    _TRANSICIONES_ADMIN = {
      EstadoReserva.PENDIENTE:   [EstadoReserva.CONFIRMADA, EstadoReserva.CANCELADA],
      EstadoReserva.CONFIRMADA:  [EstadoReserva.CANCELADA, EstadoReserva.COMPLETADA],
      EstadoReserva.CANCELADA:   [],
      EstadoReserva.COMPLETADA:  [],
    }
    # Recepción: solo consulta, no puede cambiar estado
    _TRANSICIONES_RECEPCION = {
      EstadoReserva.PENDIENTE:   [],
      EstadoReserva.CONFIRMADA:  [],
      EstadoReserva.CANCELADA:   [],
      EstadoReserva.COMPLETADA:  [],
    }
    _TRANSICIONES_RESIDENTE = {
      EstadoReserva.PENDIENTE:   [EstadoReserva.CANCELADA],
      EstadoReserva.CONFIRMADA:  [EstadoReserva.CANCELADA],
      EstadoReserva.CANCELADA:   [],
      EstadoReserva.COMPLETADA:  [],
    }
    if es_admin:
      transiciones = _TRANSICIONES_ADMIN
    elif es_recepcion:
      transiciones = _TRANSICIONES_RECEPCION
    else:
      transiciones = _TRANSICIONES_RESIDENTE
    permitidos = transiciones.get(reserva.estado, [])
    if nuevo_estado not in permitidos:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Transición inválida: '{reserva.estado}' → '{nuevo_estado}'"
      )
  # Residentes solo pueden modificar su propia reserva; recepción y admin, cualquiera
  if not es_admin and not es_recepcion and reserva.usuario_id != usuario_id:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Solo puedes modificar tus propias reservas"
    )
  reserva = await repo.update_reserva(db, reserva, cambios)
  return ReservaResponse.model_validate(reserva)

async def cancelar_reserva(
    reserva_id: uuid.UUID, tenant_id: uuid.UUID,
    usuario_id: uuid.UUID, rol_usuario: TipoRol,
    db: AsyncSession,
  ) -> None:
  """Shortcut de cancelación directa sin pasar body. Recepción no puede cancelar."""
  if rol_usuario == TipoRol.RECEPCION:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Recepción no tiene permiso para cancelar reservas"
    )
  data = ReservaUpdate(estado=EstadoReserva.CANCELADA)
  await actualizar_reserva(reserva_id, tenant_id, usuario_id, rol_usuario, data, db)
