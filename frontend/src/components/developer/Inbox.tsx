"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChatCircleDots,
  CheckCircle,
  DotsThree,
  Microphone,
  MicrophoneSlash,
  PaperPlaneTilt,
  PencilSimple,
  Phone,
  PhoneSlash,
  UserPlus,
  VideoCamera,
  WarningCircle,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { NetworkProfileDetailScreen } from "../founder/NetworkProfileDetail";
import {
  buildDeveloperProfileFromContact,
  DEVELOPER_NETWORK_PROFILES,
  type DeveloperContactProfile,
} from "./developerNetworkData";

type PersonType = "Founder" | "Developer";
type InboxFilter = "general" | "unread" | "requests" | "pending";
type RequestStatus = "pending" | "accepted" | "rejected";
type RequestDirection = "incoming" | "outgoing";

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  date: string;
  subject?: string;
}

export interface DeveloperInboxLaunchContact {
  id: string;
  name: string;
  role: string;
  match?: number;
  initials?: string;
  online?: boolean;
  email?: string;
  avatarUrl?: string;
  personType?: PersonType;
  requestStatus?: RequestStatus;
  requestDirection?: RequestDirection;
  initialMessage?: string;
  subject?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  personType: PersonType;
  match: number;
  lastMsg: string;
  lastTime: string;
  unread: number;
  initials: string;
  online: boolean;
  email?: string;
  avatarUrl?: string;
  subject?: string;
  requestStatus?: RequestStatus;
  requestDirection?: RequestDirection;
}

interface CurrentDeveloper {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

interface StoredAppUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  jobTitle?: string;
  avatarUrl?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    jobTitle?: string;
    headline?: string;
    bio?: string;
    avatarUrl?: string;
    photo?: string;
    image?: string;
  };
}

const INK = "#0f1c18";
const DARK = "#1a312c";
const MID = "#428475";
const MINT = "#89d7b7";
const BORDER = "#dce7e1";
const TEXT = "#1a2e26";
const MUTED = "#6f9283";
const DIM = "#9aaea5";

const CONTACTS: Contact[] = [
  {
    id: "asad",
    name: "Asad Ahmed",
    role: "CEO & Founder - Nexus Health",
    personType: "Founder",
    match: 94,
    lastMsg: "We would love to discuss your AI background.",
    lastTime: "10m",
    unread: 2,
    initials: "AA",
    online: true,
    email: "asad.ahmed@evolv.app",
    subject: "AI Engineer opportunity",
  },
  {
    id: "priya-founder",
    name: "Priya Sharma",
    role: "CTO - FinFlow AI",
    personType: "Founder",
    match: 88,
    lastMsg: "Your profile caught our eye.",
    lastTime: "2h",
    unread: 0,
    initials: "PS",
    online: false,
    email: "priya.sharma@evolv.app",
    subject: "ML Engineer role",
  },
  {
    id: "jake",
    name: "Jake Rivers",
    role: "Full Stack Developer - Freelance",
    personType: "Developer",
    match: 82,
    lastMsg: "Want to collaborate on a side project?",
    lastTime: "1d",
    unread: 0,
    initials: "JR",
    online: true,
    email: "jake.rivers@evolv.app",
    subject: "Side project",
  },
  {
    id: "rania",
    name: "Rania Hassan",
    role: "CEO & Founder - MediConnect",
    personType: "Founder",
    match: 91,
    lastMsg: "I saw your backend and AI work and would like to connect.",
    lastTime: "3h",
    unread: 1,
    initials: "RH",
    online: true,
    email: "rania.hassan@evolv.app",
    subject: "Connection request",
    requestStatus: "pending",
    requestDirection: "incoming",
  },
  {
    id: "layla",
    name: "Layla Nasser",
    role: "AI Researcher - Stealth",
    personType: "Developer",
    match: 80,
    lastMsg: "Would love to compare notes on model evaluation.",
    lastTime: "5h",
    unread: 1,
    initials: "LN",
    online: true,
    email: "layla.nasser@evolv.app",
    subject: "Research collaboration",
    requestStatus: "pending",
    requestDirection: "incoming",
  },
];

