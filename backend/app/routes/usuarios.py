from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import hash_password, require_roles
from ..database import get_db
from ..models import Rol, Usuario
from ..schemas import (
    EstadoUpdate,
    UsuarioCreate,
    UsuarioListResponse,
    UsuarioMutationResponse,
    UsuarioResponse,
    UsuarioUpdate,
)


router = APIRouter(tags=["Usuarios"])


def _find_role(
    db: Session,
    role_id: int,
) -> Rol:
    role = (
        db.query(Rol)
        .filter(
            Rol.id_rol == role_id,
            Rol.estado == True,
        )
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=400,
            detail="El rol seleccionado no existe",
        )

    return role


def _ensure_unique(
    db: Session,
    data,
    current_id: int | None = None,
) -> None:
    email_query = (
        db.query(Usuario)
        .filter(
            Usuario.email == data.email
        )
    )

    document_query = (
        db.query(Usuario)
        .filter(
            Usuario.numero_documento
            == data.numero_documento
        )
    )

    if current_id is not None:
        email_query = email_query.filter(
            Usuario.id_usuario != current_id
        )

        document_query = document_query.filter(
            Usuario.id_usuario != current_id
        )

    if email_query.first():
        raise HTTPException(
            status_code=409,
            detail="El correo ya está registrado",
        )

    if document_query.first():
        raise HTTPException(
            status_code=409,
            detail="El número de documento ya está registrado",
        )


def _save(
    db: Session,
    user: Usuario,
) -> Usuario:
    try:
        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Los datos ya están registrados",
        )


@router.post(
    "/registro",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_cliente(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
):
    _ensure_unique(
        db,
        usuario,
    )

    role = (
        db.query(Rol)
        .filter(
            Rol.nombre == "Cliente",
            Rol.estado == True,
        )
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=500,
            detail="El rol Cliente no está configurado",
        )

    nuevo_usuario = Usuario(
        nombres=usuario.nombres.strip(),
        apellidos=usuario.apellidos.strip(),
        tipo_documento=usuario.tipo_documento.strip(),
        numero_documento=usuario.numero_documento.strip(),
        direccion=(
            usuario.direccion.strip()
            if usuario.direccion
            else None
        ),
        telefono=(
            usuario.telefono.strip()
            if usuario.telefono
            else None
        ),
        email=str(usuario.email).lower(),
        password_hash=hash_password(
            usuario.password
        ),
        rol_id=role.id_rol,
        estado=True,
    )

    return _save(
        db,
        nuevo_usuario,
    )


@router.post(
    "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_cliente_legacy(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
):
    return registrar_cliente(
        usuario,
        db,
    )


@router.get(
    "",
    response_model=UsuarioListResponse,
)
def listar_usuarios(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(
        require_roles(1)
    ),
):
    usuarios = (
        db.query(Usuario)
        .order_by(
            Usuario.id_usuario.desc()
        )
        .all()
    )

    return {
        "success": True,
        "usuarios": usuarios,
    }


@router.get(
    "/estadisticas",
    response_model=dict,
)
def estadisticas_usuarios(
    db: Session = Depends(get_db),
    _user: Usuario = Depends(
        require_roles(1, 3)
    ),
):
    total_clientes = (
        db.query(Usuario)
        .filter(
            Usuario.rol_id == 2,
            Usuario.estado == True,
        )
        .count()
    )

    return {
        "success": True,
        "total_clientes": total_clientes,
    }


@router.get(
    "/{user_id}",
    response_model=UsuarioResponse,
)
def obtener_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(
        require_roles(1, 2, 3)
    ),
):
    if (
        current_user.rol_id != 1
        and current_user.id_usuario != user_id
    ):
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para este usuario",
        )

    user = (
        db.query(Usuario)
        .filter(
            Usuario.id_usuario == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    return user


@router.post(
    "/admin",
    response_model=UsuarioMutationResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_usuario_admin(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(
        require_roles(1)
    ),
):
    _ensure_unique(
        db,
        usuario,
    )

    role_id = usuario.rol_id or 2

    _find_role(
        db,
        role_id,
    )

    values = usuario.model_dump(
        exclude={
            "password",
            "rol_id",
        }
    )

    values["email"] = str(
        usuario.email
    ).lower()

    nuevo_usuario = Usuario(
        **values,
        password_hash=hash_password(
            usuario.password
        ),
        rol_id=role_id,
        estado=True,
    )

    saved = _save(
        db,
        nuevo_usuario,
    )

    return {
        "success": True,
        "usuario": saved,
    }


@router.put(
    "/{user_id}",
    response_model=UsuarioMutationResponse,
)
def actualizar_usuario(
    user_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(
        require_roles(1)
    ),
):
    user = (
        db.query(Usuario)
        .filter(
            Usuario.id_usuario == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    _ensure_unique(
        db,
        data,
        user_id,
    )

    _find_role(
        db,
        data.rol_id,
    )

    for field in (
        "nombres",
        "apellidos",
        "tipo_documento",
        "numero_documento",
        "direccion",
        "telefono",
        "rol_id",
    ):
        setattr(
            user,
            field,
            getattr(data, field),
        )

    user.email = str(
        data.email
    ).lower()

    if data.password:
        user.password_hash = hash_password(
            data.password
        )

    saved = _save(
        db,
        user,
    )

    return {
        "success": True,
        "usuario": saved,
    }


@router.patch(
    "/{user_id}/estado",
    response_model=UsuarioMutationResponse,
)
def cambiar_estado_usuario(
    user_id: int,
    data: EstadoUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(
        require_roles(1)
    ),
):
    user = (
        db.query(Usuario)
        .filter(
            Usuario.id_usuario == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    user.estado = data.estado

    saved = _save(
        db,
        user,
    )

    return {
        "success": True,
        "usuario": saved,
    }


@router.delete(
    "/{user_id}",
    response_model=dict,
)
def eliminar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(
        require_roles(1)
    ),
):
    user = (
        db.query(Usuario)
        .filter(
            Usuario.id_usuario == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    db.delete(user)
    db.commit()

    return {
        "success": True,
        "message": "Usuario eliminado correctamente",
    }