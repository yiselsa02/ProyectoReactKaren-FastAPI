from typing import Literal

from pydantic import BaseModel, Field


class PQRCrear(BaseModel):
    tipo: Literal["Petición", "Queja", "Reclamo", "Sugerencia"]
    asunto: str = Field(min_length=3, max_length=255)
    descripcion: str = Field(min_length=5)


class PQRResponder(BaseModel):
    respuesta: str = Field(min_length=3)
    estado: Literal["En proceso", "Respondida", "Resuelta", "Cerrada"] = "Respondida"