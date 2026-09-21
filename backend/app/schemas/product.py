from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductoBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    categoria: str = Field(min_length=2, max_length=80)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    almacenamiento: Optional[str] = Field(default=None, max_length=50)
    ram: Optional[str] = Field(default=None, max_length=50)
    color: Optional[str] = Field(default=None, max_length=50)
    precio: int = Field(ge=0)
    imagen: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)


class ProductoResponse(ProductoBase):
    id_producto: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class ProductoListResponse(BaseModel):
    success: bool
    productos: List[ProductoResponse]


class ProductoMutationResponse(BaseModel):
    success: bool
    producto: ProductoResponse
