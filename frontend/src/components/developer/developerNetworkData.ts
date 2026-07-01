"use client";

import {
  type FounderContactProfile,
  type NetworkType,
} from "../founder/NetworkProfileDetail";

export type DeveloperContactProfile = FounderContactProfile;

export const DEVELOPER_NETWORK_PROFILES: DeveloperContactProfile[] = [
  {
    id: "asad",
    name: "Asad Ahmed",
    role: "CEO & Founder",
    company: "Nexus Health",
    type: "Founder",
    initials: "AA",
    avatarColor: "#428475",
    skills: ["HealthTech", "AI", "Clinical workflows"],
    experience: "7 years",
    mutual: 12,
    location: "Islamabad, PK",
    connected: true,
    match: 94,
    availability: "Hiring AI talent",
    focus: "AI-driven diagnostics for early-stage oncology detection",
    bio: "Founder building a clinical AI platform for oncology teams, with a focus on reliable diagnostics, secure workflows, and practical hospital adoption.",
    highlights: ["Series A ready roadmap", "Hiring AI and backend talent", "Strong clinical workflow focus"],
    online: true,
  },
  {
    id: "priya-founder",
    name: "Priya Sharma",
    role: "CTO",
    company: "FinFlow AI",
    type: "Founder",
    initials: "PS",
    avatarColor: "#C4973A",
    skills: ["FinTech", "Python", "Risk models"],
    experience: "9 years",
    mutual: 8,
    location: "Mumbai, IN",
    connected: true,
    match: 88,
    availability: "Open to developer intros",
    focus: "AI-powered financial analytics for small business owners",
    bio: "Technical founder building financial intelligence tools with a practical eye for compliance, model quality, and founder-developer collaboration.",
    highlights: ["Seed stage FinTech build", "Clear technical roadmap", "Looking for ML and backend support"],
    online: false,
  },
  {
    id: "jake",
    name: "Jake Rivers",
    role: "Full Stack Developer",
    company: "Freelance",
    type: "Developer",
    initials: "JR",
    avatarColor: "#7C5CBF",
    skills: ["React", "Node.js", "AWS"],
    experience: "5 years",
    mutual: 6,
    location: "London, UK",
    connected: true,
    match: 82,
    availability: "Open to side projects",
    focus: "Full-stack product builds and developer tooling",
    bio: "Full stack developer with experience shipping product dashboards, APIs, and collaboration tools for small teams.",
    highlights: ["React and Node.js stack", "AWS deployments", "Strong prototyping speed"],
    rating: 4,
    reviews: [
      {
        id: "jake-review-1",
        reviewer: "Priya Sharma",
        rating: 4,
        comment: "Jake communicates clearly and moves fast on full-stack prototypes.",
        date: "2 weeks ago",
      },
    ],
    online: true,
  },
  {
    id: "fatima",
    name: "Fatima Ali",
    role: "Blockchain Developer",
    company: "Veritas Energy",
    type: "Developer",
    initials: "FA",
    avatarColor: "#FF6B6B",
    skills: ["Solidity", "Web3", "Python"],
    experience: "4 years",
    mutual: 4,
    location: "Lahore, PK",
    connected: true,
    match: 78,
    availability: "Project-based",
    focus: "Smart contracts and clean-energy coordination tools",
    bio: "Blockchain developer focused on practical smart contract systems, audit readiness, and clean developer handoffs.",
    highlights: ["Solidity contracts", "Python automation", "Energy domain exposure"],
    rating: 4,
    reviews: [
      {
        id: "fatima-review-1",
        reviewer: "Asad Ahmed",
        rating: 4,
        comment: "Strong technical handoff and careful with risk notes.",
        date: "1 month ago",
      },
    ],
    online: false,
  },
  {
    id: "omar",
    name: "Omar Khalid",
    role: "ML Engineer",
    company: "AgriTwin",
    type: "Developer",
    initials: "OK",
    avatarColor: "#4A90D9",
    skills: ["Python", "TensorFlow", "PyTorch"],
    experience: "6 years",
    mutual: 3,
    location: "Dubai, UAE",
    connected: false,
    match: 84,
    availability: "Exploring roles",
    focus: "Applied ML and model deployment for agriculture systems",
    bio: "ML engineer comfortable with experiment design, model quality, and production deployment for data-heavy products.",
    highlights: ["TensorFlow and PyTorch", "Data pipeline experience", "Strong ML delivery notes"],
    rating: 5,
    reviews: [
      {
        id: "omar-review-1",
        reviewer: "Rania Hassan",
        rating: 5,
        comment: "Omar is very thoughtful about model quality and delivery tradeoffs.",
        date: "3 weeks ago",
      },
    ],
    online: false,
  },
  {
    id: "rania",
    name: "Rania Hassan",
    role: "CEO & Founder",
    company: "MediConnect",
    type: "Founder",
    initials: "RH",
    avatarColor: "#E8A87C",
    skills: ["HealthTech", "Product", "AI"],
    experience: "10 years",
    mutual: 15,
    location: "Cairo, EG",
    connected: false,
    match: 91,
    availability: "Hiring backend developers",
    focus: "Telemedicine access for rural patients and urban specialists",
    bio: "Founder building healthcare access infrastructure with a strong operator background and a clear need for backend and React talent.",
    highlights: ["MVP stage HealthTech", "Hiring technical collaborators", "Strong healthcare network"],
    online: true,
  },
  {
    id: "dev-patel",
    name: "Dev Patel",
    role: "Backend Engineer",
    company: "Aura Logistics",
    type: "Developer",
    initials: "DP",
    avatarColor: "#5BC8A0",
    skills: ["Go", "Kubernetes", "PostgreSQL"],
    experience: "5 years",
    mutual: 9,
    location: "Bangalore, IN",
    connected: true,
    match: 86,
    availability: "Part-time",
    focus: "Reliable APIs, infra automation, and database design",
    bio: "Backend engineer who has helped logistics and operations teams ship dependable systems under real-world load.",
    highlights: ["Go APIs", "Kubernetes and CI/CD", "PostgreSQL performance"],
    rating: 4,
    reviews: [
      {
        id: "dev-review-1",
        reviewer: "Sofia Reyes",
        rating: 4,
        comment: "Dev is reliable, direct, and excellent with infrastructure tradeoffs.",
        date: "2 months ago",
      },
    ],
    online: true,
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    role: "Product Founder",
    company: "Veritas Energy",
    type: "Founder",
    initials: "SR",
    avatarColor: "#F7B731",
    skills: ["CleanTech", "Roadmapping", "Partnerships"],
    experience: "8 years",
    mutual: 5,
    location: "Mexico City, MX",
    connected: false,
    match: 79,
    availability: "Exploring collaborators",
    focus: "Clean-energy coordination and product roadmapping",
    bio: "Product founder building energy coordination tools for solar cooperatives and local operating teams.",
    highlights: ["CleanTech domain", "Product roadmap in progress", "Open to developer collaborators"],
    online: false,
  },
  {
    id: "layla",
    name: "Layla Nasser",
    role: "AI Researcher",
    company: "Stealth",
    type: "Developer",
    initials: "LN",
    avatarColor: "#C4973A",
    skills: ["Research", "NLP", "Evaluation"],
    experience: "5 years",
    mutual: 7,
    location: "Doha, QA",
    connected: false,
    match: 80,
    availability: "Open to research collaborations",
    focus: "NLP evaluation and model reliability",
    bio: "AI researcher focused on model evaluation, data quality, and translating research into usable product decisions.",
    highlights: ["NLP evaluation", "Research collaboration", "Strong documentation"],
    rating: 4,
    reviews: [
      {
        id: "layla-review-1",
        reviewer: "Omar Khalid",
        rating: 4,
        comment: "Layla is precise, collaborative, and very strong on evaluation details.",
        date: "4 weeks ago",
      },
    ],
    online: true,
  },
  {
    id: "chen",
    name: "Chen Wei",
    role: "Founder",
    company: "DataSync",
    type: "Founder",
    initials: "CW",
    avatarColor: "#0F1C18",
    skills: ["Data", "SaaS", "Partnerships"],
    experience: "6 years",
    mutual: 2,
    location: "Singapore",
    connected: false,
    match: 76,
    availability: "Open to technical advisors",
    focus: "Data sync tooling for modern B2B teams",
    bio: "Founder building a SaaS data synchronization product for operations teams that need cleaner handoffs between tools.",
    highlights: ["B2B SaaS", "Data tooling", "Seeking technical advisors"],
    online: false,
  },
];

