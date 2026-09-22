from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import require_roles
from ..database import get_db
from ..models import PQR
from ..schemas.pqr import PQRCrear, PQRResponder


router = APIRouter(tags=["PQR"])


# ============================================================
# CREAR PQR
# CLIENTE
# ============================================================

@router.post("")
def crear_pqr(
    datos: PQRCrear,
    db: Session = Depends(get_db),
    usuario_actual=Depends(require_roles(2)),
):
    nueva_pqr = PQR(
        usuario_id=usuario_actual.id_usuario,
        tipo=datos.tipo,
        asunto=datos.asunto,
        descripcion=datos.descripcion,
        estado="Pendiente",
        creado_en=datetime.utcnow(),
    )

    db.add(nueva_pqr)
    db.commit()
    db.refresh(nueva_pqr)

    return {
        "success": True,
        "message": "PQR creada correctamente.",
        "pqr": {
            "id_pqr": nueva_pqr.id_pqr,
            "usuario_id": nueva_pqr.usuario_id,
            "tipo": nueva_pqr.tipo,
            "asunto": nueva_pqr.asunto,
            "descripcion": nueva_pqr.descripcion,
            "respuesta": nueva_pqr.respuesta,
            "estado": nueva_pqr.estado,
            "creado_en": nueva_pqr.creado_en,
        },
    }


# ============================================================
# LISTAR TODAS LAS PQR
# ADMINISTRADOR / EMPLEADO
# ============================================================

@router.get("")
def listar_pqrs(
    db: Session = Depends(get_db),
    usuario_actual=Depends(require_roles(1, 3)),
):
    pqrs = (
        db.query(PQR)
        .options(joinedload(PQR.usuario))
        .order_by(PQR.creado_en.desc())
        .all()
    )

    resultado = []

    for pqr in pqrs:
        usuario = pqr.usuario

        resultado.append({
            "id_pqr": pqr.id_pqr,
            "usuario_id": pqr.usuario_id,

            "usuario": (
                f"{usuario.nombres} {usuario.apellidos}"
                if usuario
                else "Usuario"
            ),

            "nombre_usuario": (
                f"{usuario.nombres} {usuario.apellidos}"
                if usuario
                else "Usuario"
            ),

            "email": usuario.email if usuario else None,

            "tipo": pqr.tipo,
            "asunto": pqr.asunto,
            "descripcion": pqr.descripcion,
            "respuesta": pqr.respuesta,
            "estado": pqr.estado,
            "creado_en": pqr.creado_en,

            # La tabla/modelo PQR no tiene esta columna.
            "respondido_en": None,
        })

    return resultado


# ============================================================
# PQR DEL CLIENTE ACTUAL
# ============================================================

@router.get("/mis-pqrs")
def listar_mis_pqrs(
    db: Session = Depends(get_db),
    usuario_actual=Depends(require_roles(2)),
):
    pqrs = (
        db.query(PQR)
        .filter(
            PQR.usuario_id == usuario_actual.id_usuario
        )
        .order_by(PQR.creado_en.desc())
        .all()
    )

    return [
        {
            "id_pqr": pqr.id_pqr,
            "usuario_id": pqr.usuario_id,
            "tipo": pqr.tipo,
            "asunto": pqr.asunto,
            "descripcion": pqr.descripcion,
            "respuesta": pqr.respuesta,
            "estado": pqr.estado,
            "creado_en": pqr.creado_en,

            # La columna no existe en el modelo.
            "respondido_en": None,
        }
        for pqr in pqrs
    ]


# ============================================================
# RESPONDER PQR
# ADMINISTRADOR / EMPLEADO
# ============================================================

@router.patch("/{pqr_id}/respuesta")
def responder_pqr(
    pqr_id: int,
    datos: PQRResponder,
    db: Session = Depends(get_db),
    usuario_actual=Depends(require_roles(1, 3)),
):
    pqr = (
        db.query(PQR)
        .filter(PQR.id_pqr == pqr_id)
        .first()
    )

    if not pqr:
        raise HTTPException(
            status_code=404,
            detail="PQR no encontrada.",
        )

    pqr.respuesta = datos.respuesta
    pqr.estado = "Respondida"

    db.commit()
    db.refresh(pqr)

    return {
        "success": True,
        "message": "PQR respondida correctamente.",
        "pqr": {
            "id_pqr": pqr.id_pqr,
            "usuario_id": pqr.usuario_id,
            "tipo": pqr.tipo,
            "asunto": pqr.asunto,
            "descripcion": pqr.descripcion,
            "respuesta": pqr.respuesta,
            "estado": pqr.estado,
            "creado_en": pqr.creado_en,
            "respondido_en": None,
        },
    }