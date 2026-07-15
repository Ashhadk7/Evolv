from __future__ import annotations

import json
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings

SchemaT = TypeVar("SchemaT", bound=BaseModel)


class AgentClientError(RuntimeError):
    """Raised when an AI provider cannot return a valid agent response."""


class AgentProviderUnavailableError(AgentClientError):
    """Raised when the selected provider is intentionally unavailable."""


async def call_agent(
    schema: type[SchemaT],
    system: str,
    user: str,
    *,
    model: str | None = None,
    max_tokens: int | None = None,
    retries: int = 1,
) -> SchemaT:
    """Call the configured AI provider and validate the response.

    Generation is currently Groq-only so backend tests and API calls verify real model output.
    """

    settings = get_settings()
    provider = settings.AI_PROVIDER.lower()

    if provider == "groq":
        return await _call_groq(
            schema, system, user, model=model, max_tokens=max_tokens, retries=retries
        )

    raise AgentProviderUnavailableError(f"Unsupported AI provider: {settings.AI_PROVIDER}")


async def _call_groq(
    schema: type[SchemaT],
    system: str,
    user: str,
    *,
    model: str | None,
    max_tokens: int | None,
    retries: int,
) -> SchemaT:
    settings = get_settings()
    api_key = settings.GROQ_API_KEY.get_secret_value().strip() if settings.GROQ_API_KEY else ""
    if not api_key:
        raise AgentProviderUnavailableError("GROQ_API_KEY is required when AI_PROVIDER=groq.")

    schema_json = json.dumps(schema.model_json_schema(), ensure_ascii=True)
    payload = {
        "model": model or settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": (
                    f"{user}\n\nReturn only JSON that validates against this JSON Schema:\n"
                    f"{schema_json}"
                ),
            },
        ],
        "temperature": 0.35,
        "response_format": {"type": "json_object"},
    }
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens
    url = f"{settings.GROQ_API_BASE_URL.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    last_error: Exception | None = None
    attempts = max(1, retries + 1)
    async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
        for _ in range(attempts):
            try:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return _parse_agent_json(schema, content)
            except (httpx.HTTPError, KeyError, TypeError, ValueError, ValidationError) as exc:
                last_error = exc

    raise AgentClientError("AI provider returned an invalid agent response.") from last_error


def _parse_agent_json(schema: type[SchemaT], content: str) -> SchemaT:
    try:
        raw = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AgentClientError("AI provider response was not valid JSON.") from exc
    return schema.model_validate(raw)
