"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChatCircleDots, MagnifyingGlass, UsersThree } from "@phosphor-icons/react";
import { Avatar } from "@/components/shared/avatar";
import { Chip } from "@/components/shared/chip";
import type { BlueprintContent } from "@/features/blueprints/blueprint-content";
import type { FounderContactProfile } from "@/features/network/types";
import type { FounderNetworkMessageTarget } from "@/features/network/types";

export function DevelopersPanel({
  phases,
  selectedPhase,
  onSelectPhase,
  connections,
  matchedDevs,
  networkDevs,
  matchLoading,
  onConnect,
  onHire,
  onMessage,
  onViewProfile,
  onBrowseNetwork,
}: {
  phases: BlueprintContent["phases"];
  selectedPhase: number;
  onSelectPhase: (i: number) => void;
  connections: Record<string, boolean>;
  matchedDevs: FounderContactProfile[];
  networkDevs: FounderContactProfile[];
  matchLoading?: boolean;
  onConnect: (dev: FounderContactProfile) => void;
  onHire: (phaseIdx: number, dev: FounderContactProfile) => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  onViewProfile: (dev: FounderContactProfile) => void;
  onBrowseNetwork?: () => void;
}) {
  const [tab, setTab] = useState<"matched" | "connected">("matched");
  const [query, setQuery] = useState("");
  const matched = matchedDevs;
  const connectedDevs = networkDevs.filter((d) => connections[d.id]);
  const base = tab === "matched" ? matched : connectedDevs;
  const filtered = (
    query.trim()
      ? base.filter(
          (d) =>
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            d.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
        )
      : base
  ).slice(0, 8);

  const messageDev = (d: FounderContactProfile) => {
    onMessage?.({
      id: d.id,
      name: d.name,
      role: d.role,
      match: d.match,
      initials: d.initials,
      online: d.online,
      personType: "Developer",
    });
  };

  return (
    <div className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[15px_18px] shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[26px] h-[26px] rounded-lg bg-[#e8f5ef] flex items-center justify-center shrink-0">
          <UsersThree size={13} weight="duotone" className="text-bp-success" />
        </div>
        <span className="text-bp-ink text-[12.5px] font-extrabold">
          Developers
        </span>
      </div>

      <div className="bg-bp-tint flex gap-1.5 mb-2.5 p-0.75 rounded-lg">
        {(["matched", "connected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-[11px] font-bold py-1.5 px-2 rounded-md border-none cursor-pointer text-center select-none ${tab === t ? "bg-bp-card text-bp-ink shadow-[0_1px_3px_rgba(19,36,29,0.08)]" : "bg-transparent text-bp-muted"}`}
          >
            {t === "matched" ? "Matched" : `Connected (${connectedDevs.length})`}
          </button>
        ))}
      </div>

      <select
        value={selectedPhase}
        onChange={(e) => onSelectPhase(Number(e.target.value))}
        className="text-bp-ink bg-bp-tint w-full text-[11.5px] font-semibold p-[7px_9px] rounded-lg border border-bp-border outline-none font-inherit mb-2.25"
      >
        {phases.map((p, i) => (
          <option key={p.name} value={i}>
            Staffing for: {p.name}
          </option>
        ))}
      </select>
      <div className="relative mb-2.75">
        <MagnifyingGlass
          size={12}
          className="text-bp-label absolute left-2.25 top-1/2 -translate-y-1/2"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "matched" ? "Narrow the matches…" : "Search your connections…"}
          className="text-bp-ink w-full text-[11.5px] p-[7px_9px_7px_27px] rounded-lg border border-bp-border outline-none font-inherit"
        />
      </div>

      <div className="blueprint-scroll flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1 pb-1">
        {filtered.map((d) => {
          const connected = Boolean(connections[d.id]);
          const avail = d.availability === "Available";
          return (
            <motion.div
              key={d.id}
              whileHover={{
                y: -2,
                borderColor: "#c5ddd0",
                boxShadow: "0 8px 22px rgba(15,28,24,0.06)",
              }}
              className="bg-bp-card p-[12px_14px] rounded-lg border border-bp-border-soft flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-2.5">
                <Avatar initials={d.initials} size={34} />
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-bp-ink text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                        {d.name}
                      </span>
                      {d.online && (
                        <span className="bg-bp-success w-1.5 h-1.5 rounded-full shrink-0" />
                      )}
                    </div>
                    {tab === "matched" && (
                      <span className="text-[11.5px] font-extrabold px-2 py-0.5 rounded-full bg-[#e8f5ef] text-[#1d6e47] tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                        {d.match}%
                      </span>
                    )}
                  </div>
                  <div className="text-bp-muted text-[11.5px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {d.role}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    <Chip tone={avail ? "mint" : "amber"}>
                      {avail ? "Available" : d.availability}
                    </Chip>
                    {connected && <Chip tone="neutral">Connected</Chip>}
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 mt-0.5">
                <button
                  onClick={() => onViewProfile(d)}
                  className="bg-bp-tint text-bp-ink flex-1 text-[11px] font-bold py-1.75 rounded-md border border-bp-border-soft cursor-pointer text-center"
                >
                  View profile
                </button>
                {tab === "matched" && !connected && (
                  <button
                    onClick={() => onConnect(d)}
                    className="bp-primary-btn flex-1"
                  >
                    Connect
                  </button>
                )}
                {tab === "connected" && connected && (
                  <>
                    <button
                      onClick={() => onHire(selectedPhase, d)}
                      className="bp-primary-btn flex-1"
                    >
                      Add to phase
                    </button>
                    {onMessage && (
                      <button
                        onClick={() => messageDev(d)}
                        title="Message"
                        className="bg-bp-tint w-[30px] flex items-center justify-center rounded-md border border-bp-border-soft cursor-pointer"
                      >
                        <ChatCircleDots size={14} className="text-bp-teal" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-bp-muted bg-bp-tint text-[11.5px] text-center py-4 border border-dashed border-bp-border-soft rounded-lg">
            {tab === "matched" && matchLoading
              ? "Finding matches…"
              : tab === "connected"
                ? "No connections yet — connect with a matched developer first."
                : "No matches — try a different search."}
          </div>
        )}
      </div>

      {onBrowseNetwork && (
        <button
          onClick={onBrowseNetwork}
          className="text-bp-teal flex items-center gap-1.25 w-full justify-center text-[11px] font-bold bg-transparent border-none cursor-pointer mt-2.75 py-1"
        >
          Browse full network <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}
