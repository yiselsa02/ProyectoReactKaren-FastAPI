from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(50),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True,
        nullable=False
    )

    usuarios = relationship(
        "Usuario",
        back_populates="rol"
    )

    permisos = relationship(
        "RolPermiso",
        back_populates="rol",
        cascade="all, delete-orphan"
    )


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombres = Column(
        String(100),
        nullable=False
    )

    apellidos = Column(
        String(100),
        nullable=False
    )

    tipo_documento = Column(
        String(20),
        nullable=False
    )

    numero_documento = Column(
        String(30),
        unique=True,
        nullable=False
    )

    direccion = Column(
        String(255),
        nullable=True
    )

    telefono = Column(
        String(30),
        nullable=True
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    rol_id = Column(
        Integer,
        ForeignKey("roles.id_rol"),
        nullable=False
    )

    estado = Column(
        Boolean,
        default=True,
        nullable=False
    )

    rol = relationship(
        "Rol",
        back_populates="usuarios"
    )


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    categoria = Column(String(80), nullable=False)
    descripcion = Column(String(500), nullable=True)
    almacenamiento = Column(String(50), nullable=True)
    ram = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    precio = Column(Integer, nullable=False, default=0)
    imagen = Column(String(500), nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    estado = Column(Boolean, nullable=False, default=True)


class Permiso(Base):
    __tablename__ = "permisos"

    id_permiso = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(80), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    roles = relationship(
        "RolPermiso",
        back_populates="permiso",
        cascade="all, delete-orphan"
    )


class RolPermiso(Base):
    __tablename__ = "rol_permisos"

    id_rol = Column(Integer, ForeignKey("roles.id_rol"), primary_key=True)
    id_permiso = Column(Integer, ForeignKey("permisos.id_permiso"), primary_key=True)

    rol = relationship("Rol", back_populates="permisos")
    permiso = relationship("Permiso", back_populates="roles")


class Servicio(Base):
    __tablename__ = "servicios"

    id_servicio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(500), nullable=True)
    precio = Column(Integer, nullable=False, default=0)
    estado = Column(Boolean, nullable=False, default=True)