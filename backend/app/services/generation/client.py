import json
from typing import TypeVar

import httpx
from openai import OpenAI
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings, settings

SchemaT = TypeVar("SchemaT", bound=BaseModel)


class AgentClientError(RuntimeError):
    """Raised when an AI provider cannot return a valid agent response."""


# --- Chatbot Helper Methods (Sync OpenAI Client) ---

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        if settings.GROQ_API_KEY is None:
            raise RuntimeError("GROQ_API_KEY is not set in .env — chatbot is unavailable.")
        _client = OpenAI(
            api_key=settings.GROQ_API_KEY.get_secret_value(),
            base_url="https://api.groq.com/openai/v1",
        )
    return _client


def generate_chat(system: str, messages: list[dict]) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model=settings.CHAT_MODEL_NAME,
        messages=[{"role": "system", "content": system}, *messages],
        temperature=0.3,
    )
    content = response.choices[0].message.content
    return content or ""


# --- Blueprint Agents Helper Methods (Async HTTPX Client) ---

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
