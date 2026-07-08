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
    DATABASE_URL: str = Field(min_length=1)
    SUPABASE_URL: str = Field(min_length=1)
    SUPABASE_SERVICE_ROLE_KEY: SecretStr
    SUPABASE_ANON_KEY: SecretStr
    FIREBASE_CREDENTIALS_JSON: SecretStr
    SIGNUP_OTP_EXPIRE_MINUTES: int = 5
    SIGNUP_OTP_RETURN_DEBUG: bool = False
    EMAIL_FROM_EMAIL: str = Field(min_length=1)
    EMAIL_FROM_NAME: str = "Evolv AI"
    SMTP_HOST: str = Field(min_length=1)
    SMTP_PORT: int = 465
    SMTP_USERNAME: str = Field(min_length=1)
    SMTP_PASSWORD: SecretStr
    SMTP_USE_SSL: bool = True
    SMTP_USE_STARTTLS: bool = False
    SMTP_TIMEOUT_SECONDS: int = 20
    SECRET_KEY: str = Field(min_length=8)
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

    @field_validator(
        "API_V1_STR",
        "DATABASE_URL",
        "EMAIL_FROM_NAME",
        "SUPABASE_URL",
        "EMAIL_FROM_EMAIL",
        "SMTP_HOST",
        "SMTP_USERNAME",
        "SECRET_KEY",
    )
    @classmethod
    def require_non_empty_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Setting cannot be blank.")
        return value

    @field_validator(
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_ANON_KEY",
        "FIREBASE_CREDENTIALS_JSON",
        "SMTP_PASSWORD",
    )
    @classmethod
    def require_non_empty_secret(cls, value: SecretStr) -> SecretStr:
        if not value.get_secret_value().strip():
            raise ValueError("Secret setting cannot be blank.")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
