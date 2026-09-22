from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import require_roles
from ..database import get_db
from ..models import PQR, Usuario
from ..schemas.pqr import (
    PQRCrear,
    PQRResponder,
)


router = APIRouter(tags=["PQR"])


# ============================================================
# CREAR PQR
# Solo clientes
# ============================================================

@router.post(
    "",
    status_code=201,
)
def crear_pqr(
    data: PQRCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_roles(2)
    ),
):
    pqr = PQR(
        usuario_id=usuario.id_usuario,
        tipo=data.tipo,
        asunto=data.asunto,
        descripcion=data.descripcion,
        estado="Pendiente",
        creado_en=datetime.utcnow(),
    )

    db.add(pqr)
    db.commit()
    db.refresh(pqr)

    return {
        "success": True,
        "pqr": pqr,
    }


# ============================================================
# LISTAR PQR
# Administrador y empleado
# ============================================================

@router.get("")
def listar_pqrs(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_roles(1, 3)
    ),
):
    pqrs = (
        db.query(PQR)
        .options(
            joinedload(PQR.usuario)
        )
        .order_by(
            PQR.creado_en.desc()
        )
        .all()
    )

    resultado = []

    for pqr in pqrs:
        nombre_cliente = "Cliente no disponible"

        if pqr.usuario:
            nombres = (
                getattr(
                    pqr.usuario,
                    "nombres",
                    "",
                )
                or ""
            )

            apellidos = (
                getattr(
                    pqr.usuario,
                    "apellidos",
                    "",
                )
                or ""
            )

            nombre_cliente = (
                f"{nombres} {apellidos}"
                .strip()
            )

            if not nombre_cliente:
                nombre_cliente = (
                    getattr(
                        pqr.usuario,
                        "email",
                        None,
                    )
                    or "Cliente no disponible"
                )

        resultado.append(
            {
                "id_pqr": pqr.id_pqr,
                "usuario_id": pqr.usuario_id,
                "cliente": nombre_cliente,
                "tipo": pqr.tipo,
                "asunto": pqr.asunto,
                "descripcion": pqr.descripcion,
                "estado": pqr.estado,
                "respuesta": pqr.respuesta,
                "creado_en": pqr.creado_en,
                "respondido_en": pqr.respondido_en,
            }
        )

    return {
        "success": True,
        "pqrs": resultado,
    }


# ============================================================
# MIS PQR
# Solo clientes
# ============================================================

@router.get("/mis-pqrs")
def mis_pqrs(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_roles(2)
    ),
):
    pqrs = (
        db.query(PQR)
        .filter(
            PQR.usuario_id
            == usuario.id_usuario
        )
        .order_by(
            PQR.creado_en.desc()
        )
        .all()
    )

    return {
        "success": True,
        "pqrs": pqrs,
    }


# ============================================================
# RESPONDER PQR
# Administrador y empleado
# ============================================================

@router.patch(
    "/{pqr_id}/respuesta"
)
def responder_pqr(
    pqr_id: int,
    data: PQRResponder,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_roles(1, 3)
    ),
):
    pqr = (
        db.query(PQR)
        .filter(
            PQR.id_pqr == pqr_id
        )
        .first()
    )

    if not pqr:
        raise HTTPException(
            status_code=404,
            detail="PQR no encontrada",
        )

    pqr.respuesta = data.respuesta
    pqr.estado = "Respondida"
    pqr.respondido_en = datetime.utcnow()

    db.commit()
    db.refresh(pqr)

    return {
        "success": True,
        "pqr": pqr,
    }