from __future__ import annotations

from openai import OpenAI

from app.core.config import settings

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
