"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatCircleDots, PaperPlaneTilt, X } from "@phosphor-icons/react";
import type { Blueprint } from "@/features/blueprints/types";

// Floating Blueprint AI assistant — feature-local, only used inside BlueprintDetail.
type ChatMsg = { from: "ai" | "user"; text: string };

export function ChatPanel({ bp }: { bp: Blueprint }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      from: "ai",
      text: `I'm the blueprint assistant for ${bp.name}. Ask about the recommended stack, scope, budget, or what to build first.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    const replies = [
      `For ${bp.name}, I'd build the ${bp.techStack.frontend} client and ${bp.techStack.backend} API first — that unlocks the core flow and lets a developer demo value early.`,
      `The biggest lever is the AI layer (${bp.techStack.ai}). Ship a thin inference pipeline behind a clean API, then iterate on accuracy once real data flows in.`,
      `Budget-wise, front-load the must-have milestones. Payments release per approved milestone, so keep each phase independently shippable.`,
    ];
    const reply = replies[msgs.filter((m) => m.from === "user").length % replies.length];
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
    }, 1200);
  };

  return (
    <>
      <motion.button
        className="blueprint-no-print"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        style={{
          position: "fixed",
          bottom: 26,
          right: 26,
          zIndex: 60,
          width: 54,
          height: 54,
          borderRadius: 999,
          background: "linear-gradient(180deg, #244b42 0%, #18382f 55%, #102b24 100%)",
          border: "1px solid rgba(5, 31, 25, 0.88)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "inset 0 1px 0 rgba(171,255,220,0.18), inset 0 -1px 0 rgba(0,0,0,0.18), 0 12px 34px rgba(17,34,27,0.42)",
        }}
        aria-label="Blueprint assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              style={{ display: "flex" }}
            >
              <X size={20} weight="bold" className="text-bp-mint" />
            </motion.span>
          ) : (
            <motion.span
              key="s"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              style={{ display: "flex" }}
            >
              <ChatCircleDots size={22} weight="fill" className="text-bp-mint" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="blueprint-no-print bg-bp-card"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            style={{
              position: "fixed",
              bottom: 92,
              right: 26,
              zIndex: 59,
              width: 336,
              height: 440,
              borderRadius: 20,
              border: "1px solid var(--color-bp-border)",
              boxShadow: "0 24px 60px rgba(17,34,27,0.28)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="bg-bp-forest"
              style={{
                padding: "15px 18px",
                display: "flex",
                alignItems: "center",
                gap: 11,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "rgba(137,215,183,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChatCircleDots size={15} weight="fill" className="text-bp-mint" />
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Blueprint Assistant
                </div>
                <div className="text-bp-mint-soft" style={{ fontSize: 10.5 }}>
                  Ask anything about this build
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {msgs.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.from === "ai" ? "flex-start" : "flex-end",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    className={m.from === "ai" ? "bg-bp-tint text-bp-body" : "bg-bp-forest"}
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      padding: "10px 13px",
                      borderRadius: 14,
                      color: m.from === "ai" ? undefined : "#dbf0e5",
                      borderTopLeftRadius: m.from === "ai" ? 4 : 14,
                      borderTopRightRadius: m.from === "ai" ? 14 : 4,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div
                  className="bg-bp-tint"
                  style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    gap: 4,
                    padding: "11px 13px",
                    borderRadius: 14,
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.18 }}
                      className="bg-bp-mint"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                borderTop: "1px solid var(--color-bp-border-soft)",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Ask about the stack, scope, budget…"
                className="bg-bp-tint text-bp-ink"
                style={{
                  flex: 1,
                  fontSize: 12.5,
                  padding: "10px 13px",
                  borderRadius: 11,
                  border: "1px solid var(--color-bp-border-soft)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <motion.button
                onClick={send}
                whileTap={{ scale: 0.9 }}
                className="bp-gradient-btn"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PaperPlaneTilt size={16} weight="fill" className="text-bp-mint" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
