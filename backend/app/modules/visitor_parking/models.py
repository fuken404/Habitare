import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from app.modules.tenants.models import Tenant
  from app.modules.visitors.models import IngresoVisita

# ======================================
#   LUGARES (slots físicos fijos)
# ======================================

class LugarParqueaderoVisitante(Base):
  __tablename__ = "lugares_parqueadero_visitante"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
  )
  numero: Mapped[str] = mapped_column(String(50), nullable=False)
  tipo: Mapped[str] = mapped_column(String(10), nullable=False, default="mixto")  # carro|moto|mixto
  is_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)

  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  asignaciones: Mapped[list["ParqueaderoVisitante"]] = relationship(back_populates="lugar")


# ======================================
#   ASIGNACIONES (ocupación de slots)
# ======================================

class ParqueaderoVisitante(Base):
  __tablename__ = "parqueaderos_visitantes"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  tenant_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
  )
  lugar_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("lugares_parqueadero_visitante.id", ondelete="CASCADE"), nullable=False
  )
  ingreso_visita_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("ingreso_visita.id", ondelete="CASCADE"), nullable=False
  )
  tipo_vehiculo: Mapped[str | None] = mapped_column(String(10), nullable=True)  # carro | moto
  placa: Mapped[str | None] = mapped_column(String(20), nullable=True)
  fecha_hora_asignacion: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
  fecha_hora_liberacion: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default="NOW()", nullable=False)

  # --- Relaciones ---
  tenant: Mapped["Tenant"] = relationship()
  lugar: Mapped["LugarParqueaderoVisitante"] = relationship(back_populates="asignaciones")
  ingreso_visita: Mapped["IngresoVisita"] = relationship()
