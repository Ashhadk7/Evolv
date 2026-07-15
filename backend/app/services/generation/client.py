from __future__ import annotations

import json
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings

SchemaT = TypeVar("SchemaT", bound=BaseModel)


class AgentClientError(RuntimeError):
    """Raised when an AI provider cannot return a valid agent response."""


async def call_agent(
    schema: type[SchemaT],
    system: str,
    user: str,
    *,
    max_tokens: int | None = None,
) -> SchemaT:
    settings = get_settings()
    api_key = settings.GROQ_API_KEY.get_secret_value().strip()
    if not api_key:
        raise AgentClientError("GROQ_API_KEY is required for blueprint generation.")

    schema_json = json.dumps(schema.model_json_schema(), ensure_ascii=True)
    payload = {
        "model": settings.GROQ_MODEL,
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

    try:
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return _parse_agent_json(schema, content)
    except (httpx.HTTPError, KeyError, TypeError, ValueError, ValidationError) as exc:
        raise AgentClientError("Groq returned an invalid agent response.") from exc


def _parse_agent_json(schema: type[SchemaT], content: str) -> SchemaT:
    try:
        raw = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AgentClientError("AI provider response was not valid JSON.") from exc
    return schema.model_validate(raw)
