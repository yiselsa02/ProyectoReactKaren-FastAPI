from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth
from app.routes import usuarios
from app.routes import productos
from app.routes import pedidos
from app.routes import pqr
from app.routes import chatbot


app = FastAPI(
    title="CellWorld API",
    description="API para el sistema CellWorld",
    version="1.0.0"
)


# ============================================================
# RUTAS
# ============================================================

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Autenticación"]
)

app.include_router(
    usuarios.router,
    prefix="/api/usuarios",
    tags=["Usuarios"]
)

app.include_router(
    productos.router,
    prefix="/api/productos",
    tags=["Productos"]
)

app.include_router(
    pedidos.router,
    prefix="/api/pedidos",
    tags=["Pedidos"]
)

app.include_router(
    pqr.router,
    prefix="/api/pqr",
    tags=["PQR"]
)

app.include_router(
    chatbot.router,
    prefix="/api/chatbot",
    tags=["Chatbot"]
)


# ============================================================
# RUTA PRINCIPAL
# ============================================================

@app.get("/")
def inicio():
    return {
        "success": True,
        "message": "Bienvenido a la API de CellWorld"
    }


# ============================================================
# CORS
# ============================================================
#
# Se coloca envolviendo TODA la aplicación para que las
# respuestas normales y también los errores lleven CORS.
#

app = CORSMiddleware(
    app=app,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://cellworld-flax.vercel.app",
        "https://cellworld-amu7ahzzo-yiselsa02.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)