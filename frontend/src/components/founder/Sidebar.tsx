"use client";

import { SquaresFour, Lightbulb, ChartBar, ChatCircle, Gear } from "@phosphor-icons/react";

export type FounderTab = "dashboard" | "workspace" | "analysis" | "inbox" | "settings";

interface SidebarProps {
  active: FounderTab;
  onNavigate: (tab: FounderTab) => void;
  profile: { firstName: string; lastName: string };
  inboxCount?: number;
}

const ITEMS: { id: FounderTab; label: string; Icon: React.ElementType; badge?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", Icon: SquaresFour },
  { id: "workspace", label: "Workspace", Icon: Lightbulb },
  { id: "analysis", label: "Analysis", Icon: ChartBar },
  { id: "inbox", label: "Inbox", Icon: ChatCircle, badge: true },
  { id: "settings", label: "Settings", Icon: Gear },
];

export function Sidebar({ active, onNavigate, profile, inboxCount = 3 }: SidebarProps) {
  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "F";

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{ width: 210, background: "#0f1c18", height: "100vh" }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
          <path
            d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5"
            stroke="#89d7b7"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="3.5" r="2.1" fill="#89d7b7" />
        </svg>
        <span
          className="font-bold text-[17px] tracking-tight"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Ev<span style={{ color: "#89d7b7" }}>olv</span>
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
        {ITEMS.map(({ id, label, Icon, badge }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left"
              onMouseEnter={(e) => {
                if (isActive) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                if (isActive) return;
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
              style={{
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#0f1c18" : "rgba(255,255,255,0.65)",
                transform: "translateX(0)",
                transition: "background 0.15s ease, color 0.15s ease, transform 0.15s ease",
              }}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} />
              <span className="text-[14px] font-medium flex-1">{label}</span>
              {badge && inboxCount > 0 && (
                <span
                  className="text-[12px] font-bold px-2 py-0.5 rounded-full leading-none"
                  style={{ background: "#89d7b7", color: "#0f1c18" }}
                >
                  {inboxCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Profile Pill ── */}
      <div className="px-3 pb-5">
        <div
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: "#89d7b7", color: "#0f1c18" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[12px] font-semibold truncate"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              {profile.firstName} {profile.lastName}
            </div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Founder
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
