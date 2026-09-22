from datetime import datetime

from pydantic import BaseModel, Field


# ============================================================
# CREAR PQR
# ============================================================

class PQRCrear(BaseModel):

    tipo: str = Field(
        min_length=2,
        max_length=100
    )

    asunto: str = Field(
        min_length=2,
        max_length=255
    )

    descripcion: str = Field(
        min_length=2,
        max_length=2000
    )


# ============================================================
# RESPONDER PQR
# ============================================================

class PQRResponder(BaseModel):

    respuesta: str = Field(
        min_length=1,
        max_length=2000
    )


# ============================================================
# RESPUESTA PQR
# ============================================================

class PQRResponse(BaseModel):

    id_pqr: int

    usuario_id: int

    tipo: str

    asunto: str

    descripcion: str

    respuesta: str | None = None

    estado: str

    creado_en: datetime

    actualizado_en: datetime | None = None

    respondido_en: datetime | None = None