const MOCK_MSGS: Record<string, Message[]> = {
  asad: [
    { id: "1", from: "them", text: "Hi Sarah, your AI/ML profile is exactly what we need for Nexus Health.", time: "09:42 AM", date: "Jun 24, 2025", subject: "AI Engineer opportunity" },
    { id: "2", from: "me", text: "Thank you, Asad. I would love to hear more about the clinical workflow and model deployment needs.", time: "11:15 AM", date: "Jun 24, 2025" },
    { id: "3", from: "them", text: "Perfect. We are building around FastAPI, secure data pipelines, and practical AI review tools.", time: "11:22 AM", date: "Jun 24, 2025" },
  ],
  "priya-founder": [
    { id: "1", from: "them", text: "Hey Sarah, your Python and ML background caught our eye for FinFlow AI.", time: "08:00 AM", date: "Jun 24, 2025", subject: "ML Engineer role" },
  ],
  jake: [
    { id: "1", from: "them", text: "Sarah, I saw your portfolio and I am building an open-source developer productivity tool.", time: "04:00 PM", date: "Jun 23, 2025" },
  ],
  rania: [
    { id: "1", from: "them", text: "I saw your backend and AI work and would like to connect before sharing more about MediConnect.", time: "01:10 PM", date: "Jun 24, 2025", subject: "Connection request" },
  ],
  layla: [
    { id: "1", from: "them", text: "Would love to compare notes on model evaluation and research-to-product handoffs.", time: "11:05 AM", date: "Jun 24, 2025", subject: "Research collaboration" },
  ],
};

const AUDIO_BAR_DURATIONS = [0.52, 0.64, 0.78, 0.58, 0.86, 0.68, 0.74, 0.9, 0.62, 0.8, 0.56, 0.7];
const DEFAULT_DEVELOPER_USER: CurrentDeveloper = { firstName: "Sarah", lastName: "Mitchell" };

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function roleToPersonType(role?: string, fallbackRole?: string): PersonType {
  const value = `${role ?? ""} ${fallbackRole ?? ""}`.toLowerCase();
  return value.includes("founder") || value.includes("ceo") || value.includes("cto") ? "Founder" : "Developer";
}

function isIncomingRequest(contact: Contact) {
  return contact.requestDirection === "incoming" && contact.requestStatus !== "accepted";
}

function isOutgoingPending(contact: Contact) {
  return contact.requestDirection === "outgoing" && contact.requestStatus === "pending";
}

function hasSentIntro(thread: Message[]) {
  return thread.some((msg) => msg.from === "me");
}

function readStoredUsers() {
  try {
    const allUsers = JSON.parse(localStorage.getItem("evolv_users") ?? "[]");
    const currentUser = JSON.parse(localStorage.getItem("evolv_user") ?? "null");
    return [currentUser, ...(Array.isArray(allUsers) ? allUsers : [])].filter(Boolean) as StoredAppUser[];
  } catch {
    return [];
  }
}

function contactFromStoredUser(user: StoredAppUser): Contact | null {
  const email = user.email || user.profile?.email;
  if (!email) return null;

  const name =
    `${user.profile?.firstName ?? user.firstName ?? ""} ${user.profile?.lastName ?? user.lastName ?? ""}`.trim() ||
    email.split("@")[0];
  const personType = roleToPersonType(user.role, user.profile?.role);
  const role =
    personType === "Founder"
      ? user.profile?.headline || user.profile?.bio || "Founder"
      : user.profile?.jobTitle || user.jobTitle || user.profile?.role || "Developer";

  return {
    id: `user-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    role,
    personType,
    match: personType === "Founder" ? 82 : 76,
    lastMsg: "New conversation",
    lastTime: "Now",
    unread: 0,
    initials: getInitials(name),
    online: false,
    email,
    avatarUrl: user.profile?.avatarUrl || user.avatarUrl || user.profile?.photo || user.profile?.image,
  };
}

function getDeveloperUser(): CurrentDeveloper {
  if (typeof window === "undefined") return DEFAULT_DEVELOPER_USER;

  try {
    const user = JSON.parse(localStorage.getItem("evolv_user") ?? "null") as StoredAppUser | null;
    if (!user) return DEFAULT_DEVELOPER_USER;
    return {
      firstName: user.firstName || user.profile?.firstName || DEFAULT_DEVELOPER_USER.firstName,
      lastName: user.lastName || user.profile?.lastName || DEFAULT_DEVELOPER_USER.lastName,
      email: user.email || user.profile?.email,
      avatarUrl: user.avatarUrl || user.profile?.avatarUrl || user.profile?.photo || user.profile?.image,
    };
  } catch {
    return DEFAULT_DEVELOPER_USER;
  }
}

function getDeveloperName(currentUser?: CurrentDeveloper) {
  return `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You";
}

function Avatar({
  name,
  initials,
  avatarUrl,
  size = 40,
  dark = false,
}: {
  name: string;
  initials?: string;
  avatarUrl?: string;
  size?: number;
  dark?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarUrl ? undefined : dark ? DARK : "#e8f0eb",
        backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
        backgroundPosition: "center",
        backgroundSize: "cover",
        color: dark ? MINT : MID,
        fontSize: Math.max(10, Math.round(size * 0.28)),
        border: dark ? "1px solid rgba(137,215,183,0.25)" : "1px solid #dce9e2",
      }}
      aria-label={`${name} avatar`}
    >
      {!avatarUrl && (initials || getInitials(name))}
    </div>
  );
}

