from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "Polar Knowledge Hub"
    app_env: str = "development"
    app_debug: bool = True
    frontend_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"

    # Database (defaults to SQLite for zero-config demo; override with DATABASE_URL env var)
    database_url: str = "sqlite:///./polar_hub.db"

    # Supabase
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None

    # AI
    gemini_api_key: Optional[str] = None

    # JWT
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # Storage
    storage_bucket: str = "polar-knowledge-hub"
    storage_url: Optional[str] = None

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Crawler
    crawler_user_agent: str = "PolarKnowledgeHub/1.0 (SIH2026; Educational Research)"
    crawler_max_depth: int = 2
    crawler_max_pages: int = 100
    crawler_delay_seconds: float = 2.0
    crawler_allowed_domains: str = "ncpor.res.in,ncaor.gov.in"

    # Demo mode
    demo_mode: bool = False

    class Config:
        import os
        from pathlib import Path
        _base = Path(__file__).resolve().parent
        env_file = [str(_base / ".env"), ".env", str(_base.parent.parent / ".env")]
        extra = "ignore"

    @property
    def allowed_domains_list(self) -> list[str]:
        return [d.strip() for d in self.crawler_allowed_domains.split(",")]

    @property
    def use_real_ai(self) -> bool:
        key = (self.gemini_api_key or "").strip()
        return bool(key) and not self.demo_mode

    @property
    def use_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_anon_key)


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def reload_settings() -> Settings:
    """Clear lru_cache and reload settings from environment/.env"""
    get_settings.cache_clear()
    return get_settings()
