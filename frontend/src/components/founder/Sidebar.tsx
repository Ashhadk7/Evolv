"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientIcon as Icon } from "./ui/ClientIcon";
import {
  INITIAL_NOTIFS,
  SECTIONS,
  type BadgeKey,
  type FounderTab,
  type Notif,
} from "./founderData";
import { NotificationPanel } from "./ui/NotificationPanel";

export type { FounderTab };

// ── Color tokens ─────────────────────────────────────────────────────────────
const BG          = "#1a312c";
const BORDER_R    = "rgba(137,215,183,0.07)";
const ACCENT      = "#89d7b7";
const ACCENT_DIM  = "rgba(137,215,183,0.55)";
const TEXT_ON     = "#e8f4ef";
const TEXT_OFF    = "rgba(232,244,239,0.70)";
const TEXT_MUTED  = "rgba(232,244,239,0.42)";
const ACTIVE_BG   = "rgba(137,215,183,0.11)";
const HOVER_BG    = "rgba(255,255,255,0.045)";
const PILL_BG     = "rgba(255,255,255,0.04)";
const PILL_BORDER = "rgba(137,215,183,0.09)";
const MENU_BG     = "#1e3831";
const CLEAR       = "rgba(0,0,0,0)";

interface SidebarProps {
  active: FounderTab;
  onNavigate: (tab: FounderTab) => void;
  profile: { firstName: string; lastName: string; avatarUrl?: string };
  inboxCount?: number;
  networkCount?: number;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  active,
  onNavigate,
  profile,
  inboxCount   = 3,
  networkCount = 3,
  onOpenProfile,
  onLogout,
}: SidebarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen]             = useState(false);
  const [notifs, setNotifs]                   = useState<Notif[]>(INITIAL_NOTIFS);

  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef    = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead    = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

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
  const displayName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Founder";

  const getBadge = (badge?: BadgeKey) =>
    badge === "network" ? networkCount : badge === "inbox" ? inboxCount : 0;

  const openProfile = () => {
    setProfileMenuOpen(false);
    setNotifOpen(false);
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      onNavigate("settings");
    }
  };

  const renderAvatar = (size: number, fontSize: number) => (
    <div
      className="flex items-center justify-center overflow-hidden rounded-full shrink-0 font-bold"
      style={{
        width: size,
        height: size,
        fontSize,
        background: `linear-gradient(135deg, #4cb896, ${ACCENT})`,
        color: "#0f1c18",
        boxShadow: `0 0 0 2px rgba(137,215,183,0.18)`,
      }}
    >
      {profile.avatarUrl ? (
        <img src={profile.avatarUrl} alt={`${displayName} profile`} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );

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
                        backgroundColor: isActive ? ACTIVE_BG : CLEAR,
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
                        width={22}
                        height={22}
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

        {/* Notifications bell */}
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
              backgroundColor: notifOpen ? ACTIVE_BG : CLEAR,
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

          {/* Profile context menu */}
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
                <motion.button
                  type="button"
                  onClick={openProfile}
                  className="w-full cursor-pointer"
                  style={{
                    padding: "13px 14px 11px",
                    borderBottom: "1px solid rgba(137,215,183,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "left",
                  }}
                  whileHover={{ backgroundColor: "rgba(137,215,183,0.08)" }}
                  transition={{ duration: 0.12 }}
                >
                  {renderAvatar(28, 11)}
                  <div className="min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_ON, lineHeight: 1.3 }}>
                      {displayName}
                    </p>
                    <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.3 }}>Founder</p>
                  </div>
                  <Icon icon="solar:alt-arrow-right-bold" width={14} style={{ color: ACCENT_DIM, marginLeft: "auto", flexShrink: 0 }} />
                </motion.button>

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

          {/* Profile pill */}
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
            {renderAvatar(32, 12)}

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ fontSize: 13, color: TEXT_ON, lineHeight: 1.3 }}>
                {displayName}
              </p>
              <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.3 }}>Founder</p>
            </div>

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
      <NotificationPanel
        ref={panelRef}
        isOpen={notifOpen}
        notifs={notifs}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onNavigate={onNavigate}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}
