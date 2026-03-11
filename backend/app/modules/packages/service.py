import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.packages import repository as repo
from app.modules.packages.models import EstadoPaquete
from app.modules.packages.schemas import (
    PaqueteCreate, PaqueteResponse, PaqueteListResponse
  )

async def listar_paquetes(
    tenant_id: uuid.UUID,
    estado: EstadoPaquete | None,
    unidad_id: uuid.UUID | None,
    db: AsyncSession,
  ) -> list[PaqueteListResponse]:
  paquetes = await repo.get_paquetes_by_tenant(db, tenant_id, estado, unidad_id)
  return [PaqueteListResponse.model_validate(p) for p in paquetes]

async def obtener_paquete(
    paquete_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> PaqueteResponse:
  paquete = await repo.get_paquete_by_id(db, paquete_id, tenant_id)
  if not paquete:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paquete no encontrado")
  return PaqueteResponse.model_validate(paquete)

async def registrar_paquete(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: PaqueteCreate,
    db: AsyncSession,
  ) -> PaqueteResponse:
  paquete = await repo.create_paquete(db, {
    "tenant_id": tenant_id,
    "unidad_id": data.unidad_id,
    "recibido_por": usuario_id,
    "fecha_recepcion": datetime.utcnow(),
    "estado": EstadoPaquete.PENDIENTE,
  })
  return PaqueteResponse.model_validate(paquete)

async def entregar_paquete(
    paquete_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    db: AsyncSession,
  ) -> PaqueteResponse:
  paquete = await repo.get_paquete_by_id(db, paquete_id, tenant_id)
  if not paquete:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paquete no encontrado")
  
  if paquete.estado != EstadoPaquete.PENDIENTE:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"El paquete ya fue '{paquete.estado}' — no se puede entregar de nuevo"
    )
  paquete = await repo.update_paquete(db, paquete, {
    "estado": EstadoPaquete.RETIRADO,
    "entregado_por": usuario_id,
    "fecha_entrega": datetime.utcnow(),
  })
  return PaqueteResponse.model_validate(paquete)