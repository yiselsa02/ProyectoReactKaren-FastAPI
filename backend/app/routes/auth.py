import secrets
import smtplib

from datetime import datetime, timedelta

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from ..auth import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_user,
)

from ..database import get_db

from ..models import (
    PasswordResetToken,
    Usuario,
)

from ..services.email import (
    EmailConfigurationError,
    send_password_reset_email,
)

from ..schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    UsuarioResponse,
)


router = APIRouter(
    tags=["Autenticación"]
)


# =====================================================
# LOGIN
# =====================================================

@router.post("/login")
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):

    # =================================================
    # BUSCAR USUARIO POR CORREO
    # =================================================

    user = db.query(Usuario).filter(
        Usuario.email == str(
            credentials.email
        ).lower()
    ).first()

    # =================================================
    # USUARIO NO EXISTE
    # =================================================

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # =================================================
    # CUENTA INACTIVA
    # =================================================

    if not user.estado:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Tu cuenta ha sido inactivada. "
                "No puedes iniciar sesión."
            ),
        )

    # =================================================
    # VERIFICAR CONTRASEÑA
    # =================================================

    if not verify_password(
        credentials.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # =================================================
    # LOGIN CORRECTO
    # =================================================

    return {
        "success": True,
        "token": create_access_token(user),
        "usuario": UsuarioResponse.model_validate(user),
    }


# =====================================================
# TOKEN PARA SWAGGER / OAUTH2
# =====================================================

@router.post("/token")
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # =================================================
    # BUSCAR USUARIO
    # Swagger manda el correo en "username"
    # =================================================

    user = db.query(Usuario).filter(
        Usuario.email == form_data.username.lower()
    ).first()

    # =================================================
    # USUARIO NO EXISTE
    # =================================================

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # =================================================
    # CUENTA INACTIVA
    # =================================================

    if not user.estado:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Tu cuenta ha sido inactivada. "
                "No puedes iniciar sesión."
            ),
        )

    # =================================================
    # VERIFICAR CONTRASEÑA
    # =================================================

    if not verify_password(
        form_data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # =================================================
    # DEVOLVER TOKEN PARA SWAGGER
    # =================================================

    return {
        "access_token": create_access_token(user),
        "token_type": "bearer"
    }


# =====================================================
# PERFIL
# =====================================================

@router.get("/perfil")
def perfil(
    usuario: Usuario = Depends(get_current_user),
):

    return {
        "success": True,
        "usuario": UsuarioResponse.model_validate(usuario),
    }


# =====================================================
# RECUPERAR CONTRASEÑA
# =====================================================

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(Usuario).filter(
        Usuario.email == str(
            data.email
        ).lower(),
        Usuario.estado == True
    ).first()

    if user:

        # =============================================
        # GENERAR CÓDIGO DE 6 DÍGITOS
        # =============================================

        token = f"{secrets.randbelow(1_000_000):06d}"

        reset = PasswordResetToken(
            token=token,
            user_id=user.id_usuario,
            expires_at=(
                datetime.utcnow()
                + timedelta(minutes=30)
            ),
        )

        db.add(reset)
        db.commit()

        # =============================================
        # ENVIAR CORREO
        # =============================================

        try:

            send_password_reset_email(
                user.email,
                token
            )

        except (
            EmailConfigurationError,
            OSError,
            smtplib.SMTPException
        ) as error:

            db.delete(reset)
            db.commit()

            raise HTTPException(
                status_code=503,
                detail=str(error)
            )

    return {
        "success": True,
        "message": (
            "Si el correo existe, "
            "recibirás instrucciones"
        )
    }


# =====================================================
# RESTABLECER CONTRASEÑA
# =====================================================

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == data.code,
        PasswordResetToken.used == False,
    ).first()

    # =================================================
    # VALIDAR CÓDIGO
    # =================================================

    if (
        not reset
        or reset.expires_at < datetime.utcnow()
    ):

        raise HTTPException(
            status_code=400,
            detail="El código no es válido o expiró"
        )

    # =================================================
    # CAMBIAR CONTRASEÑA
    # =================================================

    reset.usuario.password_hash = hash_password(
        data.password
    )

    reset.used = True

    db.commit()

    return {
        "success": True,
        "message": "Contraseña actualizada correctamente"
    }