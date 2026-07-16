from __future__ import annotations

import asyncio
import json
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings
from app.services.provider_clients import (
    GROQ_CHAT_COMPLETIONS_PATH,
    groq_headers,
    groq_http_client,
    groq_url,
)

SchemaT = TypeVar("SchemaT", bound=BaseModel)

MAX_ATTEMPTS = 3


class AgentServiceError(RuntimeError):
    """Raised when an AI provider cannot return a valid agent response."""


async def call_agent(
    schema: type[SchemaT],
    system: str,
    user: str,
    *,
    max_tokens: int | None = None,
) -> SchemaT:
    settings = get_settings()
    headers = groq_headers()
    if not headers["Authorization"].removeprefix("Bearer ").strip():
        raise AgentServiceError("GROQ_API_KEY is required for blueprint generation.")

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

    url = groq_url(GROQ_CHAT_COMPLETIONS_PATH)

    last_error: Exception | None = None
    async with groq_http_client() as client:
        for attempt in range(MAX_ATTEMPTS):
            try:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 429 and attempt < MAX_ATTEMPTS - 1:
                    await asyncio.sleep(_retry_delay(response, attempt))
                    continue
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return _parse_agent_json(schema, content)
            except (httpx.HTTPError, KeyError, TypeError, ValueError, ValidationError) as exc:
                last_error = exc
                if attempt < MAX_ATTEMPTS - 1:
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
    raise AgentServiceError(f"Groq returned an invalid agent response: {last_error}") from last_error


def _retry_delay(response: httpx.Response, attempt: int) -> float:
    retry_after = response.headers.get("retry-after")
    if retry_after:
        try:
            return min(float(retry_after), 20.0)
        except ValueError:
            pass
    return min(2.0**attempt, 20.0)


def _parse_agent_json(schema: type[SchemaT], content: str) -> SchemaT:
    try:
        raw = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AgentServiceError("AI provider response was not valid JSON.") from exc
    return schema.model_validate(raw)
