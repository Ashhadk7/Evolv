"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ChartBar,
  MagnifyingGlass,
  Notebook,
  PlusCircle,
  Rocket,
  UsersThree,
} from "@phosphor-icons/react";
import {
  deleteBlueprint,
  getBlueprint,
  pollGeneration,
  retryBlueprint,
} from "@/features/blueprints/blueprints-api";
import { BlueprintDetail } from "@/features/blueprints/components/blueprint-detail";
import type { Blueprint } from "@/features/blueprints/types";
import type { FounderNetworkMessageTarget } from "@/features/network/types";
import { useWorkspaceMatches } from "@/features/workspace/lib/use-workspace-matches";
import {
  filterBlueprints,
  isBlueprintReady,
  sortBlueprints,
  workspaceStats,
  type WorkspaceSort,
  type WorkspaceStage,
} from "@/features/workspace/lib/workspace-metrics";
import { getApiErrorMessage } from "@/lib/api";
import { DeleteIdeaModal } from "./delete-idea-modal";
import { ForgeModal } from "./forge-modal";
import { IdeaCard } from "./idea-card";
import { WorkspaceFilters } from "./workspace-filters";
import { WorkspaceKpiCard } from "./workspace-kpi-card";

interface WorkspaceTabProps {
  blueprints: Blueprint[];
  onBlueprintsChange: (update: Blueprint[] | ((prev: Blueprint[]) => Blueprint[])) => void;
  triggerForge?: boolean;
  onClearForge?: () => void;
  profileComplete?: boolean;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  onRequireProfile?: (afterComplete?: () => void) => void;
}

