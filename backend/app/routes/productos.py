from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import require_roles
from ..database import get_db
from ..models import Producto, Usuario
from ..schemas import ProductoBase, ProductoListResponse, ProductoMutationResponse, ProductoResponse

router = APIRouter(prefix="/api/productos", tags=["Productos"])


@router.get("", response_model=ProductoListResponse)
def listar_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).filter(Producto.estado == True).all()
    return {"success": True, "productos": productos}


@router.get("/{product_id}", response_model=ProductoMutationResponse)
def obtener_producto(product_id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id_producto == product_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"success": True, "producto": producto}


@router.post("", response_model=ProductoMutationResponse, status_code=201)
def crear_producto(
    data: ProductoBase,
    db: Session = Depends(get_db),
    _admin_or_employee: Usuario = Depends(require_roles(1, 3)),
):
    producto = Producto(**data.model_dump(), estado=True)
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return {"success": True, "producto": producto}


@router.put("/{product_id}", response_model=ProductoMutationResponse)
def actualizar_producto(
    product_id: int,
    data: ProductoBase,
    db: Session = Depends(get_db),
    _admin_or_employee: Usuario = Depends(require_roles(1, 3)),
):
    producto = db.query(Producto).filter(Producto.id_producto == product_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for field, value in data.model_dump().items():
        setattr(producto, field, value)
    db.commit()
    db.refresh(producto)
    return {"success": True, "producto": producto}


@router.delete("/{product_id}", response_model=dict)
def eliminar_producto(
    product_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_roles(1)),
):
    producto = db.query(Producto).filter(Producto.id_producto == product_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"success": True, "message": "Producto eliminado correctamente"}
