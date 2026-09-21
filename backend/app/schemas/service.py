from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ServicioBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio: int = Field(default=0, ge=0)


class ServicioResponse(ServicioBase):
    id_servicio: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class ServicioListResponse(BaseModel):
    success: bool
    servicios: List[ServicioResponse]


class ServicioMutationResponse(BaseModel):
    success: bool
    servicio: ServicioResponse
