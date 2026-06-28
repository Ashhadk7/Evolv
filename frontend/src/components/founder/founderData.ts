// ── Sidebar / navigation types ───────────────────────────────────────────────
export type FounderTab =
  | "dashboard"
  | "workspace"
  | "analysis"
  | "network"
  | "inbox"
  | "settings";

export type BadgeKey = "network" | "inbox";

export interface NavItem {
  id: FounderTab;
  label: string;
  icon: string;
  badge?: BadgeKey;
}

// ── Notification types and data ──────────────────────────────────────────────
export type NotifType = "match" | "message" | "blueprint" | "network" | "system";

export interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  tab: FounderTab;
  actionLabel: string;
}

export const NOTIF_ICONS: Record<NotifType, string> = {
  match:     "solar:user-check-rounded-bold-duotone",
  message:   "solar:chat-round-dots-bold-duotone",
  blueprint: "solar:document-text-bold-duotone",
  network:   "solar:handshake-bold-duotone",
  system:    "solar:bolt-circle-bold-duotone",
};

export const NOTIF_COLORS: Record<NotifType, string> = {
  match:     "#89d7b7",
  message:   "#7db8f7",
  blueprint: "#f0a96e",
  network:   "#c4a8f5",
  system:    "#89d7b7",
};

export const INITIAL_NOTIFS: Notif[] = [
  {
    id: "n1",
    type: "match",
    title: "New developer match",
    body: "Sarah Mitchell (94%) is interested in Nexus Health",
    time: "2m ago",
    read: false,
    tab: "network",
    actionLabel: "View in Network",
  },
  {
    id: "n2",
    type: "message",
    title: "Message from James Okafor",
    body: "Hey, I've pushed the backend API updates you requested",
    time: "15m ago",
    read: false,
    tab: "inbox",
    actionLabel: "Open in Inbox",
  },
  {
    id: "n3",
    type: "blueprint",
    title: "Blueprint viewed",
    body: "An investor opened your Nexus Health blueprint",
    time: "1h ago",
    read: true,
    tab: "workspace",
    actionLabel: "View Blueprint",
  },
  {
    id: "n4",
    type: "network",
    title: "New connection request",
    body: "Priya Mehta wants to connect with you",
    time: "3h ago",
    read: true,
    tab: "network",
    actionLabel: "View in Network",
  },
  {
    id: "n5",
    type: "system",
    title: "Analysis ready",
    body: "Your Aura Logistics blueprint analysis is complete",
    time: "1d ago",
    read: true,
    tab: "analysis",
    actionLabel: "View Analysis",
  },
];

// ── Nav sections ─────────────────────────────────────────────────────────────
export const SECTIONS: { group: string; items: NavItem[] }[] = [
  {
    group: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "solar:widget-5-bold-duotone" },
    ],
  },
  {
    group: "Workspace",
    items: [
      { id: "workspace", label: "Workspace", icon: "solar:notebook-minimalistic-bold-duotone" },
      { id: "analysis",  label: "Analysis",  icon: "solar:graph-up-bold-duotone" },
    ],
  },
  {
    group: "Connect",
    items: [
      { id: "network", label: "Network", icon: "solar:users-group-two-rounded-bold-duotone", badge: "network" as BadgeKey },
      { id: "inbox",   label: "Inbox",   icon: "solar:inbox-in-bold-duotone",                badge: "inbox"   as BadgeKey },
    ],
  },
  {
    group: "Account",
    items: [
      { id: "settings", label: "Settings", icon: "solar:settings-minimalistic-bold-duotone" },
    ],
  },
];

// ── Network profile types and data ────────────────────────────────────────────
export type NetworkType = "Developer" | "Founder";

export interface NetworkReview {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FounderContactProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  type: NetworkType;
  initials: string;
  avatarColor: string;
  skills: string[];
  experience: string;
  mutual: number;
  location: string;
  connected: boolean;
  match: number;
  availability: string;
  focus: string;
  bio: string;
  highlights: string[];
  rating?: number;
  reviews?: NetworkReview[];
  online?: boolean;
}

