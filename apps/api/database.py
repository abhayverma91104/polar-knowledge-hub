"""
Database session management — supports both PostgreSQL (pgvector) and SQLite (demo mode)
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import logging

from config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

db_url = settings.database_url
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

IS_SQLITE = db_url.startswith("sqlite")

# SQLite needs connect_args; PostgreSQL needs pool settings
if IS_SQLITE:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(
        db_url,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database with tables"""
    from models import Base

    if not IS_SQLITE:
        # Try to enable pgvector extension (PostgreSQL only)
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.commit()
                logger.info("pgvector extension enabled")
        except Exception as e:
            logger.warning(f"Could not enable pgvector (OK for SQLite): {e}")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database tables created ({'SQLite demo' if IS_SQLITE else 'PostgreSQL'})")


def check_db_connection() -> bool:
    """Check if database is reachable"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
