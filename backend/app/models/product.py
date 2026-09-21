from sqlalchemy import Boolean, Column, Integer, String

from ..database import Base


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
