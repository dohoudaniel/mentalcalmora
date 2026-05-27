from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # Legacy catch-all (used in production or when only one DB is configured)
    database_url: str = ""

    # Explicit local vs Supabase URLs for development auto-fallback
    database_url_local: str = ""
    database_url_supabase: str = ""

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    gemini_api_key: str = ""
    allowed_origins: str = "http://localhost:8080,http://localhost:3000"
    app_env: str = "development"
    port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
