from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Boolean, default=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="rol")
    permisos = relationship(
        "RolPermiso",
        back_populates="rol",
        cascade="all, delete-orphan",
    )


class Permiso(Base):
    __tablename__ = "permisos"

    id_permiso = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(80), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Boolean, default=True, nullable=False)

    roles = relationship(
        "RolPermiso",
        back_populates="permiso",
        cascade="all, delete-orphan",
    )


class RolPermiso(Base):
    __tablename__ = "rol_permisos"

    id_rol = Column(Integer, ForeignKey("roles.id_rol"), primary_key=True)
    id_permiso = Column(Integer, ForeignKey("permisos.id_permiso"), primary_key=True)

    rol = relationship("Rol", back_populates="permisos")
    permiso = relationship("Permiso", back_populates="roles")
