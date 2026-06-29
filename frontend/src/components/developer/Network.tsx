"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Buildings,
  Briefcase,
  ChartPieSlice,
  ChatCircle,
  CheckCircle,
  Code,
  Handshake,
  MapPin,
  PaperPlaneTilt,
  Star,
  TrendUp,
  UserPlus,
  Users,
  X,
} from "@phosphor-icons/react";
import {
  NetworkProfileDetailScreen,
  RatingStars,
  SkillPill,
  TypeBadge,
  type FounderContactProfile,
} from "../founder/NetworkProfileDetail";
import {
  DEVELOPER_NETWORK_PROFILES,
  INITIAL_DEVELOPER_PENDING_IDS,
} from "./developerNetworkData";
import { type DeveloperTab } from "./shared/Sidebar";

type NetworkTabFilter = "all" | "developers" | "founders";

export interface DeveloperNetworkMessageTarget {
  id: string;
  name: string;
  role: string;
  match: number;
  initials: string;
  online?: boolean;
  personType?: "Founder" | "Developer";
  requestStatus?: "pending";
  requestDirection?: "outgoing";
  initialMessage?: string;
  subject?: string;
}

interface StoredNetworkState {
  connected: Record<string, boolean>;
  pendingIds: string[];
  ignoredIds: string[];
  outgoingIds: string[];
  requestNotes: Record<string, string>;
}

interface NetworkProps {
  onNavigate?: (tab: DeveloperTab) => void;
  onMessage?: (contact: DeveloperNetworkMessageTarget) => void;
  onPendingCountChange?: (count: number) => void;
}

const STORAGE_KEY = "evolv_developer_network_state";
const NETWORK_PEOPLE = DEVELOPER_NETWORK_PROFILES;

const initialConnected = NETWORK_PEOPLE.reduce<Record<string, boolean>>((acc, person) => {
  acc[person.id] = person.connected;
  return acc;
}, {});

function loadStoredState(): StoredNetworkState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredState(state: StoredNetworkState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // In-memory state is still enough for the current session.
  }
}

function getInitialNetworkState(): StoredNetworkState {
  const stored = loadStoredState();
  return {
    connected: { ...initialConnected, ...(stored?.connected ?? {}) },
    pendingIds: stored?.pendingIds ?? INITIAL_DEVELOPER_PENDING_IDS,
    ignoredIds: stored?.ignoredIds ?? [],
    outgoingIds: stored?.outgoingIds ?? [],
    requestNotes: stored?.requestNotes ?? {},
  };
}

function StatCard({
  label,
  value,
  sub,
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: ElementType;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(15,28,24,0.08)", borderColor: "#c5ddd0" }}
      className="rounded-xl bg-white p-4"
      style={{ border: "1px solid #e8ede9" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
          {label}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "#f0f5f2", color: "#428475" }}>
          <Icon size={15} weight="bold" />
        </span>
      </div>
      <div className="text-[1.65rem] font-bold leading-none" style={{ color: "#1a2e26" }}>
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: "#2e7d5c" }}>
        <ArrowUp size={10} weight="bold" />
        <span>{sub}</span>
      </div>
    </motion.div>
  );
}

function Avatar({ person, size = 44 }: { person: FounderContactProfile; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        background: person.avatarColor,
        color: "#fff",
        fontSize: size > 50 ? 18 : 12,
      }}
    >
      {person.initials}
    </div>
  );
}

