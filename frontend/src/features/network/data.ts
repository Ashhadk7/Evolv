import type { FounderContactProfile, NetworkType } from "./types";

export const FOUNDER_NETWORK_PROFILES: FounderContactProfile[] = [
  {
    id: "sarah",
    name: "Sarah Mitchell",
    role: "AI Engineer",
    company: "Independent",
    email: "sarah.mitchell@evolv.app",
    type: "Developer",
    initials: "SM",
    avatarColor: "#428475",
    skills: ["Python", "FastAPI", "AI/ML"],
    tags: ["AI Engineer", "Backend", "Product-minded"],
    skillEntries: [
      { id: "sarah-skill-1", kind: "Tech stack", name: "Python", experience: "5+ years" },
      { id: "sarah-skill-2", kind: "Framework", name: "FastAPI", experience: "3-5 years" },
      { id: "sarah-skill-3", kind: "Skill", name: "AI/ML", experience: "5+ years" },
    ],
    experience: "6 years",
    experienceYears: "6",
    mutual: 12,
    location: "San Francisco, US",
    connected: true,
    match: 94,
    availability: "Open to contract",
    focus: "Clinical AI workflows and model deployment",
    bio: "AI engineer with production experience across healthcare data pipelines, model serving, and secure APIs.",
    educations: [
      {
        id: "sarah-edu-1",
        level: "Master's",
        degree: "MS Artificial Intelligence",
        school: "Stanford University",
      },
    ],
    github: "github.com/sarah-mitchell-ai",
    linkedin: "linkedin.com/in/sarah-mitchell-ai",
    portfolioLink: "sarahmitchell.dev",
    certifications: [
      { id: "sarah-cert-1", name: "AWS Certified Machine Learning - Specialty" },
      { id: "sarah-cert-2", name: "TensorFlow Developer Certificate" },
    ],
    highlights: [
      "Built 3 health data pipelines",
      "FastAPI and TensorFlow stack",
      "Strong async collaboration",
    ],
    rating: 4,
    reviews: [
      {
        id: "sarah-review-1",
        reviewer: "Amina Hassan",
        rating: 5,
        comment:
          "Sarah turned a fuzzy AI workflow into a clear backend plan and kept the team calm during scope changes.",
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
    email: "james.okafor@evolv.app",
    type: "Developer",
    initials: "JO",
    avatarColor: "#7C5CBF",
    skills: ["Go", "PostgreSQL", "DevOps"],
    tags: ["Backend", "DevOps", "Data Engineer"],
    skillEntries: [
      { id: "james-skill-1", kind: "Tech stack", name: "Go", experience: "5+ years" },
      { id: "james-skill-2", kind: "Tool", name: "PostgreSQL", experience: "5+ years" },
      { id: "james-skill-3", kind: "Skill", name: "DevOps", experience: "3-5 years" },
    ],
    experience: "7 years",
    experienceYears: "7",
    mutual: 8,
    location: "London, UK",
    connected: true,
    match: 88,
    availability: "Part-time",
    focus: "Scalable APIs, infra automation, and observability",
    bio: "Backend specialist who has taken multiple B2B systems from prototype to production reliability.",
    educations: [
      {
        id: "james-edu-1",
        level: "Bachelor's",
        degree: "BS Software Engineering",
        school: "University of Manchester",
      },
    ],
    github: "github.com/james-okafor",
    linkedin: "linkedin.com/in/james-okafor",
    portfolioLink: "jamesokafor.dev",
    certifications: [{ id: "james-cert-1", name: "Certified Kubernetes Application Developer" }],
    highlights: ["Led API migration to Go", "Kubernetes and CI/CD", "FinTech compliance exposure"],
    rating: 4,
    reviews: [
      {
        id: "james-review-1",
        reviewer: "Hamza Ali",
        rating: 4,
        comment:
          "James is dependable with infrastructure decisions and explains tradeoffs in founder-friendly language.",
        date: "3 weeks ago",
      },
      {
        id: "james-review-2",
        reviewer: "Asad Khan",
        rating: 4,
        comment:
          "Very clear API planning and clean handover notes. Great fit for serious backend work.",
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
    email: "priya.nair@evolv.app",
    type: "Developer",
    initials: "PN",
    avatarColor: "#C4973A",
    skills: ["Next.js", "Node.js", "Design Systems"],
    tags: ["Full Stack", "Frontend", "UI/UX"],
    skillEntries: [
      { id: "priya-skill-1", kind: "Framework", name: "Next.js", experience: "3-5 years" },
      { id: "priya-skill-2", kind: "Tech stack", name: "Node.js", experience: "3-5 years" },
      { id: "priya-skill-3", kind: "Skill", name: "Design Systems", experience: "3-5 years" },
    ],
    experience: "5 years",
    experienceYears: "5",
    mutual: 6,
    location: "Bangalore, IN",
    connected: true,
    match: 81,
    availability: "Available next month",
    focus: "MVP builds with polished founder-facing UX",
    bio: "Full stack builder with a strong eye for product flow, dashboards, and practical launch timelines.",
    educations: [
      {
        id: "priya-edu-1",
        level: "Bachelor's",
        degree: "BS Computer Science",
        school: "PES University",
      },
    ],
    github: "github.com/priya-nair-dev",
    linkedin: "linkedin.com/in/priya-nair-dev",
    portfolioLink: "priyanair.design",
    certifications: [],
    highlights: ["Shipped 9 MVPs", "Next.js and Node.js", "Strong product instincts"],
    rating: 3,
    reviews: [
      {
        id: "priya-review-1",
        reviewer: "Amina Hassan",
        rating: 3,
        comment:
          "Good product sense and fast UI iteration. Best when requirements are already fairly clear.",
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
    email: "lars.eriksson@evolv.app",
    type: "Developer",
    initials: "LE",
    avatarColor: "#4A90D9",
    skills: ["Computer Vision", "NLP", "PyTorch"],
    tags: ["AI Engineer", "Data Engineer", "Product-minded"],
    skillEntries: [
      { id: "lars-skill-1", kind: "Skill", name: "Computer Vision", experience: "3-5 years" },
      { id: "lars-skill-2", kind: "Skill", name: "NLP", experience: "3-5 years" },
      { id: "lars-skill-3", kind: "Framework", name: "PyTorch", experience: "3-5 years" },
    ],
    experience: "4 years",
    experienceYears: "4",
    mutual: 5,
    location: "Stockholm, SE",
    connected: false,
    match: 76,
    availability: "Exploring roles",
    focus: "Applied ML for image and text intelligence",
    bio: "Machine learning engineer focused on fast experiments, deployment discipline, and measurable model quality.",
    educations: [
      {
        id: "lars-edu-1",
        level: "Master's",
        degree: "MS Data Science",
        school: "KTH Royal Institute of Technology",
      },
    ],
    github: "github.com/lars-eriksson-ml",
    linkedin: "linkedin.com/in/lars-eriksson-ml",
    portfolioLink: "larseriksson.ai",
    certifications: [{ id: "lars-cert-1", name: "Google Professional Machine Learning Engineer" }],
    highlights: ["Vision model deployment", "NLP search pipelines", "Experiment tracking"],
    rating: 3,
    reviews: [
      {
        id: "lars-review-1",
        reviewer: "Amina Hassan",
        rating: 3,
        comment:
          "Strong with experiments and model quality notes, but needs crisp product acceptance criteria.",
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
    email: "maya.chen@evolv.app",
    type: "Developer",
    initials: "MC",
    avatarColor: "#5BC8A0",
    skills: ["React", "Three.js", "Motion"],
    tags: ["Frontend", "UI/UX", "Product-minded"],
    skillEntries: [
      { id: "maya-skill-1", kind: "Framework", name: "React", experience: "5+ years" },
      { id: "maya-skill-2", kind: "Framework", name: "Three.js", experience: "3-5 years" },
      { id: "maya-skill-3", kind: "Tool", name: "Motion", experience: "3-5 years" },
    ],
    experience: "6 years",
    experienceYears: "6",
    mutual: 9,
    location: "Toronto, CA",
    connected: false,
    match: 90,
    availability: "Open this week",
    focus: "Interactive product experiences and data-rich dashboards",
    bio: "Frontend engineer who blends product taste, accessible UI, and motion systems for early-stage teams.",
    educations: [
      {
        id: "maya-edu-1",
        level: "Bachelor's",
        degree: "BS Software Engineering",
        school: "University of Waterloo",
      },
    ],
    github: "github.com/maya-chen-ui",
    linkedin: "linkedin.com/in/maya-chen-ui",
    portfolioLink: "mayachen.studio",
    certifications: [
      { id: "maya-cert-1", name: "Certified Professional in Accessibility Core Competencies" },
    ],
    highlights: [
      "Built investor demo portals",
      "Motion-rich dashboards",
      "Accessibility-minded UI",
    ],
    rating: 5,
    reviews: [
      {
        id: "maya-review-1",
        reviewer: "Hamza Ali",
        rating: 5,
        comment:
          "Maya built a beautiful investor demo quickly and handled interaction details with real care.",
        date: "1 week ago",
      },
      {
        id: "maya-review-2",
        reviewer: "Noah Williams",
        rating: 5,
        comment:
          "Excellent frontend partner for a founder who needs polish, speed, and sensible UX judgment.",
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
    email: "hamza.ali@payease.co",
    type: "Founder",
    initials: "HA",
    avatarColor: "#0F1C18",
    skills: ["FinTech", "Payments", "Go-to-market"],
    domains: ["FinTech", "Payments", "Go-to-market"],
    experience: "8 years",
    mutual: 4,
    location: "Lahore, PK",
    connected: false,
    match: 84,
    availability: "Open to partnerships",
    focus: "Embedded payments for small commerce teams",
    bio: "Founder building payment tooling for regional businesses, with a strong operator network in Pakistan.",
    educations: [
      { id: "hamza-edu-1", level: "MBA", degree: "MBA Entrepreneurship", school: "LUMS" },
    ],
    linkedin: "linkedin.com/in/hamza-ali-payease",
    highlights: ["Pilot with 40 merchants", "Payments and compliance", "Seeking dev partners"],
    online: true,
  },
  {
    id: "noah",
    name: "Noah Williams",
    role: "Product Founder",
    company: "CareLoop",
    email: "noah.williams@careloop.health",
    type: "Founder",
    initials: "NW",
    avatarColor: "#E8A87C",
    skills: ["HealthTech", "Product", "Operations"],
    domains: ["HealthTech", "Product", "Operations"],
    experience: "10 years",
    mutual: 7,
    location: "Austin, US",
    connected: false,
    match: 82,
    availability: "Hiring advisors",
    focus: "Patient retention tools for specialty clinics",
    bio: "Product founder with clinical operations experience and a clear roadmap for care coordination workflows.",
    educations: [
      { id: "noah-edu-1", level: "Master's", degree: "MPH", school: "University of Texas" },
    ],
    linkedin: "linkedin.com/in/noah-williams-careloop",
    highlights: [
      "Clinic operations background",
      "2 pilots in progress",
      "Strong problem discovery",
    ],
    online: false,
  },
  {
    id: "amina",
    name: "Amina Hassan",
    role: "Founder & CEO",
    company: "AgriTwin",
    email: "amina.hassan@agritwin.io",
    type: "Founder",
    initials: "AH",
    avatarColor: "#F7B731",
    skills: ["AgriTech", "IoT", "Fundraising"],
    domains: ["AgriTech", "IoT", "Fundraising"],
    experience: "9 years",
    mutual: 10,
    location: "Dubai, UAE",
    connected: true,
    match: 79,
    availability: "Open to founder intros",
    focus: "Digital twins for crop planning and water efficiency",
    bio: "Founder scaling AgriTwin across MENA with pilots, investor interest, and a deep climate-tech network.",
    educations: [
      {
        id: "amina-edu-1",
        level: "Master's",
        degree: "MSc Environmental Management",
        school: "University of Dubai",
      },
    ],
    linkedin: "linkedin.com/in/amina-hassan-agritwin",
    highlights: ["Seed round in progress", "IoT field pilots", "Climate-tech operator network"],
    online: false,
  },
  {
    id: "diego",
    name: "Diego Ramos",
    role: "Mobile Developer",
    company: "Freelance",
    email: "diego.ramos@evolv.app",
    type: "Developer",
    initials: "DR",
    avatarColor: "#FF6B6B",
    skills: ["React Native", "Expo", "Stripe"],
    tags: ["Mobile Developer", "Full Stack", "Product-minded"],
    skillEntries: [
      { id: "diego-skill-1", kind: "Framework", name: "React Native", experience: "3-5 years" },
      { id: "diego-skill-2", kind: "Tool", name: "Expo", experience: "3-5 years" },
      { id: "diego-skill-3", kind: "Tool", name: "Stripe", experience: "1-2 years" },
    ],
    experience: "5 years",
    experienceYears: "5",
    mutual: 3,
    location: "Mexico City, MX",
    connected: false,
    match: 73,
    availability: "Project-based",
    focus: "Mobile MVPs with payments and realtime features",
    bio: "Mobile developer comfortable taking early products from sketches to App Store-ready releases.",
    educations: [
      {
        id: "diego-edu-1",
        level: "Self-taught / Bootcamp",
        degree: "Coding Bootcamp",
        school: "Laboratoria",
      },
    ],
    github: "github.com/diego-ramos-mobile",
    linkedin: "linkedin.com/in/diego-ramos-mobile",
    portfolioLink: "diegoramos.dev",
    certifications: [],
    highlights: ["React Native launches", "Payments and notifications", "Lean MVP process"],
    rating: 3,
    reviews: [
      {
        id: "diego-review-1",
        reviewer: "Hamza Ali",
        rating: 3,
        comment:
          "Good mobile velocity and practical Stripe setup. Communication is best with weekly checkpoints.",
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
  email?: string;
}): FounderContactProfile {
  const knownProfile = getFounderNetworkProfile(contact.id);
  if (knownProfile) {
    return {
      ...knownProfile,
      match: contact.match ?? knownProfile.match,
      online: contact.online ?? knownProfile.online,
      email: knownProfile.email ?? contact.email,
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
    email: contact.email,
    type,
    initials,
    avatarColor: type === "Founder" ? "#0F1C18" : "#428475",
    skills:
      type === "Founder"
        ? ["Product", "Strategy", "Hiring"]
        : ["Product Engineering", "Collaboration", "MVP Build"],
    domains: type === "Founder" ? ["Product", "Strategy", "Hiring"] : undefined,
    experience: type === "Founder" ? "Founder profile" : "Developer profile",
    mutual: 0,
    location: "Remote",
    connected: true,
    match: contact.match ?? 80,
    availability: "In conversation",
    focus:
      type === "Founder"
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
