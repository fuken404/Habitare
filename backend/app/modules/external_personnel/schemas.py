import uuid
from datetime import datetime
from pydantic import BaseModel
from app.modules.external_personnel.models import (
    TipoDocumentoExterno, TipoPersonalExterno
  )

class IngresoExternoCreate(BaseModel):
  nombre: str
  empresa: str | None = None
  motivo: str
  tipo_documento: TipoDocumentoExterno = TipoDocumentoExterno.OTRO
  n_documento: str = ""
  tipo_personal: TipoPersonalExterno = TipoPersonalExterno.CONTRATISTA
  observaciones: str | None = None

class IngresoExternoUpdate(BaseModel):
  empresa: str | None = None
  motivo: str | None = None
  observaciones: str | None = None

class IngresoExternoResponse(BaseModel):
  id: uuid.UUID
  tenant_id: uuid.UUID
  registrado_por: uuid.UUID
  tipo_documento: TipoDocumentoExterno
  n_documento: str
  nombre: str
  tipo_personal: TipoPersonalExterno
  empresa: str | None
  motivo: str
  fecha_hora_ingreso: datetime
  fecha_hora_salida: datetime | None
  observaciones: str | None
  created_at: datetime
  updated_at: datetime

  model_config = {"from_attributes": True}

class IngresoExternoListResponse(BaseModel):
  id: uuid.UUID
  nombre: str
  empresa: str | None
  motivo: str
  fecha_hora_ingreso: datetime
  fecha_hora_salida: datetime | None

  model_config = {"from_attributes": True}
