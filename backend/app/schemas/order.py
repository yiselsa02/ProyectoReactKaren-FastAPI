from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class PedidoItemCreate(BaseModel):
    producto_id: int
    nombre_producto: str = Field(min_length=1, max_length=150)
    precio_unitario: int = Field(ge=0)
    cantidad: int = Field(ge=1, le=100)


class PedidoCreate(BaseModel):
    items: List[PedidoItemCreate] = Field(min_length=1, max_length=100)


class PedidoItemResponse(PedidoItemCreate):
    id_detalle: int

    model_config = ConfigDict(from_attributes=True)


class PedidoResponse(BaseModel):
    id_pedido: int
    usuario_id: int
    total: int
    estado: str
    creado_en: datetime
    detalles: List[PedidoItemResponse]

    model_config = ConfigDict(from_attributes=True)


class PedidoListResponse(BaseModel):
    success: bool
    pedidos: List[PedidoResponse]
