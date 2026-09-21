from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import require_roles
from ..database import get_db
from ..models import Servicio, Usuario
from ..schemas import ServicioBase, ServicioListResponse, ServicioMutationResponse

router = APIRouter(prefix="/api/servicios", tags=["Servicios"])


@router.get("", response_model=ServicioListResponse)
def listar_servicios(db: Session = Depends(get_db)):
    servicios = db.query(Servicio).filter(Servicio.estado == True).all()
    return {"success": True, "servicios": servicios}


@router.get("/{service_id}", response_model=ServicioMutationResponse)
def obtener_servicio(service_id: int, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == service_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"success": True, "servicio": servicio}


@router.post("", response_model=ServicioMutationResponse, status_code=201)
def crear_servicio(
    data: ServicioBase,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_roles(1)),
):
    servicio = Servicio(**data.model_dump(), estado=True)
    db.add(servicio)
    db.commit()
    db.refresh(servicio)
    return {"success": True, "servicio": servicio}


@router.put("/{service_id}", response_model=ServicioMutationResponse)
def actualizar_servicio(
    service_id: int,
    data: ServicioBase,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_roles(1)),
):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == service_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for field, value in data.model_dump().items():
        setattr(servicio, field, value)
    db.commit()
    db.refresh(servicio)
    return {"success": True, "servicio": servicio}


@router.delete("/{service_id}", response_model=dict)
def eliminar_servicio(
    service_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_roles(1)),
):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == service_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    db.delete(servicio)
    db.commit()
    return {"success": True, "message": "Servicio eliminado correctamente"}
