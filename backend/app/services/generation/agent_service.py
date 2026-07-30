from __future__ import annotations

import asyncio
import json
import logging
import random
import time
from collections.abc import Callable
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings
from app.services.provider_clients import (
    GROQ_CHAT_COMPLETIONS_PATH,
    groq_headers,
    groq_http_client,
    groq_sync_http_client,
    groq_url,
)

logger = logging.getLogger(__name__)

SchemaT = TypeVar("SchemaT", bound=BaseModel)

MAX_ATTEMPTS = 6
CHAT_MAX_ATTEMPTS = 5

RETRY_FAIL_FAST_SECONDS = 120.0

RETRY_BUDGET_SECONDS = 300.0

NON_RETRYABLE_STATUSES = frozenset({400, 401, 403, 404, 413, 422})

_CONCURRENCY: asyncio.Semaphore | None = None


def _groq_concurrency() -> asyncio.Semaphore:
    """One semaphore for the process, sized from settings on first use.

    Groq's free tier bills tokens per minute, and a single agent call is large
    enough that even two in flight blow the window and keep re-blowing it on
    reset, so the pipeline never finishes. A paid key with real TPM headroom can
    raise GROQ_MAX_CONCURRENCY without touching this code.
    """
    global _CONCURRENCY
    if _CONCURRENCY is None:
        _CONCURRENCY = asyncio.Semaphore(get_settings().GROQ_MAX_CONCURRENCY)
    return _CONCURRENCY


class AgentServiceError(RuntimeError):
    """Raised when an AI provider cannot return a valid agent response."""


class AgentRateLimitError(AgentServiceError):
    """Raised when the provider's rate limit cannot be waited out in-request."""


class TruncatedResponseError(ValueError):
    """Raised when the model hit max_tokens before closing its JSON.

    A parse error cannot distinguish this from a malformed answer, so retrying
    would repeat the same overlong response. The provider reports it directly
    via finish_reason, which lets the retry ask for a shorter one instead.
    """


def _rate_limit_error(model: str, delay: float) -> AgentRateLimitError:
    minutes = max(1, round(delay / 60))
    hint = " (daily token budget likely spent)" if delay > RETRY_FAIL_FAST_SECONDS else ""
    return AgentRateLimitError(
        f"Groq rate limit reached for {model}{hint}. Try again in ~{minutes} min."
    )


async def call_agent(
    schema: type[SchemaT],
    system: str,
    user: str,
    *,
    max_tokens: int | None = None,
    model: str | None = None,
    verify: Callable[[SchemaT], None] | None = None,
) -> SchemaT:
    """Call an agent and return its schema-valid output.

    `verify` runs after schema validation for rules the schema cannot express
    (totals that must reconcile, graphs that must stay acyclic). Raising
    ValueError from it re-enters the same corrective-retry loop a schema
    failure uses, so a semantic rejection reaches the model as feedback.
    """
    settings = get_settings()
    headers = groq_headers()
    if not headers["Authorization"].removeprefix("Bearer ").strip():
        raise AgentServiceError("GROQ_API_KEY is required for blueprint generation.")

    schema_json = json.dumps(_slim_schema(schema.model_json_schema()), ensure_ascii=True)
    payload = {
        "model": model or settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": (
                    f"{user}\n\nRespond with a single JSON object containing the data. "
                    "It must validate against this JSON Schema — output the data, "
                    f"never the schema itself:\n{schema_json}"
                ),
            },
        ],
        "temperature": 0.35,
        "response_format": {"type": "json_object"},
    }
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens
    if "gpt-oss" in payload["model"]:
        payload["reasoning_effort"] = "low"

    url = groq_url(GROQ_CHAT_COMPLETIONS_PATH)

    last_error: Exception | None = None
    deadline = time.monotonic() + RETRY_BUDGET_SECONDS
    attempt = 0
    async with groq_http_client() as client:
        while True:
            try:
                async with _groq_concurrency():
                    response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 429:
                    delay = _retry_delay(response, attempt)
                    if delay > RETRY_FAIL_FAST_SECONDS or time.monotonic() + delay > deadline:
                        raise _rate_limit_error(payload["model"], delay)
                    logger.warning(
                        "Groq 429 (%s): waiting %.0fs (%.0fs retry budget left)",
                        payload["model"],
                        delay,
                        deadline - time.monotonic(),
                    )
                    await asyncio.sleep(delay + random.uniform(0.5, 2.5))
                    continue
                if response.status_code in NON_RETRYABLE_STATUSES:
                    raise AgentServiceError(
                        f"Groq rejected the request for {payload['model']} with "
                        f"{response.status_code}; retrying the same request cannot help."
                    )
                response.raise_for_status()
                choice = response.json()["choices"][0]
                if choice.get("finish_reason") == "length":
                    raise TruncatedResponseError(
                        "Your previous response was cut off before the JSON finished. "
                        "Return the same structure with fewer list items and shorter prose "
                        "so the whole object fits."
                    )
                content = choice["message"]["content"]
                result = _parse_agent_json(schema, content)
                if verify is not None:
                    verify(result)
                return result
            except (httpx.HTTPError, KeyError, TypeError, ValueError, ValidationError) as exc:
                last_error = exc
                attempt += 1
                if attempt < MAX_ATTEMPTS:
                    if isinstance(exc, ValueError):
                        payload["messages"] = payload["messages"][:2] + [
                            {
                                "role": "user",
                                "content": (
                                    f"Your previous response was rejected: {str(exc)[:400]}\n"
                                    "Return ONLY a JSON data object that conforms to the "
                                    "schema — never the schema itself."
                                ),
                            }
                        ]
                    await asyncio.sleep(1.5 * attempt)
                    continue
                break
    raise AgentServiceError(f"Groq returned an invalid agent response: {last_error}") from last_error


