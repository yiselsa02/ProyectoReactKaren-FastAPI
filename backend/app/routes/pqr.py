from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import require_roles
from ..database import get_db
from ..models import PQR, Usuario
from ..schemas.pqr import PQRCrear, PQRResponder

router = APIRouter(
    prefix="/api/pqr",
    tags=["PQR"],
)


def convertir_pqr(pqr: PQR):
    nombre_cliente = "Cliente no disponible"

    if pqr.usuario:
        nombres = getattr(pqr.usuario, "nombres", "") or ""
        apellidos = getattr(pqr.usuario, "apellidos", "") or ""

        nombre_cliente = f"{nombres} {apellidos}".strip()

        if not nombre_cliente:
            nombre_cliente = (
                getattr(pqr.usuario, "email", None)
                or "Cliente no disponible"
            )

    return {
        "id_pqr": pqr.id_pqr,
        "usuario_id": pqr.usuario_id,
        "cliente": nombre_cliente,
        "tipo": pqr.tipo,
        "asunto": pqr.asunto,
        "descripcion": pqr.descripcion,
        "respuesta": pqr.respuesta,
        "estado": pqr.estado,
        "creado_en": pqr.creado_en,
        "actualizado_en": pqr.actualizado_en,
    }


@router.post("", status_code=201)
def crear_pqr(
    data: PQRCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(2)),
):
    pqr = PQR(
        usuario_id=usuario.id_usuario,
        tipo=data.tipo,
        asunto=data.asunto,
        descripcion=data.descripcion,
        estado="Pendiente",
    )

    db.add(pqr)
    db.commit()
    db.refresh(pqr)

    return {
        "success": True,
        "message": "PQR creada correctamente",
        "pqr": convertir_pqr(pqr),
    }


@router.get("")
def listar_pqrs(
    db: Session = Depends(get_db),
    _admin_o_empleado: Usuario = Depends(require_roles(1, 3)),
):
    pqrs = (
        db.query(PQR)
        .options(joinedload(PQR.usuario))
        .order_by(PQR.creado_en.desc())
        .all()
    )

    return {
        "success": True,
        "pqrs": [
            convertir_pqr(pqr)
            for pqr in pqrs
        ],
        "total_pqrs": len(pqrs),
    }


@router.get("/mis-pqrs")
def listar_mis_pqrs(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(2)),
):
    pqrs = (
        db.query(PQR)
        .options(joinedload(PQR.usuario))
        .filter(PQR.usuario_id == usuario.id_usuario)
        .order_by(PQR.creado_en.desc())
        .all()
    )

    return {
        "success": True,
        "pqrs": [
            convertir_pqr(pqr)
            for pqr in pqrs
        ],
        "total_pqrs": len(pqrs),
    }


@router.patch("/{pqr_id}/respuesta")
def responder_pqr(
    pqr_id: int,
    data: PQRResponder,
    db: Session = Depends(get_db),
    _admin_o_empleado: Usuario = Depends(require_roles(1, 3)),
):
    pqr = (
        db.query(PQR)
        .filter(PQR.id_pqr == pqr_id)
        .first()
    )

    if not pqr:
        raise HTTPException(
            status_code=404,
            detail="PQR no encontrada",
        )

    pqr.respuesta = data.respuesta
    pqr.estado = data.estado
    pqr.actualizado_en = datetime.utcnow()

    db.commit()
    db.refresh(pqr)

    return {
        "success": True,
        "message": "PQR actualizada correctamente",
        "pqr": convertir_pqr(pqr),
    }