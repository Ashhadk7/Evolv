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
    SIGNUP_OTP_EXPIRE_MINUTES: int = 5
    SIGNUP_OTP_RETURN_DEBUG: bool = False
    PASSWORD_RESET_OTP_COOLDOWN_SECONDS: int = Field(default=30, ge=0, le=3600)
    EMAIL_PROVIDER: Literal["smtp", "brevo"] = "smtp"
    EMAIL_FROM_EMAIL: str = Field(min_length=1)
    EMAIL_FROM_NAME: str = "Evolv AI"
    BREVO_API_KEY: SecretStr | None = None
    BREVO_API_BASE_URL: str = "https://api.brevo.com/v3"
    BREVO_TIMEOUT_SECONDS: int = Field(default=20, ge=1, le=120)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: SecretStr | None = None
    SMTP_USE_SSL: bool = True
    SMTP_USE_STARTTLS: bool = False
    SMTP_TIMEOUT_SECONDS: int = 20
    SECRET_KEY: str = Field(min_length=8)
    ALLOWED_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    TWILIO_ACCOUNT_SID: str = Field(min_length=1)
    TWILIO_AUTH_TOKEN: SecretStr
    TWILIO_VERIFY_SERVICE_SID: str = Field(min_length=1)
    TWILIO_VERIFY_CHANNEL: str = Field(min_length=1)
    TWILIO_TIMEOUT_SECONDS: int = Field(ge=1, le=120)
    GOOGLE_CALENDAR_CLIENT_ID: str = Field(min_length=1)
    GOOGLE_CALENDAR_CLIENT_SECRET: SecretStr
    GOOGLE_CALENDAR_REDIRECT_URI: str = Field(min_length=1)
    GOOGLE_CALENDAR_FRONTEND_RETURN_URL: str = Field(min_length=1)
    AI_TIMEOUT_SECONDS: int = Field(default=45, ge=1, le=180)
    GROQ_MAX_CONCURRENCY: int = Field(default=1, ge=1, le=8)
    GENERATION_DEADLINE_SECONDS: int = Field(default=660, ge=60, le=3600)
    GROQ_API_KEY: SecretStr
    GROQ_API_BASE_URL: str = Field(min_length=1)
    GROQ_MODEL: str = Field(min_length=1)
    GROQ_FAST_MODEL: str = "llama-3.1-8b-instant"
    CHAT_MODEL_NAME: str = "llama-3.1-8b-instant"
    ENRICHMENT_TIMEOUT_SECONDS: int = Field(default=12, ge=1, le=60)
    TAVILY_API_KEY: SecretStr
    TAVILY_BASE_URL: str = Field(min_length=1)
    PINECONE_API_KEY: SecretStr | None = None
    PINECONE_INDEX_NAME: str | None = None
    PINECONE_REGION: str | None = None
    PINECONE_EMBEDDING_MODEL: str = "multilingual-e5-large"
    DB_POOL_SIZE: int = Field(default=5, ge=1, le=20)
    DB_MAX_OVERFLOW: int = Field(default=5, ge=0, le=20)
    DB_POOL_TIMEOUT_SECONDS: int = Field(default=10, ge=1, le=60)
    DB_POOL_RECYCLE_SECONDS: int = Field(default=1800, ge=30, le=86400)
    STRIPE_SECRET_KEY: SecretStr | None = None
    STRIPE_WEBHOOK_SECRET: SecretStr | None = None
    STRIPE_API_BASE_URL: str = "https://api.stripe.com/v1"

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
        "BREVO_API_BASE_URL",
        "SECRET_KEY",
        "TWILIO_ACCOUNT_SID",
        "TWILIO_VERIFY_SERVICE_SID",
        "TWILIO_VERIFY_CHANNEL",
        "GOOGLE_CALENDAR_CLIENT_ID",
        "GOOGLE_CALENDAR_REDIRECT_URI",
        "GOOGLE_CALENDAR_FRONTEND_RETURN_URL",
        "GROQ_API_BASE_URL",
        "GROQ_MODEL",
        "CHAT_MODEL_NAME",
        "TAVILY_BASE_URL",
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
        "TWILIO_AUTH_TOKEN",
        "GOOGLE_CALENDAR_CLIENT_SECRET",
        "GROQ_API_KEY",
        "TAVILY_API_KEY",
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
