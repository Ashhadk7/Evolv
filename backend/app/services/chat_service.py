import json
import re

from app.services.generation.client import generate_chat


def get_chat_response(messages: list[dict], blueprint_data: dict | None) -> str:
    context = ""
    if blueprint_data:
        name = blueprint_data.get("name") or "Unnamed Venture"
        industry = blueprint_data.get("industry") or "Technology"
        idea = blueprint_data.get("ideaDesc") or blueprint_data.get("idea") or ""
        viability = blueprint_data.get("viability") or 0
        market_potential = blueprint_data.get("marketPotential") or 0
        
        # Check if rich contentJson exists (nested under 'contentJson' or 'content_json')
        content_json = blueprint_data.get("contentJson") or blueprint_data.get("content_json") or {}
        agents = content_json.get("agents") or {}
        
        # Load sub-agent dictionaries
        market_agent = agents.get("market") or {}
        competitor_agent = agents.get("competitor") or {}
        persona_agent = agents.get("persona") or {}
        product_agent = agents.get("product") or {}
        tech_stack_agent = agents.get("techStack") or {}
        strategy_agent = agents.get("strategy") or {}
        
        differentiator = competitor_agent.get("positioning_angle") or competitor_agent.get("positioningAngle") or blueprint_data.get("differentiator") or "Innovative tech solution"
        
        cost_obj = blueprint_data.get("cost") or {}
        timeline = blueprint_data.get("intake", {}).get("timeline") or cost_obj.get("timeline") or "14 weeks"
        team_str = cost_obj.get("team") or "4 members"
        
        tech_stack = blueprint_data.get("techStack") or {}
        ts_plan = tech_stack_agent.get("techStack") or tech_stack_agent.get("tech_stack") or {}
        
        # Load technologies from agent configuration
        frontend_layer = ts_plan.get("frontend") or {}
        backend_layer = ts_plan.get("backend") or {}
        database_layer = ts_plan.get("database") or {}
        vector_db_layer = ts_plan.get("vectorDb") or ts_plan.get("vector_db") or {}
        ai_provider_layer = ts_plan.get("aiProvider") or ts_plan.get("ai_provider") or {}
        hosting_layer = ts_plan.get("hosting") or {}
        
        frontend_tech = frontend_layer.get("chosen") or tech_stack.get("frontend") or "Next.js"
        backend_tech = backend_layer.get("chosen") or tech_stack.get("backend") or "FastAPI"
        db_tech = database_layer.get("chosen") or tech_stack.get("db") or "PostgreSQL"
        vector_db_tech = vector_db_layer.get("chosen") or "Pinecone"
        ai_tech = ai_provider_layer.get("chosen") or "OpenAI"
        hosting_tech = hosting_layer.get("chosen") or "Vercel"
        
        has_ai = False
        if ai_tech and ai_tech.lower() != "none":
            has_ai = True
            
        dev_total = 10500 + 16000 + 8000 + 7600 + (16500 if has_ai else 0)
        contingency = int(round(dev_total * 0.1))
        
        hosting_str = hosting_layer.get("monthlyCost") or hosting_layer.get("monthly_cost") or cost_obj.get("hosting") or "$800/mo"
        hosting_num = 800
        try:
            m = re.sub(r'[, ]', '', hosting_str)
            match_res = re.search(r'\$?([\d.]+)\s*([kK])?', m)
            if match_res:
                hosting_num = float(match_res.group(1))
                if match_res.group(2) and match_res.group(2).lower() == 'k':
                    hosting_num *= 1000
        except Exception:
            pass
        infra = int(round(hosting_num * (14 / 4.33)))
        total_cost = f"${int(round((dev_total + contingency + infra) / 1000))}K"
        
        # Product Scope Features
        must_have = []
        should_have = []
        nice_to_have = []
        custom_features = product_agent.get("features") or blueprint_data.get("features") or []
        for idx, f in enumerate(custom_features):
            if idx < 2:
                must_have.append(f)
            elif idx < 4:
                should_have.append(f)
            else:
                nice_to_have.append(f)
        must_have.extend(["Authentication & onboarding", "Milestone payments & escrow"])
        should_have.append("Notifications & email")
        nice_to_have.append("Admin & analytics dashboard")
        
        out_of_scope = product_agent.get("outOfScope") or product_agent.get("out_of_scope") or [
            "Native mobile apps — ship web-first, evaluate mobile after MVP validation",
            "Multi-language / localisation",
            f"Deep {industry} enterprise integrations beyond the first design partner"
        ]
        
        # Development Roadmap Phases
        phases = [
            f"Phase 1: Foundation & UI ({frontend_tech}, 3 weeks) - Deliverables: Design system & component library, Responsive app shell, Auth & onboarding screens",
            f"Phase 2: Core Backend & API ({backend_tech}, 4 weeks) - Deliverables: Data model & migrations, REST API + auth middleware, Core business logic",
        ]
        if has_ai:
            phases.append(
                f"Phase 3: Intelligence Layer ({ai_tech}, 3 weeks) - Deliverables: Model integration, Inference pipeline & caching, Results & insights API"
            )
        phases.extend([
            "Phase 4: Payments & Integrations (Stripe Connect, 2 weeks) - Deliverables: Milestone escrow flow, Connected accounts & payouts, Email & notifications",
            "Phase 5: Hardening & Launch (QA · CI/CD, 2 weeks) - Deliverables: E2E + load testing, Observability & alerts, Production deploy pipeline"
        ])
        
        views = blueprint_data.get("views") or 0
        dev_matches = blueprint_data.get("devMatches") or 0
        interested = blueprint_data.get("interested") or 0
        
        analytics_views = views
        analytics_apps = dev_matches + 7
        analytics_saves = interested + 4
        
        market = blueprint_data.get("market") or {}
        market_size = market_agent.get("size") or market.get("size") or "$1.2B"
        cagr = market_agent.get("cagr") or market.get("cagr") or "14.2%"
        barriers = market_agent.get("barriers") or market.get("barriers") or "Moderate"
        market_score = market_agent.get("score") or market.get("score") or 0
        
        def parse_market_money(s: str) -> float:
            m_str = re.sub(r'[, ]', '', s)
            match_res = re.search(r'\$?([\d.]+)\s*([kKmMbB])?', m_str)
            if not match_res:
                return 500000000.0
            val = float(match_res.group(1))
            unit = (match_res.group(2) or "").lower()
            if unit == 'k':
                val *= 1000
            elif unit == 'm':
                val *= 1000000
            elif unit == 'b':
                val *= 1000000000
            return val
            
        def fmt_market_money(val: float) -> str:
            if val >= 1000000000:
                val_div = val / 1000000000.0
                fmt_str = f"{val_div:.1f}" if val % 1000000000 != 0 else f"{int(val_div)}"
                return f"${fmt_str}B"
            if val >= 1000000:
                val_div = val / 1000000.0
                fmt_str = f"{val_div:.1f}" if val % 1000000 != 0 else f"{int(val_div)}"
                return f"${fmt_str}M"
            if val >= 1000:
                return f"${int(round(val / 1000))}K"
            return f"${int(round(val))}"
            
        def clamp_val(val: float, min_val: float, max_val: float) -> float:
            return max(min_val, min(max_val, val))
            
        def barrier_multiplier(b_str: str) -> float:
            b_low = b_str.lower()
            if any(k in b_low for k in ["high", "regulatory", "hardware", "grid"]):
                return 0.76
            if any(k in b_low for k in ["moderate", "content"]):
                return 0.90
            return 1.0
            
        total_market_val = parse_market_money(market_size)
        barrier_factor = barrier_multiplier(barriers)
        reachable_pct = clamp_val((market_score / 100.0) * 0.22 * barrier_factor, 0.08, 0.22)
        capture_pct = clamp_val((viability / 100.0) * 0.06 * barrier_factor, 0.015, 0.06)
        
        reachable_wedge_val = total_market_val * reachable_pct
        capture_val = reachable_wedge_val * capture_pct
        
        reachable_wedge_str = fmt_market_money(reachable_wedge_val)
        capture_str = fmt_market_money(capture_val)
        
        # Personas, Competitors, and Risks & Mitigations
        persona_cards = persona_agent.get("personas") or []
        personas = []
        for card in persona_cards:
            seg = card.get("segment") or "User"
            name_p = card.get("name") or "Practitioner"
            role_p = card.get("role") or "Expert"
            context_p = card.get("context") or ""
            personas.append(f"Card {seg}: {name_p} ({role_p}) - {context_p}")
            
        if not personas:
            personas = [
                f"1. Primary User: The {industry} Practitioner (wants to get the core outcome faster with less friction)",
                "2. Economic Buyer: The Team Lead (decision maker, wants clear ROI and easy rollout)",
                "3. Gatekeeper: The Ops / IT Owner (security review, permissions, integration reliability)"
            ]
            
        strengths = [
            "Clear, sizeable market demand",
            "Strong developer interest & matchability",
            "Defensible differentiation vs. incumbents"
        ]
        assessment_risks = [
            "Competitive, well-funded incumbents",
            barriers
        ]
        competitors_list = competitor_agent.get("competitors") or blueprint_data.get("competitors") or []
        competitors_str = ", ".join([f"{c.get('name')} ({c.get('type')})" for c in competitors_list]) or "No major direct competitors identified"
        
        roles_list = tech_stack_agent.get("roles") or []
        if roles_list:
            team_roles = [f"{r.get('role')} (Count: {r.get('count')}, Skills: {r.get('skills')})" for r in roles_list]
            team_str = f"{len(roles_list)} roles"
        else:
            team_roles = [
                "Full-Stack Engineer (Next.js · TypeScript · API design, Lead)",
                f"{ai_tech} Engineer (inference pipelines)" if has_ai else "Backend Engineer",
                f"Backend Engineer ({backend_tech} · {db_tech})",
                "Product Designer (UX · design systems, part-time)"
            ]
            
        strategy_risks = strategy_agent.get("risks") or []
        if strategy_risks:
            risks_and_mitigations = [f"{idx+1}. Risk: {r.get('risk')} (Severity: {r.get('severity')}) - Mitigation: {r.get('mitigation')}" for idx, r in enumerate(strategy_risks)]
        else:
            risks_and_mitigations = [
                "1. Well-funded incumbents move into the niche (Severity: Medium) - Mitigation: Win on focus, speed, and price; build integration moat early.",
                f"2. {barriers} (Severity: High) - Mitigation: Engage requirements early, design for compliance, and ship audit-ready.",
                "3. Model accuracy below user trust threshold (Severity: Medium) - Mitigation: Ship explainability, keep human-in-the-loop, and improve on real usage data.",
                "4. Slow developer ramp delays milestones (Severity: Low) - Mitigation: Scope independent milestones; pay on approval to keep momentum."
            ]
        
        context = (
            f"Venture Name: {name}\n"
            f"Industry: {industry}\n"
            f"Description: {idea}\n"
            f"Differentiator: {differentiator}\n"
            f"Viability Score: {viability}/100\n"
            f"Market Potential Score: {market_potential}/100\n"
            f"Venture Assessment:\n"
            f"  - Strengths: {', '.join(strengths)}\n"
            f"  - Risks: {', '.join(assessment_risks)}\n"
            f"Target Users / Personas:\n"
            + "\n".join([f"  - {per}" for per in personas]) + "\n"
            f"Build Snapshot:\n"
            f"  - Total Build Budget: {total_cost}\n"
            f"  - Build Timeline: {timeline}\n"
            f"  - Roles Needed: {team_str}\n"
            f"  - Team Roles list: {', '.join(team_roles)}\n"
            f"Product Scope (MVP Features):\n"
            f"  - Must-have features: {', '.join(must_have)}\n"
            f"  - Should-have features: {', '.join(should_have)}\n"
            f"  - Nice-to-have features: {', '.join(nice_to_have)}\n"
            f"  - Out of Scope for V1: {'; '.join(out_of_scope)}\n"
            f"Development Roadmap:\n"
            + "\n".join([f"  - {ph}" for ph in phases]) + "\n"
            f"Tech Stack: {json.dumps(tech_stack)}\n"
            f"Traction Metrics (Signals & Activity):\n"
            f"  - Blueprint Views: {analytics_views}\n"
            f"  - Developer Applications: {analytics_apps}\n"
            f"  - Profile Saves: {analytics_saves}\n"
            f"Market Analysis:\n"
            f"  - Total Market Size: {market_size}\n"
            f"  - CAGR: {cagr}\n"
            f"  - Market Barriers: {barriers}\n"
            f"  - Reachable Wedge: {reachable_wedge_str}\n"
            f"  - 3-Year Capture: {capture_str}\n"
            f"Competitive Landscape:\n"
            f"  - Incumbents: {competitors_str}\n"
            f"Risks & Mitigations:\n"
            + "\n".join([f"  - {rm}" for rm in risks_and_mitigations]) + "\n"
        )
    
    system_prompt = (
        "You are the friendly and knowledgeable AI Assistant for this startup blueprint. "
        "Answer the user's questions in a natural, helpful, and human-like tone using the blueprint data below. "
        "Do not respond in a robotic or overly restricted way. Explain the tech stack, cost, features, "
        "or milestones clearly based on the data provided.\n\n"
        f"Blueprint data:\n{context}" if context else "No blueprint context is available."
    )
    
    return generate_chat(system_prompt, messages)
