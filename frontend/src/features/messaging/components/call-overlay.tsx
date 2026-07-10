"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Microphone, MicrophoneSlash, PhoneSlash, VideoCamera } from "@phosphor-icons/react";
import { DARK, MID, MINT } from "@/features/messaging/lib/inbox-theme";
import { Avatar } from "./inbox-avatar";

const AUDIO_BAR_DURATIONS = [0.55, 0.8, 0.65, 0.95, 0.7, 0.9];

interface CallContact {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
}

export function CallOverlay({
  contact,
  mode,
  onEnd,
}: {
  contact: CallContact;
  mode: "voice" | "video";
  onEnd: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,28,24,0.88)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="overflow-hidden rounded-2xl text-center"
        style={{ width: 320, background: DARK, border: "1px solid rgba(137,215,183,0.15)" }}
      >
        <div className="px-8 py-8">
          <Avatar
            name={contact.name}
            initials={contact.initials}
            avatarUrl={contact.avatarUrl}
            size={80}
            dark
          />
          <div
            className="mt-3 mb-0.5 text-[15px] font-semibold"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {contact.name}
          </div>
          <div className="mb-1 text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {contact.role}
          </div>
          <div className="mb-6 font-mono text-[13px]" style={{ color: MINT }}>
            {fmt(seconds)}
          </div>

          <div className="mb-6 flex items-end justify-center gap-1" style={{ height: 32 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: muted ? "#334d42" : MID }}
                animate={{ height: muted ? 4 : [4, 8, 16, 24, 12, 20, 8, 28, 12, 6][i % 10] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: AUDIO_BAR_DURATIONS[i % AUDIO_BAR_DURATIONS.length],
                  delay: i * 0.06,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              style={{ background: muted ? "rgba(255,255,255,0.08)" : "rgba(137,215,183,0.12)" }}
            >
              {muted ? (
                <MicrophoneSlash size={20} style={{ color: "rgba(255,255,255,0.4)" }} />
              ) : (
                <Microphone size={20} style={{ color: MINT }} />
              )}
            </button>

            <button
              type="button"
              onClick={onEnd}
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "#c0392b" }}
            >
              <PhoneSlash size={22} style={{ color: "#fff" }} weight="fill" />
            </button>

            {mode === "video" && (
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "rgba(137,215,183,0.12)" }}
              >
                <VideoCamera size={20} style={{ color: MINT }} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
