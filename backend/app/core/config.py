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
    API_V1_STR: str
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: SecretStr
    SUPABASE_ANON_KEY: SecretStr
    SIGNUP_OTP_EXPIRE_MINUTES: int = 5
    SIGNUP_OTP_RETURN_DEBUG: bool = False
    EMAIL_FROM_EMAIL: str
    EMAIL_FROM_NAME: str
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: SecretStr
    SMTP_USE_SSL: bool
    SMTP_USE_STARTTLS: bool
    SMTP_TIMEOUT_SECONDS: int
    SECRET_KEY: str = Field(min_length=8)
    ALLOWED_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: Any) -> Any:
        if isinstance(value, str) and not value.startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator(
        "API_V1_STR",
        "DATABASE_URL",
        "EMAIL_FROM_EMAIL",
        "EMAIL_FROM_NAME",
        "SECRET_KEY",
        "SMTP_HOST",
        "SMTP_USERNAME",
        "SUPABASE_URL",
        mode="before",
    )
    @classmethod
    def require_non_empty_text(cls, value: Any) -> Any:
        if isinstance(value, str) and value.strip():
            return value.strip()
        raise ValueError("This environment variable is required.")

    @field_validator("SMTP_PASSWORD", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY")
    @classmethod
    def require_non_empty_secret(cls, value: SecretStr) -> SecretStr:
        if value.get_secret_value().strip():
            return value
        raise ValueError("This environment variable is required.")

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
