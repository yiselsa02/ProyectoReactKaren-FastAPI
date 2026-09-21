from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    tipo_documento = Column(String(20), nullable=False)
    numero_documento = Column(String(30), unique=True, nullable=False)
    direccion = Column(String(255), nullable=True)
    telefono = Column(String(30), nullable=True)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    estado = Column(Boolean, default=True, nullable=False)

    rol = relationship("Rol", back_populates="usuarios")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(6), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, nullable=False, default=False)

    usuario = relationship("Usuario")
