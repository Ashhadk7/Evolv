"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import type { Blueprint } from "@/features/blueprints/types";
import type { FounderNetworkMessageTarget } from "@/features/network/types";
import {
  deleteBlueprint,
  retryBlueprint,
  pollGeneration,
  getBlueprint,
} from "@/features/blueprints/blueprints-api";
import { getApiErrorMessage } from "@/lib/api";
import { IdeaCard } from "./idea-card";
import { ForgeModal } from "./forge-modal";
import { DeleteIdeaModal } from "./delete-idea-modal";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { BlueprintDetail } from "@/features/blueprints/components/blueprint-detail";
import {
  DEFAULT_BLUEPRINTS,
  WORKSPACE_SORT_OPTIONS,
  WORKSPACE_STAGES,
} from "@/features/workspace/data/workspace-data";

/* ------------------------------------------------------- */
/* Types                                                    */
/* ------------------------------------------------------- */

/* ------------------------------------------------------- */
/* Main export                                            */
/* ------------------------------------------------------- */
interface Props {
  initialBlueprints?: Blueprint[];
  onBlueprintsChange?: (bps: Blueprint[]) => void;
  openBlueprintId?: string | null;
  onClearOpen?: () => void;
  triggerForge?: boolean;
  onClearForge?: () => void;
  profileComplete?: boolean;
  onCompleteProfile?: () => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  onRequireProfile?: (afterComplete?: () => void) => void;
}