function ConnectionRequestModal({
  person,
  onClose,
  onWithoutNote,
  onWithNote,
}: {
  person: FounderContactProfile;
  onClose: () => void;
  onWithoutNote: () => void;
  onWithNote: (note: string) => void;
}) {
  const [addingNote, setAddingNote] = useState(false);
  const [note, setNote] = useState("");
  const trimmedNote = note.trim();

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
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="w-full max-w-[520px] overflow-hidden bg-white shadow-2xl"
        style={{ borderRadius: 16, border: "1px solid #c5ddd0" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ background: "#1a312c", color: "#e8f5ef" }}>
          <div className="flex min-w-0 items-center gap-3">
            <Avatar person={person} size={42} />
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-extrabold">Connect with {person.name}</h3>
              <p className="truncate text-[11px]" style={{ color: "#89d7b7" }}>
                {person.role} at {person.company}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label="Close connection request"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="px-5 py-5">
          {!addingNote ? (
            <p className="text-[13px] leading-6" style={{ color: "#334d42" }}>
              Send the request now, or add a short note. If you add a note, their pending chat will open with your intro attached.
            </p>
          ) : (
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#7a9e8e" }}>
                Add a note
              </label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write a short intro..."
                className="h-32 w-full resize-none rounded-2xl px-4 py-3 text-[13px] leading-6 outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
                style={{ border: "1px solid #c5ddd0", color: "#1a2e26", background: "#fbfdfb" }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-end" style={{ background: "#f5f7f5", borderTop: "1px solid #dce7e1" }}>
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border bg-white px-5 text-[13px] font-semibold transition hover:bg-[#f5f7f5]"
            style={{ borderColor: "#ded9d0", color: "#1a2e26" }}
          >
            Cancel
          </button>
          {!addingNote ? (
            <>
              <button
                type="button"
                onClick={onWithoutNote}
                className="h-11 rounded-xl border bg-white px-5 text-[13px] font-extrabold transition hover:bg-[#f5f7f5]"
                style={{ borderColor: "#c5ddd0", color: "#1a312c" }}
              >
                Without note
              </button>
              <motion.button
                type="button"
                onClick={() => setAddingNote(true)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold"
                style={{ background: "#1a312c", color: "#89d7b7" }}
              >
                Add a note
              </motion.button>
            </>
          ) : (
            <motion.button
              type="button"
              onClick={() => onWithNote(trimmedNote)}
              disabled={!trimmedNote}
              whileHover={trimmedNote ? { y: -1 } : {}}
              whileTap={trimmedNote ? { scale: 0.98 } : {}}
              className="flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold disabled:opacity-45"
              style={{ background: "#1a312c", color: "#89d7b7" }}
            >
              <PaperPlaneTilt size={14} weight="fill" />
              Send note
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Network({ onNavigate, onMessage, onPendingCountChange }: NetworkProps) {
  const [activeTab, setActiveTab] = useState<NetworkTabFilter>("all");
  const [networkState, setNetworkState] = useState<StoredNetworkState>(getInitialNetworkState);
  const [selectedPerson, setSelectedPerson] = useState<FounderContactProfile | null>(null);
  const [requestModalPerson, setRequestModalPerson] = useState<FounderContactProfile | null>(null);
  const { connected, pendingIds, ignoredIds, outgoingIds, requestNotes } = networkState;
  const outgoingSet = useMemo(() => new Set(outgoingIds), [outgoingIds]);

  useEffect(() => {
    saveStoredState(networkState);
  }, [networkState]);

  useEffect(() => {
    onPendingCountChange?.(pendingIds.length);
  }, [onPendingCountChange, pendingIds.length]);

  const pendingPeople = useMemo(
    () => NETWORK_PEOPLE.filter((person) => pendingIds.includes(person.id)),
    [pendingIds]
  );

  const visiblePeople = useMemo(
    () => NETWORK_PEOPLE.filter((person) => !pendingIds.includes(person.id) && !ignoredIds.includes(person.id)),
    [ignoredIds, pendingIds]
  );

  const filteredPeople = visiblePeople.filter((person) => {
    if (activeTab === "developers") return person.type === "Developer";
    if (activeTab === "founders") return person.type === "Founder";
    return true;
  });

  const connectedPeople = visiblePeople.filter((person) => connected[person.id]);
  const developerConnections = connectedPeople.filter((person) => person.type === "Developer").length;
  const founderConnections = connectedPeople.filter((person) => person.type === "Founder").length;
  const suggestedPeople = visiblePeople
    .filter((person) => !connected[person.id] && !outgoingSet.has(person.id))
    .sort((a, b) => b.match - a.match);

  const tabs = [
    { id: "all" as const, label: "All", count: visiblePeople.length },
    { id: "developers" as const, label: "Developers", count: visiblePeople.filter((p) => p.type === "Developer").length },
    { id: "founders" as const, label: "Founders", count: visiblePeople.filter((p) => p.type === "Founder").length },
  ];

  const handleAcceptRequest = (id: string) => {
    setNetworkState((prev) => ({
      ...prev,
      connected: { ...prev.connected, [id]: true },
      pendingIds: prev.pendingIds.filter((pendingId) => pendingId !== id),
      ignoredIds: prev.ignoredIds.filter((ignoredId) => ignoredId !== id),
      outgoingIds: prev.outgoingIds.filter((outgoingId) => outgoingId !== id),
    }));
  };

  const handleIgnoreRequest = (id: string) => {
    setNetworkState((prev) => ({
      ...prev,
      pendingIds: prev.pendingIds.filter((pendingId) => pendingId !== id),
      ignoredIds: Array.from(new Set([...prev.ignoredIds, id])),
    }));
    setSelectedPerson(null);
  };

  const handleToggleConnection = (id: string) => {
    setNetworkState((prev) => {
      const nextConnected = !prev.connected[id];
      return {
        ...prev,
        connected: { ...prev.connected, [id]: nextConnected },
        outgoingIds: nextConnected ? prev.outgoingIds.filter((outgoingId) => outgoingId !== id) : prev.outgoingIds,
      };
    });
  };

  const markOutgoingRequest = (person: FounderContactProfile, note?: string) => {
    setNetworkState((prev) => {
      const next = {
        ...prev,
        connected: { ...prev.connected, [person.id]: false },
        outgoingIds: Array.from(new Set([...prev.outgoingIds, person.id])),
        requestNotes: note ? { ...prev.requestNotes, [person.id]: note } : prev.requestNotes,
      };
      saveStoredState(next);
      return next;
    });
  };

  const buildMessageTarget = (person: FounderContactProfile, note?: string): DeveloperNetworkMessageTarget => ({
    id: person.id,
    name: person.name,
    role: `${person.role} - ${person.company}`,
    match: person.match,
    initials: person.initials,
    online: person.online,
    personType: person.type,
    requestStatus: connected[person.id] ? undefined : "pending",
    requestDirection: connected[person.id] ? undefined : "outgoing",
    initialMessage: note,
    subject: connected[person.id] ? undefined : "Connection request",
  });

  const openInbox = (person: FounderContactProfile, note?: string) => {
    const target = buildMessageTarget(person, note);
    if (onMessage) onMessage(target);
    else {
      onNavigate?.("inbox");
    }
  };

  const handleConnectionButton = (person: FounderContactProfile) => {
    if (connected[person.id]) {
      handleToggleConnection(person.id);
      return;
    }
    if (outgoingSet.has(person.id)) return;
    setRequestModalPerson(person);
  };

  const handleMessage = (person: FounderContactProfile) => {
    if (!connected[person.id]) {
      markOutgoingRequest(person);
      openInbox(person, requestNotes[person.id]);
      return;
    }
    openInbox(person);
  };

  const handleSendRequestWithoutNote = () => {
    if (!requestModalPerson) return;
    markOutgoingRequest(requestModalPerson);
    setRequestModalPerson(null);
  };

  const handleSendRequestWithNote = (note: string) => {
    if (!requestModalPerson) return;
    markOutgoingRequest(requestModalPerson, note);
    openInbox(requestModalPerson, note);
    setRequestModalPerson(null);
  };

  if (selectedPerson) {
    const selectedRequested = outgoingSet.has(selectedPerson.id);
    return (
      <>
        <div className="h-screen overflow-hidden">
          <NetworkProfileDetailScreen
            key={selectedPerson.id}
            profile={selectedPerson}
            connected={Boolean(connected[selectedPerson.id])}
            pending={pendingIds.includes(selectedPerson.id)}
            backLabel="Back to Network"
            onBack={() => setSelectedPerson(null)}
            onAccept={handleAcceptRequest}
            onIgnore={handleIgnoreRequest}
            onToggleConnection={() => handleConnectionButton(selectedPerson)}
            onMessage={handleMessage}
            connectionLabel={selectedRequested ? "Requested" : undefined}
            connectionDisabled={selectedRequested}
          />
        </div>
        <AnimatePresence>
          {requestModalPerson && (
            <ConnectionRequestModal
              person={requestModalPerson}
              onClose={() => setRequestModalPerson(null)}
              onWithoutNote={handleSendRequestWithoutNote}
              onWithNote={handleSendRequestWithNote}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  const breakdownTotal = Math.max(connectedPeople.length, 1);

  return (
    <>
      <div className="flex h-screen flex-col overflow-y-auto" style={{ background: "#f5f6f4", padding: "24px 28px" }}>
        <div className="mb-5 flex shrink-0 items-start justify-between">
          <div>
            <h2 className="text-[1.2rem] font-bold" style={{ color: "#1a2e26" }}>My Network</h2>
            <p className="mt-0.5 text-[12px]" style={{ color: "#7a9e8e" }}>
              Manage founder matches, developer peers, and connection requests in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2" style={{ border: "1px solid #e8ede9" }}>
            <TrendUp size={14} style={{ color: "#428475" }} />
            <span className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>{suggestedPeople.length} suggested</span>
          </div>
        </div>

        <div className="mb-4 grid shrink-0 grid-cols-4 gap-3">
          <StatCard label="Total Connections" value={String(connectedPeople.length)} sub={`${suggestedPeople.length} suggested`} Icon={Users} />
          <StatCard label="Founder Connections" value={String(founderConnections)} sub="+3 this week" Icon={Handshake} />
          <StatCard label="Developer Connections" value={String(developerConnections)} sub="+2 this week" Icon={Code} />
          <StatCard label="Pending Requests" value={String(pendingPeople.length)} sub="Needs review" Icon={UserPlus} />
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <AnimatePresence initial={false}>
              {pendingPeople.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 rounded-xl bg-white p-4"
                  style={{ border: "1px solid #e8ede9" }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <UserPlus size={15} weight="bold" style={{ color: "#428475" }} />
                    <span className="text-[13px] font-bold" style={{ color: "#1a2e26" }}>Connection Requests</span>
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold" style={{ background: "#89d7b7", color: "#0f1c18" }}>
                      {pendingPeople.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingPeople.map((person) => (
                      <motion.div
                        key={person.id}
                        layout
                        whileHover={{ y: -2, borderColor: "#c5ddd0", boxShadow: "0 8px 22px rgba(15,28,24,0.07)" }}
                        onClick={() => setSelectedPerson(person)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3"
                        style={{ background: "#f5f7f5", border: "1px solid #e8ede9" }}
                      >
                        <Avatar person={person} size={40} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[13px] font-bold" style={{ color: "#1a2e26" }}>{person.name}</span>
                            <TypeBadge type={person.type} />
                          </div>
                          <div className="mt-0.5 truncate text-[11px]" style={{ color: "#6b8e7e" }}>{person.role} at {person.company}</div>
                          <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: "#7a9e8e" }}>
                            <Users size={11} /> {person.mutual} mutual connections
                          </div>
                          {person.type === "Developer" && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px]" style={{ color: "#7a9e8e" }}>
                              <RatingStars rating={person.rating ?? 0} size={11} />
                              <span>{person.rating ?? 0}/5 rating</span>
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <motion.button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAcceptRequest(person.id);
                            }}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            className="cursor-pointer rounded-xl px-3 py-1.5 text-[12px] font-semibold"
                            style={{ background: "#1a312c", color: "#89d7b7" }}
                          >
                            Accept
                          </motion.button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleIgnoreRequest(person.id);
                            }}
                            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-white"
                            style={{ color: "#7a9e8e", border: "1px solid #dde5e0" }}
                          >
                            Ignore
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl bg-white p-1" style={{ border: "1px solid #e8ede9" }}>
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors"
                      style={{
                        background: isActive ? "#0f1c18" : "transparent",
                        color: isActive ? "#89d7b7" : "#6b8e7e",
                      }}
                    >
                      {tab.label}
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px]"
                        style={{ background: isActive ? "rgba(137,215,183,0.16)" : "#f0f5f2", color: isActive ? "#89d7b7" : "#428475" }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div layout className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredPeople.map((person) => {
                  const isConnected = connected[person.id];
                  const isRequested = outgoingSet.has(person.id);
                  return (
                    <motion.div
                      layout
                      key={person.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      whileHover={{ y: -3, borderColor: "#c5ddd0", boxShadow: "0 10px 28px rgba(15,28,24,0.08)" }}
                      onClick={() => setSelectedPerson(person)}
                      className="cursor-pointer rounded-xl bg-white p-4"
                      style={{ border: "1px solid #e8ede9" }}
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <Avatar person={person} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[14px] font-bold" style={{ color: "#1a2e26" }}>{person.name}</span>
                            {person.online && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#2e7d5c" }} />}
                          </div>
                          <div className="mt-0.5 text-[11px]" style={{ color: "#6b8e7e" }}>{person.role}</div>
                          <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: "#7a9e8e" }}>
                            <Buildings size={11} /> {person.company}
                          </div>
                        </div>
                        <TypeBadge type={person.type} />
                      </div>

                      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px]" style={{ color: "#7a9e8e" }}>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {person.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={11} /> {person.experience}</span>
                        <span className="flex items-center gap-1"><Star size={11} weight="fill" /> {person.match}% match</span>
                      </div>

                      {person.type === "Developer" && (
                        <div className="mb-3 flex items-center gap-2 text-[10px]" style={{ color: "#7a9e8e" }}>
                          <RatingStars rating={person.rating ?? 0} size={12} />
                          <span className="font-semibold" style={{ color: "#1a2e26" }}>{person.rating ?? 0}/5</span>
                          <span>{person.reviews?.length ?? 0} reviews</span>
                        </div>
                      )}

                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {person.skills.slice(0, 3).map((skill) => <SkillPill key={skill} label={skill} />)}
                      </div>

                      <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #eaf0eb" }}>
                        <motion.button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleConnectionButton(person);
                          }}
                          disabled={isRequested}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold disabled:opacity-60"
                          style={{
                            background: isConnected || isRequested ? "#e8f5ef" : "#0f1c18",
                            color: isConnected || isRequested ? "#2e7d5c" : "#89d7b7",
                            border: isConnected || isRequested ? "1px solid #c5ddd0" : "1px solid #1a312c",
                          }}
                        >
                          {isConnected ? <CheckCircle size={13} weight="fill" /> : <UserPlus size={13} weight="bold" />}
                          {isConnected ? "Connected" : isRequested ? "Requested" : "Connect"}
                        </motion.button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMessage(person);
                          }}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[#e8ede9]"
                          style={{ color: "#0f1c18", border: "1px solid #dde5e0" }}
                        >
                          <ChatCircle size={13} /> Message
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-6">
            <div className="rounded-xl bg-white p-4" style={{ border: "1px solid #e8ede9" }}>
              <div className="mb-3 flex items-center gap-2">
                <Star size={14} weight="fill" style={{ color: "#C4973A" }} />
                <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>Recommended for you</span>
              </div>
              <div className="space-y-2">
                {suggestedPeople.slice(0, 4).map((person) => (
                  <motion.div
                    key={person.id}
                    whileHover={{ x: 2 }}
                    onClick={() => setSelectedPerson(person)}
                    className="flex cursor-pointer items-center gap-2.5 py-2"
                    style={{ borderBottom: "1px solid #f0f5f2" }}
                  >
                    <Avatar person={person} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-semibold" style={{ color: "#1a2e26" }}>{person.name}</div>
                      <div className="truncate text-[10px]" style={{ color: "#7a9e8e" }}>{person.role}</div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold" style={{ color: "#2e7d5c" }}>{person.match}% match</span>
                        {person.type === "Developer" && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#7a9e8e" }}>
                            <RatingStars rating={person.rating ?? 0} size={10} />
                            {person.rating ?? 0}/5
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleConnectionButton(person);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#0f1c18]"
                      style={{ background: "#e8f5ef", color: "#2e7d5c", border: "1px solid #c5ddd0" }}
                    >
                      <UserPlus size={13} weight="bold" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-4" style={{ border: "1px solid #e8ede9" }}>
              <div className="mb-3 flex items-center gap-2">
                <ChartPieSlice size={14} weight="fill" style={{ color: "#428475" }} />
                <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>Network breakdown</span>
              </div>
              {[
                { label: "Founders", value: founderConnections, color: "#C4973A" },
                { label: "Developers", value: developerConnections, color: "#428475" },
                { label: "Pending", value: pendingPeople.length, color: "#7C5CBF" },
              ].map((item) => (
                <div key={item.label} className="mb-3 flex items-center gap-2 last:mb-0">
                  <div className="w-20 text-[11px] font-semibold" style={{ color: "#1a2e26" }}>{item.label}</div>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "#eaf0eb" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.value / breakdownTotal) * 100)}%` }}
                      style={{ background: item.color }}
                    />
                  </div>
                  <div className="w-5 text-right text-[11px] font-bold" style={{ color: "#1a2e26" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {requestModalPerson && (
          <ConnectionRequestModal
            person={requestModalPerson}
            onClose={() => setRequestModalPerson(null)}
            onWithoutNote={handleSendRequestWithoutNote}
            onWithNote={handleSendRequestWithNote}
          />
        )}
      </AnimatePresence>
    </>
  );
}
