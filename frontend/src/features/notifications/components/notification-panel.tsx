"use client";

import { forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClientIcon as Icon } from "@/components/ui/client-icon";
import { NOTIF_COLORS, NOTIF_ICONS } from "../data";
import type { AppNotif } from "../types";

interface NotificationPanelProps {
  isOpen: boolean;
  notifs: AppNotif[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: string) => void;
  onClose: () => void;
}

export const NotificationPanel = forwardRef<HTMLDivElement, NotificationPanelProps>(
  function NotificationPanel(
    { isOpen, notifs, onMarkRead, onMarkAllRead, onNavigate, onClose },
    ref
  ) {
    const [notifTab, setNotifTab] = useState<"all" | "unread">("all");

    const unreadCount = notifs.filter((n) => !n.read).length;
    const filtered = notifTab === "all" ? notifs : notifs.filter((n) => !n.read);

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
              className="fixed inset-0 z-[39] bg-[#0f1c18]/18"
            />

            {/* Panel */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed left-[240px] top-0 bottom-0 w-[340px] bg-[#fafbfa] border-r border-[#e4ebe6] shadow-[8px_0_36px_rgba(15,28,24,0.13)] z-[40] flex flex-col"
            >
              {/* ── Header ── */}
              <div className="py-5 px-[18px] pb-4 border-b border-[#edf1ee] shrink-0 bg-white">
                {/* Title row */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-[#1a2e26] tracking-[-0.015em]">
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
                          className="bg-[#1a312c] text-[#89d7b7] text-[10px] font-bold rounded-full px-[7px] py-[2px] leading-[1.6]"
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Close button */}
                  <motion.button
                    onClick={onClose}
                    className="w-[30px] h-[30px] rounded-lg flex items-center justify-center bg-[#f0f4f2] cursor-pointer"
                    whileHover={{ background: "#e4ebe6" }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ duration: 0.12 }}
                  >
                    <Icon
                      icon="solar:close-square-bold-duotone"
                      width={17}
                      className="text-[#7a9e8e]"
                    />
                  </motion.button>
                </div>

                {/* Segmented tab control */}
                <div className="bg-[#f0f4f2] rounded-[10px] p-[3px] flex gap-[2px]">
                  {(["all", "unread"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setNotifTab(tab)}
                      className="flex-1 relative py-[7px] px-3 rounded-[8px] cursor-pointer bg-transparent border-none outline-none"
                    >
                      {notifTab === tab && (
                        <motion.div
                          layoutId="notif-tab-indicator"
                          className="absolute inset-0 rounded-[7px] bg-white shadow-[0_1px_5px_rgba(15,28,24,0.09)]"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span
                        className={`relative z-10 text-[12px] flex items-center justify-center gap-1.5 transition-colors duration-150 capitalize ${
                          notifTab === tab ? "font-bold text-[#1a2e26]" : "font-semibold text-[#7a9e8e]"
                        }`}
                      >
                        {tab}
                        {tab === "unread" && unreadCount > 0 && (
                          <span
                            className={`text-[9px] font-bold rounded-full px-[5px] py-[1px] leading-[1.7] transition-all duration-150 ${
                              notifTab === "unread" ? "bg-[#0f1c18] text-[#89d7b7]" : "bg-[#d4dfd9] text-[#7a9e8e]"
                            }`}
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
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {filtered.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="py-15 px-6 text-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#edf2ef] flex items-center justify-center mx-auto mb-3.5">
                        <Icon
                          icon="solar:bell-off-bold-duotone"
                          width={26}
                          className="text-[#89d7b7]"
                        />
                      </div>
                      <p className="text-[14px] font-semibold text-[#1a2e26] mb-1.25">
                        All caught up
                      </p>
                      <p className="text-[12px] text-[#7a9e8e] leading-[1.55]">
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
                          className={`group flex w-full cursor-pointer items-start text-left gap-3 py-3.5 pr-[18px] pl-[15px] border-b border-[#edf1ee] transition-all duration-150 ${
                            notif.read
                              ? "border-l-[3px] border-l-transparent bg-white"
                              : "border-l-[3px] border-l-[#89d7b7] bg-[#89d7b7]/[0.04]"
                          }`}
                          whileHover={{
                            x: 3,
                            backgroundColor: notif.read ? "#f0f5f2" : "rgba(137,215,183,0.1)",
                          }}
                          transition={{ delay: i * 0.04, duration: 0.18 }}
                        >
                          {/* Type icon circle */}
                          <div
                            style={{
                              background: `${NOTIF_COLORS[notif.type]}18`,
                              border: `1px solid ${NOTIF_COLORS[notif.type]}28`,
                            }}
                            className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 mt-0.25"
                          >
                            <Icon
                              icon={NOTIF_ICONS[notif.type]}
                              width={19}
                              style={{ color: NOTIF_COLORS[notif.type] }}
                            />
                          </div>

                          {/* Text content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[13px] leading-[1.35] ${
                                notif.read ? "font-medium text-[#3d5c4e]" : "font-bold text-[#1a2e26]"
                              }`}
                            >
                              {notif.title}
                            </p>
                            <p className="text-[12px] text-[#7a9e8e] mt-0.75 leading-[1.5]">
                              {notif.body}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[11px] text-[#b0c0b8]">{notif.time}</span>
                              {!notif.read && (
                                <span className="text-[9px] font-bold tracking-[0.04em] text-[#428475] bg-[#428475]/10 rounded px-[5px] py-[1px] uppercase">
                                  New
                                </span>
                              )}
                              <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 text-[11px] font-bold text-[#428475] flex items-center gap-0.75">
                                {notif.actionLabel}
                                <Icon
                                  icon="solar:arrow-right-bold"
                                  width={10}
                                  className="text-[#428475]"
                                />
                              </span>
                            </div>
                          </div>

                          {/* Right side — unread dot or chevron on hover */}
                          <div className="shrink-0 mt-1 relative w-4">
                            <AnimatePresence>
                              {!notif.read && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                  className="w-2 h-2 rounded-full bg-[#89d7b7] shadow-[0_0_6px_rgba(137,215,183,0.55)] absolute top-0 right-0"
                                />
                              )}
                            </AnimatePresence>
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                              <Icon
                                icon="solar:alt-arrow-right-bold"
                                width={13}
                                className="text-[#7a9e8e]"
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
                    className="py-3.5 px-[18px] border-t border-[#edf1ee] shrink-0 bg-white"
                  >
                    <motion.button
                      onClick={onMarkAllRead}
                      className="bp-gradient-btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-[11px] text-[13px] font-bold"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      <Icon
                        icon="solar:check-read-bold-duotone"
                        width={15}
                        className="text-[#89d7b7]"
                      />
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
