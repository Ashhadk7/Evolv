"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Buildings,
  ChatCircle,
  CheckCircle,
  Code,
  Handshake,
  MapPin,
  Star,
  UserPlus,
  Users,
} from "@phosphor-icons/react";

export type NetworkType = "Developer" | "Founder";

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
    skills: type === "Founder" ? ["Product", "Strategy", "Hiring"] : ["Product Engineering", "Collaboration", "MVP Build"],
    experience: type === "Founder" ? "Founder profile" : "Developer profile",
    mutual: 0,
    location: "Remote",
    connected: true,
    match: contact.match ?? 80,
    availability: "In conversation",
    focus: type === "Founder" ? "Startup execution and partnership building" : "Founder-facing product execution",
    bio: `${contact.name} is already in your inbox. Their public profile is being prepared from your current conversation context.`,
    highlights: ["Active conversation", "Shared Evolv network", "Profile details available from connected context"],
    online: contact.online,
  };
}

function ProfileAvatar({ profile, size = 64 }: { profile: FounderContactProfile; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: profile.avatarColor,
        color: "#fff",
        fontSize: size > 56 ? 18 : 12,
      }}
    >
      {profile.initials}
    </div>
  );
}

export function TypeBadge({ type }: { type: NetworkType }) {
  const isFounder = type === "Founder";
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{
        background: isFounder ? "rgba(196,151,58,0.1)" : "#e8f5ef",
        color: isFounder ? "#a87316" : "#2e7d5c",
        border: `1px solid ${isFounder ? "rgba(196,151,58,0.22)" : "#c5ddd0"}`,
      }}
    >
      {type}
    </span>
  );
}

export function SkillPill({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: "#f5f7f5", border: "1px solid #e8ede9", color: "#428475" }}
    >
      {label}
    </span>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: "#f5f7f5", border: "1px solid #e8ede9" }}>
      <div className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "#7a9e8e" }}>
        {label}
      </div>
      <div className="text-[12px] font-bold" style={{ color: "#1a2e26" }}>
        {value}
      </div>
    </div>
  );
}

export function NetworkProfileDetailScreen({
  profile,
  connected = profile.connected,
  pending = false,
  backLabel = "Back",
  onBack,
  onAccept,
  onIgnore,
  onToggleConnection,
  onMessage,
  messageLabel = "Message",
}: {
  profile: FounderContactProfile;
  connected?: boolean;
  pending?: boolean;
  backLabel?: string;
  onBack: () => void;
  onAccept?: (id: string) => void;
  onIgnore?: (id: string) => void;
  onToggleConnection?: (id: string) => void;
  onMessage?: (profile: FounderContactProfile) => void;
  messageLabel?: string;
}) {
  const canManagePending = pending && onAccept && onIgnore;
  const canToggleConnection = !pending && onToggleConnection;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      className="h-full overflow-y-auto"
      style={{ background: "#f5f6f4", padding: "24px 28px" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors hover:bg-[#e8ede9]"
          style={{ color: "#428475" }}
        >
          <ArrowLeft size={14} weight="bold" /> {backLabel}
        </button>
        <div className="h-4 w-px" style={{ background: "#dde5e0" }} />
        <div className="text-[12px] font-semibold" style={{ color: "#7a9e8e" }}>
          {profile.type} profile
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="space-y-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e8ede9" }}
          >
            <div className="p-5 flex flex-col md:flex-row md:items-start gap-4" style={{ borderBottom: "1px solid #eaf0eb" }}>
              <ProfileAvatar profile={profile} size={72} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-[1.45rem] font-bold leading-tight" style={{ color: "#1a2e26" }}>
                    {profile.name}
                  </h2>
                  {profile.online && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#2e7d5c" }} />}
                  <TypeBadge type={profile.type} />
                </div>
                <div className="text-[13px]" style={{ color: "#6b8e7e" }}>
                  {profile.role} at {profile.company}
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-[11px]" style={{ color: "#6b8e7e" }}>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {profile.location}</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {profile.experience}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {profile.mutual} mutual</span>
                  <span className="flex items-center gap-1"><Star size={12} weight="fill" /> {profile.match}% match</span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:ml-auto">
                {canManagePending && (
                  <>
                    <button
                      onClick={() => onIgnore(profile.id)}
                      className="px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors hover:bg-[#f5f7f5]"
                      style={{ color: "#7a9e8e", border: "1px solid #dde5e0" }}
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() => onAccept(profile.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-opacity hover:opacity-90"
                      style={{ background: "#0f1c18", color: "#89d7b7" }}
                    >
                      <UserPlus size={14} weight="bold" /> Accept
                    </button>
                  </>
                )}
                {canToggleConnection && (
                  <button
                    onClick={() => onToggleConnection(profile.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
                    style={{
                      background: connected ? "#e8f5ef" : "#0f1c18",
                      color: connected ? "#2e7d5c" : "#89d7b7",
                      border: connected ? "1px solid #c5ddd0" : "1px solid #0f1c18",
                    }}
                  >
                    {connected ? <CheckCircle size={14} weight="fill" /> : <UserPlus size={14} weight="bold" />}
                    {connected ? "Connected" : "Connect"}
                  </button>
                )}
                {onMessage && (
                  <button
                    onClick={() => onMessage(profile)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors hover:bg-[#e8ede9]"
                    style={{ color: "#0f1c18", border: "1px solid #dde5e0" }}
                  >
                    <ChatCircle size={14} /> {messageLabel}
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
              <DetailTile label="Match" value={`${profile.match}%`} />
              <DetailTile label={profile.type === "Developer" ? "Availability" : "Status"} value={profile.availability} />
              <DetailTile label="Connection" value={pending ? "Pending" : connected ? "Connected" : "Suggested"} />
            </div>
          </motion.section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e8ede9" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Code size={14} weight="bold" style={{ color: "#428475" }} />
                <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                  Professional summary
                </span>
              </div>
              <p className="text-[13px] leading-6" style={{ color: "#334d42" }}>
                {profile.bio}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e8ede9" }}
            >
              <div className="flex items-center gap-2 mb-2">
                {profile.type === "Founder" ? (
                  <Handshake size={14} weight="bold" style={{ color: "#428475" }} />
                ) : (
                  <Buildings size={14} weight="bold" style={{ color: "#428475" }} />
                )}
                <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                  Core focus
                </span>
              </div>
              <div className="rounded-xl p-3 text-[13px] leading-6" style={{ background: "#f5f7f5", color: "#1a2e26", border: "1px solid #e8ede9" }}>
                {profile.focus}
              </div>
            </motion.div>
          </section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4"
            style={{ border: "1px solid #e8ede9" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} weight="fill" style={{ color: "#2e7d5c" }} />
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                Highlights
              </span>
            </div>
            <div className="space-y-2.5">
              {profile.highlights.map((item) => (
                <div key={item} className="flex items-start gap-2 text-[12px]" style={{ color: "#1a2e26" }}>
                  <CheckCircle size={13} weight="fill" className="mt-0.5 shrink-0" style={{ color: "#2e7d5c" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-white rounded-xl p-4"
            style={{ border: "1px solid #e8ede9" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} weight="fill" style={{ color: "#C4973A" }} />
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                Skills and domains
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => <SkillPill key={skill} label={skill} />)}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

