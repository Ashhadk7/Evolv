from __future__ import annotations

import json
import uuid
from typing import AsyncIterator

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.blueprint import Blueprint
from app.repositories import blueprints as blueprints_repository
from app.services.generation.client import stream_chat
from app.services.mock_blueprints import MOCK_BLUEPRINTS


def _build_context(blueprint_id: str, db: Session) -> str:
    # 1. Check if the ID is a known default mock blueprint key
    if blueprint_id in MOCK_BLUEPRINTS:
        return json.dumps(MOCK_BLUEPRINTS[blueprint_id], ensure_ascii=False)

    # 2. Check if the ID is a valid UUID
    try:
        blueprint_uuid = uuid.UUID(blueprint_id)
    except ValueError:
        # If not a valid UUID and not mock, fall back to the first available blueprint in DB for testing
        statement = select(Blueprint).options(selectinload(Blueprint.versions)).limit(1)
        blueprint = db.scalar(statement)
        if blueprint is None or blueprint.current_version is None:
            return ""
        blueprint_uuid = blueprint.id

    # 3. Retrieve blueprint from repository
    blueprint = blueprints_repository.get_blueprint_by_id(db, blueprint_uuid)
    if blueprint is None or blueprint.current_version is None:
        return ""

    version = blueprint.current_version
    
    # Check if other branch has added content_json already
    if hasattr(version, "content_json") and version.content_json:
        return json.dumps(version.content_json, ensure_ascii=False)

    # Fallback: calculate values dynamically matching the frontend build blueprint formulas
    has_ai = "ai" in version.industry.lower() or "intelligence" in version.idea_desc.lower()
    total_cost = "$67K" if has_ai else "$62K"
    build_time = "14 weeks (about 3 months)"
    barriers = "Regulatory compliance" if has_ai else "Incumbent competition"
    
    starting_users = int(20 + version.market_potential * 0.6)
    growth_rate = int((0.08 + (version.viability / 100) * 0.08) * 100)
    
    return json.dumps(
        {
            "name": version.name,
            "industry": version.industry,
            "idea": version.idea_desc,
            "differentiator": version.differentiator or "Innovative tech solution",
            "viability": version.viability,
            "market_potential": version.market_potential,
            "funding_readiness": version.funding_readiness.value,
            "developer_demand": version.developer_demand.value,
            "ai_recommend": version.ai_recommend or "Proceed to validation",
            "total_build_cost": total_cost,
            "build_time": build_time,
            "milestones": "5 phases",
            "roles_needed": "4",
            "mvp_features": "4 core",
            "financials": {
                "price_per_user": "$49/month",
                "starting_users": f"{starting_users} users",
                "monthly_growth_rate": f"{growth_rate}% per month",
                "break_even_month": "Month 11"
            },
            "tech_stack": {
                "frontend": "React, TailwindCSS",
                "backend": "FastAPI, Python",
                "ai": "TensorFlow" if has_ai else "None",
                "db": "PostgreSQL, Redis"
            },
            "risks_and_mitigations": [
                {
                    "risk": barriers,
                    "severity": "High",
                    "mitigation": "Engage requirements early, design for compliance, and ship audit-ready from day one."
                },
                {
                    "risk": "Well-funded incumbents move into the niche",
                    "severity": "Medium",
                    "mitigation": "Win on focus, speed, and price for under-served teams; build integration moat early."
                },
                {
                    "risk": "Model accuracy below user trust threshold",
                    "severity": "Medium",
                    "mitigation": "Ship explainability, keep a human-in-the-loop, and improve on real usage data."
                },
                {
                    "risk": "Slow developer ramp delays milestones",
                    "severity": "Low",
                    "mitigation": "Scope independently-shippable milestones; pay on approval to keep momentum."
                }
            ]
        },
        ensure_ascii=False,
    )


def parse_market_money(s: str) -> float:
    import re
    cleaned = re.sub(r'[, ]', '', s)
    m = re.search(r'\$?([\d.]+)\s*([mMbB])?', cleaned)
    if not m:
        return 100000000.0
    n = float(m.group(1))
    suffix = (m.group(2) or "").lower()
    if suffix == 'm':
        n *= 1000000.0
    elif suffix == 'b':
        n *= 1000000000.0
    return n