export const INITIAL_DEVELOPER_PENDING_IDS = ["rania", "layla", "chen"];

export function getDeveloperNetworkProfile(id: string) {
  return DEVELOPER_NETWORK_PROFILES.find((profile) => profile.id === id);
}

export function buildDeveloperProfileFromContact(contact: {
  id: string;
  name: string;
  role: string;
  match?: number;
  initials?: string;
  online?: boolean;
  personType?: NetworkType;
}): DeveloperContactProfile {
  const knownProfile = getDeveloperNetworkProfile(contact.id);
  if (knownProfile) {
    return {
      ...knownProfile,
      match: contact.match ?? knownProfile.match,
      online: contact.online ?? knownProfile.online,
    };
  }

  const [rolePart, companyPart] = contact.role.split(" - ");
  const type: NetworkType =
    contact.personType ?? (rolePart.toLowerCase().includes("founder") ? "Founder" : "Developer");
  const initials =
    contact.initials ||
    contact.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return {
    id: contact.id,
    name: contact.name,
    role: rolePart || contact.role,
    company: companyPart || "Evolv Network",
    type,
    initials,
    avatarColor: type === "Founder" ? "#0F1C18" : "#428475",
    skills: type === "Founder" ? ["Product", "Strategy", "Hiring"] : ["Engineering", "Collaboration", "Delivery"],
    experience: type === "Founder" ? "Founder profile" : "Developer profile",
    mutual: 0,
    location: "Remote",
    connected: true,
    match: contact.match ?? 80,
    availability: "In conversation",
    focus: type === "Founder" ? "Startup execution and hiring" : "Developer collaboration and delivery",
    bio: `${contact.name} is connected through your Evolv conversation context.`,
    highlights: ["Active conversation", "Shared Evolv network", "Profile details available from current context"],
    rating: type === "Developer" ? 3 : undefined,
    reviews: type === "Developer" ? [] : undefined,
    online: contact.online,
  };
}
