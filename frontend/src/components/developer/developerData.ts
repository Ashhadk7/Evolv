// ── Sidebar / navigation types ────────────────────────────────────────────────
export type DeveloperTab =
  | "dashboard"
  | "discover"
  | "applications"
  | "projects"
  | "network"
  | "inbox"
  | "settings";

export type BadgeKey = "network" | "inbox";

export interface NavItem {
  id: DeveloperTab;
  label: string;
  icon: string;
  badge?: BadgeKey;
}

// ── Notification types and data ───────────────────────────────────────────────
export type NotifType = "match" | "message" | "application" | "network" | "system";

export interface DevNotif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  tab: DeveloperTab;
  actionLabel: string;
}

export const NOTIF_ICONS: Record<NotifType, string> = {
  match:       "solar:user-check-rounded-bold-duotone",
  message:     "solar:chat-round-dots-bold-duotone",
  application: "solar:document-text-bold-duotone",
  network:     "solar:handshake-bold-duotone",
  system:      "solar:bolt-circle-bold-duotone",
};

export const NOTIF_COLORS: Record<NotifType, string> = {
  match:       "#89d7b7",
  message:     "#7db8f7",
  application: "#f0a96e",
  network:     "#c4a8f5",
  system:      "#89d7b7",
};

export const INITIAL_DEV_NOTIFS: DevNotif[] = [
  {
    id: "dn1",
    type: "match",
    title: "New startup match",
    body: "Nexus Health (94%) matches your AI & Python skillset",
    time: "3m ago",
    read: false,
    tab: "discover",
    actionLabel: "View in Discover",
  },
  {
    id: "dn2",
    type: "message",
    title: "Message from Asad Ahmed",
    body: "Hi, we'd love to discuss your application for the AI Engineer role",
    time: "18m ago",
    read: false,
    tab: "inbox",
    actionLabel: "Open in Inbox",
  },
  {
    id: "dn3",
    type: "application",
    title: "Application update",
    body: "FinFlow AI has moved your application to the Interview stage",
    time: "2h ago",
    read: true,
    tab: "applications",
    actionLabel: "View Applications",
  },
  {
    id: "dn4",
    type: "network",
    title: "Connection request",
    body: "Priya Sharma from Aura Logistics wants to connect with you",
    time: "5h ago",
    read: true,
    tab: "network",
    actionLabel: "View in Network",
  },
  {
    id: "dn5",
    type: "system",
    title: "Profile strength update",
    body: "Adding your GitHub will increase your match rate by 12%",
    time: "1d ago",
    read: true,
    tab: "settings",
    actionLabel: "Update Profile",
  },
];

// ── Nav sections ──────────────────────────────────────────────────────────────
export const DEV_SECTIONS: { group: string; items: NavItem[] }[] = [
  {
    group: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "solar:widget-5-bold-duotone" },
    ],
  },
  {
    group: "Discover",
    items: [
      { id: "discover",     label: "Discover",     icon: "solar:compass-bold-duotone" },
      { id: "applications", label: "Applications", icon: "solar:document-add-bold-duotone" },
    ],
  },
  {
    group: "Work",
    items: [
      { id: "projects", label: "Projects", icon: "solar:rocket-bold-duotone" },
      { id: "network",  label: "Network",  icon: "solar:users-group-two-rounded-bold-duotone", badge: "network" },
    ],
  },
  {
    group: "Connect",
    items: [
      { id: "inbox", label: "Inbox", icon: "solar:inbox-in-bold-duotone", badge: "inbox" },
    ],
  },
  {
    group: "Account",
    items: [
      { id: "settings", label: "Settings", icon: "solar:settings-minimalistic-bold-duotone" },
    ],
  },
];

export const statsData = [
    {
        id: 2,
        label: 'Active Projects',
        value: '4',
        trend: '+2',
        trendUp: true,
    },
    {
        id: 3,
        label: 'Earnings',
        value: '$8.4K',
        trend: '+12%',
        trendUp: true,
    },
    {
        id: 4,
        label: 'Pending Applications',
        value: '5',
        trend: '+3',
        trendUp: true,
    },
];

export const featuredMatch = {
    id: 1,
    name: 'Nexus Health',
    icon: 'heartbeat',
    matchScore: 94,
    description: 'AI-driven diagnostics platform for early-stage oncology detection. This is a Series A ready startup with $250K funding and a growing team of 8.',
    techStack: ['Python', 'FastAPI', 'AI/ML', 'React', 'Docker'],
    whyMatched: [
        'Strong Python & FastAPI expertise (5+ years)',
        'AI/ML background aligns perfectly with their tech stack',
        'Healthcare domain interest matches their mission',
        'Proven project experience with similar scale startups',
        'Your availability aligns with their timeline',
    ],
    logo: 'NH',
};

