from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class PQR(Base):
    __tablename__ = "pqr"

    id_pqr = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False,
    )
    tipo = Column(String(50), nullable=False)
    asunto = Column(String(255), nullable=False)
    descripcion = Column(String, nullable=False)
    respuesta = Column(String, nullable=True)
    estado = Column(String(30), nullable=False, default="Pendiente")
    creado_en = Column(DateTime, nullable=False, default=datetime.utcnow)
    actualizado_en = Column(
        DateTime,
        nullable=True,
        onupdate=datetime.utcnow,
    )

    usuario = relationship("Usuario")