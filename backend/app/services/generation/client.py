from __future__ import annotations

from openai import AsyncOpenAI

from app.core.config import settings

CHEAP_MODEL = "llama-3.3-70b-versatile"

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if settings.GROQ_API_KEY is None:
            raise RuntimeError("GROQ_API_KEY is not set in .env — chatbot is unavailable.")
        _client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY.get_secret_value(),
            base_url="https://api.groq.com/openai/v1",
        )
    return _client


async def stream_chat(system: str, messages: list[dict]) -> AsyncOpenAI:
    client = _get_client()
    response = await client.chat.completions.create(
        model=CHEAP_MODEL,
        messages=[{"role": "system", "content": system}, *messages],
        stream=True,
    )
    async for chunk in response:
        token = chunk.choices[0].delta.content
        if token:
            yield token
