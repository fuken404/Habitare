import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.pqrs.models import EstadoPQRS, TipoPQRS
from app.modules.pqrs.schemas import (
    TipoIncidenteCreate, TipoIncidenteUpdate, TipoIncidenteResponse,
    CategoriaPQRSCreate, CategoriaPQRSUpdate, CategoriaPQRSResponse,
    PQRSCreate, PQRSUpdate, PQRSResponse, PQRSListResponse,
    MensajePQRSCreate, MensajePQRSResponse,
  )
from app.modules.pqrs import service as pqrs_service

router = APIRouter(prefix="/pqrs", tags=["PQRS"])

_ROLES_ADMIN    = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_UPDATE   = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_TODOS    = (TipoRol.RESIDENTE, TipoRol.SEGURIDAD, TipoRol.RECEPCION,
                    TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)

# ======================================
#        TIPOS DE INCIDENTE
# ======================================

_ROLES_REPORTE = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION,
                   TipoRol.SUPERADMIN, TipoRol.RESIDENTE)

@router.get("/tipos-incidente", response_model=list[TipoIncidenteResponse])
async def listar_tipos_incidente(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_REPORTE)),
    db: AsyncSession = Depends(get_db),
  ):
  return await pqrs_service.listar_tipos_incidente(tenant_id, db)

@router.post("/tipos-incidente", response_model=TipoIncidenteResponse, status_code=status.HTTP_201_CREATED)
async def crear_tipo_incidente(
    body: TipoIncidenteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await pqrs_service.crear_tipo_incidente(tenant_id, body, db)

@router.patch("/tipos-incidente/{tipo_id}", response_model=TipoIncidenteResponse)
async def actualizar_tipo_incidente(
    tipo_id: uuid.UUID,
    body: TipoIncidenteUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await pqrs_service.actualizar_tipo_incidente(tipo_id, tenant_id, body, db)

@router.delete("/tipos-incidente/{tipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_tipo_incidente(
    tipo_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await pqrs_service.eliminar_tipo_incidente(tipo_id, tenant_id, db)

# ======================================
#         CATEGORÍAS (globales)
# ======================================

@router.get("/categorias", response_model=list[CategoriaPQRSResponse])
async def listar_categorias(
    todas: bool = Query(default=False, description="Incluir categorías inactivas"),
    _: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await pqrs_service.listar_categorias(db, solo_activas=not todas)

@router.post("/categorias", response_model=CategoriaPQRSResponse, status_code=status.HTTP_201_CREATED)
async def crear_categoria(
    body: CategoriaPQRSCreate,
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await pqrs_service.crear_categoria(body, db)

@router.patch("/categorias/{categoria_id}", response_model=CategoriaPQRSResponse)
async def actualizar_categoria(
    categoria_id: uuid.UUID,
    body: CategoriaPQRSUpdate,
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await pqrs_service.actualizar_categoria(categoria_id, body, db)

# ======================================
#               PQRS
# ======================================

@router.get("", response_model=list[PQRSListResponse])
async def listar_pqrs(
    estado: EstadoPQRS | None = Query(default=None),
    unidad_id: uuid.UUID | None = Query(default=None),
    tipo: TipoPQRS | None = Query(default=None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  effective_unidad_id = unidad_id
  if current_user.rol == TipoRol.RESIDENTE and current_user.unidad_id is not None:
    effective_unidad_id = current_user.unidad_id
  return await pqrs_service.listar_pqrs(tenant_id, estado, effective_unidad_id, db, tipo)

@router.get("/{pqrs_id}", response_model=PQRSResponse)
async def obtener_pqrs(
    pqrs_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  return await pqrs_service.obtener_pqrs(pqrs_id, tenant_id, current_user.rol, db)

@router.post("", response_model=PQRSResponse, status_code=status.HTTP_201_CREATED)
async def crear_pqrs(
    body: PQRSCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Radica una nueva PQRS. Todos los roles pueden radicar.
  Se crea en estado ABIERTA y el texto de descripción
  queda como primer mensaje del hilo.
  """
  return await pqrs_service.crear_pqrs(tenant_id, current_user.id, body, db)

@router.patch("/{pqrs_id}", response_model=PQRSResponse)
async def actualizar_pqrs(
    pqrs_id: uuid.UUID,
    body: PQRSUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_UPDATE)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Actualiza estado o metadatos de la PQRS. Solo administración.
  Flujo: ABIERTA → EN_PROCESO → RESUELTA → CERRADA (o RECHAZADA).
  Cada cambio de estado genera nota interna automática.
  """
  return await pqrs_service.actualizar_pqrs(
    pqrs_id, tenant_id, current_user.id, body, db
  )

# ======================================
#           MENSAJES / HILO
# ======================================

@router.post("/{pqrs_id}/mensajes", response_model=MensajePQRSResponse, status_code=status.HTTP_201_CREATED)
async def agregar_mensaje(
    pqrs_id: uuid.UUID,
    body: MensajePQRSCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    current_user: MeResponse = Depends(require_roles(*_ROLES_TODOS)),
    db: AsyncSession = Depends(get_db),
  ):
  """
  Agrega un mensaje al hilo de la PQRS.
  - `is_interno: false` → visible para residente y administración.
  - `is_interno: true` → solo visible para administración (solo ADMIN/SUPERADMIN pueden usarlo).
  No permitido en PQRS CERRADA o RECHAZADA.
  """
  return await pqrs_service.agregar_mensaje(
    pqrs_id, tenant_id, current_user.id, current_user.rol, body, db
  )
