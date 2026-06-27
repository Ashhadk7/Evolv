"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  VideoCamera,
  Microphone,
  MicrophoneSlash,
  PhoneSlash,
  PaperPlaneTilt,
  DotsThree,
} from "@phosphor-icons/react";

/* ────────────────────────────────────────────────────────── */
/* Types & static data                                         */
/* ────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface InboxLaunchContact {
  id: string;
  name: string;
  role: string;
  match?: number;
  initials?: string;
  online?: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  match: number;
  lastMsg: string;
  lastTime: string;
  unread: number;
  initials: string;
  online: boolean;
}

const CONTACTS: Contact[] = [
  { id: "sarah", name: "Sarah Mitchell", role: "AI Engineer", match: 94, lastMsg: "Sounds great, let's sync tomorrow!", lastTime: "2m", unread: 2, initials: "SM", online: true },
  { id: "james", name: "James Okafor", role: "Backend Dev", match: 88, lastMsg: "I've reviewed the blueprint…", lastTime: "1h", unread: 0, initials: "JO", online: true },
  { id: "priya", name: "Priya Nair", role: "Full Stack Dev", match: 81, lastMsg: "Can you share the API docs?", lastTime: "3h", unread: 1, initials: "PN", online: false },
  { id: "lars", name: "Lars Eriksson", role: "ML Engineer", match: 76, lastMsg: "I'm interested in the AI role.", lastTime: "1d", unread: 0, initials: "LE", online: false },
];

const MOCK_MSGS: Record<string, Message[]> = {
  sarah: [
    { id: "1", from: "them", text: "Hi! I saw your Nexus Health blueprint — really impressive viability score.", time: "10:02" },
    { id: "2", from: "me", text: "Thank you! We're targeting early-stage oncology clinics. Your FastAPI experience is exactly what we need.", time: "10:05" },
    { id: "3", from: "them", text: "I've worked on 3 DICOM processing pipelines before. Happy to walk you through my previous work.", time: "10:07" },
    { id: "4", from: "me", text: "That would be perfect. Can we schedule a quick call this week?", time: "10:08" },
    { id: "5", from: "them", text: "Sounds great, let's sync tomorrow!", time: "10:09" },
  ],
  james: [
    { id: "1", from: "them", text: "I've reviewed the blueprint — the tech stack looks solid. Node.js + Go hybrid is a good call.", time: "09:30" },
    { id: "2", from: "me", text: "Glad you think so! We'd need someone to own the API layer and DevOps side.", time: "09:33" },
  ],
  priya: [
    { id: "1", from: "them", text: "Can you share the API docs?", time: "08:15" },
  ],
  lars: [
    { id: "1", from: "them", text: "I'm interested in the AI role. My background is in computer vision and NLP.", time: "Yesterday" },
  ],
};

const AUDIO_BAR_DURATIONS = [0.52, 0.64, 0.78, 0.58, 0.86, 0.68, 0.74, 0.9, 0.62, 0.8, 0.56, 0.7];

/* ────────────────────────────────────────────────────────── */
/* Sub-components                                              */
/* ────────────────────────────────────────────────────────── */

