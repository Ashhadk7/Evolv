"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

// ── Color tokens ────────────────────────────────────────────────────────────
const BG          = "#1a312c";
const BORDER_R    = "rgba(137,215,183,0.07)";
const ACCENT      = "#89d7b7";
const ACCENT_DIM  = "rgba(137,215,183,0.55)";
const TEXT_ON     = "#e8f4ef";
const TEXT_OFF    = "rgba(232,244,239,0.46)";
const TEXT_MUTED  = "rgba(232,244,239,0.26)";
const ACTIVE_BG   = "rgba(137,215,183,0.11)";
const HOVER_BG    = "rgba(255,255,255,0.045)";
const PILL_BG     = "rgba(255,255,255,0.04)";
const PILL_BORDER = "rgba(137,215,183,0.09)";
const MENU_BG     = "#1e3831";

// ── Types ───────────────────────────────────────────────────────────────────
export type FounderTab =
  | "dashboard"
  | "workspace"
  | "analysis"
  | "network"
  | "inbox"
  | "settings";

interface SidebarProps {
  active: FounderTab;
  onNavigate: (tab: FounderTab) => void;
  profile: { firstName: string; lastName: string };
  inboxCount?: number;
  networkCount?: number;
  onLogout?: () => void;
}

type BadgeKey = "network" | "inbox";

interface NavItem {
  id: FounderTab;
  label: string;
  icon: string;
  badge?: BadgeKey;
}

// ── Notification data ───────────────────────────────────────────────────────
type NotifType = "match" | "message" | "blueprint" | "network" | "system";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  tab: FounderTab;
  actionLabel: string;
}

const NOTIF_ICONS: Record<NotifType, string> = {
  match:     "solar:user-check-rounded-bold-duotone",
  message:   "solar:chat-round-dots-bold-duotone",
  blueprint: "solar:document-text-bold-duotone",
  network:   "solar:handshake-bold-duotone",
  system:    "solar:bolt-circle-bold-duotone",
};

const NOTIF_COLORS: Record<NotifType, string> = {
  match:     "#89d7b7",
  message:   "#7db8f7",
  blueprint: "#f0a96e",
  network:   "#c4a8f5",
  system:    "#89d7b7",
};

const INITIAL_NOTIFS: Notif[] = [
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

// ── Nav sections ────────────────────────────────────────────────────────────
const SECTIONS: { group: string; items: NavItem[] }[] = [
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
      { id: "network", label: "Network", icon: "solar:users-group-two-rounded-bold-duotone", badge: "network" },
      { id: "inbox",   label: "Inbox",   icon: "solar:inbox-in-bold-duotone",                badge: "inbox"   },
    ],
  },
  {
    group: "Account",
    items: [
      { id: "settings", label: "Settings", icon: "solar:settings-minimalistic-bold-duotone" },
    ],
  },
];

// ── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar({
  active,
  onNavigate,
  profile,
  inboxCount   = 3,
  networkCount = 3,
  onLogout,
}: SidebarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen]             = useState(false);
  const [notifTab, setNotifTab]               = useState<"all" | "unread">("all");
  const [notifs, setNotifs]                   = useState<Notif[]>(INITIAL_NOTIFS);

  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef    = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const filtered    = notifTab === "all" ? notifs : notifs.filter((n) => !n.read);

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead    = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  // Click-outside: close profile menu and notif panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        bellRef.current &&
        !bellRef.current.contains(target)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "F";

  const getBadge = (badge?: BadgeKey) =>
    badge === "network" ? networkCount : badge === "inbox" ? inboxCount : 0;

  return (
    <>
      {/* ── Sidebar ── */}
      <motion.aside
        className="flex flex-col shrink-0"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 240,
          minWidth: 240,
          background: BG,
          height: "100vh",
          borderRight: `1px solid ${BORDER_R}`,
          position: "relative",
          zIndex: 30,
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 pt-7 pb-6">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5"
              stroke={ACCENT}
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="3.5" r="2.2" fill={ACCENT} />
          </svg>
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: 18, color: TEXT_ON, letterSpacing: "-0.02em" }}
          >
            Ev<span style={{ color: ACCENT }}>olv</span>
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: BORDER_R, marginInline: 20 }} />

        {/* Navigation */}
        <nav
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ padding: "14px 10px 8px" }}
        >
          {SECTIONS.map(({ group, items }, si) => (
            <div key={group || si} style={{ marginBottom: group ? 6 : 4 }}>
              {group && (
                <p
                  className="font-semibold uppercase tracking-widest"
                  style={{
                    fontSize: 10,
                    color: TEXT_MUTED,
                    padding: "10px 10px 6px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {group}
                </p>
              )}

              <div className="flex flex-col" style={{ gap: 2 }}>
                {items.map(({ id, label, icon, badge }) => {
                  const isActive = active === id;
                  const count    = getBadge(badge);

                  return (
                    <motion.button
                      key={id}
                      onClick={() => onNavigate(id)}
                      className="relative flex items-center w-full rounded-xl text-left cursor-pointer"
                      style={{ gap: 12, padding: "11px 12px", minHeight: 44 }}
                      whileHover={
                        isActive
                          ? {}
                          : { x: 2, backgroundColor: HOVER_BG, color: "rgba(232,244,239,0.82)" }
                      }
                      animate={{
                        backgroundColor: isActive ? ACTIVE_BG : "transparent",
                        color: isActive ? TEXT_ON : TEXT_OFF,
                      }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="founder-nav-pill"
                          className="absolute left-0 rounded-r-full"
                          style={{
                            width: 3,
                            height: "56%",
                            background: ACCENT,
                            top: "22%",
                            boxShadow: `0 0 8px ${ACCENT_DIM}`,
                          }}
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}

                      <Icon
                        icon={icon}
                        width={20}
                        height={20}
                        style={{
                          color: isActive ? ACCENT : TEXT_OFF,
                          flexShrink: 0,
                          transition: "color 0.15s ease",
                        }}
                      />

                      <span className="flex-1 leading-none font-medium" style={{ fontSize: 14 }}>
                        {label}
                      </span>

                      {badge && count > 0 && (
                        <motion.span
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="font-bold rounded-full leading-none"
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            background: ACTIVE_BG,
                            color: ACCENT,
                            border: "1px solid rgba(137,215,183,0.2)",
                          }}
                        >
                          {count}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Notifications bell — above profile pill */}
        <div style={{ padding: "0 10px 6px" }}>
          <div style={{ height: 1, background: BORDER_R, marginBottom: 8 }} />
          <motion.button
            ref={bellRef}
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileMenuOpen(false);
            }}
            className="relative w-full flex items-center rounded-xl cursor-pointer"
            style={{ gap: 12, padding: "10px 12px", minHeight: 44 }}
            animate={{
              backgroundColor: notifOpen ? ACTIVE_BG : "transparent",
              color: notifOpen ? TEXT_ON : TEXT_OFF,
            }}
            whileHover={notifOpen ? {} : { x: 2, backgroundColor: HOVER_BG }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Icon
              icon="solar:bell-bold-duotone"
              width={20}
              height={20}
              style={{ color: notifOpen ? ACCENT : TEXT_OFF, flexShrink: 0, transition: "color 0.15s" }}
            />
            <span className="flex-1 leading-none font-medium" style={{ fontSize: 14 }}>
              Notifications
            </span>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="font-bold rounded-full leading-none"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    background: ACTIVE_BG,
                    color: ACCENT,
                    border: "1px solid rgba(137,215,183,0.2)",
                  }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Profile pill + popover */}
        <div style={{ padding: "0 10px 20px", position: "relative" }} ref={profileRef}>
          <div style={{ height: 1, background: BORDER_R, marginBottom: 10 }} />

          {/* Profile context menu — pops up above the pill */}
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{
                  position: "absolute",
                  bottom: "calc(100% - 8px)",
                  left: 0,
                  right: 0,
                  background: MENU_BG,
                  border: "1px solid rgba(137,215,183,0.13)",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 -12px 32px rgba(0,0,0,0.35), 0 -2px 8px rgba(0,0,0,0.2)",
                  zIndex: 50,
                }}
              >
                {/* User header */}
                <div
                  style={{
                    padding: "13px 14px 11px",
                    borderBottom: "1px solid rgba(137,215,183,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full shrink-0 font-bold"
                    style={{
                      width: 28,
                      height: 28,
                      fontSize: 11,
                      background: `linear-gradient(135deg, #4cb896, ${ACCENT})`,
                      color: "#0f1c18",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_ON, lineHeight: 1.3 }}>
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.3 }}>Founder</p>
                  </div>
                </div>

                {/* Log out */}
                <motion.button
                  onClick={() => { setProfileMenuOpen(false); onLogout?.(); }}
                  className="w-full flex items-center gap-3 cursor-pointer"
                  style={{ padding: "11px 14px" }}
                  whileHover={{ backgroundColor: "rgba(248,113,113,0.08)" }}
                  transition={{ duration: 0.12 }}
                >
                  <Icon icon="solar:logout-2-bold-duotone" width={16} style={{ color: "#f87171", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>Log out</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile pill — clicking opens/closes the menu */}
          <motion.button
            onClick={() => { setProfileMenuOpen((v) => !v); setNotifOpen(false); }}
            className="w-full flex items-center rounded-xl cursor-pointer"
            style={{
              gap: 10,
              padding: "10px 12px",
              background: PILL_BG,
              border: `1px solid ${profileMenuOpen ? "rgba(137,215,183,0.18)" : PILL_BORDER}`,
            }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.07)" }}
            animate={{ borderColor: profileMenuOpen ? "rgba(137,215,183,0.18)" : PILL_BORDER }}
            transition={{ duration: 0.15 }}
          >
            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-full shrink-0 font-bold"
              style={{
                width: 32,
                height: 32,
                fontSize: 12,
                background: `linear-gradient(135deg, #4cb896, ${ACCENT})`,
                color: "#0f1c18",
                boxShadow: `0 0 0 2px rgba(137,215,183,0.18)`,
              }}
            >
              {initials}
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ fontSize: 13, color: TEXT_ON, lineHeight: 1.3 }}>
                {profile.firstName} {profile.lastName}
              </p>
              <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.3 }}>Founder</p>
            </div>

            {/* Chevron — rotates when menu is open */}
            <motion.span
              animate={{ rotate: profileMenuOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{ display: "flex", flexShrink: 0 }}
            >
              <Icon icon="solar:alt-arrow-down-bold" width={14} style={{ color: TEXT_MUTED }} />
            </motion.span>
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Notification panel ── */}
      <AnimatePresence>
        {notifOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setNotifOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 39,
                background: "rgba(15,28,24,0.18)",
              }}
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              style={{
                position: "fixed",
                left: 240,
                top: 0,
                bottom: 0,
                width: 340,
                background: "#fafbfa",
                borderRight: "1px solid #e4ebe6",
                boxShadow: "8px 0 36px rgba(15,28,24,0.13)",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* ── Header ── */}
              <div
                style={{
                  padding: "20px 18px 16px",
                  borderBottom: "1px solid #edf1ee",
                  flexShrink: 0,
                  background: "#ffffff",
                }}
              >
                {/* Title row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1a2e26",
                        letterSpacing: "-0.015em",
                      }}
                    >
                      Notifications
                    </h3>
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span
                          key="badge"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          style={{
                            background: "#0f1c18",
                            color: "#89d7b7",
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 99,
                            padding: "2px 7px",
                            lineHeight: 1.6,
                          }}
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Close button */}
                  <motion.button
                    onClick={() => setNotifOpen(false)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f0f4f2",
                      cursor: "pointer",
                    }}
                    whileHover={{ background: "#e4ebe6" }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ duration: 0.12 }}
                  >
                    <Icon icon="solar:close-square-bold-duotone" width={17} style={{ color: "#7a9e8e" }} />
                  </motion.button>
                </div>

                {/* Segmented tab control */}
                <div
                  style={{
                    background: "#f0f4f2",
                    borderRadius: 10,
                    padding: 3,
                    display: "flex",
                    gap: 2,
                  }}
                >
                  {(["all", "unread"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setNotifTab(tab)}
                      style={{
                        flex: 1,
                        position: "relative",
                        padding: "7px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        outline: "none",
                      }}
                    >
                      {notifTab === tab && (
                        <motion.div
                          layoutId="notif-tab-indicator"
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 7,
                            background: "#ffffff",
                            boxShadow: "0 1px 5px rgba(15,28,24,0.09)",
                          }}
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span
                        style={{
                          position: "relative",
                          zIndex: 1,
                          fontSize: 12,
                          fontWeight: notifTab === tab ? 600 : 500,
                          color: notifTab === tab ? "#1a2e26" : "#7a9e8e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          transition: "color 0.15s",
                          textTransform: "capitalize",
                        }}
                      >
                        {tab}
                        {tab === "unread" && unreadCount > 0 && (
                          <span
                            style={{
                              background: notifTab === "unread" ? "#0f1c18" : "#d4dfd9",
                              color: notifTab === "unread" ? "#89d7b7" : "#7a9e8e",
                              fontSize: 9,
                              fontWeight: 700,
                              borderRadius: 99,
                              padding: "1px 5px",
                              lineHeight: 1.7,
                              transition: "all 0.15s",
                            }}
                          >
                            {unreadCount}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── List ── */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                <AnimatePresence mode="wait">
                  {filtered.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ padding: "60px 24px", textAlign: "center" }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: "#edf2ef",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 14px",
                        }}
                      >
                        <Icon
                          icon="solar:bell-off-bold-duotone"
                          width={26}
                          style={{ color: "#89d7b7" }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a2e26",
                          marginBottom: 5,
                        }}
                      >
                        All caught up
                      </p>
                      <p style={{ fontSize: 12, color: "#7a9e8e", lineHeight: 1.55 }}>
                        No unread notifications right now
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {filtered.map((notif, i) => (
                        <motion.button
                          key={notif.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            markRead(notif.id);
                            onNavigate(notif.tab);
                            setNotifOpen(false);
                          }}
                          className="group w-full text-left flex items-start cursor-pointer"
                          style={{
                            gap: 12,
                            padding: "14px 18px 14px 15px",
                            borderBottom: "1px solid #edf1ee",
                            borderLeft: notif.read
                              ? "3px solid transparent"
                              : "3px solid #89d7b7",
                            background: notif.read
                              ? "#ffffff"
                              : "rgba(137,215,183,0.04)",
                          }}
                          whileHover={{
                            x: 3,
                            backgroundColor: notif.read
                              ? "#f0f5f2"
                              : "rgba(137,215,183,0.1)",
                          }}
                          transition={{ delay: i * 0.04, duration: 0.18 }}
                        >
                          {/* Type icon circle */}
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: `${NOTIF_COLORS[notif.type]}18`,
                              border: `1px solid ${NOTIF_COLORS[notif.type]}28`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            <Icon
                              icon={NOTIF_ICONS[notif.type]}
                              width={19}
                              style={{ color: NOTIF_COLORS[notif.type] }}
                            />
                          </div>

                          {/* Text content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: notif.read ? 500 : 600,
                                color: notif.read ? "#3d5c4e" : "#1a2e26",
                                lineHeight: 1.35,
                              }}
                            >
                              {notif.title}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#7a9e8e",
                                marginTop: 3,
                                lineHeight: 1.5,
                              }}
                            >
                              {notif.body}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 6,
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ fontSize: 11, color: "#b0c0b8" }}>
                                {notif.time}
                              </span>
                              {!notif.read && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: "0.04em",
                                    color: "#428475",
                                    background: "rgba(66,132,117,0.1)",
                                    borderRadius: 4,
                                    padding: "1px 5px",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  New
                                </span>
                              )}
                              {/* Action label — slides in on hover */}
                              <span
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#428475",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                {notif.actionLabel}
                                <Icon
                                  icon="solar:arrow-right-bold"
                                  width={10}
                                  style={{ color: "#428475" }}
                                />
                              </span>
                            </div>
                          </div>

                          {/* Right side — unread dot or chevron on hover */}
                          <div style={{ flexShrink: 0, marginTop: 4, position: "relative", width: 16 }}>
                            <AnimatePresence>
                              {!notif.read && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#89d7b7",
                                    boxShadow: "0 0 6px rgba(137,215,183,0.55)",
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                  }}
                                />
                              )}
                            </AnimatePresence>
                            {/* Chevron arrow — visible on hover */}
                            <span
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute inset-0 flex items-center justify-center"
                            >
                              <Icon
                                icon="solar:alt-arrow-right-bold"
                                width={13}
                                style={{ color: "#7a9e8e" }}
                              />
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer: mark all read ── */}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      padding: "14px 18px",
                      borderTop: "1px solid #edf1ee",
                      flexShrink: 0,
                      background: "#ffffff",
                    }}
                  >
                    <motion.button
                      onClick={markAllRead}
                      className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-xl"
                      style={{
                        padding: "11px 0",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#89d7b7",
                        background: "#0f1c18",
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      <Icon icon="solar:check-read-bold-duotone" width={15} style={{ color: "#89d7b7" }} />
                      Mark all as read
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
