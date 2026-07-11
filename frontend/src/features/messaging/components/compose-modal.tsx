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
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: "rgba(15,28,24,0.34)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="w-full max-w-[780px] overflow-hidden bg-white shadow-2xl"
        style={{ borderRadius: 14, border: `1px solid ${BORDER}` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ background: DARK, color: "#e8f5ef" }}
        >
          <h3 className="text-[1.05rem] font-extrabold">New Message</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label="Close compose"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div>
          <div className="grid grid-cols-[92px_1fr] items-center gap-4 border-b border-[#edf1ee] px-7 py-3">
            <label
              className="text-[12px] font-extrabold tracking-[0.12em] uppercase"
              style={{ color: "#777" }}
            >
              To
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Recipient email..."
              className="h-14 rounded-2xl border px-4 text-[15px] transition outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>

          <div className="grid grid-cols-[92px_1fr] gap-4 border-b border-[#edf1ee] px-7 py-4">
            <label
              className="pt-3 text-[12px] font-extrabold tracking-[0.12em] uppercase"
              style={{ color: "#777" }}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your message..."
              rows={7}
              className="resize-none rounded-2xl border px-4 py-3 text-[15px] leading-6 transition outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>
        </div>

        <div
          className="flex flex-col gap-3 px-7 py-5 sm:flex-row sm:items-center sm:justify-between"
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

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl border bg-white px-6 text-[14px] font-semibold transition hover:bg-[#f5f7f5]"
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
              className="bp-gradient-btn flex h-12 items-center gap-2 rounded-xl px-7 text-[14px] font-extrabold"
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
