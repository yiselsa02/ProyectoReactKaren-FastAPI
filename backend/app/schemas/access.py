from typing import Optional

from pydantic import BaseModel, ConfigDict


class PermisoResponse(BaseModel):
    id_permiso: int
    nombre: str
    descripcion: Optional[str] = None
    estado: bool

    model_config = ConfigDict(from_attributes=True)
