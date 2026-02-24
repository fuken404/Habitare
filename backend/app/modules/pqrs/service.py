import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pqrs import repository as repo
from app.modules.pqrs.models import EstadoPQRS, PrioridadPQRS
from app.modules.pqrs.schemas import (
    CategoriaPQRSCreate, CategoriaPQRSUpdate, CategoriaPQRSResponse,
    PQRSCreate, PQRSUpdate, PQRSResponse, PQRSListResponse,
    MensajePQRSCreate, MensajePQRSResponse,
  )
from app.modules.users.models import TipoRol

# Transiciones válidas por estado
_TRANSICIONES: dict[EstadoPQRS, list[EstadoPQRS]] = {
    EstadoPQRS.ABIERTA:     [EstadoPQRS.EN_PROCESO, EstadoPQRS.RECHAZADA],
    EstadoPQRS.EN_PROCESO:  [EstadoPQRS.RESUELTA, EstadoPQRS.RECHAZADA],
    EstadoPQRS.RESUELTA:    [EstadoPQRS.CERRADA],
    EstadoPQRS.CERRADA:     [],
    EstadoPQRS.RECHAZADA:   [],
  }

_ESTADOS_FINALES = {EstadoPQRS.CERRADA, EstadoPQRS.RECHAZADA}

# ======================================
#          CATEGORÍA PQRS
# ======================================

async def listar_categorias(
    db: AsyncSession, solo_activas: bool = True
  ) -> list[CategoriaPQRSResponse]:
  items = await repo.get_categorias(db, solo_activas)
  return [CategoriaPQRSResponse.model_validate(c) for c in items]

async def crear_categoria(
    data: CategoriaPQRSCreate, db: AsyncSession
  ) -> CategoriaPQRSResponse:
  categoria = await repo.create_categoria(db, data.model_dump())
  return CategoriaPQRSResponse.model_validate(categoria)

async def actualizar_categoria(
    categoria_id: uuid.UUID, data: CategoriaPQRSUpdate, db: AsyncSession
  ) -> CategoriaPQRSResponse:
  categoria = await repo.get_categoria_by_id(db, categoria_id)
  if not categoria:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
  categoria = await repo.update_categoria(db, categoria, data.model_dump(exclude_none=True))
  return CategoriaPQRSResponse.model_validate(categoria)

# ======================================
#               PQRS
# ======================================

async def listar_pqrs(
    tenant_id: uuid.UUID,
    estado: EstadoPQRS | None,
    unidad_id: uuid.UUID | None,
    db: AsyncSession,
  ) -> list[PQRSListResponse]:
  items = await repo.get_pqrs_list(db, tenant_id, estado, unidad_id)
  return [PQRSListResponse.model_validate(p) for p in items]

async def obtener_pqrs(
    pqrs_id: uuid.UUID,
    tenant_id: uuid.UUID,
    rol_usuario: TipoRol,
    db: AsyncSession,
  ) -> PQRSResponse:
  # Los residentes no ven mensajes internos
  es_admin = rol_usuario in (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id, include_internos=es_admin)
  if not pqrs:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrada")
  return PQRSResponse.model_validate(pqrs)

async def crear_pqrs(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: PQRSCreate,
    db: AsyncSession,
  ) -> PQRSResponse:
  categoria = await repo.get_categoria_by_id(db, data.categoria_id)
  if not categoria or not categoria.is_activa:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Categoría no encontrada o inactiva"
    )
  pqrs = await repo.create_pqrs(db, {
    "tenant_id": tenant_id,
    "radicado_por": usuario_id,
    "estado": EstadoPQRS.ABIERTA,
    **data.model_dump(),
  })
  # Mensaje inicial automático con la descripción del radicado
  await repo.create_mensaje(
    db, pqrs.id, usuario_id,
    contenido=data.descripcion,
    is_interno=False,
  )
  pqrs = await repo.get_pqrs_by_id(db, pqrs.id, tenant_id)
  return PQRSResponse.model_validate(pqrs)

async def actualizar_pqrs(
    pqrs_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: PQRSUpdate,
    db: AsyncSession,
  ) -> PQRSResponse:
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id)
  if not pqrs:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrada")
  cambios = data.model_dump(exclude_none=True)
  # Validar transición de estado
  if "estado" in cambios:
    nuevo_estado = cambios["estado"]
    permitidos = _TRANSICIONES.get(pqrs.estado, [])
    if nuevo_estado not in permitidos:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Transición inválida: '{pqrs.estado}' → '{nuevo_estado}'"
      )
    now = datetime.now(timezone.utc)
    # Primera respuesta: cuando pasa de ABIERTA a EN_PROCESO
    if (
      pqrs.estado == EstadoPQRS.ABIERTA
      and nuevo_estado == EstadoPQRS.EN_PROCESO
      and not pqrs.fecha_primera_respuesta
    ):
      cambios["fecha_primera_respuesta"] = now
    # Fecha resolución al cerrar o resolver
    if nuevo_estado in (EstadoPQRS.RESUELTA, EstadoPQRS.RECHAZADA):
      cambios["fecha_resolucion"] = now
    # Nota interna automática del cambio de estado
    await repo.create_mensaje(
      db, pqrs_id, usuario_id,
      contenido=f"Estado actualizado a '{nuevo_estado}'.",
      is_interno=True,
    )
  pqrs = await repo.update_pqrs(db, pqrs, cambios)
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id)
  return PQRSResponse.model_validate(pqrs)

# ======================================
#           MENSAJE PQRS
# ======================================

async def agregar_mensaje(
    pqrs_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    rol_usuario: TipoRol,
    data: MensajePQRSCreate,
    db: AsyncSession,
  ) -> MensajePQRSResponse:
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id)
  if not pqrs:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrada")
  if pqrs.estado in _ESTADOS_FINALES:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"No se pueden agregar mensajes a una PQRS en estado '{pqrs.estado}'"
    )
  # Solo administración puede enviar mensajes internos
  es_admin = rol_usuario in (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
  if data.is_interno and not es_admin:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Solo la administración puede enviar notas internas"
    )
  mensaje = await repo.create_mensaje(
    db, pqrs_id, usuario_id, data.contenido, data.is_interno
  )
  return MensajePQRSResponse.model_validate(mensaje)
