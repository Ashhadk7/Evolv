"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle, Coins, Flag, PencilSimple } from "@phosphor-icons/react";
import type { Phase } from "@/features/blueprints/blueprint-content";
import { fmtMoney } from "@/features/blueprints/blueprint-content";
import { cardStyle, NUM } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Chip } from "@/components/shared/chip";
import { Avatar } from "@/components/shared/avatar";
import { devsForPhase } from "./blueprint-detail-data";

export function RoadmapSection({
  phases,
  setPhases,
  editing,
  editPhase,
  setEditPhase,
  hirePanelPhase,
  setHirePanelPhase,
  phaseHires,
  setPhaseHires,
  totalWeeks,
  reduce,
  matchedDevelopers = [],
}: {
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  editing: boolean;
  editPhase: number | null;
  setEditPhase: React.Dispatch<React.SetStateAction<number | null>>;
  hirePanelPhase: number | null;
  setHirePanelPhase: React.Dispatch<React.SetStateAction<number | null>>;
  phaseHires: Record<number, string>;
  setPhaseHires: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  totalWeeks: number;
  reduce: boolean | null;
  /** Live-matched developers from GET /blueprints/{id}/matches. Falls back to [] gracefully. */
  matchedDevelopers?: import("@/features/network/types").FounderContactProfile[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<Flag size={18} weight="duotone" className="text-bp-success" />}
          kicker="Delivery"
          title="Development Roadmap"
          desc="Milestone-based build plan. Each milestone is independently shippable, with its developer payout released on approval."
          right={<Chip tone="dark">{totalWeeks} weeks total</Chip>}
        />
        <div className="relative pl-1.5">
          <motion.div
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute top-3.5 bottom-3.5 left-5 w-0.5 origin-top bg-[linear-gradient(var(--color-bp-mint),var(--color-bp-border))]"
          />
          <div className="flex flex-col gap-3.5">
            {phases.map((ph, i) => {
              const inProg = ph.status === "In Progress";
              const pay = ph.cost;
              const isEdit = editPhase === i;
              return (
                <div key={i} className="flex gap-4">
                  <div
                    style={NUM}
                    className="bg-bp-forest text-bp-mint z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
                  >
                    {i + 1}
                  </div>
                  <div className="border-bp-border-soft bg-bp-tint flex-1 rounded-2xl border px-[18px] py-4">
                    <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                      {isEdit ? (
                        <input
                          value={ph.name}
                          onChange={(e) =>
                            setPhases((p) =>
                              p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                            )
                          }
                          className="border-bp-border text-bp-ink flex-1 rounded-lg border px-2.5 py-1.5 font-[inherit] text-sm font-bold outline-none"
                        />
                      ) : (
                        <span className="text-bp-ink text-[14.5px] font-bold">{ph.name}</span>
                      )}
                      <span className="font-mono-app text-bp-teal text-[11px]">{ph.layer}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <Chip>{ph.weeks}w</Chip>
                        <Chip tone="mint" icon={<Coins size={11} weight="fill" />}>
                          {fmtMoney(pay)}
                        </Chip>
                        <Chip tone={inProg ? "mint" : "neutral"}>{ph.status}</Chip>
                        {editing && (
                          <button
                            onClick={() => setEditPhase(isEdit ? null : i)}
                            className="border-bp-border bg-bp-card flex h-7 w-7 cursor-pointer items-center justify-center rounded-[11px] border"
                            title="Edit phase"
                          >
                            {isEdit ? (
                              <CheckCircle size={14} weight="fill" className="text-bp-success" />
                            ) : (
                              <PencilSimple size={13} className="text-bp-teal" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ph.deliverables.map((d, di) =>
                        isEdit ? (
                          <input
                            key={di}
                            value={d}
                            onChange={(e) =>
                              setPhases((p) =>
                                p.map((x, j) =>
                                  j === i
                                    ? {
                                        ...x,
                                        deliverables: x.deliverables.map((y, k) =>
                                          k === di ? e.target.value : y
                                        ),
                                      }
                                    : x
                                )
                              )
                            }
                            className="border-bp-border text-bp-ink rounded-lg border px-[9px] py-[5px] font-[inherit] text-xs outline-none"
                          />
                        ) : (
                          <span
                            key={di}
                            className="border-bp-border-soft bg-bp-card text-bp-body flex items-center gap-1.5 rounded-lg border px-[11px] py-[5px] text-xs"
                          >
                            <CheckCircle size={11} weight="fill" className="text-bp-mint" />
                            {d}
                          </span>
                        )
                      )}
                    </div>
                    <div className="mt-2.5">
                      <span className="font-mono-app text-bp-label text-[10px] font-bold tracking-[0.08em] uppercase">
                        Acceptance criteria
                      </span>
                      <div className="mt-1.5 flex flex-col gap-1">
                        {ph.acceptanceCriteria.map((a, ai) => (
                          <span key={ai} className="text-bp-muted text-xs leading-[1.5]">
                            · {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="border-bp-border-soft mt-3 flex flex-wrap items-center justify-between gap-2.5 border-t pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {ph.skillset.map((s) => (
                          <Chip key={s}>{s}</Chip>
                        ))}
                      </div>
                      {phaseHires[i] ? (
                        <Chip tone="mint" icon={<CheckCircle size={11} weight="fill" />}>
                          {phaseHires[i]} hired for this phase
                        </Chip>
                      ) : (
                        <button
                          onClick={() => setHirePanelPhase(hirePanelPhase === i ? null : i)}
                          className="bp-primary-btn"
                        >
                          Hire for this phase <ArrowRight size={12} weight="bold" />
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {hirePanelPhase === i && !phaseHires[i] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex flex-col gap-2">
                            {(matchedDevelopers.length > 0 ? matchedDevelopers : devsForPhase(ph.skillset)).map((d) => (
                              <div
                                key={d.name}
                                className="border-bp-border-soft bg-bp-card flex items-center gap-3 rounded-[11px] border px-3 py-2.5"
                              >
                                <Avatar initials={d.initials} size={34} />
                                <div className="min-w-0 flex-1">
                                  <div className="text-bp-ink text-[13px] font-bold">{d.name}</div>
                                  <div className="text-bp-muted mt-px text-[11px]">{d.role}</div>
                                </div>
                                <span
                                  style={NUM}
                                  className="rounded-full bg-[#e8f5ef] px-2.5 py-1 text-xs font-extrabold text-[#1d6e47]"
                                >
                                  {d.match}%
                                </span>
                                <button
                                  onClick={() => {
                                    setPhaseHires((p) => ({ ...p, [i]: d.name }));
                                    setHirePanelPhase(null);
                                  }}
                                  className="bp-gradient-btn bg-bp-forest text-bp-mint cursor-pointer rounded-[9px] border-none px-3.5 py-[7px] text-xs font-bold"
                                >
                                  Hire
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
