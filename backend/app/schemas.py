from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional


# ============================================================
# CREAR USUARIO
# ============================================================

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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


# ============================================================
# RESPUESTA USUARIO
# ============================================================

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

    model_config = ConfigDict(
        from_attributes=True
    )


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


class ServicioBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio: int = Field(default=0, ge=0)


class ServicioResponse(ServicioBase):
    id_servicio: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class PermisoResponse(BaseModel):
    id_permiso: int
    nombre: str
    descripcion: Optional[str] = None
    estado: bool

    model_config = ConfigDict(from_attributes=True)