export const recentMatches = [
    {
        id: 2,
        name: 'Nexus Health',
        icon: 'heartbeat',
        matchScore: 94,
        description: 'AI-driven diagnostics platform for early-stage oncology detection.',
        techStack: ['Python', 'FastAPI', 'AI/ML'],
        industry: 'HealthTech',
        stage: 'Seed Stage',
        budget: '$250K',
        teamSize: '8 team',
        logo: 'NH',
    },
    {
        id: 3,
        name: 'Aura Logistics',
        icon: 'truck',
        matchScore: 88,
        description: 'Last-mile delivery drone network for suburban environments.',
        techStack: ['Node.js', 'React', 'AWS'],
        industry: 'Logistics',
        stage: 'Series A',
        budget: '$850K',
        teamSize: '12 team',
        iconClass: 'logistics',
        logo: 'AL',
    },
    {
        id: 4,
        name: 'Veritas Energy',
        icon: 'bolt',
        matchScore: 82,
        description: 'Decentralized micro-grid management software for solar cooperatives.',
        techStack: ['Python', 'Solidity', 'Blockchain'],
        industry: 'CleanTech',
        stage: 'MVP',
        budget: '$180K',
        teamSize: '6 team',
        iconClass: 'energy',
        logo: 'VE',
    },
];

export const applications = [
    {
        id: 1,
        name: 'Nexus Health',
        icon: 'heartbeat',
        iconClass: 'health',
        role: 'AI Engineer',
        date: 'Applied 2 days ago',
        status: 'Interview',
    },
    {
        id: 2,
        name: 'FinFlow AI',
        icon: 'dollar-sign',
        iconClass: 'finflow',
        role: 'Backend Developer',
        date: 'Applied 1 week ago',
        status: 'Pending',
    },
    {
        id: 3,
        name: 'Aura Logistics',
        icon: 'truck',
        iconClass: 'logistics',
        role: 'Full Stack Dev',
        date: 'Applied 2 weeks ago',
        status: 'Accepted',
    },
    {
        id: 4,
        name: 'Veritas Energy',
        icon: 'bolt',
        iconClass: 'energy',
        role: 'Smart Contract Eng',
        date: 'Applied 3 weeks ago',
        status: 'Declined',
    },
];

export const projects = [
    {
        id: 1,
        name: 'Nexus Health',
        role: 'AI Engineer',
        icon: 'heartbeat',
        iconClass: 'health',
        progress: 75,
        progressColor: 'green',
        teamMembers: ['A', 'B', 'C'],
        extraMembers: 5,
        stage: 'Testing',
        deadline: '4 days',
        hoursLogged: '124 hrs',
    },
    {
        id: 2,
        name: 'Aura Logistics',
        role: 'Lead Developer',
        icon: 'truck',
        iconClass: 'logistics',
        progress: 42,
        progressColor: 'orange',
        teamMembers: ['D', 'E', 'F'],
        extraMembers: 3,
        stage: 'Development',
        deadline: '15 days',
        hoursLogged: '64 hrs',
    },
];

export const profileData = {
    name: 'Sarah Mitchell',
    role: 'Senior AI Engineer',
    location: 'Islamabad, Pakistan',
    experience: '5 Years Experience',
    availability: 'Open to Opportunities',
    matchRate: '88%',
    profileStrength: '94%',
    founderRating: '4.9/5',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
};

export const agentStatusData = [
    { id: 1, name: 'Skill Analysis Agent', status: 'Active' },
    { id: 2, name: 'Startup Matching Agent', status: 'Active' },
    { id: 3, name: 'Career Recommendation Agent', status: 'Active' },
    { id: 4, name: 'Market Intelligence Agent', status: 'Active' },
];

export const insightsData = [
    { id: 1, icon: 'code', value: 'Machine Learning', label: 'MOST DEMANDED SKILL' },
    { id: 2, icon: 'arrow-up', value: '+18%', label: 'MATCH INCREASE POTENTIAL', trendUp: true },
    { id: 3, icon: 'heartbeat', value: 'HealthTech', label: 'FASTEST GROWING DOMAIN' },
    { id: 4, icon: 'users', value: '12', label: 'FOUNDER INTEREST SIGNALS' },
];
export const discoverStats = [
    { id: 1, label: 'New Matches', value: '18', trend: '+6', trendUp: true },
    { id: 2, label: 'High Match Opportunities', value: '12', trend: '+4', trendUp: true },
    { id: 3, label: 'Saved Blueprints', value: '9', trend: '+2', trendUp: true },
    { id: 4, label: 'Applications Submitted', value: '7', trend: '+3', trendUp: true },
];