export function WorkspaceTab({
  initialBlueprints = DEFAULT_BLUEPRINTS,
  onBlueprintsChange,
  openBlueprintId,
  onClearOpen,
  triggerForge,
  onClearForge,
  profileComplete = true,
  onCompleteProfile,
  onMessage,
  onRequireProfile,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Blueprint | null>(null);
  const [deleting, setDeleting] = useState(false);

  // initialBlueprints is only a seed for useState — it does not automatically
  // keep this component in sync with later changes to the store (a project
  // started elsewhere, a blueprint edited in another tab, a background
  // refetch). Without this, `blueprints` — and anything derived from it —
  // silently goes stale, and the next local edit's `update()` call would
  // persist that stale snapshot back to the store, overwriting whatever
  // changed in the meantime.
  useEffect(() => {
    setBlueprints(initialBlueprints);
  }, [initialBlueprints]);

  // Use searchParams to initialize without flashing
  const bpParam = searchParams.get("blueprint");
  const [viewingId, setViewingId] = useState<string | null>(bpParam ?? openBlueprintId ?? null);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("All Stages");
  const [sort, setSort] = useState("Viability");

  useEffect(() => {
    if (triggerForge)
      queueMicrotask(() => {
        setForgeOpen(true);
        onClearForge?.();
      });
  }, [triggerForge, onClearForge]);
  useEffect(() => {
    if (openBlueprintId) queueMicrotask(() => setViewingId(openBlueprintId));
  }, [openBlueprintId]);

  // Sync to URL to persist across refreshes
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (viewingId) {
      if (p.get("blueprint") !== viewingId) {
        p.set("blueprint", viewingId);
        router.push(`?${p.toString()}`, { scroll: false });
      }
    } else {
      if (p.has("blueprint")) {
        p.delete("blueprint");
        router.push(`?${p.toString()}`, { scroll: false });
      }
    }
  }, [viewingId, router, searchParams]);

  const update = (bps: Blueprint[]) => {
    setBlueprints(bps);
    onBlueprintsChange?.(bps);
  };

  // Delete server-side first, then drop it from the list — so the card only
  // disappears once the row is actually gone. On error the card stays put.
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteBlueprint(pendingDelete.id);
      update(blueprints.filter((b) => b.id !== pendingDelete.id));
      if (viewingId === pendingDelete.id) setViewingId(null);
      setPendingDelete(null);
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // Retry re-runs generation on the same row. Update just this card via the
  // functional form so the long poll can't clobber concurrent changes to other
  // cards; the store cache reconciles on the next load from the backend.
  const handleRetry = async (bp: Blueprint) => {
    const applyOne = (updated: Blueprint) =>
      setBlueprints((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      applyOne(await retryBlueprint(bp.id)); // reset to `generating`
      applyOne(await pollGeneration(bp.id)); // resolved `completed`
    } catch {
      // Poll threw (failed or timed out) — re-fetch so the card shows the real
      // backend state (failed + error, or still generating).
      const latest = await getBlueprint(bp.id).catch(() => null);
      if (latest) applyOne(latest);
    }
  };

  const viewingBP = blueprints.find((b) => b.id === viewingId);

  const filtered = blueprints.filter((bp) => {
    const matchSearch =
      bp.name.toLowerCase().includes(search.toLowerCase()) ||
      bp.industry.toLowerCase().includes(search.toLowerCase()) ||
      bp.ideaDesc.toLowerCase().includes(search.toLowerCase());
    const matchStage = stage === "All Stages" || bp.status.toLowerCase() === stage.toLowerCase();
    return matchSearch && matchStage;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Viability") return b.viability - a.viability;
    if (sort === "Impressions") return b.investorViews - a.investorViews;
    if (sort === "Market Potential") return b.marketPotential - a.marketPotential;
    return 0;
  });

  const pubCount = blueprints.filter((b) => b.status === "PUBLISHED").length;
  const totalInvViews = blueprints.reduce((s, b) => s + b.investorViews, 0);
  const avgViability =
    blueprints.length > 0
      ? Math.round(blueprints.reduce((s, b) => s + b.viability, 0) / blueprints.length)
      : 0;

  const headerStats = [
    { value: blueprints.length, label: "Total Ideas" },
    { value: pubCount, label: "Published" },
    { value: `${avgViability}%`, label: "Avg Viability" },
    { value: totalInvViews, label: "Impressions" },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f0f3f1]">
      {/* -- Header -- */}
      <div className="shrink-0 px-8 pt-7 pb-5">
        <AnimatePresence mode="wait">
          {!viewingBP ? (
            <motion.div
              key="header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Title row */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h1 className="text-[28px] leading-none font-black tracking-[-0.025em] text-[#1a2e26]">
                    Founder Workspace
                  </h1>
                  <p className="mt-1.5 text-[13px] text-[#7a9e8e]">
                    Manage and track your startup blueprints
                  </p>
                </div>
                <button onClick={() => setForgeOpen(true)} className="bp-primary-btn">
                  <Plus size={15} weight="bold" /> New idea
                </button>
              </div>

              {/* Dark stats bar */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex overflow-hidden rounded-2xl bg-[#1a312c] shadow-[0_4px_20px_rgba(26,49,44,0.2)]"
              >
                {headerStats.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex flex-1 flex-col items-center px-4 py-5 ${
                      i < headerStats.length - 1 ? "border-r border-[rgba(137,215,183,0.12)]" : ""
                    }`}
                  >
                    <span className="text-[26px] leading-none font-black tracking-[-0.02em] text-white">
                      {s.value}
                    </span>
                    <span className="mt-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#89d7b7] uppercase">
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="detail-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* -- Body -- */}
      <div className="flex flex-1 gap-5 overflow-hidden px-8 pb-7">
        {/* Left: list or detail */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {viewingBP ? (
              <BlueprintDetail
                key="detail"
                bp={viewingBP}
                onBack={() => {
                  setViewingId(null);
                  onClearOpen?.();
                }}
                onSave={(updated) =>
                  update(blueprints.map((b) => (b.id === updated.id ? updated : b)))
                }
                onMessage={onMessage}
                profileComplete={profileComplete}
                onRequireProfile={onRequireProfile}
              />
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col overflow-hidden"
              >
                {/* Search & filter bar */}
                <div className="mb-[18px] flex shrink-0 items-center gap-2.5">
                  <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-[#dde8e2] bg-white px-4 py-3 shadow-[0_1px_6px_rgba(26,49,44,0.05)]">
                    <MagnifyingGlass size={17} className="shrink-0 text-[#9ab4a4]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search ideas, industries…"
                      className="flex-1 border-none bg-transparent font-[inherit] text-[13px] text-[#1a2e26] outline-none"
                    />
                  </div>
                  {[
                    { label: stage, options: WORKSPACE_STAGES, setter: setStage },
                    { label: `Sort: ${sort}`, options: WORKSPACE_SORT_OPTIONS, setter: setSort },
                  ].map(({ label, options, setter }) => (
                    <div key={label} className="relative">
                      <select
                        onChange={(e) => setter(e.target.value)}
                        className="min-w-[138px] cursor-pointer appearance-none rounded-2xl border border-[#dde8e2] bg-white py-3 pr-10 pl-4 font-[inherit] text-[13px] font-semibold text-[#1a2e26] shadow-[0_1px_6px_rgba(26,49,44,0.05)] outline-none"
                      >
                        {options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                      <CaretDown
                        size={11}
                        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7a9e8e]"
                      />
                    </div>
                  ))}
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto pr-1">
                  {sorted.length === 0 && (
                    <div className="py-16 text-center text-[#7a9e8e]">
                      <div className="mb-4 text-4xl">?</div>
                      <div className="mb-1.5 text-sm font-bold text-[#1a2e26]">No ideas found</div>
                      <div className="text-[13px]">
                        Try adjusting your search or forge a new blueprint.
                      </div>
                    </div>
                  )}
                  <AnimatePresence>
                    {sorted.map((bp, idx) => (
                      <IdeaCard
                        key={bp.id}
                        bp={bp}
                        idx={idx}
                        onView={() => setViewingId(bp.id)}
                        onDelete={() => setPendingDelete(bp)}
                        onRetry={() => handleRetry(bp)}
                        canPublish={profileComplete}
                        onCompleteProfile={onCompleteProfile}
                        onTogglePublic={() =>
                          update(
                            blueprints.map((b) =>
                              b.id === bp.id
                                ? {
                                    ...b,
                                    isPublic: !b.isPublic,
                                    status: (b.isPublic ? "DRAFT" : "PUBLISHED") as
                                      "DRAFT" | "PUBLISHED",
                                  }
                                : b
                            )
                          )
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <AnimatePresence>
          {!viewingBP && (
            <motion.aside
              key="sidebar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="w-[290px] shrink-0 overflow-y-auto"
            >
              <WorkspaceSidebar />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {forgeOpen && (
        <ForgeModal
          onClose={() => setForgeOpen(false)}
          onCreated={(bp) => {
            update([bp, ...blueprints]);
            setViewingId(bp.id);
          }}
        />
      )}

      <AnimatePresence>
        {pendingDelete && (
          <DeleteIdeaModal
            ideaName={pendingDelete.name}
            deleting={deleting}
            onConfirm={confirmDelete}
            onClose={() => !deleting && setPendingDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export { DEFAULT_BLUEPRINTS };
