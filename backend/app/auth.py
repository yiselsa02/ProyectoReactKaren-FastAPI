import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import get_db
from .models import Usuario


JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "change-this-secret-in-production"
)

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

JWT_EXPIRE_MINUTES = int(
    os.getenv("JWT_EXPIRE_MINUTES", "60")
)


# =====================================================
# OAUTH2
# =====================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token"
)


# =====================================================
# HASH DE CONTRASEÑA
# =====================================================

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError(
            "La contraseña no puede superar los 72 bytes."
        )

    return bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    ).decode("utf-8")


# =====================================================
# VERIFICAR CONTRASEÑA
# =====================================================

def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# =====================================================
# CREAR JWT
# =====================================================

def create_access_token(user: Usuario) -> str:

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=JWT_EXPIRE_MINUTES)
    )

    payload = {
        "sub": str(user.id_usuario),
        "role": user.rol_id,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


# =====================================================
# OBTENER USUARIO ACTUAL
# =====================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_error

    except (JWTError, ValueError):
        raise credentials_error

    user = db.query(Usuario).filter(
        Usuario.id_usuario == int(user_id)
    ).first()

    if not user:
        raise credentials_error

    # =================================================
    # VERIFICAR SI LA CUENTA SIGUE ACTIVA
    # =================================================

    if not user.estado:
        raise credentials_error

    return user


# =====================================================
# VERIFICAR ROLES
# =====================================================

def require_roles(*roles: int):

    def role_dependency(
        user: Usuario = Depends(get_current_user)
    ) -> Usuario:

        if user.rol_id not in roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tienes permisos para realizar "
                    "esta operación"
                ),
            )

        return user

    return role_dependency