export const opportunities = [
    {
        id: 5,
        name: 'Nexus Health',
        industry: 'HealthTech',
        founder: 'Asad Ahmed',
        stage: 'Series A',
        viability: 92,
        budget: '$250K',
        teamSize: '8',
        description: 'AI-driven diagnostics platform for early-stage oncology detection, reducing false positives by 40%.',
        roles: ['AI Engineer', 'Backend Engineer', 'ML Engineer'],
        techStack: ['Python', 'FastAPI', 'AI/ML', 'React', 'Docker'],
        matchExplanation: 'Your FastAPI, Python and AI experience strongly align with this startup.',
        metrics: { viability: 92, fundingReadiness: 85, growthPotential: 90 },
        logo: 'NH',
    },
    {
        id: 6,
        name: 'Aura Logistics',
        industry: 'Logistics',
        founder: 'Asad Ahmed',
        stage: 'Seed',
        viability: 85,
        budget: '$120K',
        teamSize: '6',
        description: 'Last-mile delivery drone network utilizing autonomous navigation in suburban environments.',
        roles: ['Full Stack Developer', 'DevOps Engineer'],
        techStack: ['Node.js', 'React', 'AWS', 'Docker'],
        matchExplanation: 'Your Node.js, React and AWS skills are a perfect fit for their tech stack.',
        metrics: { viability: 85, fundingReadiness: 75, growthPotential: 88 },
        logo: 'AL',
    },
    {
        id: 7,
        name: 'Veritas Energy',
        industry: 'CleanTech',
        founder: 'Asad Ahmed',
        stage: 'MVP',
        viability: 78,
        budget: '$80K',
        teamSize: '4',
        description: 'Decentralized micro-grid management software for residential solar cooperatives.',
        roles: ['Blockchain Developer', 'Backend Engineer'],
        techStack: ['Python', 'Solidity', 'Blockchain', 'React'],
        matchExplanation: 'Your Python and Blockchain expertise matches their technical requirements.',
        metrics: { viability: 78, fundingReadiness: 70, growthPotential: 82 },
        logo: 'VE',
    },
    {
        id: 8,
        name: 'FinFlow AI',
        industry: 'FinTech',
        founder: 'Priya Sharma',
        stage: 'Seed',
        viability: 88,
        budget: '$180K',
        teamSize: '7',
        description: 'AI-powered financial analytics platform for small business owners.',
        roles: ['ML Engineer', 'Backend Engineer'],
        techStack: ['Python', 'PyTorch', 'GraphQL', 'AWS'],
        matchExplanation: 'Your Python, PyTorch and GraphQL skills are highly relevant.',
        metrics: { viability: 88, fundingReadiness: 82, growthPotential: 92 },
        logo: 'FF',
    },
    {
        id: 9,
        name: 'AgriTwin',
        industry: 'EdTech',
        founder: 'Usman Khan',
        stage: 'Idea',
        viability: 72,
        budget: '$50K',
        teamSize: '3',
        description: 'Digital twin platform for agricultural education and training.',
        roles: ['Full Stack Developer', '3D Engineer'],
        techStack: ['React', 'Node.js', 'Three.js', 'PostgreSQL'],
        matchExplanation: 'Your React and Node.js experience aligns with their educational platform needs.',
        metrics: { viability: 72, fundingReadiness: 65, growthPotential: 78 },
        logo: 'AT',
    },
    {
        id: 10,
        name: 'MediConnect',
        industry: 'HealthTech',
        founder: 'Fatima Ali',
        stage: 'MVP',
        viability: 82,
        budget: '$95K',
        teamSize: '5',
        description: 'Telemedicine platform connecting rural patients with urban specialists.',
        roles: ['Backend Engineer', 'React Developer'],
        techStack: ['Python', 'FastAPI', 'React', 'PostgreSQL'],
        matchExplanation: 'Your FastAPI and Python expertise is exactly what they need.',
        metrics: { viability: 82, fundingReadiness: 78, growthPotential: 85 },
        logo: 'MC',
    },
];

export const founders = [
    {
        id: 1,
        founderName: 'Asad Ahmed',
        startupName: 'Nexus Health',
        role: 'AI Engineer',
        matchScore: 94,
        message: 'We are looking for an AI engineer to join our team. Your profile is exactly what we need.',
        logo: 'NH',
    },
    {
        id: 2,
        founderName: 'Priya Sharma',
        startupName: 'FinFlow AI',
        role: 'ML Engineer',
        matchScore: 82,
        message: 'We need a machine learning engineer to help build our financial models.',
        logo: 'FF',
    },
];

export const trendingDomains = [
    { id: 1, name: 'AI', startups: 24, growth: 32, demand: 94 },
    { id: 2, name: 'HealthTech', startups: 18, growth: 28, demand: 89 },
    { id: 3, name: 'FinTech', startups: 15, growth: 22, demand: 84 },
    { id: 4, name: 'SaaS', startups: 20, growth: 18, demand: 82 },
    { id: 5, name: 'EdTech', startups: 10, growth: 15, demand: 76 },
];

export const insights = [
    'Healthcare startups increased by 24% this month.',
    'Developers with FastAPI receive 31% more founder invitations.',
    'Machine Learning remains the most requested skill.',
    'Remote startup opportunities increased by 18%.',
];

export const filterOptions = {
    industries: ['HealthTech', 'FinTech', 'AI', 'SaaS', 'EdTech', 'CleanTech', 'Logistics'],
    fundingStages: ['Idea', 'MVP', 'Seed', 'Series A', 'Series B'],
    viabilityRanges: ['0-50', '50-70', '70-85', '85-100'],
    techStacks: ['React', 'Python', 'FastAPI', 'Node.js', 'AI/ML', 'AWS', 'PostgreSQL', 'Docker', 'Solidity', 'GraphQL'],
    matchScores: ['60%+', '70%+', '80%+', '90%+'],
    workTypes: ['Remote', 'Hybrid', 'Onsite'],
};

export const dashboardData = {};