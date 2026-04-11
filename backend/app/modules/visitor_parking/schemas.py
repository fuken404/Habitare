import uuid
from datetime import datetime
from pydantic import BaseModel


class LugarParqueaderoVisitanteCreate(BaseModel):
  numero: str
  tipo: str = "mixto"  # carro|moto|mixto


class LugarParqueaderoVisitanteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  numero: str
  tipo: str
  is_activo: bool
  is_ocupado: bool = False

  model_config = {"from_attributes": True}


class ParqueaderoVisitanteCreate(BaseModel):
  ingreso_visita_id: uuid.UUID
  lugar_id: uuid.UUID | None = None  # None → auto-asigna el primer lugar disponible
  tipo_vehiculo: str | None = None
  placa: str | None = None


class ParqueaderoVisitanteResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  ingreso_visita_id: uuid.UUID
  lugar_id: uuid.UUID
  numero: str = ""        # derivado de lugar.numero
  tipo: str = ""          # derivado de lugar.tipo
  tipo_vehiculo: str | None
  placa: str | None
  fecha_hora_asignacion: datetime
  fecha_hora_liberacion: datetime | None
  nombre_visitante: str | None = None

  model_config = {"from_attributes": True}

  @classmethod
  def from_orm_with_visitante(cls, obj) -> "ParqueaderoVisitanteResponse":
    data = cls.model_validate(obj)
    if obj.lugar is not None:
      data.numero = obj.lugar.numero
      data.tipo = obj.lugar.tipo
    if obj.ingreso_visita is not None and obj.ingreso_visita.visitante is not None:
      v = obj.ingreso_visita.visitante
      data.nombre_visitante = f"{v.nombre} {v.apellido}".strip() if v.apellido else v.nombre
    return data
