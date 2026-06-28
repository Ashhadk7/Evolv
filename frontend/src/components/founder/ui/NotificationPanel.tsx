"use client";

import { forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import {
  NOTIF_COLORS,
  NOTIF_ICONS,
  type FounderTab,
  type Notif,
} from "../founderData";

interface NotificationPanelProps {
  isOpen: boolean;
  notifs: Notif[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: FounderTab) => void;
  onClose: () => void;
}

export const NotificationPanel = forwardRef<HTMLDivElement, NotificationPanelProps>(
  function NotificationPanel({ isOpen, notifs, onMarkRead, onMarkAllRead, onNavigate, onClose }, ref) {
    const [notifTab, setNotifTab] = useState<"all" | "unread">("all");

    const unreadCount = notifs.filter((n) => !n.read).length;
    const filtered    = notifTab === "all" ? notifs : notifs.filter((n) => !n.read);

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 39,
                background: "rgba(15,28,24,0.18)",
              }}
            />

            {/* Panel */}
            <motion.div
              ref={ref}
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
                    onClick={onClose}
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
                        <Icon icon="solar:bell-off-bold-duotone" width={26} style={{ color: "#89d7b7" }} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1a2e26", marginBottom: 5 }}>
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
                            onMarkRead(notif.id);
                            onNavigate(notif.tab);
                            onClose();
                          }}
                          className="group w-full text-left flex items-start cursor-pointer"
                          style={{
                            gap: 12,
                            padding: "14px 18px 14px 15px",
                            borderBottom: "1px solid #edf1ee",
                            borderLeft: notif.read ? "3px solid transparent" : "3px solid #89d7b7",
                            background: notif.read ? "#ffffff" : "rgba(137,215,183,0.04)",
                          }}
                          whileHover={{
                            x: 3,
                            backgroundColor: notif.read ? "#f0f5f2" : "rgba(137,215,183,0.1)",
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
                            <p style={{ fontSize: 12, color: "#7a9e8e", marginTop: 3, lineHeight: 1.5 }}>
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
                              <span style={{ fontSize: 11, color: "#b0c0b8" }}>{notif.time}</span>
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
                                <Icon icon="solar:arrow-right-bold" width={10} style={{ color: "#428475" }} />
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
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute inset-0 flex items-center justify-center">
                              <Icon icon="solar:alt-arrow-right-bold" width={13} style={{ color: "#7a9e8e" }} />
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
                      onClick={onMarkAllRead}
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
    );
  }
);
