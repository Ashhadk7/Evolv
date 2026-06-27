"use client";

import { useEffect, useMemo, useState } from "react";
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
  Star,
  TrendUp,
  UserPlus,
  Users,
} from "@phosphor-icons/react";
import {
  FOUNDER_NETWORK_PROFILES,
  INITIAL_PENDING_IDS,
  NetworkProfileDetailScreen,
  SkillPill,
  TypeBadge,
  type FounderContactProfile,
} from "./NetworkProfileDetail";

type NetworkTabFilter = "all" | "developers" | "founders";

export interface FounderNetworkMessageTarget {
  id: string;
  name: string;
  role: string;
  match: number;
  initials: string;
  online?: boolean;
}

interface StoredNetworkState {
  connected: Record<string, boolean>;
  pendingIds: string[];
  ignoredIds: string[];
}

interface NetworkTabProps {
  onMessage: (contact: FounderNetworkMessageTarget) => void;
  onPendingCountChange?: (count: number) => void;
}

const STORAGE_KEY = "evolv_founder_network_state";
const NETWORK_PEOPLE = FOUNDER_NETWORK_PROFILES;

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

function getInitialNetworkState(): StoredNetworkState {
  const stored = loadStoredState();
  return {
    connected: { ...initialConnected, ...(stored?.connected ?? {}) },
    pendingIds: stored?.pendingIds ?? INITIAL_PENDING_IDS,
    ignoredIds: stored?.ignoredIds ?? [],
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
  Icon: React.ElementType;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(15,28,24,0.08)", borderColor: "#c5ddd0" }}
      className="bg-white rounded-xl p-4"
      style={{ border: "1px solid #e8ede9" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#7a9e8e" }}>
          {label}
        </span>
        <span className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#f0f5f2", color: "#428475" }}>
          <Icon size={15} weight="bold" />
        </span>
      </div>
      <div className="text-[1.65rem] font-bold leading-none" style={{ color: "#1a2e26" }}>
        {value}
      </div>
      <div className="flex items-center gap-1 text-[10px] mt-1" style={{ color: "#2e7d5c" }}>
        <ArrowUp size={10} weight="bold" />
        <span>{sub}</span>
      </div>
    </motion.div>
  );
}

function Avatar({ person, size = 44 }: { person: FounderContactProfile; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
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

export function NetworkTab({ onMessage, onPendingCountChange }: NetworkTabProps) {
  const [activeTab, setActiveTab] = useState<NetworkTabFilter>("all");
  const [networkState, setNetworkState] = useState<StoredNetworkState>(getInitialNetworkState);
  const [selectedPerson, setSelectedPerson] = useState<FounderContactProfile | null>(null);
  const { connected, pendingIds, ignoredIds } = networkState;

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(networkState));
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
  const suggestedPeople = visiblePeople.filter((person) => !connected[person.id]).sort((a, b) => b.match - a.match);

  const tabs = [
    { id: "all" as const, label: "All", count: visiblePeople.length },
    { id: "developers" as const, label: "Developers", count: visiblePeople.filter((p) => p.type === "Developer").length },
    { id: "founders" as const, label: "Founders", count: visiblePeople.filter((p) => p.type === "Founder").length },
  ];

  const handleAcceptRequest = (id: string) => {
    setNetworkState((prev) => ({
      connected: { ...prev.connected, [id]: true },
      pendingIds: prev.pendingIds.filter((pendingId) => pendingId !== id),
      ignoredIds: prev.ignoredIds.filter((ignoredId) => ignoredId !== id),
    }));
  };

  const handleIgnoreRequest = (id: string) => {
    setNetworkState((prev) => ({
      connected: prev.connected,
      pendingIds: prev.pendingIds.filter((pendingId) => pendingId !== id),
      ignoredIds: Array.from(new Set([...prev.ignoredIds, id])),
    }));
    setSelectedPerson(null);
  };

  const handleToggleConnection = (id: string) => {
    setNetworkState((prev) => ({
      ...prev,
      connected: { ...prev.connected, [id]: !prev.connected[id] },
    }));
  };

  const handleMessage = (person: FounderContactProfile) => {
    onMessage({
      id: person.id,
      name: person.name,
      role: `${person.role} - ${person.company}`,
      match: person.match,
      initials: person.initials,
      online: person.online,
    });
  };

  if (selectedPerson) {
    return (
      <NetworkProfileDetailScreen
        profile={selectedPerson}
        connected={Boolean(connected[selectedPerson.id])}
        pending={pendingIds.includes(selectedPerson.id)}
        backLabel="Back to Network"
        onBack={() => setSelectedPerson(null)}
        onAccept={handleAcceptRequest}
        onIgnore={handleIgnoreRequest}
        onToggleConnection={handleToggleConnection}
        onMessage={handleMessage}
      />
    );
  }

  const breakdownTotal = Math.max(connectedPeople.length, 1);

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ background: "#f5f6f4", padding: "24px 28px" }}>
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[1.2rem] font-bold" style={{ color: "#1a2e26" }}>My Network</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "#7a9e8e" }}>
            Manage developer matches, founder peers, and connection requests in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white" style={{ border: "1px solid #e8ede9" }}>
          <TrendUp size={14} style={{ color: "#428475" }} />
          <span className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>{suggestedPeople.length} suggested</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
        <StatCard label="Total Connections" value={String(connectedPeople.length)} sub={`${suggestedPeople.length} suggested`} Icon={Users} />
        <StatCard label="Developer Connections" value={String(developerConnections)} sub="+2 this week" Icon={Code} />
        <StatCard label="Founder Connections" value={String(founderConnections)} sub="+1 this week" Icon={Handshake} />
        <StatCard label="Pending Requests" value={String(pendingPeople.length)} sub="Needs review" Icon={UserPlus} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="min-w-0">
          <AnimatePresence initial={false}>
            {pendingPeople.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-xl p-4 mb-4"
                style={{ border: "1px solid #e8ede9" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus size={15} weight="bold" style={{ color: "#428475" }} />
                  <span className="text-[13px] font-bold" style={{ color: "#1a2e26" }}>Connection Requests</span>
                  <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#89d7b7", color: "#0f1c18" }}>
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
                      className="flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer"
                      style={{ background: "#f5f7f5", border: "1px solid #e8ede9" }}
                    >
                      <Avatar person={person} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold truncate" style={{ color: "#1a2e26" }}>{person.name}</span>
                          <TypeBadge type={person.type} />
                        </div>
                        <div className="text-[11px] mt-0.5 truncate" style={{ color: "#6b8e7e" }}>{person.role} at {person.company}</div>
                        <div className="flex items-center gap-1 text-[10px] mt-1" style={{ color: "#7a9e8e" }}>
                          <Users size={11} /> {person.mutual} mutual connections
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <motion.button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAcceptRequest(person.id);
                          }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className="px-3 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer"
                          style={{ background: "#0f1c18", color: "#89d7b7" }}
                        >
                          Accept
                        </motion.button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleIgnoreRequest(person.id);
                          }}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors hover:bg-white"
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

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex rounded-xl bg-white p-1" style={{ border: "1px solid #e8ede9" }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                    style={{
                      background: isActive ? "#0f1c18" : "transparent",
                      color: isActive ? "#89d7b7" : "#6b8e7e",
                    }}
                  >
                    {tab.label}
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: isActive ? "rgba(137,215,183,0.16)" : "#f0f5f2", color: isActive ? "#89d7b7" : "#428475" }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredPeople.map((person) => {
                const isConnected = connected[person.id];
                return (
                  <motion.div
                    layout
                    key={person.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    whileHover={{ y: -3, borderColor: "#c5ddd0", boxShadow: "0 10px 28px rgba(15,28,24,0.08)" }}
                    onClick={() => setSelectedPerson(person)}
                    className="bg-white rounded-xl p-4 cursor-pointer"
                    style={{ border: "1px solid #e8ede9" }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar person={person} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold truncate" style={{ color: "#1a2e26" }}>{person.name}</span>
                          {person.online && <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "#2e7d5c" }} />}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "#6b8e7e" }}>{person.role}</div>
                        <div className="flex items-center gap-1 text-[10px] mt-1" style={{ color: "#7a9e8e" }}>
                          <Buildings size={11} /> {person.company}
                        </div>
                      </div>
                      <TypeBadge type={person.type} />
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] mb-3" style={{ color: "#7a9e8e" }}>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {person.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} /> {person.experience}</span>
                      <span className="flex items-center gap-1"><Star size={11} weight="fill" /> {person.match}% match</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {person.skills.slice(0, 3).map((skill) => <SkillPill key={skill} label={skill} />)}
                    </div>

                    <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #eaf0eb" }}>
                      <motion.button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleConnection(person.id);
                        }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer"
                        style={{
                          background: isConnected ? "#e8f5ef" : "#0f1c18",
                          color: isConnected ? "#2e7d5c" : "#89d7b7",
                          border: isConnected ? "1px solid #c5ddd0" : "1px solid #0f1c18",
                        }}
                      >
                        {isConnected ? <CheckCircle size={13} weight="fill" /> : <UserPlus size={13} weight="bold" />}
                        {isConnected ? "Connected" : "Connect"}
                      </motion.button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMessage(person);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors hover:bg-[#e8ede9]"
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
          <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #e8ede9" }}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} weight="fill" style={{ color: "#C4973A" }} />
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>Recommended for you</span>
            </div>
            <div className="space-y-2">
              {suggestedPeople.slice(0, 4).map((person) => (
                <motion.div
                  key={person.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedPerson(person)}
                  className="flex items-center gap-2.5 py-2 cursor-pointer"
                  style={{ borderBottom: "1px solid #f0f5f2" }}
                >
                  <Avatar person={person} size={34} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate" style={{ color: "#1a2e26" }}>{person.name}</div>
                    <div className="text-[10px] truncate" style={{ color: "#7a9e8e" }}>{person.role}</div>
                    <div className="text-[10px] font-semibold" style={{ color: "#2e7d5c" }}>{person.match}% match</div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleConnection(person.id);
                    }}
                    className="h-7 w-7 rounded-full flex items-center justify-center transition-colors hover:bg-[#0f1c18]"
                    style={{ background: "#e8f5ef", color: "#2e7d5c", border: "1px solid #c5ddd0" }}
                  >
                    <UserPlus size={13} weight="bold" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #e8ede9" }}>
            <div className="flex items-center gap-2 mb-3">
              <ChartPieSlice size={14} weight="fill" style={{ color: "#428475" }} />
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>Network breakdown</span>
            </div>
            {[
              { label: "Developers", value: developerConnections, color: "#428475" },
              { label: "Founders", value: founderConnections, color: "#C4973A" },
              { label: "Pending", value: pendingPeople.length, color: "#7C5CBF" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 mb-3 last:mb-0">
                <div className="text-[11px] font-semibold w-20" style={{ color: "#1a2e26" }}>{item.label}</div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#eaf0eb" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (item.value / breakdownTotal) * 100)}%` }}
                    style={{ background: item.color }}
                  />
                </div>
                <div className="text-[11px] font-bold w-5 text-right" style={{ color: "#1a2e26" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

