import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv()


# ============================================================
# DATABASE URL
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está configurada"
    )


# ============================================================
# POSTGRESQL + PSYCOPG
# ============================================================

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )


# ============================================================
# ENGINE
# ============================================================

engine = create_engine(
    DATABASE_URL,

    echo=(
        os.getenv(
            "SQL_ECHO",
            "false"
        ).lower() == "true"
    ),

    # Evita reutilizar conexiones que Neon
    # haya cerrado mientras estaban inactivas.
    pool_pre_ping=True,

    # No mantener conexiones abiertas
    # indefinidamente en Vercel.
    pool_recycle=300,

    # Evita que una función serverless acumule
    # demasiadas conexiones.
    pool_size=1,
    max_overflow=0,
)


# ============================================================
# SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ============================================================
# BASE
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()