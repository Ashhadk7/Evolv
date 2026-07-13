"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClientIcon as Icon } from "@/components/ui/client-icon";
import { Logo } from "@/features/auth/components/logo";
import { NotificationPanel } from "@/features/notifications/components/notification-panel";
import type { AppNotif } from "@/features/notifications/types";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notifications-api";
import type { BadgeKey, NavSection } from "@/config/navigation";
import { clearAllUserData } from "@/features/auth/lib/session";

// ─────────────────────────────────────────────────────────────────────────────
// ONE sidebar for every dashboard. Founder / Developer differ only by the props
// below (nav config, role label, profile, notifications). See config/navigation.
//
// NOTE: the colour literals here are kept as raw values — Framer Motion animates
// between parsed colours, so `var(--token)` strings can't be interpolated on the
// animated props. Tokenising the static styles is safe follow-up work.
// ─────────────────────────────────────────────────────────────────────────────
const BG = "#1a312c";
const BORDER_R = "rgba(137,215,183,0.07)";
const ACCENT = "#89d7b7";
const ACCENT_DIM = "rgba(137,215,183,0.55)";
const TEXT_ON = "#e8f4ef";
const TEXT_OFF = "rgba(232,244,239,0.70)";
const TEXT_MUTED = "rgba(232,244,239,0.42)";
const ACTIVE_BG = "rgba(137,215,183,0.11)";
const HOVER_BG = "rgba(255,255,255,0.045)";
const PILL_BG = "rgba(255,255,255,0.04)";
const PILL_BORDER = "rgba(137,215,183,0.09)";
const MENU_BG = "#1e3831";
const CLEAR = "rgba(0,0,0,0)";

export interface DashboardSidebarProps {
  /** Nav sections to render (founderNav / developerNav). */
  sections: NavSection[];
  /** Currently active nav id. */
  activeId: string;
  onNavigate: (id: string) => void;
  /** "Founder" | "Developer" — shown under the profile name. */
  roleLabel: string;
  profile: { firstName?: string; lastName?: string; avatarUrl?: string };
  /** Seed notifications for this role. */
  initialNotifs: AppNotif[];
  inboxCount?: number;
  networkCount?: number;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  /** Unique layoutId for the active-nav pill (prevents cross-mount animation). */
  navPillId?: string;
  /** Developer shell uses sticky positioning; founder uses relative. */
  sticky?: boolean;
  /** Initial shown when there is no avatar image. */
  avatarFallback?: string;
}

