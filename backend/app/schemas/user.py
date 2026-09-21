from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCreate(BaseModel):
    nombres: str = Field(min_length=2, max_length=100)
    apellidos: str = Field(min_length=2, max_length=100)
    tipo_documento: str = Field(min_length=2, max_length=20)
    numero_documento: str = Field(min_length=4, max_length=30)
    direccion: Optional[str] = Field(default=None, max_length=255)
    telefono: Optional[str] = Field(default=None, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    rol_id: Optional[int] = None


class UsuarioUpdate(BaseModel):
    nombres: str = Field(min_length=2, max_length=100)
    apellidos: str = Field(min_length=2, max_length=100)
    tipo_documento: str = Field(min_length=2, max_length=20)
    numero_documento: str = Field(min_length=4, max_length=30)
    direccion: Optional[str] = Field(default=None, max_length=255)
    telefono: Optional[str] = Field(default=None, max_length=30)
    email: EmailStr
    password: Optional[str] = Field(default=None, min_length=6, max_length=72)
    rol_id: int = Field(ge=1, le=3)


class EstadoUpdate(BaseModel):
    estado: bool


class UsuarioResponse(BaseModel):
    id_usuario: int
    nombres: str
    apellidos: str
    tipo_documento: str
    numero_documento: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: EmailStr
    rol_id: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class UsuarioListResponse(BaseModel):
    success: bool
    usuarios: List[UsuarioResponse]


class UsuarioMutationResponse(BaseModel):
    success: bool
    usuario: UsuarioResponse