def fmt_market_money(v: float) -> str:
    if v >= 1000000000.0:
        val = f"{v / 1000000000.0:.1f}"
        if val.endswith(".0"):
            val = val[:-2]
        return f"${val}B"
    if v >= 1000000.0:
        val = f"{v / 1000000.0:.1f}"
        if val.endswith(".0"):
            val = val[:-2]
        return f"${val}M"
    return f"${int(round(v / 1000.0))}K"


def barrier_multiplier(barriers: str) -> float:
    b = barriers.lower()
    if (
        "high" in b or 
        "regulatory" in b or 
        "hardware" in b or 
        "grid" in b
    ):
        return 0.76
    if "moderate" in b or "content" in b or "medium" in b:
        return 0.9
    return 1.0


def clamp_val(val: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(val, max_val))


def _build_context_from_payload(bp: dict) -> str:
    # Safely parse fields
    name = bp.get("name") or "Unnamed Venture"
    industry = bp.get("industry") or "Technology"
    idea = bp.get("ideaDesc") or bp.get("idea") or ""
    differentiator = bp.get("differentiator") or "Innovative tech solution"
    viability = bp.get("viability") or 0
    market_potential = bp.get("marketPotential") or bp.get("market_potential") or 0
    funding_readiness = bp.get("fundingReadiness") or bp.get("funding_readiness") or "Medium"
    developer_demand = bp.get("developerDemand") or bp.get("developer_demand") or "Medium"
    ai_recommend = bp.get("aiRecommend") or bp.get("ai_recommend") or "Proceed to validation"
    
    # Traction views/apps/saves
    views = bp.get("views") or 0
    applications = bp.get("developerApplications") or bp.get("developer_applications") or 10
    saves = bp.get("interested") or bp.get("profile_saves") or 4
    
    # Stack
    tech_stack = bp.get("techStack") or bp.get("tech_stack") or {}
    
    # Financials calculations matching blueprint-content.ts
    price_per_user = "$49/month"
    starting_users = int(round(20 + market_potential * 0.6))
    growth_rate = int(round((0.08 + (viability / 100) * 0.08) * 100))
    
    # Determine AI phase presence
    has_ai = False
    if isinstance(tech_stack, dict):
        ai_val = tech_stack.get("ai") or ""
        if ai_val and ai_val.lower() != "none":
            has_ai = True
            
    # Calculate build total cost matching frontend
    dev_total = 10500 + 16000 + 8000 + 7600
    if has_ai:
        dev_total += 16500
        
    contingency = int(round(dev_total * 0.1))
    
    # infra during build
    hosting_str = bp.get("cost", {}).get("hosting", "$800/mo")
    import re
    m = re.sub(r'[, ]', '', hosting_str)
    match_res = re.search(r'\$?([\d.]+)\s*([kK])?', m)
    n = 800
    if match_res:
        n = float(match_res.group(1))
        if match_res.group(2) and match_res.group(2).lower() == 'k':
            n *= 1000
    build_months = 14 / 4.33
    infra_during_build = int(round(n * build_months))
    
    total_cost_val = dev_total + contingency + infra_during_build
    total_build_cost = f"${int(round(total_cost_val / 1000))}K"
    
    # Calculate break-even month matching frontend logic
    cumulative_rev = 0
    break_even_month = "Month 11"
    u = starting_users
    for month in range(1, 25):
        if month > 1:
            u = int(round(u * (1 + growth_rate / 100)))
        mrr = u * 49
        cumulative_rev += mrr
        if cumulative_rev >= total_cost_val:
            break_even_month = f"Month {month}"
            break
            
    financials = {
        "price_per_user": price_per_user,
        "starting_users": f"{starting_users} users",
        "monthly_growth_rate": f"{growth_rate}% per month",
        "break_even_month": break_even_month,
        "year_1_revenue_projection": f"Starts at ${starting_users * 49} MRR in Month 1 and grows dynamically"
    }

    # Market calculations
    market_obj = bp.get("market") or {}
    market_size_str = market_obj.get("size") or "$500M"
    cagr_str = market_obj.get("cagr") or "22%"
    barriers = market_obj.get("barriers") or "Incumbent competition"
    market_score = market_obj.get("score") or bp.get("marketPotential") or bp.get("market_potential") or 60
    
    total_market_val = parse_market_money(market_size_str)
    barrier_factor = barrier_multiplier(barriers)
    
    reachable_pct = clamp_val((market_score / 100) * 0.22 * barrier_factor, 0.08, 0.22)
    capture_pct = clamp_val((viability / 100) * 0.06 * barrier_factor, 0.015, 0.06)
    
    reachable_wedge_val = total_market_val * reachable_pct
    realistic_capture_val = reachable_wedge_val * capture_pct
    
    reachable_wedge = fmt_market_money(reachable_wedge_val)
    realistic_capture = fmt_market_money(realistic_capture_val)
    
    market_analysis = {
        "total_market": market_size_str,
        "reachable_wedge": reachable_wedge,
        "reachable_market": reachable_wedge,
        "three_year_capture": realistic_capture,
        "realistic_capture": realistic_capture,
        "cagr": cagr_str,
        "barriers": barriers
    }

    # Features
    features = bp.get("features") or ["Foundation UI", "Core API", "Milestone payments"]
    
    # Competitors
    competitors = bp.get("competitors") or []
    
    # Risks and Mitigations (use industry or fallback)
    risks_and_mitigations = [
        {
            "risk": barriers,
            "severity": "High",
            "mitigation": "Engage early, design for compliance, and ship audit-ready."
        },
        {
            "risk": "Well-funded incumbents move into the niche",
            "severity": "Medium",
            "mitigation": "Win on focus, speed, and price for under-served teams; build integration moat early."
        },
        {
            "risk": "Model accuracy below user trust threshold",
            "severity": "Medium",
            "mitigation": "Ship explainability, keep a human-in-the-loop, and improve on real data."
        },
        {
            "risk": "Slow developer ramp delays milestones",
            "severity": "Low",
            "mitigation": "Scope independently-shippable milestones; pay on approval."
        }
    ]

    return json.dumps({
        "name": name,
        "industry": industry,
        "idea": idea,
        "differentiator": differentiator,
        "viability": viability,
        "market_potential": market_potential,
        "funding_readiness": funding_readiness,
        "developer_demand": developer_demand,
        "ai_recommend": ai_recommend,
        "blueprint_views": views,
        "developer_applications": applications,
        "profile_saves": saves,
        "total_build_cost": total_build_cost,
        "build_time": "14 weeks (about 3 months)",
        "milestones": "5 phases",
        "roles_needed": "4",
        "mvp_features": f"{len(features)} core",
        "financials": financials,
        "market": market_analysis,
        "features": features,
        "tech_stack": tech_stack,
        "competitors": competitors,
        "risks_and_mitigations": risks_and_mitigations
    }, ensure_ascii=False)


async def stream_blueprint_chat(
    blueprint_id: str,
    db: Session,
    messages: list[dict],
    blueprint_data: dict | None = None,
) -> AsyncIterator[str]:
    if blueprint_data:
        context = _build_context_from_payload(blueprint_data)
    else:
        context = _build_context(blueprint_id, db)
        
    if not context:
        async def _fallback():
            yield "I could not find this blueprint's details. Please try again."
        return _fallback()

    system = (
        f"You are the friendly and knowledgeable AI Assistant for this startup blueprint. "
        f"Answer the user's questions in a natural, helpful, and human-like tone using the blueprint data below. "
        f"Do not respond in a robotic, literal, or overly restricted way. If the user asks about the tech stack, "
        f"team roles, budget, cost, features, matched developers, milestones, phases, stats, financials, "
        f"projections, break-even month, or risks and mitigations, explain them fully based on the data. "
        f"For example, if asked about break-even, use the break_even_month field from the financials block.\n\n"
        f"Blueprint data:\n{context}"
    )
    print("DEBUG - Compiled System Prompt:")
    print(system)
    return stream_chat(system, messages)
