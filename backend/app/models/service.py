from sqlalchemy import Boolean, Column, Integer, String

from ..database import Base


class Servicio(Base):
    __tablename__ = "servicios"

    id_servicio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(500), nullable=True)
    precio = Column(Integer, nullable=False, default=0)
    estado = Column(Boolean, nullable=False, default=True)
