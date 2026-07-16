"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle, X } from "@phosphor-icons/react";

// Shared bottom-right "complete your profile" nudge used by both the founder
// and developer app shells, extracted from their layouts to remove the
// near-duplicate markup that previously lived in each one.
export function ProfileCompletionPrompt({
  visible,
  missingProfileFields,
  messageSuffix,
  title = "Complete profile setup",
  message,
  actionLabel = "Complete profile",
  headerClassName = "",
  buttonPaddingX,
  onDismiss,
  onOpenProfile,
}: {
  visible: boolean;
  missingProfileFields: string[];
  messageSuffix: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  headerClassName?: string;
  buttonPaddingX: number;
  onDismiss: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed right-5 bottom-5 z-40 w-[320px] overflow-hidden bg-white"
          style={{
            border: "1px solid #d9e7df",
            borderRadius: 12,
            boxShadow: "0 18px 44px rgba(15,28,24,0.16)",
          }}
        >
          <div className="flex items-start gap-3 px-4 py-4">
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "#e8f5ef", color: "#428475" }}
            >
              <CheckCircle size={17} weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <div className={`flex items-start justify-between gap-2 ${headerClassName}`}>
                <p className="text-[13px] font-extrabold" style={{ color: "#1a2e26" }}>
                  {title}
                </p>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="rounded-md p-1 transition hover:bg-[#f0f5f2]"
                  aria-label="Dismiss profile setup reminder"
                  style={{ color: "#7a9e8e" }}
                >
                  <X size={13} weight="bold" />
                </button>
              </div>
              <p className="mt-1 text-[12px] leading-5" style={{ color: "#6b8e7e" }}>
                {message ??
                  `Add ${missingProfileFields.slice(0, 2).join(", ") || "your details"} ${messageSuffix}`}
              </p>
              <button
                type="button"
                onClick={onOpenProfile}
                className="bp-gradient-btn mt-3 flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12px] font-bold"
                style={{
                  cursor: "pointer",
                  paddingLeft: buttonPaddingX,
                  paddingRight: buttonPaddingX,
                }}
              >
                {actionLabel}
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
