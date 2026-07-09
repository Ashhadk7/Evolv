// ─────────────────────────────────────────────────────────────────────────────
// Sidebar navigation config.
// The shared <DashboardSidebar /> is data-driven: it renders whatever sections
// it is handed. Founder and Developer differ ONLY by the arrays below — one
// component, two configs. Add/rename/reorder nav items here, never in the JSX.
// ─────────────────────────────────────────────────────────────────────────────

export type BadgeKey = "network" | "inbox";

export interface NavItem {
  /** Matches the route/tab id the dashboard navigates to. */
  id: string;
  label: string;
  /** Iconify icon name, e.g. "solar:widget-5-bold-duotone". */
  icon: string;
  /** Optional live-count badge sourced from the sidebar's count props. */
  badge?: BadgeKey;
}

export interface NavSection {
  /** Empty string renders no group header (used for the top-level Dashboard item). */
  group: string;
  items: NavItem[];
}

export const founderNav: NavSection[] = [
  {
    group: "",
    items: [{ id: "dashboard", label: "Dashboard", icon: "solar:widget-5-bold-duotone" }],
  },
  {
    group: "Workspace",
    items: [
      { id: "workspace", label: "Workspace", icon: "solar:notebook-minimalistic-bold-duotone" },
      { id: "projects", label: "Projects", icon: "solar:layers-minimalistic-bold-duotone" },
    ],
  },
  {
    group: "Connect",
    items: [
      {
        id: "network",
        label: "Network",
        icon: "solar:users-group-two-rounded-bold-duotone",
        badge: "network",
      },
      { id: "inbox", label: "Inbox", icon: "solar:inbox-in-bold-duotone", badge: "inbox" },
    ],
  },
];

export const developerNav: NavSection[] = [
  {
    group: "",
    items: [{ id: "dashboard", label: "Dashboard", icon: "solar:widget-5-bold-duotone" }],
  },
  {
    group: "Discover",
    items: [
      { id: "discover", label: "Discover", icon: "solar:compass-bold-duotone" },
      { id: "applications", label: "Applications", icon: "solar:document-add-bold-duotone" },
    ],
  },
  {
    group: "Work",
    items: [
      { id: "projects", label: "Projects", icon: "solar:rocket-bold-duotone" },
      {
        id: "network",
        label: "Network",
        icon: "solar:users-group-two-rounded-bold-duotone",
        badge: "network",
      },
    ],
  },
  {
    group: "Connect",
    items: [{ id: "inbox", label: "Inbox", icon: "solar:inbox-in-bold-duotone", badge: "inbox" }],
  },
];
