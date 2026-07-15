# Rich Mock data mapping for default frontend blueprint IDs to allow complete, context-aware chatbot answers.
MOCK_BLUEPRINTS = {
    "nexus": {
        "name": "Nexus Health",
        "industry": "HealthTech",
        "idea": "AI-driven diagnostics platform for early-stage oncology detection, reducing false positives by 40%.",
        "differentiator": "Affordable early detection for emerging markets",
        "viability": 82,
        "market_potential": 91,
        "funding_readiness": "High",
        "developer_demand": "High",
        "ai_recommend": "Publish to attract developer matches",
        "blueprint_views": 142,
        "developer_applications": 12,
        "profile_saves": 6,
        "total_build_cost": "$67K",
        "build_time": "14 weeks (about 3 months)",
        "milestones": "5 phases",
        "roles_needed": "4",
        "mvp_features": "4 core",
        "financials": {
            "price_per_user": "$49/month",
            "starting_users": "75 users",
            "monthly_growth_rate": "15% per month",
            "break_even_month": "Month 11",
            "year_1_revenue_projection": "Starts at $3.6K MRR in Month 1 and grows to $18K+ MRR by Month 12"
        },
        "features": [
            "Scan upload & analysis",
            "Real-time diagnostic report",
            "Physician dashboard",
            "Patient history"
        ],
        "tech_stack": {
            "frontend": "React, TailwindCSS",
            "backend": "FastAPI, Python",
            "ai": "TensorFlow, DICOM",
            "db": "PostgreSQL, Redis"
        },
        "cost": {
            "timeline": "6 months",
            "team": "3 devs",
            "hosting": "$800/mo",
            "budget": "$120K"
        },
        "market": {
            "size": "$2.4B",
            "cagr": "18.3%",
            "barriers": "High regulatory"
        },
        "competitors": [
            {"name": "PathAI", "type": "Direct"},
            {"name": "Paige", "type": "Direct"},
            {"name": "Tempus", "type": "Indirect"}
        ],
        "roles_list": [
            "Full-Stack Engineer (Lead) - Next.js, TypeScript, API design",
            "ML / AI Engineer (x1) - TensorFlow, DICOM pipelines",
            "Backend Engineer (x1) - FastAPI, Python, PostgreSQL, Redis",
            "Product Designer (x1) - UX, design systems (part-time)"
        ],
        "matched_developers": [
            "Priya Nair (Full Stack Developer - Next.js, Node.js - 5 years experience)",
            "Lars Eriksson (ML Engineer - Computer Vision, NLP - 4 years experience)",
            "Sarah Mitchell (AI Engineer - Python, FastAPI - 6 years experience)",
            "Maya Chen (Frontend Engineer - React, Three.js - 6 years experience)"
        ],
        "risks_and_mitigations": [
            {
                "risk": "High regulatory barriers",
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
    "aura": {
        "name": "Aura Logistics",
        "industry": "SaaS",
        "idea": "Last-mile delivery drone network utilizing autonomous navigation in mid-density suburban environments.",
        "differentiator": "Suburb-first, cost-efficient fleet model",
        "viability": 68,
        "market_potential": 74,
        "funding_readiness": "Medium",
        "developer_demand": "Medium",
        "ai_recommend": "Add technical co-founder to strengthen team",
        "blueprint_views": 89,
        "developer_applications": 15,
        "profile_saves": 5,
        "total_build_cost": "$69K",
        "build_time": "14 weeks (about 3 months)",
        "milestones": "5 phases",
        "roles_needed": "4",
        "mvp_features": "4 core",
        "financials": {
            "price_per_user": "$49/month",
            "starting_users": "64 users",
            "monthly_growth_rate": "13% per month",
            "break_even_month": "Month 12",
            "year_1_revenue_projection": "Starts at $3.1K MRR in Month 1 and grows to $12K+ MRR by Month 12"
        },
        "features": [
            "Fleet management",
            "Route optimisation",
            "Customer tracking",
            "API integrations"
        ],
        "tech_stack": {
            "frontend": "Next.js",
            "backend": "Node.js, Express",
            "ai": "Route ML models",
            "db": "MongoDB"
        },
        "cost": {
            "timeline": "9 months",
            "team": "5 devs",
            "hosting": "$1.5K/mo",
            "budget": "$280K"
        },
        "market": {
            "size": "$1.1B",
            "cagr": "24.1%",
            "barriers": "Regulatory + hardware"
        },
        "competitors": [
            {"name": "Zipline", "type": "Direct"},
            {"name": "Wing", "type": "Direct"}
        ],
        "roles_list": [
            "Drone Systems Dev (Lead)",
            "Backend API Engineer (x1)",
            "Frontend/Web Dev (x1)"
        ],
        "matched_developers": [
            "Lars Eriksson (ML Engineer - Computer Vision, NLP - 4 years experience)",
            "Maya Chen (Frontend Engineer - React, Three.js - 6 years experience)"
        ],
        "risks_and_mitigations": [
            {
                "risk": "Regulatory + hardware",
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
    "veritas": {
        "name": "Veritas Energy",
        "industry": "CleanTech",
        "idea": "Decentralized micro-grid management software for residential solar cooperatives.",
        "differentiator": "Blockchain-verified carbon credits + instant settlement",
        "viability": 74,
        "market_potential": 68,
        "funding_readiness": "Low",
        "developer_demand": "Low",
        "ai_recommend": "Schedule developer interviews this week",
        "blueprint_views": 12,
        "developer_applications": 10,
        "profile_saves": 4,
        "total_build_cost": "$66K",
        "build_time": "14 weeks (about 3 months)",
        "milestones": "5 phases",
        "roles_needed": "4",
        "mvp_features": "4 core",
        "financials": {
            "price_per_user": "$49/month",
            "starting_users": "61 users",
            "monthly_growth_rate": "14% per month",
            "break_even_month": "Month 11",
            "year_1_revenue_projection": "Starts at $3.0K MRR in Month 1 and grows to $12K+ MRR by Month 12"
        },
        "features": [
            "Energy listing",
            "Smart contract trades",
            "Carbon credit wallet",
            "Analytics dashboard"
        ],
        "tech_stack": {
            "frontend": "React",
            "backend": "Go, gRPC",
            "ai": "Price prediction",
            "db": "PostgreSQL, IPFS"
        },
        "cost": {
            "timeline": "12 months",
            "team": "4 devs",
            "hosting": "$600/mo",
            "budget": "$200K"
        },
        "market": {
            "size": "$850M",
            "cagr": "31.2%",
            "barriers": "Grid regulations"
        },
        "competitors": [
            {"name": "LO3 Energy", "type": "Direct"}
        ],
        "roles_list": [
            "Smart Grid Engineer (Lead)",
            "Smart Contract/Blockchain Dev (x1)",
            "Product Manager (x1)"
        ],
        "matched_developers": [
            "Priya Nair (Full Stack Developer - Next.js, Node.js - 5 years experience)",
            "Sarah Mitchell (AI Engineer - Python, FastAPI - 6 years experience)"
        ],
        "risks_and_mitigations": [
            {
                "risk": "Grid regulations",
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
    "edai": {
        "name": "Educational AI Tutor",
        "industry": "EdTech",
        "idea": "Adaptive learning paths for high school mathematics using generative problem sets and real-time feedback.",
        "differentiator": "Generative personalization at scale",
        "viability": 61,
        "market_potential": 72,
        "funding_readiness": "Medium",
        "developer_demand": "Medium",
        "ai_recommend": "Complete market research before publishing",
        "blueprint_views": 0,
        "developer_applications": 11,
        "profile_saves": 4,
        "total_build_cost": "$66K",
        "build_time": "14 weeks (about 3 months)",
        "milestones": "5 phases",
        "roles_needed": "4",
        "mvp_features": "4 core",
        "financials": {
            "price_per_user": "$49/month",
            "starting_users": "63 users",
            "monthly_growth_rate": "13% per month",
            "break_even_month": "Month 12",
            "year_1_revenue_projection": "Starts at $3.1K MRR in Month 1 and grows to $12K+ MRR by Month 12"
        },
        "features": [
            "Adaptive problem sets",
            "Real-time feedback",
            "Progress tracking",
            "Parent dashboard"
        ],
        "tech_stack": {
            "frontend": "React",
            "backend": "FastAPI",
            "ai": "GPT-4o",
            "db": "PostgreSQL"
        },
        "cost": {
            "timeline": "4 months",
            "team": "2 devs",
            "hosting": "$400/mo",
            "budget": "$60K"
        },
        "market": {
            "size": "$4.0B",
            "cagr": "28.0%",
            "barriers": "Content regulation"
        },
        "competitors": [],
        "roles_list": [
            "Backend FastAPI/AI Engineer (Lead)",
            "Frontend React Developer (x1)"
        ],
        "matched_developers": [
            "Priya Nair (Full Stack Developer - Next.js, Node.js - 5 years experience)",
            "Sarah Mitchell (AI Engineer - Python, FastAPI - 6 years experience)",
            "Maya Chen (Frontend Engineer - React, Three.js - 6 years experience)"
        ],
        "risks_and_mitigations": [
            {
                "risk": "Content regulation",
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
}