export const FOUNDER_NETWORK_PROFILES: FounderContactProfile[] = [
  {
    id: "sarah",
    name: "Sarah Mitchell",
    role: "AI Engineer",
    company: "Independent",
    type: "Developer",
    initials: "SM",
    avatarColor: "#428475",
    skills: ["Python", "FastAPI", "AI/ML"],
    experience: "6 years",
    mutual: 12,
    location: "San Francisco, US",
    connected: true,
    match: 94,
    availability: "Open to contract",
    focus: "Clinical AI workflows and model deployment",
    bio: "AI engineer with production experience across healthcare data pipelines, model serving, and secure APIs.",
    highlights: ["Built 3 health data pipelines", "FastAPI and TensorFlow stack", "Strong async collaboration"],
    rating: 4,
    reviews: [
      {
        id: "sarah-review-1",
        reviewer: "Amina Hassan",
        rating: 5,
        comment: "Sarah turned a fuzzy AI workflow into a clear backend plan and kept the team calm during scope changes.",
        date: "2 weeks ago",
      },
      {
        id: "sarah-review-2",
        reviewer: "Noah Williams",
        rating: 4,
        comment: "Strong communicator around data handoffs, model risks, and production timelines.",
        date: "1 month ago",
      },
    ],
    online: true,
  },
  {
    id: "james",
    name: "James Okafor",
    role: "Backend Developer",
    company: "CloudBridge Labs",
    type: "Developer",
    initials: "JO",
    avatarColor: "#7C5CBF",
    skills: ["Go", "PostgreSQL", "DevOps"],
    experience: "7 years",
    mutual: 8,
    location: "London, UK",
    connected: true,
    match: 88,
    availability: "Part-time",
    focus: "Scalable APIs, infra automation, and observability",
    bio: "Backend specialist who has taken multiple B2B systems from prototype to production reliability.",
    highlights: ["Led API migration to Go", "Kubernetes and CI/CD", "FinTech compliance exposure"],
    rating: 4,
    reviews: [
      {
        id: "james-review-1",
        reviewer: "Hamza Ali",
        rating: 4,
        comment: "James is dependable with infrastructure decisions and explains tradeoffs in founder-friendly language.",
        date: "3 weeks ago",
      },
      {
        id: "james-review-2",
        reviewer: "Asad Khan",
        rating: 4,
        comment: "Very clear API planning and clean handover notes. Great fit for serious backend work.",
        date: "2 months ago",
      },
    ],
    online: true,
  },
  {
    id: "priya",
    name: "Priya Nair",
    role: "Full Stack Developer",
    company: "Studio North",
    type: "Developer",
    initials: "PN",
    avatarColor: "#C4973A",
    skills: ["Next.js", "Node.js", "Design Systems"],
    experience: "5 years",
    mutual: 6,
    location: "Bangalore, IN",
    connected: true,
    match: 81,
    availability: "Available next month",
    focus: "MVP builds with polished founder-facing UX",
    bio: "Full stack builder with a strong eye for product flow, dashboards, and practical launch timelines.",
    highlights: ["Shipped 9 MVPs", "Next.js and Node.js", "Strong product instincts"],
    rating: 3,
    reviews: [
      {
        id: "priya-review-1",
        reviewer: "Amina Hassan",
        rating: 3,
        comment: "Good product sense and fast UI iteration. Best when requirements are already fairly clear.",
        date: "1 month ago",
      },
      {
        id: "priya-review-2",
        reviewer: "Noah Williams",
        rating: 4,
        comment: "Priya made our dashboard feel polished without slowing the MVP timeline.",
        date: "2 months ago",
      },
    ],
    online: false,
  },
  {
    id: "lars",
    name: "Lars Eriksson",
    role: "ML Engineer",
    company: "Nordic Models",
    type: "Developer",
    initials: "LE",
    avatarColor: "#4A90D9",
    skills: ["Computer Vision", "NLP", "PyTorch"],
    experience: "4 years",
    mutual: 5,
    location: "Stockholm, SE",
    connected: false,
    match: 76,
    availability: "Exploring roles",
    focus: "Applied ML for image and text intelligence",
    bio: "Machine learning engineer focused on fast experiments, deployment discipline, and measurable model quality.",
    highlights: ["Vision model deployment", "NLP search pipelines", "Experiment tracking"],
    rating: 3,
    reviews: [
      {
        id: "lars-review-1",
        reviewer: "Amina Hassan",
        rating: 3,
        comment: "Strong with experiments and model quality notes, but needs crisp product acceptance criteria.",
        date: "6 weeks ago",
      },
    ],
    online: false,
  },
  {
    id: "maya",
    name: "Maya Chen",
    role: "Frontend Engineer",
    company: "LaunchCraft",
    type: "Developer",
    initials: "MC",
    avatarColor: "#5BC8A0",
    skills: ["React", "Three.js", "Motion"],
    experience: "6 years",
    mutual: 9,
    location: "Toronto, CA",
    connected: false,
    match: 90,
    availability: "Open this week",
    focus: "Interactive product experiences and data-rich dashboards",
    bio: "Frontend engineer who blends product taste, accessible UI, and motion systems for early-stage teams.",
    highlights: ["Built investor demo portals", "Motion-rich dashboards", "Accessibility-minded UI"],
    rating: 5,
    reviews: [
      {
        id: "maya-review-1",
        reviewer: "Hamza Ali",
        rating: 5,
        comment: "Maya built a beautiful investor demo quickly and handled interaction details with real care.",
        date: "1 week ago",
      },
      {
        id: "maya-review-2",
        reviewer: "Noah Williams",
        rating: 5,
        comment: "Excellent frontend partner for a founder who needs polish, speed, and sensible UX judgment.",
        date: "4 weeks ago",
      },
    ],
    online: true,
  },
  {
    id: "hamza",
    name: "Hamza Ali",
    role: "Founder",
    company: "PayEase",
    type: "Founder",
    initials: "HA",
    avatarColor: "#0F1C18",
    skills: ["FinTech", "Payments", "Go-to-market"],
    experience: "8 years",
    mutual: 4,
    location: "Lahore, PK",
    connected: false,
    match: 84,
    availability: "Open to partnerships",
    focus: "Embedded payments for small commerce teams",
    bio: "Founder building payment tooling for regional businesses, with a strong operator network in Pakistan.",
    highlights: ["Pilot with 40 merchants", "Payments and compliance", "Seeking dev partners"],
    online: true,
  },
  {
    id: "noah",
    name: "Noah Williams",
    role: "Product Founder",
    company: "CareLoop",
    type: "Founder",
    initials: "NW",
    avatarColor: "#E8A87C",
    skills: ["HealthTech", "Product", "Operations"],
    experience: "10 years",
    mutual: 7,
    location: "Austin, US",
    connected: false,
    match: 82,
    availability: "Hiring advisors",
    focus: "Patient retention tools for specialty clinics",
    bio: "Product founder with clinical operations experience and a clear roadmap for care coordination workflows.",
    highlights: ["Clinic operations background", "2 pilots in progress", "Strong problem discovery"],
    online: false,
  },
  {
    id: "amina",
    name: "Amina Hassan",
    role: "Founder & CEO",
    company: "AgriTwin",
    type: "Founder",
    initials: "AH",
    avatarColor: "#F7B731",
    skills: ["AgriTech", "IoT", "Fundraising"],
    experience: "9 years",
    mutual: 10,
    location: "Dubai, UAE",
    connected: true,
    match: 79,
    availability: "Open to founder intros",
    focus: "Digital twins for crop planning and water efficiency",
    bio: "Founder scaling AgriTwin across MENA with pilots, investor interest, and a deep climate-tech network.",
    highlights: ["Seed round in progress", "IoT field pilots", "Climate-tech operator network"],
    online: false,
  },
  {
    id: "diego",
    name: "Diego Ramos",
    role: "Mobile Developer",
    company: "Freelance",
    type: "Developer",
    initials: "DR",
    avatarColor: "#FF6B6B",
    skills: ["React Native", "Expo", "Stripe"],
    experience: "5 years",
    mutual: 3,
    location: "Mexico City, MX",
    connected: false,
    match: 73,
    availability: "Project-based",
    focus: "Mobile MVPs with payments and realtime features",
    bio: "Mobile developer comfortable taking early products from sketches to App Store-ready releases.",
    highlights: ["React Native launches", "Payments and notifications", "Lean MVP process"],
    rating: 3,
    reviews: [
      {
        id: "diego-review-1",
        reviewer: "Hamza Ali",
        rating: 3,
        comment: "Good mobile velocity and practical Stripe setup. Communication is best with weekly checkpoints.",
        date: "3 weeks ago",
      },
    ],
    online: true,
  },
];