def _slim_schema(schema: dict) -> dict:
    """Strip auto-generated `title` keys from a Pydantic JSON Schema.

    Pydantic adds a title to every model and field; they carry no validation
    meaning but cost hundreds of prompt tokens per call across the pipeline.
    """
    if isinstance(schema, dict):
        return {
            key: _slim_schema(value)
            for key, value in schema.items()
            if key != "title"
        }
    if isinstance(schema, list):
        return [_slim_schema(item) for item in schema]
    return schema


def _parse_agent_json(schema: type[SchemaT], content: str) -> SchemaT:
    text = content.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0].strip()
    return schema.model_validate(json.loads(text))


def _parse_time_string(val: str) -> float:
    val = val.strip().lower()
    if val.endswith("ms"):
        try:
            return float(val[:-2]) / 1000.0
        except ValueError:
            pass
    if val.endswith("s"):
        val = val[:-1]
    if "m" in val:
        parts = val.split("m")
        try:
            minutes = float(parts[0])
            seconds = float(parts[1]) if len(parts) > 1 and parts[1] else 0.0
            return minutes * 60.0 + seconds
        except ValueError:
            pass
    try:
        return float(val)
    except ValueError:
        return 5.0


def _retry_delay(response: httpx.Response, attempt: int) -> float:
    """Provider-signaled wait before the limit resets, uncapped — callers
    decide whether a wait that long is worth riding out or should fail fast."""
    retry_after = response.headers.get("retry-after")
    if retry_after:
        try:
            return float(retry_after)
        except ValueError:
            pass
    for header in ("x-ratelimit-reset-tokens", "x-ratelimit-reset-requests"):
        val = response.headers.get(header)
        if val:
            return _parse_time_string(val) + 0.5
    return 3.0 * (attempt + 1)


def generate_chat(system: str, messages: list[dict[str, str]]) -> str:
    settings = get_settings()
    headers = groq_headers()
    if not headers["Authorization"].removeprefix("Bearer ").strip():
        raise AgentServiceError("GROQ_API_KEY is required for chat completions.")

    payload = {
        "model": settings.CHAT_MODEL_NAME,
        "messages": [
            {"role": "system", "content": system},
            *messages,
        ],
        "temperature": 0.3,
    }

    url = groq_url(GROQ_CHAT_COMPLETIONS_PATH)

    last_error: Exception | None = None
    with groq_sync_http_client() as client:
        for attempt in range(CHAT_MAX_ATTEMPTS):
            try:
                response = client.post(url, headers=headers, json=payload)
                if response.status_code == 429 and attempt < CHAT_MAX_ATTEMPTS - 1:
                    delay = _retry_delay(response, attempt)
                    if delay > RETRY_FAIL_FAST_SECONDS:
                        raise _rate_limit_error(payload["model"], delay)
                    time.sleep(delay)
                    continue
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                if not isinstance(content, str) or not content.strip():
                    raise ValueError("AI provider returned an empty chat response.")
                return content.strip()
            except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
                last_error = exc
                if attempt < CHAT_MAX_ATTEMPTS - 1:
                    time.sleep(2.0 * (attempt + 1))
                    continue
    raise AgentServiceError(f"Groq returned an invalid chat response: {last_error}") from last_error
