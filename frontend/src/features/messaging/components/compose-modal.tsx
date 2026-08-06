"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PaperPlaneTilt, WarningCircle, X } from "@phosphor-icons/react";
import { BORDER, DARK, TEXT } from "@/features/messaging/lib/inbox-theme";

export function ComposeModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (data: { email: string; subject: string; message: string }) => string | null | Promise<string | null>;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setError("");
    setSending(true);
    const nextError = await onSend({ email, subject: "", message });
    setSending(false);
    if (nextError) {
      setError(nextError);
      return;
    }
    setEmail("");
    setMessage("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ background: "rgba(15,28,24,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="w-full max-w-[620px] max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-2xl"
        style={{ border: `1px solid ${BORDER}` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3.5 sm:px-7 sm:py-5"
          style={{ background: DARK, color: "#e8f5ef" }}
        >
          <h3 className="text-base sm:text-[1.05rem] font-extrabold">New Message</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label="Close compose"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="p-4 sm:p-7 flex flex-col gap-4">
          <div className="flex flex-col sm:grid sm:grid-cols-[72px_1fr] items-start sm:items-center gap-1.5 sm:gap-4">
            <label
              className="text-[11px] sm:text-[12px] font-extrabold tracking-[0.12em] uppercase shrink-0"
              style={{ color: "#777" }}
            >
              To
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Recipient email..."
              className="h-11 sm:h-12 w-full min-w-0 rounded-xl sm:rounded-2xl border px-3.5 sm:px-4 text-xs sm:text-[14px] transition outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-[72px_1fr] items-start gap-1.5 sm:gap-4">
            <label
              className="sm:pt-3 text-[11px] sm:text-[12px] font-extrabold tracking-[0.12em] uppercase shrink-0"
              style={{ color: "#777" }}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your message..."
              rows={5}
              className="w-full min-w-0 resize-none rounded-xl sm:rounded-2xl border px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-[14px] leading-relaxed transition outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>
        </div>

        <div
          className="flex flex-col gap-3 px-4 py-4 sm:px-7 sm:py-5 sm:flex-row sm:items-center sm:justify-between border-t border-[#edf1ee]"
          style={{ background: "#fbfcfb" }}
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 text-[12px] font-semibold"
                style={{ color: "#b42318" }}
              >
                <WarningCircle size={15} weight="fill" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial h-10 sm:h-12 rounded-xl border bg-white px-4 sm:px-6 text-xs sm:text-[14px] font-semibold transition hover:bg-[#f5f7f5]"
              style={{ borderColor: "#ded9d0", color: TEXT }}
            >
              Cancel
            </button>
            <motion.button
              type="button"
              onClick={() => void submit()}
              disabled={sending}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="bp-gradient-btn flex-1 sm:flex-initial flex h-10 sm:h-12 items-center justify-center gap-2 rounded-xl px-5 sm:px-7 text-xs sm:text-[14px] font-extrabold"
            >
              <PaperPlaneTilt size={15} weight="fill" />
              {sending ? "Sending..." : "Send Message"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