export const INITIAL_PENDING_IDS = ["maya", "hamza", "noah"];

export function getFounderNetworkProfile(id: string) {
  return FOUNDER_NETWORK_PROFILES.find((profile) => profile.id === id);
}

export function buildProfileFromContact(contact: {
  id: string;
  name: string;
  role: string;
  match?: number;
  initials?: string;
  online?: boolean;
}): FounderContactProfile {
  const knownProfile = getFounderNetworkProfile(contact.id);
  if (knownProfile) {
    return {
      ...knownProfile,
      match: contact.match ?? knownProfile.match,
      online: contact.online ?? knownProfile.online,
    };
  }

  const [rolePart, companyPart] = contact.role.split(" - ");
  const type: NetworkType = rolePart.toLowerCase().includes("founder") ? "Founder" : "Developer";
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
    skills: type === "Founder"
      ? ["Product", "Strategy", "Hiring"]
      : ["Product Engineering", "Collaboration", "MVP Build"],
    experience: type === "Founder" ? "Founder profile" : "Developer profile",
    mutual: 0,
    location: "Remote",
    connected: true,
    match: contact.match ?? 80,
    availability: "In conversation",
    focus: type === "Founder"
      ? "Startup execution and partnership building"
      : "Founder-facing product execution",
    bio: `${contact.name} is already in your inbox. Their public profile is being prepared from your current conversation context.`,
    highlights: [
      "Active conversation",
      "Shared Evolv network",
      "Profile details available from connected context",
    ],
    rating: type === "Developer" ? 3 : undefined,
    reviews: type === "Developer" ? [] : undefined,
    online: contact.online,
  };
}
