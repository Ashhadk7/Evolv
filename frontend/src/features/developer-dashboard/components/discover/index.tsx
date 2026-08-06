"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import {
  applyToDiscoverBlueprint,
  listDiscoverBlueprints,
  listSavedDiscoverBlueprints,
  saveDiscoverBlueprint,
  unsaveDiscoverBlueprint,
  withdrawDiscoverApplication,
  DISCOVER_PAGE_SIZE,
  type ApplyInput,
  type DiscoverFilterOptions,
  type DiscoverFilters,
  type DiscoverSort,
} from "@/features/developer-dashboard/lib/discover-api";
import { ApplyModal } from "./apply-modal";
import { canApply, engagementNotice } from "./apply-state";
import { DeveloperBlueprintDetail } from "./developer-blueprint-detail";
import { FeaturedMatchCard } from "./featured-match-card";
import { FilterBar, type DiscoverView } from "./filter-bar";
import { OpportunitiesGrid } from "./opportunities-grid";
import { Pagination } from "./pagination";
import type { Opportunity } from "./types";

const EMPTY_OPTIONS: DiscoverFilterOptions = {
  industries: [],
  stages: [],
  techStack: [],
  roles: [],
};

const Discover = ({ profileComplete = true, onRequireProfile }: DeveloperPageProps) => {
  const [detailBlueprint, setDetailBlueprint] = useState<Opportunity | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedBlueprints, setSavedBlueprints] = useState<Opportunity[]>([]);
  const [view, setView] = useState<DiscoverView>("all");
  const [filterOptions, setFilterOptions] = useState<DiscoverFilterOptions>(EMPTY_OPTIONS);
  const [activeFilters, setActiveFilters] = useState<DiscoverFilters>({});
  const [sort, setSort] = useState<DiscoverSort>("match");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [unavailableSavedCount, setUnavailableSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyBlueprintId, setBusyBlueprintId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"apply" | "save" | "withdraw" | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [applyTarget, setApplyTarget] = useState<Opportunity | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySubmitted, setApplySubmitted] = useState(false);

  const loadBlueprints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listDiscoverBlueprints(activeFilters, sort, page);
      setOpportunities(response.items);
      setFilterOptions(response.filterOptions);
      setSavedCount(response.savedCount);
      setTotal(response.total);
      setDetailBlueprint((current) =>
        current ? (response.items.find((item) => item.id === current.id) ?? current) : null
      );
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [activeFilters, sort, page]);

  const loadSavedBlueprints = useCallback(async () => {
    try {
      const items = await listSavedDiscoverBlueprints();
      const available = items.flatMap((item) =>
        item.available && item.blueprint ? [item.blueprint] : []
      );
      setSavedBlueprints(available);
      setSavedCount(available.length);
      setUnavailableSavedCount(items.length - available.length);
    } catch {
      setSavedBlueprints([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBlueprints(), 0);
    return () => window.clearTimeout(timer);
  }, [loadBlueprints]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSavedBlueprints(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSavedBlueprints]);

  const updateBlueprint = useCallback((id: string, changes: Partial<Opportunity>) => {
    const applyChanges = (item: Opportunity) => (item.id === id ? { ...item, ...changes } : item);
    setOpportunities((items) => items.map(applyChanges));
    setSavedBlueprints((items) => items.map(applyChanges));
    setDetailBlueprint((current) => (current?.id === id ? applyChanges(current) : current));
    setApplyTarget((current) => (current?.id === id ? applyChanges(current) : current));
  }, []);

  const visibleBlueprints = view === "all" ? opportunities : savedBlueprints;
  const featuredMatch = view === "all" && page === 0 ? (opportunities[0] ?? null) : null;
  const restBlueprints = useMemo(
    () => (featuredMatch ? visibleBlueprints.slice(1) : visibleBlueprints),
    [featuredMatch, visibleBlueprints]
  );

  const requireProfile = (retry: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(retry);
    return true;
  };

  const handleFilterChange = (key: keyof DiscoverFilters, value: string) => {
    setActiveFilters((current) => ({ ...current, [key]: value || null }));
    setPage(0);
  };

  const handleSortChange = (next: DiscoverSort) => {
    setSort(next);
    setPage(0);
  };

  const handleViewChange = (next: DiscoverView) => {
    setView(next);
    setPage(0);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setPage(0);
  };

  const handleOpenApply = (blueprint: Opportunity) => {
    if (requireProfile(() => handleOpenApply(blueprint))) return;
    if (!canApply(blueprint)) {
      setNotice({
        tone: "success",
        text: engagementNotice(blueprint) ?? "You have already applied to this blueprint.",
      });
      return;
    }
    setApplyError(null);
    setApplySubmitted(false);
    setApplyTarget(blueprint);
  };

  const handleApplyFromDetail = (blueprint: Opportunity, role: string) => {
    if (requireProfile(() => handleApplyFromDetail(blueprint, role))) return;
    if (!canApply(blueprint)) {
      setNotice({
        tone: "success",
        text: engagementNotice(blueprint) ?? "You have already applied to this blueprint.",
      });
      return;
    }
    setApplyError(null);
    setApplySubmitted(false);
    setApplyTarget({ ...blueprint, bestRole: role || blueprint.bestRole });
  };

  const handleSubmitApply = async (input: ApplyInput) => {
    if (!applyTarget) return;
    const target = applyTarget;

    setBusyBlueprintId(target.id);
    setBusyAction("apply");
    setApplyError(null);
    try {
      const application = await applyToDiscoverBlueprint(target.id, input);
      updateBlueprint(target.id, {
        applied: true,
        applicationId: application.id,
        applicationStatus: application.status,
        appliedRole: application.role ?? input.role,
        appliedAt: application.applied_at,
        withdrawnAt: null,
        applicantCount: target.applicantCount + 1,
      });
      setApplySubmitted(true);
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "already_applied") {
        updateBlueprint(target.id, { applied: true, applicationStatus: "applied" });
        setApplyError("You have already applied to this blueprint.");
        return;
      }
      if (caught instanceof ApiError && caught.code === "already_engaged") {
        const data = caught.data as
          | {
              engagement_status?: Opportunity["engagementStatus"];
              engagement_project_id?: string;
              engagement_project_title?: string;
            }
          | null;
        updateBlueprint(target.id, {
          applied: false,
          applicationStatus: null,
          engagementStatus: data?.engagement_status ?? "accepted",
          engagementProjectId: data?.engagement_project_id ?? null,
          engagementProjectTitle: data?.engagement_project_title ?? target.name,
        });
        setApplyError(caught.detail);
        return;
      }
      setApplyError(getApiErrorMessage(caught));
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
    }
  };

  const handleSave = async (blueprint: Opportunity) => {
    if (requireProfile(() => void handleSave(blueprint))) return;

    setBusyBlueprintId(blueprint.id);
    setBusyAction("save");
    setNotice(null);
    try {
      if (blueprint.saved) {
        await unsaveDiscoverBlueprint(blueprint.id);
        updateBlueprint(blueprint.id, { saved: false });
        setSavedBlueprints((items) => items.filter((item) => item.id !== blueprint.id));
        setSavedCount((count) => Math.max(0, count - 1));
        setNotice({ tone: "success", text: "Removed from saved." });
      } else {
        await saveDiscoverBlueprint(blueprint.id);
        updateBlueprint(blueprint.id, { saved: true });
        void loadSavedBlueprints();
        setNotice({ tone: "success", text: "Blueprint saved." });
      }
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "already_saved") {
        updateBlueprint(blueprint.id, { saved: true });
        void loadSavedBlueprints();
        return;
      }
      setNotice({ tone: "error", text: getApiErrorMessage(caught) });
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
    }
  };

  const handleWithdraw = async (blueprint: Opportunity) => {
    if (!blueprint.applicationId) return;

    setBusyBlueprintId(blueprint.id);
    setBusyAction("withdraw");
    setNotice(null);
    try {
      await withdrawDiscoverApplication(blueprint.applicationId);
      updateBlueprint(blueprint.id, {
        applied: false,
        applicationStatus: "withdrawn",
        withdrawnAt: new Date().toISOString(),
        applicantCount: Math.max(0, blueprint.applicantCount - 1),
      });
      setNotice({ tone: "success", text: "Application withdrawn." });
    } catch (caught) {
      setNotice({ tone: "error", text: getApiErrorMessage(caught) });
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
    }
  };

  if (detailBlueprint) {
    return (
      <div className={styles.discoverPage}>
        <DeveloperBlueprintDetail
          key={detailBlueprint.id}
          blueprint={detailBlueprint}
          busyAction={busyBlueprintId === detailBlueprint.id ? (busyAction ?? undefined) : undefined}
          onBack={() => setDetailBlueprint(null)}
          onApply={handleApplyFromDetail}
          onWithdraw={handleWithdraw}
          onSave={handleSave}
        />
        {applyTarget && (
          <ApplyModal
            blueprint={applyTarget}
            submitting={busyAction === "apply"}
            error={applyError}
            submitted={applySubmitted}
            onSubmit={handleSubmitApply}
            onClose={() => setApplyTarget(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.discoverPage}>
      <header className={styles.pageHead}>
        <h1>Discover</h1>
        <p>
          Published startup blueprints, ranked by how well they match your skills. Apply to build
          with founders.
        </p>
      </header>

      <FilterBar
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        sort={sort}
        view={view}
        savedCount={savedCount}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        onViewChange={handleViewChange}
      />

      <div className={styles.pageBody}>
        {notice && (
          <p
            className={notice.tone === "error" ? styles.noticeError : styles.notice}
            role="status"
            aria-live="polite"
          >
            {notice.text}
          </p>
        )}

        {view === "saved" && unavailableSavedCount > 0 && (
          <p className={styles.notice} role="status">
            {unavailableSavedCount} saved{" "}
            {unavailableSavedCount === 1 ? "blueprint is" : "blueprints are"} no longer public and
            cannot be shown.
          </p>
        )}

        {view === "all" && !loading && !error && (
          <FeaturedMatchCard
            featuredMatch={featuredMatch}
            busyAction={
              featuredMatch?.id === busyBlueprintId ? (busyAction ?? undefined) : undefined
            }
            onSave={handleSave}
            onView={setDetailBlueprint}
            onApply={handleOpenApply}
          />
        )}

        {(restBlueprints.length > 0 || !featuredMatch) && (
          <OpportunitiesGrid
            opportunities={restBlueprints}
            heading={view === "all" ? "More matches" : "Saved blueprints"}
            loading={loading && view === "all"}
            error={view === "all" ? error : null}
            busyBlueprintId={busyBlueprintId}
            busyAction={busyAction}
            emptyTitle={
              view === "all"
                ? "No blueprints match those filters"
                : "You have not saved any blueprints yet"
            }
            emptyHint={
              view === "all"
                ? "Try clearing a filter or widening your search."
                : "Use Save on any public blueprint and it will appear here."
            }
            emptyAction={
              view === "all"
                ? { label: "Clear filters", onClick: handleClearFilters }
                : { label: "Browse all blueprints", onClick: () => handleViewChange("all") }
            }
            onView={setDetailBlueprint}
            onApply={handleOpenApply}
            onSave={handleSave}
            onRetry={() => void loadBlueprints()}
          />
        )}

        {view === "all" && !loading && !error && (
          <Pagination
            page={page}
            pageSize={DISCOVER_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>

      {applyTarget && (
        <ApplyModal
          blueprint={applyTarget}
          submitting={busyAction === "apply"}
          error={applyError}
          submitted={applySubmitted}
          onSubmit={handleSubmitApply}
          onClose={() => setApplyTarget(null)}
        />
      )}

      <footer className={styles.pageFooter}>
        <span>Evolv — Discover</span>
        <span>2026 Evolv. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Discover;
