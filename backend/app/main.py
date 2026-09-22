import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import auth, chatbot, pedidos, productos, usuarios, pqr

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API CellWorld",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://cellworld-[a-z0-9]+-yiselsa02\.vercel\.app",
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(pqr.router)
app.include_router(chatbot.router)


@app.get("/")
def inicio():
    return {
        "success": True,
        "message": "Bienvenido a la API de CellWorld",
    }