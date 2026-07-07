from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Evolv API"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./evolv.db"
    SUPABASE_URL: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: SecretStr | None = None
    SUPABASE_ANON_KEY: SecretStr | None = None
    SUPABASE_AUTH_EMAIL_CONFIRM: bool = True
    SECRET_KEY: str = Field(default="change-me-in-local-development", min_length=8)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALLOWED_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: Any) -> Any:
        if isinstance(value, str) and not value.startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: Any) -> Any:
        if isinstance(value, str) and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
