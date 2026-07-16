import json
from app.services.generation.client import generate_chat


def get_chat_response(messages: list[dict], blueprint_data: dict | None) -> str:
    if not blueprint_data:
        system_prompt = (
            "You are the friendly AI assistant for Evolv startup blueprints. "
            "No blueprint context is available."
        )
        return generate_chat(system_prompt, messages)

    # Build a concise, clean summary of the blueprint data
    summary = {
        "Venture Name": blueprint_data.get("name") or "Unnamed Venture",
        "Industry": blueprint_data.get("industry") or "Technology",
        "Idea Description": blueprint_data.get("ideaDesc") or blueprint_data.get("idea") or "",
        "Viability Score": f"{blueprint_data.get('viability', 0)}/100",
        "Market Potential Score": f"{blueprint_data.get('marketPotential', 0)}/100",
        "Blueprint Views": blueprint_data.get("views", 0),
        "Developer Applications": blueprint_data.get("developerApplications", 7),
        "Profile Saves": blueprint_data.get("profileSaves", 4),
    }

    # Extract key high-level context from the teammate's 6-agent rich JSON data
    content_json = blueprint_data.get("contentJson") or blueprint_data.get("content_json") or {}
    agents_data = content_json.get("agents") or {}

    # Calculate exact same Cost Model as React to match UI cards ($64K build cost)
    WEEKLY_RATES = {
        "ai/ml": 5500,
        "full stack": 4200,
        "backend": 4000,
        "stripe connect": 4000,
        "devops": 3800,
        "frontend": 3500,
        "design": 3200,
        "qa": 2800,
        "default": 3800,
    }
    
    phases = [
        {"name": "Foundation & UI", "weeks": 3, "rate": 3500, "role": "Frontend Developer"},
        {"name": "Core Backend & API", "weeks": 4, "rate": 4000, "role": "Backend Developer"},
        {"name": "Intelligence Layer", "weeks": 3, "rate": 5500, "role": "AI/ML Engineer"},
        {"name": "Payments & Integrations", "weeks": 2, "rate": 4000, "role": "Backend Developer (Stripe)"},
        {"name": "Hardening & Launch", "weeks": 2, "rate": 3800, "role": "DevOps Engineer / QA"},
    ]
    
    dev_total = sum(p["weeks"] * p["rate"] for p in phases)
    contingency = int(dev_total * 0.1)
    total_cost = dev_total + contingency
    total_cost_k = f"${total_cost // 1000}K"

    summary["Build Time"] = "14 weeks (~3 months)"
    summary["Total Build Cost"] = total_cost_k
    summary["Milestones Count"] = "5 phases"
    summary["Roles Count"] = "3 roles"
    
    summary["Cost Calculation Breakdown"] = {
        "Development Subtotal": f"${dev_total:,}",
        "Contingency (10%)": f"${contingency:,}",
        "Grand Total Build Cost": f"${total_cost:,} (rounds to {total_cost_k})",
        "Milestones Cost Breakdown": [
            f"{p['name']} ({p['weeks']} weeks @ ${p['rate']}/wk by {p['role']}): ${p['weeks'] * p['rate']:,}"
            for p in phases
        ]
    }

    if agents_data:
        clean_context = {}
        
        # 1. Product details
        prod = agents_data.get("product") or {}
        if prod:
            clean_context["MVP Features"] = prod.get("features", [])[:6]
            if prod.get("description"):
                clean_context["Description"] = prod.get("description")
            
        # 2. Tech stack summary
        tech = agents_data.get("techStack") or {}
        if tech:
            clean_context["Tech Stack"] = {
                "Frontend": tech.get("frontend"),
                "Backend": tech.get("backend"),
                "Database": tech.get("db"),
                "AI": tech.get("ai"),
            }
            if tech.get("roles"):
                clean_context["Required Roles"] = [r.get("role") for r in tech.get("roles") if r.get("role")]
                
        # 3. Strategy / Risks / Roadmap
        strat = agents_data.get("strategy") or {}
        if strat:
            clean_context["Top Risks"] = [r.get("risk") for r in strat.get("risks", [])[:3] if r.get("risk")]
            clean_context["Roadmap Milestones"] = [m for m in strat.get("pathToComplete", [])[:6]]
            
        # 4. Market / Competitors
        mkt = agents_data.get("market") or {}
        if mkt:
            clean_context["Market Overview"] = {
                "Size": mkt.get("size"),
                "CAGR": mkt.get("cagr"),
                "Barriers": mkt.get("barriers"),
            }
        
        summary["Blueprint Highlights"] = clean_context
    else:
        # Fallback context mapping for legacy drafts using flat fields
        summary["Fallback Context"] = {
            "techStack": blueprint_data.get("techStack") or {},
            "features": blueprint_data.get("features") or [],
            "timeline": blueprint_data.get("cost", {}).get("timeline") or "14 weeks",
            "budget": blueprint_data.get("cost", {}).get("budget") or "To be estimated",
        }

    context_str = json.dumps(summary, indent=2, ensure_ascii=False)

    system_prompt = (
        "You are the friendly and knowledgeable AI Assistant for this startup blueprint. "
        "Answer the user's questions in a natural, helpful, and human-like tone using the blueprint data below. "
        "Explain the recommended tech stack, estimated costs, features, roadmap milestones, target personas, "
        "or marketing/GTM strategy clearly based on the provided JSON context. "
        "If a question requires calculation (like total budget, timeline, or infrastructure cost), perform it "
        "analytically based on the context data. Do not show raw JSON tags in your conversational response.\n\n"
        f"Blueprint JSON Context:\n{context_str}"
    )

    return generate_chat(system_prompt, messages)
