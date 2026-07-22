from __future__ import annotations

import json
from typing import Any

from app.services.generation.agent_service import generate_chat

CHAT_HISTORY_LIMIT = 14


def get_chat_response(messages: list[dict[str, str]], blueprint_data: dict[str, Any] | None) -> str:
    system_prompt = _system_prompt(_blueprint_summary(blueprint_data))
    return generate_chat(system_prompt, _chat_history(messages))


def _chat_history(messages: list[dict[str, str]]) -> list[dict[str, str]]:
    history: list[dict[str, str]] = []
    for message in messages[-CHAT_HISTORY_LIMIT:]:
        role = message.get("role")
        content = message.get("content", "").strip()
        if role in {"user", "assistant"} and content:
            history.append({"role": role, "content": content})
    return history


def _system_prompt(summary: dict[str, Any] | None) -> str:
    if summary is None:
        return (
            "You are Evolv's blueprint assistant. Answer clearly and honestly. "
            "No blueprint context is available, so avoid inventing blueprint-specific details."
        )

    context = json.dumps(summary, ensure_ascii=True, separators=(",", ":"))
    return (
        "You are Evolv's blueprint assistant. Use only the provided blueprint context "
        "when answering blueprint-specific questions. If the context does not contain "
        "an answer, say what is missing and suggest the next practical step. Keep the "
        "tone helpful, concise, and founder-friendly.\n\n"
        f"Blueprint context JSON:\n{context}"
    )


def _blueprint_summary(blueprint_data: dict[str, Any] | None) -> dict[str, Any] | None:
    if not blueprint_data:
        return None

    content = _record(blueprint_data.get("contentJson")) or _record(blueprint_data.get("content_json")) or {}
    agents = _record(content.get("agents")) or {}
    intake = _record(content.get("intake")) or {}

    summary: dict[str, Any] = {
        "blueprint": _compact(
            {
                "name": blueprint_data.get("name"),
                "industry": blueprint_data.get("industry"),
                "idea": blueprint_data.get("idea") or blueprint_data.get("ideaDesc"),
                "differentiator": blueprint_data.get("differentiator"),
                "aiRecommendation": blueprint_data.get("aiRecommend"),
                "viability": blueprint_data.get("viability"),
                "marketPotential": blueprint_data.get("marketPotential"),
                "developerDemand": blueprint_data.get("developerDemand"),
            }
        ),
        "intake": _compact(intake),
    }

    agent_summary = _agent_summary(agents)
    if agent_summary:
        summary["agents"] = agent_summary

    return _compact(summary)


def _agent_summary(agents: dict[str, Any]) -> dict[str, Any]:
    market = _record(agents.get("market")) or {}
    competitor = _record(agents.get("competitor")) or {}
    persona = _record(agents.get("persona")) or {}
    product = _record(agents.get("product")) or {}
    tech_stack = _record(agents.get("techStack")) or {}
    strategy = _record(agents.get("strategy")) or {}

    tech_layers = _record(tech_stack.get("techStack")) or {}
    return _compact(
        {
            "market": _compact(
                {
                    "size": market.get("size"),
                    "cagr": market.get("cagr"),
                    "score": market.get("score"),
                    "demandLevel": market.get("demandLevel"),
                    "timing": market.get("timing"),
                    "whyNow": market.get("whyNow"),
                    "headwinds": _string_list(market.get("headwinds"), 4),
                }
            ),
            "competitor": _compact(
                {
                    "positioningAngle": competitor.get("positioningAngle"),
                    "threatLevel": competitor.get("threatLevel"),
                    "whiteSpace": _string_list(competitor.get("whiteSpace"), 4),
                    "competitors": _competitor_names(competitor.get("competitors")),
                }
            ),
            "persona": _compact(
                {
                    "primaryPersona": persona.get("primaryPersona"),
                    "messagingAngles": _string_list(persona.get("messagingAngles"), 4),
                    "riskNotes": _string_list(persona.get("riskNotes"), 4),
                }
            ),
            "product": _compact(
                {
                    "features": _string_list(product.get("features"), 7),
                    "outOfScope": _string_list(product.get("outOfScope"), 5),
                }
            ),
            "techStack": _compact(
                {
                    "layers": _tech_layers(tech_layers),
                    "roles": _tech_roles(tech_stack.get("roles")),
                }
            ),
            "strategy": _compact(
                {
                    "pathToComplete": _string_list(strategy.get("pathToComplete"), 5),
                    "gtmSequence": _string_list(strategy.get("gtmSequence"), 5),
                    "risks": _strategy_risks(strategy.get("risks")),
                }
            ),
        }
    )


def _tech_layers(layers: dict[str, Any]) -> dict[str, str]:
    result: dict[str, str] = {}
    for key in ("frontend", "backend", "database", "vectorDb", "aiProvider", "hosting"):
        layer = _record(layers.get(key))
        chosen = layer.get("chosen") if layer else None
        if isinstance(chosen, str) and chosen.strip():
            result[key] = chosen.strip()
    return result


def _tech_roles(value: Any) -> list[dict[str, Any]]:
    roles: list[dict[str, Any]] = []
    for item in _records(value)[:5]:
        role = _compact(
            {
                "role": item.get("role"),
                "count": item.get("count"),
                "skills": item.get("skills"),
                "lead": item.get("lead"),
            }
        )
        if role:
            roles.append(role)
    return roles


def _competitor_names(value: Any) -> list[str]:
    names: list[str] = []
    for item in _records(value)[:6]:
        name = item.get("name")
        kind = item.get("type")
        if isinstance(name, str) and name.strip():
            label = f"{name.strip()} ({kind})" if isinstance(kind, str) and kind else name.strip()
            names.append(label)
    return names


def _strategy_risks(value: Any) -> list[dict[str, Any]]:
    risks: list[dict[str, Any]] = []
    for item in _records(value)[:5]:
        risk = _compact(
            {
                "risk": item.get("risk"),
                "severity": item.get("severity"),
                "mitigation": item.get("mitigation"),
            }
        )
        if risk:
            risks.append(risk)
    return risks


def _string_list(value: Any, limit: int) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item.strip() for item in value[:limit] if isinstance(item, str) and item.strip()]


def _records(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _record(value: Any) -> dict[str, Any] | None:
    return value if isinstance(value, dict) else None


def _compact(value: dict[str, Any]) -> dict[str, Any]:
    compacted: dict[str, Any] = {}
    for key, item in value.items():
        if item is None or item == "" or item == [] or item == {}:
            continue
        compacted[key] = item
    return compacted