/* Call overlay */
function CallOverlay({
  contact,
  mode,
  onEnd,
}: {
  contact: Contact;
  mode: "voice" | "video";
  onEnd: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* Audio visualiser bars */
  const BAR_COUNT = 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,24,0.88)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden text-center"
        style={{ width: 320, background: "#0f1c18", border: "1px solid rgba(137,215,183,0.15)" }}
      >
        <div className="px-8 py-8">
          {/* Avatar */}
          <div
            className="h-20 w-20 rounded-full mx-auto mb-3 flex items-center justify-center text-[1.5rem] font-bold"
            style={{ background: "#1a3028", color: "#89d7b7", border: "2px solid rgba(137,215,183,0.2)" }}
          >
            {contact.initials}
          </div>

          <div className="text-[15px] font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.9)" }}>
            {contact.name}
          </div>
          <div className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {contact.role}
          </div>
          <div className="text-[13px] font-mono mb-6" style={{ color: "#89d7b7" }}>
            {fmt(seconds)}
          </div>

          {/* Visualiser */}
          <div className="flex items-end justify-center gap-1 mb-6" style={{ height: 32 }}>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: muted ? "#334d42" : "#428475" }}
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

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setMuted((m) => !m)}
              className="h-12 w-12 rounded-full flex items-center justify-center transition-colors"
              style={{ background: muted ? "rgba(255,255,255,0.08)" : "rgba(137,215,183,0.12)" }}
            >
              {muted ? (
                <MicrophoneSlash size={20} style={{ color: "rgba(255,255,255,0.4)" }} />
              ) : (
                <Microphone size={20} style={{ color: "#89d7b7" }} />
              )}
            </button>

            <button
              onClick={onEnd}
              className="h-14 w-14 rounded-full flex items-center justify-center"
              style={{ background: "#c0392b" }}
            >
              <PhoneSlash size={22} style={{ color: "#fff" }} weight="fill" />
            </button>

            {mode === "video" && (
              <button
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(137,215,183,0.12)" }}
              >
                <VideoCamera size={20} style={{ color: "#89d7b7" }} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Main export                                                 */
/* ────────────────────────────────────────────────────────── */

export function InboxTab({
  activeContactId,
  onActiveContactChange,
  extraContacts = [],
}: {
  activeContactId?: string;
  onActiveContactChange?: (id: string) => void;
  extraContacts?: InboxLaunchContact[];
}) {
  const [localActiveId, setLocalActiveId] = useState("sarah");
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MSGS);
  const [draft, setDraft] = useState("");
  const [call, setCall] = useState<{ mode: "voice" | "video" } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mergedContacts = [
    ...extraContacts
      .filter((extra) => !contacts.some((contact) => contact.id === extra.id))
      .map<Contact>((extra) => {
        const initials =
          extra.initials ||
          extra.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();

        return {
          id: extra.id,
          name: extra.name,
          role: extra.role,
          match: extra.match ?? 80,
          lastMsg: "New conversation",
          lastTime: "Now",
          unread: 0,
          initials,
          online: Boolean(extra.online),
        };
      }),
    ...contacts,
  ];

  const activeId = activeContactId ?? localActiveId;
  const contact = mergedContacts.find((c) => c.id === activeId) ?? mergedContacts[0] ?? CONTACTS[0];
  const thread = contact ? messages[contact.id] ?? [] : [];

  const selectContact = (id: string) => {
    if (onActiveContactChange) onActiveContactChange(id);
    else setLocalActiveId(id);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, thread.length]);

  const sendMsg = () => {
    if (!draft.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msg: Message = { id: Date.now().toString(), from: "me", text: draft.trim(), time: now };
    setMessages((prev) => ({ ...prev, [contact.id]: [...(prev[contact.id] ?? []), msg] }));
    setContacts((prev) => {
      const nextContact = { ...contact, lastMsg: draft.trim(), lastTime: "Now", unread: 0 };
      return prev.some((item) => item.id === contact.id)
        ? prev.map((item) => item.id === contact.id ? nextContact : item)
        : [nextContact, ...prev];
    });
    setDraft("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  return (
    <div
      className="h-full flex overflow-hidden"
      style={{ background: "#f5f6f4" }}
    >
      {/* ── Contact list ── */}
      <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: 260, background: "#fff", borderRight: "1px solid #e8ede9" }}>
        <div className="px-4 py-4 shrink-0" style={{ borderBottom: "1px solid #eaf0eb" }}>
          <div className="text-[13px] font-bold" style={{ color: "#1a2e26" }}>Inbox</div>
          <div className="text-[11px] mt-0.5" style={{ color: "#7a9e8e" }}>Developer connections</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mergedContacts.map((c) => {
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  selectContact(c.id);
                  setContacts((prev) => prev.map((item) => item.id === c.id ? { ...item, unread: 0 } : item));
                }}
                className={`w-full text-left px-4 py-3.5 transition-all cursor-pointer ${isActive ? 'bg-[#f0f5f2]' : 'hover:bg-[#f5f7f5]'}`}
                style={{
                  borderBottom: "1px solid #f0f5f2",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative shrink-0">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ background: isActive ? "#0f1c18" : "#e8f0eb", color: isActive ? "#89d7b7" : "#428475" }}
                    >
                      {c.initials}
                    </div>
                    {c.online && (
                      <span
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full"
                        style={{ background: "#2e7d5c", border: "2px solid #fff" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold truncate" style={{ color: "#1a2e26" }}>{c.name}</span>
                      <span className="text-[10px] shrink-0 ml-1" style={{ color: "#b0c0b8" }}>{c.lastTime}</span>
                    </div>
                    <div className="text-[10px] mb-0.5" style={{ color: "#7a9e8e" }}>{c.role}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] truncate" style={{ color: "#7a9e8e" }}>{c.lastMsg}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <span className="text-[10px] font-semibold" style={{ color: "#2e7d5c" }}>{c.match}%</span>
                        {c.unread > 0 && (
                          <span
                            className="h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{ background: "#89d7b7", color: "#0f1c18" }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Chat header */}
        <div
          className="flex items-center px-5 py-3.5 shrink-0 bg-white"
          style={{ borderBottom: "1px solid #e8ede9" }}
        >
          <div className="flex items-center gap-2.5 flex-1">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: "#0f1c18", color: "#89d7b7" }}
            >
              {contact.initials}
            </div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#1a2e26" }}>{contact.name}</div>
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#7a9e8e" }}>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: contact.online ? "#2e7d5c" : "#b0c0b8" }}
                />
                {contact.online ? "Online" : "Offline"}
                <span>· {contact.role}</span>
                <span
                  className="px-1.5 py-0.5 rounded-full font-semibold ml-1"
                  style={{ background: "#e8f5ef", color: "#2e7d5c" }}
                >
                  {contact.match}% Match
                </span>
              </div>
            </div>
          </div>
          {/* Call buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCall({ mode: "voice" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:bg-[#e8ede9] cursor-pointer"
              style={{ color: "#0f1c18", border: "1px solid #e8ede9" }}
            >
              <Phone size={14} /> Voice
            </button>
            <button
              onClick={() => setCall({ mode: "video" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:bg-[#1a2e26] cursor-pointer"
              style={{ background: "#0f1c18", color: "#89d7b7" }}
            >
              <VideoCamera size={14} /> Video
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#e8ede9] transition-all cursor-pointer">
              <DotsThree size={16} style={{ color: "#7a9e8e" }} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <AnimatePresence>
            {thread.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[68%] px-4 py-2.5 rounded-2xl text-[13px]"
                  style={
                    msg.from === "me"
                      ? { background: "#0f1c18", color: "#e8f5ef", borderBottomRightRadius: 4 }
                      : { background: "#fff", color: "#1a2e26", border: "1px solid #e8ede9", borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.text}
                  <div
                    className="text-[10px] mt-1 text-right"
                    style={{ color: msg.from === "me" ? "rgba(137,215,183,0.5)" : "#b0c0b8" }}
                  >
                    {msg.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="px-4 py-3 bg-white shrink-0 flex items-center gap-2"
          style={{ borderTop: "1px solid #e8ede9" }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            className="flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none"
            style={{ background: "#f5f7f5", border: "1px solid #e8ede9", color: "#1a2e26" }}
          />
          <button
            onClick={sendMsg}
            disabled={!draft.trim()}
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-opacity"
            style={{ background: "#0f1c18", opacity: draft.trim() ? 1 : 0.4 }}
          >
            <PaperPlaneTilt size={15} style={{ color: "#89d7b7" }} weight="fill" />
          </button>
        </div>
      </div>

      {/* Call overlay */}
      {call && (
        <CallOverlay
          contact={contact}
          mode={call.mode}
          onEnd={() => setCall(null)}
        />
      )}
    </div>
  );
}
