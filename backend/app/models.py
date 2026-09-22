from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# ============================================================
# ROL
# ============================================================

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


# ============================================================
# USUARIO
# ============================================================

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

    pqrs = relationship(
        "PQR",
        back_populates="usuario"
    )

    pedidos = relationship(
        "Pedido",
        back_populates="usuario"
    )


# ============================================================
# PRODUCTO
# ============================================================

class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(150),
        nullable=False
    )

    categoria = Column(
        String(80),
        nullable=False
    )

    descripcion = Column(
        String(500),
        nullable=True
    )

    almacenamiento = Column(
        String(50),
        nullable=True
    )

    ram = Column(
        String(50),
        nullable=True
    )

    color = Column(
        String(50),
        nullable=True
    )

    precio = Column(
        Integer,
        nullable=False,
        default=0
    )

    imagen = Column(
        String(500),
        nullable=True
    )

    stock = Column(
        Integer,
        nullable=False,
        default=0
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


# ============================================================
# PERMISO
# ============================================================

class Permiso(Base):
    __tablename__ = "permisos"

    id_permiso = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(80),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )

    roles = relationship(
        "RolPermiso",
        back_populates="permiso",
        cascade="all, delete-orphan"
    )


# ============================================================
# ROL - PERMISO
# ============================================================

class RolPermiso(Base):
    __tablename__ = "rol_permisos"

    id_rol = Column(
        Integer,
        ForeignKey("roles.id_rol"),
        primary_key=True
    )

    id_permiso = Column(
        Integer,
        ForeignKey("permisos.id_permiso"),
        primary_key=True
    )

    rol = relationship(
        "Rol",
        back_populates="permisos"
    )

    permiso = relationship(
        "Permiso",
        back_populates="roles"
    )


# ============================================================
# SERVICIO
# ============================================================

class Servicio(Base):
    __tablename__ = "servicios"

    id_servicio = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        String(500),
        nullable=True
    )

    precio = Column(
        Integer,
        nullable=False,
        default=0
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


# ============================================================
# PQR
# ============================================================

class PQR(Base):
    __tablename__ = "pqr"

    id_pqr = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    tipo = Column(
        String,
        nullable=False
    )

    asunto = Column(
        String,
        nullable=False
    )

    descripcion = Column(
        String,
        nullable=False
    )

    respuesta = Column(
        String,
        nullable=True
    )

    estado = Column(
        String,
        nullable=False,
        default="Pendiente"
    )

    creado_en = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    actualizado_en = Column(
        DateTime,
        nullable=True
    )

    usuario = relationship(
        "Usuario",
        back_populates="pqrs",
        foreign_keys=[usuario_id]
    )


# ============================================================
# PEDIDO
# ============================================================

class Pedido(Base):
    __tablename__ = "pedidos"

    id_pedido = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    total = Column(
        Integer,
        nullable=False,
        default=0
    )

    estado = Column(
        String(50),
        nullable=False,
        default="pagado"
    )

    creado_en = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    usuario = relationship(
        "Usuario",
        back_populates="pedidos"
    )

    detalles = relationship(
        "DetallePedido",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )


# ============================================================
# DETALLE DEL PEDIDO
# ============================================================

class DetallePedido(Base):
    __tablename__ = "detalle_pedidos"

    pedido_id = Column(
        Integer,
        ForeignKey("pedidos.id_pedido"),
        primary_key=True
    )

    producto_id = Column(
        Integer,
        primary_key=True
    )

    nombre_producto = Column(
        String(150),
        nullable=False
    )

    precio_unitario = Column(
        Integer,
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    pedido = relationship(
        "Pedido",
        back_populates="detalles"
    )