function MessageRow({
  msg,
  contact,
  currentUser,
}: {
  msg: Message;
  contact: Contact;
  currentUser?: CurrentDeveloper;
}) {
  const mine = msg.from === "me";
  const developerName = getDeveloperName(currentUser);
  const developerInitials = getInitials(developerName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${mine ? "justify-end" : "justify-start"}`}
    >
      {!mine && <Avatar name={contact.name} initials={contact.initials} avatarUrl={contact.avatarUrl} size={42} />}

      <div className={`flex max-w-[74%] flex-col ${mine ? "items-end" : "items-start"}`}>
        <div
          className={`mb-2 flex flex-wrap items-center gap-2 text-[12px] leading-5 ${mine ? "justify-end" : "justify-start"}`}
          style={{ color: DIM }}
        >
          {!mine && <span className="font-extrabold" style={{ color: INK }}>{contact.name}</span>}
          <span>{msg.date} - {msg.time}</span>
          {mine && <span className="font-extrabold" style={{ color: INK }}>You</span>}
        </div>

        <div
          className="px-4 py-3 text-[13px] leading-6"
          style={
            mine
              ? { background: DARK, color: "#e8f5ef", borderRadius: "18px 18px 4px 18px" }
              : { background: "#fff", color: TEXT, border: "1px solid #e4ebe7", borderRadius: "18px 18px 18px 4px" }
          }
        >
          {msg.subject && (
            <div
              className="mb-2 rounded-md px-2.5 py-1.5 text-[11px] font-bold"
              style={{
                background: mine ? "rgba(137,215,183,0.12)" : "#f0f6f3",
                color: mine ? MINT : MID,
              }}
            >
              Subject: {msg.subject}
            </div>
          )}
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>

      {mine && <Avatar name={developerName} initials={developerInitials} avatarUrl={currentUser?.avatarUrl} size={42} dark />}
    </motion.div>
  );
}

function ComposeModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (data: { email: string; subject: string; message: string }) => string | null;
}) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const nextError = onSend({ email, subject, message });
    if (nextError) {
      setError(nextError);
      return;
    }
    setEmail("");
    setSubject("");
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
        <div className="flex items-center justify-between px-7 py-5" style={{ background: DARK, color: "#e8f5ef" }}>
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
            <label className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#777" }}>
              To
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Recipient email..."
              className="h-14 rounded-2xl border px-4 text-[15px] outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>

          <div className="grid grid-cols-[92px_1fr] items-center gap-4 border-b border-[#edf1ee] px-7 py-3">
            <label className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#777" }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject optional..."
              className="h-14 rounded-2xl border px-4 text-[15px] outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>

          <div className="grid grid-cols-[92px_1fr] gap-4 border-b border-[#edf1ee] px-7 py-4">
            <label className="pt-3 text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#777" }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your message..."
              rows={7}
              className="resize-none rounded-2xl border px-4 py-3 text-[15px] leading-6 outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
              style={{ borderColor: "#cfdcd6", color: TEXT }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 px-7 py-5 sm:flex-row sm:items-center sm:justify-between" style={{ background: "#fbfcfb" }}>
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
              onClick={submit}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-12 items-center gap-2 rounded-xl px-7 text-[14px] font-extrabold"
              style={{ background: DARK, color: MINT }}
            >
              <PaperPlaneTilt size={15} weight="fill" />
              Send Message
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,24,0.88)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="overflow-hidden rounded-2xl text-center"
        style={{ width: 320, background: DARK, border: "1px solid rgba(137,215,183,0.15)" }}
      >
        <div className="px-8 py-8">
          <Avatar name={contact.name} initials={contact.initials} avatarUrl={contact.avatarUrl} size={80} dark />
          <div className="mb-0.5 mt-3 text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
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

function profileToContact(profile: DeveloperContactProfile): Contact {
  return {
    id: profile.id,
    name: profile.name,
    role: `${profile.role} - ${profile.company}`,
    personType: profile.type,
    match: profile.match,
    lastMsg: "New conversation",
    lastTime: "Now",
    unread: 0,
    initials: profile.initials,
    online: Boolean(profile.online),
  };
}

export default function Inbox({
  activeContactId,
  onActiveContactChange,
  extraContacts = [],
  profileComplete = true,
  onRequireProfile,
}: {
  activeContactId?: string;
  onActiveContactChange?: (id: string) => void;
  extraContacts?: DeveloperInboxLaunchContact[];
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}) {
  const [localActiveId, setLocalActiveId] = useState("asad");
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MSGS);
  const [draft, setDraft] = useState("");
  const [call, setCall] = useState<{ mode: "voice" | "video" } | null>(null);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentDeveloper>(DEFAULT_DEVELOPER_USER);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>(() =>
    extraContacts.some((extra) => extra.id === activeContactId && extra.requestDirection === "outgoing")
      ? "pending"
      : "general"
  );
  const messageListRef = useRef<HTMLDivElement>(null);

  const mergedContacts = useMemo(() => {
    const toContact = (extra: DeveloperInboxLaunchContact, base?: Contact): Contact => {
      const personType = extra.personType ?? base?.personType ?? roleToPersonType(extra.role);
      const initialMessage = extra.initialMessage?.trim();
      return {
        id: base?.id ?? extra.id,
        name: extra.name || base?.name || "Evolv member",
        role: extra.role || base?.role || "Evolv Network",
        personType,
        match: extra.match ?? base?.match ?? 80,
        lastMsg: initialMessage || base?.lastMsg || (extra.requestDirection === "outgoing" ? "Connection request sent" : "New conversation"),
        lastTime: initialMessage ? "Now" : base?.lastTime ?? "Now",
        unread: extra.requestDirection === "outgoing" ? 0 : base?.unread ?? 0,
        initials: extra.initials || base?.initials || getInitials(extra.name),
        online: extra.online ?? base?.online ?? false,
        email: extra.email || base?.email,
        avatarUrl: extra.avatarUrl || base?.avatarUrl,
        subject: extra.subject || base?.subject,
        requestStatus: extra.requestStatus ?? base?.requestStatus,
        requestDirection: extra.requestDirection ?? base?.requestDirection,
      };
    };

    const contactMap = new Map(contacts.map((item) => [item.id, item] as const));
    const promotedIds: string[] = [];

    extraContacts.forEach((extra) => {
      const normalizedEmail = extra.email?.toLowerCase();
      const existing = contacts.find((item) =>
        item.id === extra.id || (normalizedEmail ? item.email?.toLowerCase() === normalizedEmail : false)
      );
      const nextContact = toContact(extra, existing);
      contactMap.set(nextContact.id, nextContact);
      promotedIds.push(nextContact.id);
    });

    const promoted = Array.from(new Set(promotedIds))
      .map((id) => contactMap.get(id))
      .filter((item): item is Contact => Boolean(item));
    const rest = contacts
      .map((item) => contactMap.get(item.id) ?? item)
      .filter((item) => !promotedIds.includes(item.id));

    return [...promoted, ...rest];
  }, [contacts, extraContacts]);

  const activeId = activeContactId ?? localActiveId;
  const contact = mergedContacts.find((c) => c.id === activeId) ?? mergedContacts[0] ?? CONTACTS[0];
  const thread = useMemo(() => {
    const rawThread = contact ? messages[contact.id] ?? [] : [];
    const launchContact = extraContacts.find((extra) =>
      extra.id === contact.id || (extra.email && contact.email?.toLowerCase() === extra.email.toLowerCase())
    );
    const initialMessage = launchContact?.initialMessage?.trim();
    if (!initialMessage || rawThread.some((msg) => msg.from === "me" && msg.text === initialMessage)) return rawThread;

    return [
      ...rawThread,
      {
        id: `launch-${contact.id}`,
        from: "me" as const,
        text: initialMessage,
        time: "Now",
        date: "Today",
        subject: launchContact?.subject || "Connection request",
      },
    ];
  }, [contact, extraContacts, messages]);
  const contactProfile = buildDeveloperProfileFromContact(contact);
  const incomingRequestActive = isIncomingRequest(contact);
  const outgoingPendingActive = isOutgoingPending(contact);
  const sentOutgoingIntro = outgoingPendingActive && hasSentIntro(thread);
  const messageLocked = incomingRequestActive || (outgoingPendingActive && sentOutgoingIntro);
  const inputPlaceholder = incomingRequestActive
    ? contact.requestStatus === "rejected"
      ? "Request rejected. Accept it to reply."
      : "Accept the request before replying."
    : sentOutgoingIntro
      ? "Requested - waiting for them to accept."
      : outgoingPendingActive
        ? "Request pending - send one intro message..."
        : "Type a message...";
  const requestContacts = useMemo(
    () => mergedContacts.filter((item) => isIncomingRequest(item) && (messages[item.id]?.length ?? 0) <= 1),
    [mergedContacts, messages]
  );
  const pendingContacts = useMemo(
    () => mergedContacts.filter((item) => isOutgoingPending(item)),
    [mergedContacts]
  );
  const generalContacts = useMemo(
    () => mergedContacts.filter((item) => !isIncomingRequest(item) && !isOutgoingPending(item)),
    [mergedContacts]
  );
  const unreadContacts = useMemo(
    () => generalContacts.filter((item) => item.unread > 0),
    [generalContacts]
  );
  const visibleContacts =
    inboxFilter === "requests"
      ? requestContacts
      : inboxFilter === "pending"
        ? pendingContacts
        : inboxFilter === "unread"
          ? unreadContacts
          : generalContacts;
  const inboxTabs = [
    { id: "general" as const, label: "General", count: generalContacts.length },
    { id: "unread" as const, label: "Unread", count: unreadContacts.length },
    { id: "requests" as const, label: "Requests", count: requestContacts.length },
    { id: "pending" as const, label: "Pending", count: pendingContacts.length },
  ];

  const selectContact = (id: string) => {
    if (onActiveContactChange) onActiveContactChange(id);
    else setLocalActiveId(id);
    setContacts((prev) => prev.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
    setViewingProfile(false);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCurrentUser(getDeveloperUser());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const requireProfileBeforeAction = (afterComplete?: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(afterComplete);
    return true;
  };

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;

    const frame = window.requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, thread.length]);

  const sendMsg = () => {
    if (messageLocked) return;
    if (!draft.trim()) return;
    if (requireProfileBeforeAction(() => sendMsg())) return;
    const now = new Date();
    const body = draft.trim();
    const msg: Message = {
      id: Date.now().toString(),
      from: "me",
      text: body,
      time: formatTime(now),
      date: formatDate(now),
    };

    setMessages((prev) => ({ ...prev, [contact.id]: [...(prev[contact.id] ?? []), msg] }));
    setContacts((prev) => {
      const nextContact = { ...contact, lastMsg: body, lastTime: "Now", unread: 0 };
      return prev.some((item) => item.id === contact.id)
        ? prev.map((item) => (item.id === contact.id ? nextContact : item))
        : [nextContact, ...prev];
    });
    setDraft("");
  };

  const acceptRequest = (id: string) => {
    if (requireProfileBeforeAction(() => acceptRequest(id))) return;
    setContacts((prev) => {
      const acceptedContact = { ...contact, requestStatus: "accepted" as const, unread: 0, lastTime: "Now" };
      return prev.some((item) => item.id === id)
        ? prev.map((item) => (item.id === id ? { ...item, requestStatus: "accepted", unread: 0, lastTime: "Now" } : item))
        : [acceptedContact, ...prev];
    });
    setInboxFilter("general");
  };

  const rejectRequest = (id: string) => {
    if (requireProfileBeforeAction(() => rejectRequest(id))) return;
    setContacts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, requestStatus: "rejected", unread: 0, lastTime: "Now" }
          : item
      )
    );
    setInboxFilter("requests");
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMsg();
    }
  };

  const findRecipient = (email: string) => {
    const normalized = email.toLowerCase();
    const existing = mergedContacts.find((item) => item.email?.toLowerCase() === normalized);
    if (existing) return existing;

    const networkProfile = DEVELOPER_NETWORK_PROFILES.find((profile) =>
      `${profile.name.toLowerCase().replace(/\s+/g, ".")}@evolv.app` === normalized
    );
    if (networkProfile) return profileToContact(networkProfile);

    const storedUser = readStoredUsers().find((user) => (user.email || user.profile?.email)?.toLowerCase() === normalized);
    return storedUser ? contactFromStoredUser(storedUser) : null;
  };

  const sendComposedMessage = ({ email, subject, message }: { email: string; subject: string; message: string }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();
    const trimmedSubject = subject.trim();

    if (!normalizedEmail) return "Enter the recipient's email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return "Enter a valid email address.";
    if (!trimmedMessage) return "Write a message before sending.";

    const recipient = findRecipient(normalizedEmail);
    if (!recipient) return "No Evolv account was found with that email.";
    const existingRecipient = mergedContacts.some((item) =>
      item.id === recipient.id || item.email?.toLowerCase() === normalizedEmail
    );

    const now = new Date();
    const msg: Message = {
      id: Date.now().toString(),
      from: "me",
      text: trimmedMessage,
      time: formatTime(now),
      date: formatDate(now),
      subject: trimmedSubject || undefined,
    };

    const nextContact: Contact = {
      ...recipient,
      email: recipient.email || normalizedEmail,
      lastMsg: trimmedMessage,
      lastTime: "Now",
      unread: 0,
      subject: trimmedSubject || recipient.subject,
      requestStatus: existingRecipient ? recipient.requestStatus : "pending",
      requestDirection: existingRecipient ? recipient.requestDirection : "outgoing",
    };

    setContacts((prev) => [nextContact, ...prev.filter((item) => item.id !== nextContact.id)]);
    setMessages((prev) => ({
      ...prev,
      [nextContact.id]: [...(prev[nextContact.id] ?? []), msg],
    }));
    if (onActiveContactChange) onActiveContactChange(nextContact.id);
    else setLocalActiveId(nextContact.id);
    if (nextContact.requestDirection === "outgoing") setInboxFilter("pending");
    setViewingProfile(false);
    setComposeOpen(false);
    return null;
  };

  if (viewingProfile) {
    return (
      <NetworkProfileDetailScreen
        key={contactProfile.id}
        profile={contactProfile}
        connected={!incomingRequestActive && !outgoingPendingActive}
        backLabel="Back to Chat"
        onBack={() => setViewingProfile(false)}
        onMessage={() => setViewingProfile(false)}
        messageLabel="Open Chat"
        connectionLabel={outgoingPendingActive ? "Requested" : undefined}
        connectionDisabled={outgoingPendingActive}
      />
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden" style={{ background: "#f5f6f4", padding: "24px 28px" }}>
      <div className="mb-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[1.2rem] font-bold" style={{ color: TEXT }}>
            Inbox
          </h2>
          <p className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
            Manage founder and developer conversations in one place.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setComposeOpen(true)}
          whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(15,28,24,0.16)" }}
          whileTap={{ scale: 0.98 }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold"
          style={{ background: DARK, color: MINT }}
        >
          <PencilSimple size={15} weight="bold" />
          Compose
        </motion.button>
      </div>

      <div className="min-h-0 flex-1">
        <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section
            className="flex min-h-0 flex-col overflow-hidden bg-white"
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              boxShadow: "0 16px 38px rgba(15,28,24,0.06)",
            }}
          >
            <div
              className="shrink-0 px-5 py-4"
              style={{ borderBottom: "1px solid #eaf0eb", background: "#fbfdfb" }}
            >
              <div className="flex items-center gap-2 text-[13px] font-extrabold" style={{ color: TEXT }}>
                <ChatCircleDots size={16} weight="fill" style={{ color: MID }} />
                Conversations
              </div>
              <div className="mt-3 grid grid-cols-[1fr_1fr_1.25fr_1.15fr] rounded-xl p-1" style={{ background: "#eef4f0", border: "1px solid #e2ebe5" }}>
                {inboxTabs.map((tab) => {
                  const isActive = inboxFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setInboxFilter(tab.id)}
                      className="flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[10px] font-extrabold transition-all"
                      style={{
                        background: isActive ? DARK : "transparent",
                        color: isActive ? MINT : MUTED,
                      }}
                    >
                      <span className="whitespace-nowrap">{tab.label}</span>
                      {(tab.id !== "general" || tab.count > 0) && (
                        <span
                          className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]"
                          style={{
                            background: isActive ? "rgba(137,215,183,0.14)" : "#fff",
                            color: isActive ? MINT : MID,
                          }}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {visibleContacts.length === 0 && (
                <div className="flex h-full min-h-[220px] items-center justify-center px-6 text-center text-[12px]" style={{ color: MUTED }}>
                  {inboxFilter === "unread"
                    ? "No unread chats right now."
                    : inboxFilter === "requests"
                      ? "No message requests waiting."
                      : inboxFilter === "pending"
                        ? "No pending requests from your side."
                        : "No conversations yet."}
                </div>
              )}
              {visibleContacts.map((item) => {
                const isActive = item.id === activeId;
                const requestLabel =
                  isIncomingRequest(item)
                    ? item.requestStatus === "rejected"
                      ? "Rejected"
                      : "Request"
                    : isOutgoingPending(item)
                      ? "Requested"
                      : item.personType;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectContact(item.id)}
                    className="w-full px-4 py-4 text-left transition-all"
                    style={{
                      background: isActive ? "#f0f5f2" : "#fff",
                      borderBottom: "1px solid #edf3ef",
                      boxShadow: isActive ? "inset 3px 0 0 #428475" : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar name={item.name} initials={item.initials} avatarUrl={item.avatarUrl} size={40} dark={isActive} />
                        {item.online && (
                          <span
                            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full"
                            style={{ background: "#2e7d5c", border: "2px solid #fff" }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12px] font-extrabold" style={{ color: TEXT }}>
                            {item.name}
                          </span>
                          <span className="shrink-0 text-[10px]" style={{ color: DIM }}>
                            {item.lastTime}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase"
                            style={{
                              background:
                                item.requestDirection === "incoming"
                                  ? "#fff7ed"
                                  : item.personType === "Founder"
                                    ? "#eef2ff"
                                    : "#e8f5ef",
                              color:
                                item.requestDirection === "incoming"
                                  ? "#b45309"
                                  : item.personType === "Founder"
                                    ? "#4f46e5"
                                    : "#2e7d5c",
                            }}
                          >
                            {requestLabel}
                          </span>
                          <span className="truncate text-[10px]" style={{ color: MUTED }}>
                            {item.role}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px]" style={{ color: MUTED }}>
                            {item.lastMsg}
                          </span>
                          {item.unread > 0 && (
                            <span
                              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold"
                              style={{ background: MINT, color: INK }}
                            >
                              {item.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            className="flex min-h-0 flex-col overflow-hidden bg-white"
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              boxShadow: "0 16px 38px rgba(15,28,24,0.06)",
            }}
          >
            <div
              className="flex shrink-0 items-center px-5 py-4"
              style={{ borderBottom: "1px solid #e8ede9", background: "#fbfdfb" }}
            >
              <button
                type="button"
                onClick={() => setViewingProfile(true)}
                className="-ml-2 flex flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-all hover:bg-[#f5f7f5]"
              >
                <Avatar name={contact.name} initials={contact.initials} avatarUrl={contact.avatarUrl} size={44} dark />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-extrabold" style={{ color: TEXT }}>
                    {contact.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]" style={{ color: MUTED }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: contact.online ? "#2e7d5c" : DIM }} />
                    {contact.online ? "Online" : "Offline"}
                    <span>- {contact.role}</span>
                    <span
                      className="ml-1 rounded-full px-1.5 py-0.5 font-bold"
                      style={{ background: "#e8f5ef", color: "#2e7d5c" }}
                    >
                      {contact.match}% Match
                    </span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCall({ mode: "voice" })}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:bg-[#e8ede9]"
                  style={{ color: INK, border: "1px solid #e8ede9" }}
                >
                  <Phone size={14} /> Voice
                </button>
                <motion.button
                  type="button"
                  onClick={() => setCall({ mode: "video" })}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold"
                  style={{ background: DARK, color: MINT }}
                >
                  <VideoCamera size={14} /> Video
                </motion.button>
                <button type="button" className="rounded-lg p-1.5 transition-all hover:bg-[#e8ede9]">
                  <DotsThree size={16} style={{ color: MUTED }} />
                </button>
              </div>
            </div>

            {contact.subject && (
              <div className="shrink-0 px-6 py-3 text-[12px] font-bold" style={{ color: MID, borderBottom: "1px solid #eef3f0" }}>
                Subject: {contact.subject}
              </div>
            )}

            {incomingRequestActive && (
              <div
                className="flex shrink-0 flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  background: contact.requestStatus === "rejected" ? "#fff7f4" : "#fffaf0",
                  borderBottom: "1px solid #f1e4d0",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: contact.requestStatus === "rejected" ? "#ffe7df" : "#fff1d6",
                      color: contact.requestStatus === "rejected" ? "#b42318" : "#b45309",
                    }}
                  >
                    {contact.requestStatus === "rejected" ? <XCircle size={18} weight="fill" /> : <UserPlus size={18} weight="fill" />}
                  </span>
                  <div>
                    <div className="text-[13px] font-extrabold" style={{ color: TEXT }}>
                      {contact.requestStatus === "rejected" ? "Rejected message request" : "Message request"}
                    </div>
                    <p className="mt-0.5 max-w-[620px] text-[12px] leading-5" style={{ color: MUTED }}>
                      {contact.requestStatus === "rejected"
                        ? "This request is still kept here. Accept it if you want to move it into General and reply."
                        : "Accept this request to move the chat into General, or reject it to keep it in Requests."}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => rejectRequest(contact.id)}
                    disabled={contact.requestStatus === "rejected"}
                    className="rounded-lg border px-3 py-2 text-[12px] font-bold transition hover:bg-white disabled:opacity-45"
                    style={{ borderColor: "#ead7c4", color: "#9a5b1e" }}
                  >
                    Reject
                  </button>
                  <motion.button
                    type="button"
                    onClick={() => acceptRequest(contact.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-extrabold"
                    style={{ background: DARK, color: MINT }}
                  >
                    <CheckCircle size={14} weight="fill" />
                    Accept
                  </motion.button>
                </div>
              </div>
            )}

            {outgoingPendingActive && (
              <div
                className="flex shrink-0 items-start gap-3 px-6 py-4"
                style={{ background: "#eef7f2", borderBottom: "1px solid #dcebe3" }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#dff1e8", color: MID }}>
                  <UserPlus size={18} weight="fill" />
                </span>
                <div>
                  <div className="text-[13px] font-extrabold" style={{ color: TEXT }}>
                    Requested
                  </div>
                  <p className="mt-0.5 max-w-[680px] text-[12px] leading-5" style={{ color: MUTED }}>
                    {sentOutgoingIntro
                      ? "Your request and intro message are sent. You cannot message again until they accept."
                      : "Your request is pending. You can send one intro message here, then wait for them to accept."}
                  </p>
                </div>
              </div>
            )}

            <div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5" style={{ background: "#fbfcfb" }}>
              <div className="flex flex-col gap-6">
                <AnimatePresence initial={false}>
                  {thread.map((msg) => (
                    <MessageRow key={msg.id} msg={msg} contact={contact} currentUser={currentUser} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 bg-white px-4 py-3" style={{ borderTop: "1px solid #e8ede9" }}>
              <Avatar name={getDeveloperName(currentUser)} initials={getInitials(getDeveloperName(currentUser))} avatarUrl={currentUser?.avatarUrl} size={36} dark />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKey}
                disabled={messageLocked}
                placeholder={inputPlaceholder}
                className="h-11 flex-1 rounded-xl px-4 text-[13px] outline-none"
                style={{ background: messageLocked ? "#eef3ef" : "#f5f7f5", border: "1px solid #e8ede9", color: TEXT }}
              />
              <motion.button
                type="button"
                onClick={sendMsg}
                disabled={!draft.trim() || messageLocked}
                whileHover={draft.trim() && !messageLocked ? { scale: 1.08 } : {}}
                whileTap={draft.trim() && !messageLocked ? { scale: 0.92 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: DARK, opacity: draft.trim() && !messageLocked ? 1 : 0.4 }}
                aria-label="Send message"
              >
                <PaperPlaneTilt size={16} style={{ color: MINT }} weight="fill" />
              </motion.button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onSend={sendComposedMessage} />}
      </AnimatePresence>

      {call && <CallOverlay contact={contact} mode={call.mode} onEnd={() => setCall(null)} />}
    </div>
  );
}