export function WorkspaceTab({
  blueprints,
  onBlueprintsChange,
  triggerForge,
  onClearForge,
  profileComplete = true,
  onMessage,
  onRequireProfile,
}: WorkspaceTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [forgeOpen, setForgeOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Blueprint | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openInEdit, setOpenInEdit] = useState(false);

  // The `?blueprint=` param is the ONLY source of truth for what's open.
  // It was previously mirrored into component state and a store field, kept in
  // step by three effects writing the same value from different directions —
  // browser Back cleared the URL but not the store, so the stale id pushed the
  // param straight back and the two ping-ponged forever. Deriving it means
  // there is nothing left to fall out of sync.
  const viewingId = searchParams.get("blueprint");

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<WorkspaceStage>("All Stages");
  const [sort, setSort] = useState<WorkspaceSort>("Viability");

  useEffect(() => {
    if (triggerForge)
      queueMicrotask(() => {
        setForgeOpen(true);
        onClearForge?.();
      });
  }, [triggerForge, onClearForge]);

  const openBlueprint = (id: string, edit: boolean) => {
    setOpenInEdit(edit);
    const params = new URLSearchParams(searchParams.toString());
    params.set("blueprint", id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const closeBlueprint = () => {
    setOpenInEdit(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("blueprint");
    router.push(params.size ? `?${params.toString()}` : window.location.pathname, {
      scroll: false,
    });
  };

  const visible = sortBlueprints(filterBlueprints(blueprints, { search, stage }), sort);
  const stats = workspaceStats(blueprints);
  // Only completed blueprints have the roles the matcher scores against, so
  // asking for the others' matches would spend a request per guaranteed-empty result.
  const matches = useWorkspaceMatches(blueprints.filter(isBlueprintReady).map((bp) => bp.id));
  const viewingBlueprint = blueprints.find((bp) => bp.id === viewingId);

  // Delete server-side first so the card only disappears once the row is gone.
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteBlueprint(pendingDelete.id);
      onBlueprintsChange((prev) => prev.filter((bp) => bp.id !== pendingDelete.id));
      if (viewingId === pendingDelete.id) closeBlueprint();
      setPendingDelete(null);
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // Retry re-runs generation on the same row, then polls it to completion.
  const handleRetry = async (bp: Blueprint) => {
    const applyOne = (updated: Blueprint) =>
      onBlueprintsChange((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    try {
      applyOne(await retryBlueprint(bp.id));
      applyOne(await pollGeneration(bp.id));
    } catch {
      // The poll failed or timed out — re-fetch so the card shows the real
      // backend state rather than a stale "generating".
      const latest = await getBlueprint(bp.id).catch(() => null);
      if (latest) applyOne(latest);
    }
  };

  if (viewingBlueprint) {
    return (
      <div className="bg-[#f5f6f4] flex h-full min-h-full flex-col overflow-hidden px-4 py-5 md:px-9 md:py-7">
        <BlueprintDetail
          bp={viewingBlueprint}
          startInEdit={openInEdit}
          onBack={closeBlueprint}
          onSave={(updated) =>
            onBlueprintsChange((prev) => prev.map((bp) => (bp.id === updated.id ? updated : bp)))
          }
          onMessage={onMessage}
          profileComplete={profileComplete}
          onRequireProfile={onRequireProfile}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f4] flex h-full min-h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-start justify-between gap-3 px-4 pt-5 pb-4 md:px-9 md:pt-[30px] md:pb-5">
        <div className="min-w-0">
          <h1 className="text-bp-ink text-[22px] md:text-[28px] leading-none font-extrabold tracking-[-0.03em]">
            Founder Workspace
          </h1>
          <p className="text-bp-muted mt-1.5 text-[12px] md:text-[13.5px]">
            Track viability, momentum and reach across your startup blueprints.
          </p>
        </div>
        <button type="button" onClick={() => setForgeOpen(true)} className="bp-primary-btn shrink-0 !text-xs md:!text-sm !px-3 md:!px-4">
          <PlusCircle size={15} weight="fill" aria-hidden /> <span className="hidden sm:inline">New idea</span><span className="inline sm:hidden">New</span>
        </button>
      </header>

      <div className="blueprint-scroll flex-1 overflow-y-auto px-4 pt-1 pb-8 md:px-9">
        <section
          aria-label="Workspace summary"
          className="mb-6 grid grid-cols-2 gap-[18px] lg:grid-cols-4"
        >
          <WorkspaceKpiCard
            icon={<Notebook size={21} weight="duotone" />}
            value={stats.total}
            label="Total ideas"
            delta={
              stats.createdThisWeek > 0
                ? { label: `+${stats.createdThisWeek} this week`, tone: "positive" }
                : undefined
            }
          />
          <WorkspaceKpiCard
            icon={<Rocket size={21} weight="duotone" />}
            value={stats.published}
            label="Published live"
            delta={
              stats.drafts > 0
                ? {
                    label: `${stats.drafts} draft${stats.drafts === 1 ? "" : "s"} left`,
                    tone: "neutral",
                  }
                : undefined
            }
          />
          <WorkspaceKpiCard
            icon={<ChartBar size={21} weight="duotone" />}
            value={
              <>
                {stats.avgViability}
                <span className="text-bp-label text-[20px]">%</span>
              </>
            }
            label="Avg viability"
            progress={stats.avgViability}
          />
          <WorkspaceKpiCard
            icon={<UsersThree size={21} weight="duotone" />}
            value={matches.loading ? "—" : matches.total}
            label="Developer matches"
          />
        </section>

        <WorkspaceFilters
          search={search}
          stage={stage}
          sort={sort}
          onSearchChange={setSearch}
          onStageChange={setStage}
          onSortChange={setSort}
        />

        {visible.length === 0 ? (
          <div className="py-16 text-center text-[#7a9e8e]">
            <MagnifyingGlass size={34} aria-hidden className="mx-auto text-[#b6cfc3]" />
            <p className="text-bp-ink mt-3 text-sm font-bold">No ideas found</p>
            <p className="mt-1.5 text-[13px]">Try a different search or forge a new blueprint.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-5">
            <AnimatePresence>
              {visible.map((bp, index) => (
                <IdeaCard
                  key={bp.id}
                  bp={bp}
                  index={index}
                  developers={matches.byBlueprint[bp.id] ?? []}
                  developersLoading={matches.loading}
                  onView={() => openBlueprint(bp.id, false)}
                  onEdit={() => openBlueprint(bp.id, true)}
                  onDelete={() => setPendingDelete(bp)}
                  onRetry={() => handleRetry(bp)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {forgeOpen && (
        <ForgeModal
          onClose={() => setForgeOpen(false)}
          onCreated={(bp) => {
            onBlueprintsChange((prev) => [bp, ...prev]);
            openBlueprint(bp.id, false);
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
