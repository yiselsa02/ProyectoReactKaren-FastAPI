from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id_pedido = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    total = Column(Integer, nullable=False, default=0)
    estado = Column(String(30), nullable=False, default="pagado")
    creado_en = Column(DateTime, nullable=False, default=datetime.utcnow)

    usuario = relationship("Usuario")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")


class DetallePedido(Base):
    __tablename__ = "detalle_pedidos"

    id_detalle = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=False)
    producto_id = Column(Integer, nullable=False)
    nombre_producto = Column(String(150), nullable=False)
    precio_unitario = Column(Integer, nullable=False)
    cantidad = Column(Integer, nullable=False)

    pedido = relationship("Pedido", back_populates="detalles")