export function DashboardSidebar({
  sections,
  activeId,
  onNavigate,
  roleLabel,
  profile,
  initialNotifs,
  inboxCount = 3,
  networkCount = 0,
  onOpenProfile,
  onLogout,
  navPillId = "nav-pill",
  sticky = false,
  avatarFallback = "U",
}: DashboardSidebarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<AppNotif[]>(initialNotifs);

  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch real notifications from API; fall back to initialNotifs on error.
  useEffect(() => {
    fetchNotifications()
      .then((items) => setNotifs(items))
      .catch(() => {
        /* keep initialNotifs as fallback */
      });
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    // Optimistic update
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {
      // Revert on failure by re-fetching
      fetchNotifications()
        .then((items) => setNotifs(items))
        .catch(() => {
          /* ignore */
        });
    });
  };

  const markRead = (id: string) => {
    // Optimistic update
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationRead(id).catch(() => {
      // Revert on failure by re-fetching
      fetchNotifications()
        .then((items) => setNotifs(items))
        .catch(() => {
          /* ignore */
        });
    });
  };

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
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || avatarFallback;
  const displayName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || roleLabel;

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

  const handleLogout = () => {
    setProfileMenuOpen(false);
    if (onLogout) {
      onLogout();
      return;
    }
    clearAllUserData();
    window.location.href = "/sign-in";
  };

  const renderAvatar = (size: number, fontSize: number) => (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold"
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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatarUrl}
          alt={`${displayName} profile`}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );

  return (
    <>
      {/* ── Sidebar ── */}
      <motion.aside
        className="flex shrink-0 flex-col"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 240,
          minWidth: 240,
          background: BG,
          height: "100vh",
          borderRight: `1px solid ${BORDER_R}`,
          position: sticky ? "sticky" : "relative",
          top: sticky ? 0 : undefined,
          zIndex: 30,
        }}
      >
        {/* Brand */}
        <div className="flex items-center px-5 pt-3.5 pb-2.5">
          <Logo dark compact />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: BORDER_R, marginInline: 20 }} />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto" style={{ padding: "6px 8px 4px" }}>
          {sections.map(({ group, items }, si) => (
            <div key={group || si} style={{ marginBottom: group ? 3 : 2 }}>
              {group && (
                <p
                  className="font-semibold tracking-widest uppercase"
                  style={{
                    fontSize: 9.5,
                    color: TEXT_MUTED,
                    padding: "5px 10px 1px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {group}
                </p>
              )}

              <div className="flex flex-col" style={{ gap: 2 }}>
                {items.map(({ id, label, icon, badge }) => {
                  const isActive = activeId === id;
                  const count = getBadge(badge);

                  return (
                    <motion.button
                      key={id}
                      onClick={() => onNavigate(id)}
                      className="relative flex w-full cursor-pointer items-center rounded-xl text-left"
                      style={{
                        gap: 10,
                        padding: "7px 10px",
                        minHeight: 36,
                        border: "none",
                        background: "transparent",
                      }}
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
                          layoutId={navPillId}
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

                      <span className="flex-1 leading-none font-medium" style={{ fontSize: 13.5 }}>
                        {label}
                      </span>

                      {badge && count > 0 && (
                        <motion.span
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="rounded-full leading-none font-bold"
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

          {/* Divider for Notifications */}
          <div style={{ height: 1, background: BORDER_R, margin: "4px 10px 4px" }} />

          {/* Notifications Nav Item */}
          <motion.button
            ref={bellRef}
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileMenuOpen(false);
            }}
            className="relative flex w-full cursor-pointer items-center rounded-xl text-left"
            style={{
              gap: 10,
              padding: "7px 10px",
              minHeight: 36,
              border: "none",
              background: "transparent",
            }}
            whileHover={
              notifOpen
                ? {}
                : { x: 2, backgroundColor: HOVER_BG, color: "rgba(232,244,239,0.82)" }
            }
            animate={{
              backgroundColor: notifOpen ? ACTIVE_BG : CLEAR,
              color: notifOpen ? TEXT_ON : TEXT_OFF,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {notifOpen && (
              <motion.span
                layoutId={navPillId}
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
              icon="solar:bell-bold-duotone"
              width={20}
              height={20}
              style={{
                color: notifOpen ? ACCENT : TEXT_OFF,
                flexShrink: 0,
                transition: "color 0.15s ease",
              }}
            />

            <span className="flex-1 leading-none font-medium" style={{ fontSize: 13.5 }}>
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
                  className="rounded-full leading-none font-bold"
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
        </nav>

        {/* Profile pill + popover */}
        <div style={{ padding: "0 8px 8px", position: "relative" }} ref={profileRef}>
          <div style={{ height: 1, background: BORDER_R, marginBottom: 6 }} />

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
                    border: "none",
                    background: "transparent",
                  }}
                  whileHover={{ backgroundColor: "rgba(137,215,183,0.08)" }}
                  transition={{ duration: 0.12 }}
                >
                  {renderAvatar(28, 11)}
                  <div className="min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_ON, lineHeight: 1.3 }}>
                      {displayName}
                    </p>
                    <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.3 }}>{roleLabel}</p>
                  </div>
                  <Icon
                    icon="solar:alt-arrow-right-bold"
                    width={14}
                    style={{ color: ACCENT_DIM, marginLeft: "auto", flexShrink: 0 }}
                  />
                </motion.button>

                {/* Settings */}
                <motion.button
                  type="button"
                  onClick={openProfile}
                  className="flex w-full cursor-pointer items-center gap-3"
                  style={{
                    padding: "11px 14px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    borderBottom: "1px solid rgba(137,215,183,0.08)",
                  }}
                  whileHover={{ backgroundColor: "rgba(137,215,183,0.08)" }}
                  transition={{ duration: 0.12 }}
                >
                  <Icon
                    icon="solar:settings-minimalistic-bold-duotone"
                    width={16}
                    style={{ color: ACCENT, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: TEXT_ON, fontWeight: 500 }}>Settings</span>
                </motion.button>

                {/* Log out */}
                <motion.button
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3"
                  style={{
                    padding: "11px 14px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                  }}
                  whileHover={{ backgroundColor: "rgba(248,113,113,0.08)" }}
                  transition={{ duration: 0.12 }}
                >
                  <Icon
                    icon="solar:logout-2-bold-duotone"
                    width={16}
                    style={{ color: "#f87171", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>Log out</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile pill */}
          <motion.button
            onClick={() => {
              setProfileMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex w-full cursor-pointer items-center rounded-xl"
            style={{
              gap: 8,
              padding: "6px 8px",
              background: PILL_BG,
              border: `1px solid ${profileMenuOpen ? "rgba(137,215,183,0.18)" : PILL_BORDER}`,
            }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.07)" }}
            animate={{ borderColor: profileMenuOpen ? "rgba(137,215,183,0.18)" : PILL_BORDER }}
            transition={{ duration: 0.15 }}
          >
            {renderAvatar(28, 11)}

            <div className="min-w-0 flex-1" style={{ textAlign: "left" }}>
              <p
                className="truncate font-semibold"
                style={{ fontSize: 13, color: TEXT_ON, lineHeight: 1.3 }}
              >
                {displayName}
              </p>
              <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.3 }}>{roleLabel}</p>
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
