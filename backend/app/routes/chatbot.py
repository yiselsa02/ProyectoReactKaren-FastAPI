import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


@router.post("")
def responder_chatbot(data: ChatRequest):
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="La IA no está configurada. Se usará el asistente local.",
        )

    mensajes = [
        {
            "role": "system",
            "content": (
                "Eres CellBot, el asistente virtual de CellWorld, una tienda colombiana "
                "de celulares y accesorios. Responde en español, de forma clara, amable "
                "y breve. Ayuda con catálogo, precios, pedidos, carrito, pagos, entregas, "
                "cuenta, garantías y PQR. No inventes stock, precios, pedidos ni políticas. "
                "Si no tienes un dato real, indica que debe revisarse en el catálogo, el "
                "panel del cliente o con soporte. Nunca solicites contraseñas ni claves."
            ),
        }
    ]
    mensajes.extend(
        {"role": item.role, "content": item.content}
        for item in data.history[-20:]
    )
    mensajes.append({"role": "user", "content": data.message})

    cuerpo = json.dumps(
        {
            "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "messages": mensajes,
            "temperature": 0.7,
            "max_tokens": 350,
        }
    ).encode("utf-8")

    solicitud = Request(
        "https://api.openai.com/v1/chat/completions",
        data=cuerpo,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(solicitud, timeout=30) as respuesta:
            resultado = json.loads(respuesta.read().decode("utf-8"))
    except HTTPError as error:
        detalle = error.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=502,
            detail=f"No fue posible consultar la IA: {detalle[:300]}",
        ) from error
    except (URLError, TimeoutError) as error:
        raise HTTPException(
            status_code=504,
            detail="La IA tardó demasiado en responder.",
        ) from error

    try:
        respuesta_ia = resultado["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as error:
        raise HTTPException(
            status_code=502,
            detail="La IA devolvió una respuesta inválida.",
        ) from error

    return {"success": True, "reply": respuesta_ia}
