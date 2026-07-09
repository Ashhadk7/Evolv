import type { ActionModalData } from "@/features/developer-dashboard/components/action-modal";
import type { applications } from "@/features/developer-dashboard/data/developer-data";

export type MatchData = {
  name: string;
  icon: string;
  matchScore: number;
  description: string;
  techStack: string[];
  industry?: string;
  stage?: string;
  budget?: string;
  teamSize?: string;
  iconClass?: string;
  whyMatched?: string[];
};

export type AppItem = (typeof applications)[number];

/* ─── Modal configs for every interactive element ─────────────────────── */
export const MODALS: {
  viewAllMatches: ActionModalData;
  viewAllApplications: ActionModalData;
  viewAllProjects: ActionModalData;
  reviewMatch: (match: MatchData) => ActionModalData;
  saveMatch: (match: MatchData) => ActionModalData;
  shareMatch: ActionModalData;
  editProfile: ActionModalData;
  viewPortfolio: ActionModalData;
  github: ActionModalData;
  linkedin: ActionModalData;
  twitter: ActionModalData;
  notification: ActionModalData;
  applicationItem: (app: AppItem) => ActionModalData;
} = {
  viewAllMatches: {
    icon: "star",
    accent: "#C4973A",
    title: "View All Matches",
    badge: "Discover Page",
    description:
      "Browse your full list of AI-curated startup matches ranked by compatibility. Filter by industry, stage, budget, and tech stack.",
    details: [
      { icon: "robot", label: "Total Matches", value: "34 new" },
      { icon: "chart-line", label: "Avg Match Score", value: "81%" },
      { icon: "filter", label: "Filters", value: "8 active options" },
      { icon: "clock", label: "Updated", value: "Every 2 hours" },
    ],
    steps: [
      "Navigate to the Discover page",
      "View all matches sorted by AI score",
      "Apply filters to narrow down results",
      "Connect or save matches to your shortlist",
    ],
    cta: "Go to Discover",
  },
  viewAllApplications: {
    icon: "paper-plane",
    accent: "#5BC8A0",
    title: "All Applications",
    badge: "Applications Page",
    description:
      "Track the full pipeline of your startup applications — from submitted to interview to accepted. See status updates in real-time.",
    details: [
      { icon: "hourglass-half", label: "Pending", value: "2 applications" },
      { icon: "calendar-check", label: "Interviews", value: "1 scheduled" },
      { icon: "check-circle", label: "Accepted", value: "1 offer" },
      { icon: "times-circle", label: "Declined", value: "1 total" },
    ],
    steps: [
      "Open the Applications page",
      "View full details for each application",
      "Track interview schedules and deadlines",
      "Accept or decline offers directly",
    ],
    cta: "View Applications",
  },
  viewAllProjects: {
    icon: "calendar-check",
    accent: "#7C5CBF",
    title: "Active Projects",
    badge: "Projects Page",
    description:
      "Monitor progress, deadlines, team collaboration, and hours logged across all your active startup engagements.",
    details: [
      { icon: "tasks", label: "Active Projects", value: "2 running" },
      { icon: "users", label: "Team Members", value: "6 people" },
      { icon: "clock", label: "Hours Logged", value: "88 hrs total" },
      { icon: "flag", label: "Next Deadline", value: "In 2 weeks" },
    ],
    steps: [
      "Open the Projects page",
      "Check progress bars and deadlines",
      "Log hours and update task status",
      "Collaborate with your startup team",
    ],
    cta: "View Projects",
  },
  reviewMatch: (match) => ({
    icon: "eye",
    accent: "#5BC8A0",
    title: `Review — ${match.name}`,
    badge: `${match.matchScore}% AI Match`,
    description: match.description,
    details: [
      { icon: "industry", label: "Industry", value: match.industry || "HealthTech" },
      { icon: "seedling", label: "Stage", value: match.stage || "Seed Stage" },
      { icon: "dollar-sign", label: "Budget", value: match.budget || "$250K" },
      { icon: "users", label: "Team", value: match.teamSize || "8 team" },
    ],
    steps: [
      "Read the full startup profile and mission",
      "Review the AI compatibility breakdown",
      "Send a connection request or save for later",
      "Schedule a discovery call if interested",
    ],
    cta: "View Full Profile",
  }),
  saveMatch: (match) => ({
    icon: "bookmark",
    accent: "#C4973A",
    title: `Save — ${match.name}`,
    badge: "Saved to Shortlist",
    description: `${match.name} has been added to your shortlist. You can revisit saved matches any time from the Discover page.`,
    details: [
      { icon: "star", label: "Match Score", value: `${match.matchScore}%` },
      { icon: "folder", label: "Saved To", value: "Your Shortlist" },
    ],
    steps: [
      "Match saved to your shortlist",
      "Access shortlist from Discover → Saved tab",
      "Compare saved matches side by side",
    ],
    cta: "View Shortlist",
  }),
  shareMatch: {
    icon: "share-alt",
    accent: "#FF6B6B",
    title: "Share Match",
    badge: "Share Feature",
    description:
      "Share this startup match with a colleague or mentor via a shareable link, email, or export a summary PDF.",
    details: [
      { icon: "link", label: "Share Via", value: "Link / Email" },
      { icon: "file-pdf", label: "Export", value: "PDF Summary" },
      { icon: "lock", label: "Privacy", value: "Link expires in 7 days" },
    ],
    steps: [
      "Generate a shareable link",
      "Send via email or copy to clipboard",
      "Recipient sees a read-only match card",
    ],
    cta: "Copy Link",
  },
  editProfile: {
    icon: "user-edit",
    accent: "#5BC8A0",
    title: "Edit Developer Profile",
    badge: "Settings Page",
    description:
      "Update your skills, portfolio links, availability status, and bio. A complete profile increases your AI match score significantly.",
    details: [
      { icon: "percentage", label: "Profile Strength", value: "94%" },
      { icon: "star", label: "Founder Rating", value: "4.9 / 5" },
      { icon: "check-circle", label: "Verified", value: "Email & GitHub" },
      { icon: "bolt", label: "Tip", value: "Add 2 more skills to hit 100%" },
    ],
    steps: [
      "Go to Settings → Profile",
      "Update skills, bio and availability",
      "Upload portfolio links and GitHub",
      "Save changes to boost match rate",
    ],
    cta: "Edit Profile",
  },
  viewPortfolio: {
    icon: "briefcase",
    accent: "#7C5CBF",
    title: "View Portfolio",
    badge: "Portfolio",
    description:
      "Sarah's public portfolio showcases 12 projects spanning AI/ML systems, full-stack applications, and open-source contributions.",
    details: [
      { icon: "code", label: "Projects", value: "12 featured" },
      { icon: "star", label: "GitHub Stars", value: "1.4K" },
      { icon: "eye", label: "Profile Views", value: "348 this month" },
      { icon: "award", label: "Top Skill", value: "Python / AI" },
    ],
    steps: [
      "Open public portfolio in a new tab",
      "Founders can view your project breakdowns",
      "Contact you directly from the portfolio page",
    ],
    cta: "Open Portfolio",
  },
  github: {
    icon: "github",
    accent: "#1B1B1B",
    title: "GitHub Profile",
    badge: "Open Source",
    description: `View Sarah's GitHub — 1.4K stars, 200+ contributions this year, and active open-source projects in Python and ML.`,
    details: [
      { icon: "code-branch", label: "Repos", value: "48 public" },
      { icon: "star", label: "Stars", value: "1.4K total" },
      { icon: "calendar", label: "Contributions", value: "204 this yr" },
    ],
    steps: [
      "Opens github.com/sarah-mitchell in a new tab",
      "Founders can review code quality directly",
    ],
    cta: "Open GitHub",
  },
  linkedin: {
    icon: "linkedin",
    accent: "#0077B5",
    title: "LinkedIn Profile",
    badge: "Professional Network",
    description:
      "Connect with Sarah on LinkedIn to see her full work history, recommendations, and professional endorsements.",
    details: [
      { icon: "users", label: "Connections", value: "500+" },
      { icon: "award", label: "Endorsements", value: "42 skills" },
      { icon: "certificate", label: "Certs", value: "3 AWS / GCP" },
    ],
    steps: [
      "Opens LinkedIn profile in a new tab",
      "Send a connection request",
      "View full professional history",
    ],
    cta: "Open LinkedIn",
  },
  twitter: {
    icon: "twitter",
    accent: "#1DA1F2",
    title: "Twitter / X",
    badge: "Social",
    description:
      "Follow Sarah for AI/ML thoughts, startup insights, and tech threads. 2.1K followers and counting.",
    details: [
      { icon: "users", label: "Followers", value: "2.1K" },
      { icon: "retweet", label: "Tweets", value: "860 total" },
    ],
    steps: [
      "Opens twitter.com/sarahmitchell in a new tab",
      "Follow for regular AI and startup content",
    ],
    cta: "Open Twitter",
  },
  notification: {
    icon: "bell",
    accent: "#FF6B6B",
    title: "Notifications",
    badge: "3 Unread",
    description:
      "You have 3 unread notifications — an interview invite from Nexus Health, a match score update, and a project deadline reminder.",
    details: [
      { icon: "calendar-check", label: "Interview", value: "Nexus Health — Tomorrow 3PM" },
      { icon: "star", label: "New Match", value: "Aura Logistics updated to 91%" },
      { icon: "flag", label: "Deadline", value: "Project due in 2 weeks" },
    ],
    steps: [
      "Review all notifications in your inbox",
      "Confirm or reschedule the interview",
      "Check updated match scores in Discover",
    ],
    cta: "Open Inbox",
  },
  applicationItem: (app) => ({
    icon: app.icon,
    accent:
      app.status === "Accepted"
        ? "#5BC8A0"
        : app.status === "Interview"
          ? "#C4973A"
          : app.status === "Declined"
            ? "#FF6B6B"
            : "#888",
    title: app.name,
    badge: app.status,
    description: `You applied for the ${app.role} position at ${app.name}. ${app.date}.`,
    details: [
      { icon: "briefcase", label: "Role", value: app.role },
      { icon: "clock", label: "Applied", value: app.date },
      { icon: "info-circle", label: "Status", value: app.status },
    ],
    steps:
      app.status === "Interview"
        ? [
            "Prepare for your interview",
            "Review the startup's tech stack",
            "Confirm the meeting time",
          ]
        : app.status === "Accepted"
          ? [
              "Congratulations! Review the offer",
              "Discuss terms with the founder",
              "Accept or negotiate",
            ]
          : app.status === "Declined"
            ? ["Review feedback if provided", "Explore similar matches in Discover"]
            : ["Application is under review", "You'll be notified within 3–5 days"],
    cta:
      app.status === "Interview"
        ? "Prepare Interview"
        : app.status === "Accepted"
          ? "View Offer"
          : "View Application",
  }),
};
