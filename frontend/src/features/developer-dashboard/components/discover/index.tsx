import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Layers3 } from "lucide-react";
import { getAccessToken } from "@/features/auth/lib/session";

import { Topbar } from "@/features/developer-dashboard/components/topbar";
import { StatCard } from "@/features/developer-dashboard/components/stat-card";
import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import {
  applyToDiscoverBlueprint,
  listDiscoverBlueprints,
  saveDiscoverBlueprint,
  unsaveDiscoverBlueprint,
  listSavedDiscoverBlueprints,
  withdrawDiscoverApplication,
  type DiscoverFilterOptions,
  type DiscoverFilters,
  type SavedDiscoverBlueprint,
} from "@/features/developer-dashboard/lib/discover-api";
import { FeaturedMatchCard } from "./featured-match-card";
import { FilterBar } from "./filter-bar";
import { OpportunitiesList } from "./opportunities-list";
import { DeveloperBlueprintDetail } from "./developer-blueprint-detail";
import type { Opportunity } from "./types";

const EMPTY_OPTIONS: DiscoverFilterOptions = {
  industries: [],
  stages: [],
  techStack: [],
};

const Discover = ({ onNavigate, profileComplete = true, onRequireProfile }: DeveloperPageProps) => {
  const [detailStartup, setDetailStartup] = useState<Opportunity | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedItems, setSavedItems] = useState<SavedDiscoverBlueprint[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "saved">("all");
  const [filterOptions, setFilterOptions] = useState<DiscoverFilterOptions>(EMPTY_OPTIONS);
  const [activeFilters, setActiveFilters] = useState<DiscoverFilters>({});
  const [savedCount, setSavedCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [highMatchCount, setHighMatchCount] = useState(0);
  const [totalPublicCount, setTotalPublicCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyBlueprintId, setBusyBlueprintId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"apply" | "save" | "withdraw" | null>(null);
  const [busyRole, setBusyRole] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

<<<<<<< HEAD
  const loadBlueprints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listDiscoverBlueprints(activeFilters);
      setOpportunities(response.items);
      setFilterOptions(response.filterOptions);
      setSavedCount(response.savedCount);
      setApplicationsCount(response.applicationsCount);
      setHighMatchCount(response.highMatchCount);
      setTotalPublicCount(response.total);
      setDetailStartup((current) =>
        current ? (response.items.find((item) => item.id === current.id) ?? current) : null
=======
  const handleApply = async (blueprintId?: string) => {
    if (!profileComplete && onRequireProfile) {
      onRequireProfile(() => onNavigate("applications"));
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const targetId = blueprintId || selectedStartup?.id || "9b178a4a-e642-4cb5-bfef-1c7370f4c807";

      await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers,
        body: JSON.stringify({ blueprint_id: targetId }),
      });
    } catch (e) {
      console.warn("Application creation error:", e);
    }

    onNavigate("applications");
  };

  const applyFilters = (filters: DiscoverFilters) => {
    let filtered = [...opportunities];
    if (filters.industry) filtered = filtered.filter((o) => o.industry === filters.industry);
    if (filters.fundingStage) filtered = filtered.filter((o) => o.stage === filters.fundingStage);
    if (filters.matchScore) {
      const min = parseInt(filters.matchScore);
      filtered = filtered.filter((o) => ((o as Opportunity).matchScore || 0) >= min);
    }
    if (filters.viability) {
      const [min, max] = filters.viability.split("-").map(Number);
      filtered = filtered.filter((o) => (o.viability || 0) >= min && (o.viability || 0) <= max);
    }
    if (filters.techStack) {
      filtered = filtered.filter(
        (o) => o.techStack && o.techStack.includes(filters.techStack as string)
>>>>>>> b4aad8d6e6e70854d4052a381503bc04e43ca974
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  const loadSavedBlueprints = useCallback(async () => {
    try {
      const items = await listSavedDiscoverBlueprints();
      setSavedItems(items);
      setSavedCount(items.length);
    } catch {
      setSavedItems([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBlueprints();
      void loadSavedBlueprints();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadBlueprints, loadSavedBlueprints]);

  const updateBlueprint = useCallback((id: string, changes: Partial<Opportunity>) => {
    const applyChanges = (item: Opportunity) => (item.id === id ? { ...item, ...changes } : item);
    setOpportunities((items) => items.map(applyChanges));
    setDetailStartup((current) => (current?.id === id ? applyChanges(current) : current));
    setSavedItems((items) =>
      items.map((item) =>
        item.blueprint?.id === id
          ? {
              ...item,
              name: changes.name ?? item.name,
              blueprint: applyChanges(item.blueprint),
            }
          : item
      )
    );
  }, []);

  const featuredMatch = opportunities[0] ?? null;

  const discoverStats = useMemo(
    () => [
      {
        id: 1,
        label: "Public Blueprints",
        value: String(totalPublicCount),
        trend: "Live",
        trendUp: true,
      },
      {
        id: 2,
        label: "High Relevance",
        value: String(highMatchCount),
        trend: "75%+",
        trendUp: true,
      },
      {
        id: 3,
        label: "Saved Blueprints",
        value: String(savedCount),
        trend: "Yours",
        trendUp: true,
      },
      {
        id: 4,
        label: "Applications",
        value: String(applicationsCount),
        trend: "Submitted",
        trendUp: true,
      },
    ],
    [applicationsCount, highMatchCount, savedCount, totalPublicCount]
  );

  const handleFilterChange = (key: keyof DiscoverFilters, value: string) => {
    setActiveFilters((current) => ({ ...current, [key]: value || null }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const handleSelectStartup = (startup: Opportunity) => {
    handleViewBlueprint(startup);
  };

  const handleViewBlueprint = (startup: Opportunity) => {
    setDetailStartup(startup);
    setNotice(null);
  };

  const handleApply = async (startup: Opportunity, role: string) => {
    if (!profileComplete && onRequireProfile) {
      onRequireProfile(() => {
        void handleApply(startup, role);
      });
      return;
    }
    if (startup.applied) return;

    setBusyBlueprintId(startup.id);
    setBusyAction("apply");
    setBusyRole(role);
    setNotice(null);
    try {
      const application = await applyToDiscoverBlueprint(startup.id, role);
      updateBlueprint(startup.id, {
        applied: true,
        applicationId: application.id,
        applicationStatus: application.status,
        appliedRole: application.role ?? role,
        appliedAt: application.applied_at,
        withdrawnAt: null,
      });
      setApplicationsCount((count) => count + 1);
      setNotice({ tone: "success", text: "Application submitted." });
    } catch (err) {
      if (err instanceof ApiError && err.code === "already_applied") {
        updateBlueprint(startup.id, { applied: true, applicationStatus: "applied" });
        setNotice({ tone: "success", text: "You already applied to this blueprint." });
        return;
      }
      setNotice({ tone: "error", text: getApiErrorMessage(err) });
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
      setBusyRole(null);
    }
  };

  const handleSave = async (startup: Opportunity) => {
    if (!profileComplete && onRequireProfile) {
      onRequireProfile(() => {
        void handleSave(startup);
      });
      return;
    }

    setBusyBlueprintId(startup.id);
    setBusyAction("save");
    setNotice(null);
    try {
      if (startup.saved) {
        await unsaveDiscoverBlueprint(startup.id);
        updateBlueprint(startup.id, { saved: false });
        setSavedItems((items) =>
          items.filter((item) => item.id !== startup.id && item.blueprint?.id !== startup.id)
        );
        setSavedCount((count) => Math.max(0, count - 1));
        setNotice({ tone: "success", text: "Blueprint removed from saved." });
      } else {
        await saveDiscoverBlueprint(startup.id);
        updateBlueprint(startup.id, { saved: true });
        setSavedCount((count) => count + 1);
        void loadSavedBlueprints();
        setNotice({ tone: "success", text: "Blueprint saved." });
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "already_saved") {
        updateBlueprint(startup.id, { saved: true });
        void loadSavedBlueprints();
        setNotice({ tone: "success", text: "Blueprint is already saved." });
        return;
      }
      setNotice({ tone: "error", text: getApiErrorMessage(err) });
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
    }
  };

  const handleWithdraw = async (startup: Opportunity) => {
    if (!startup.applicationId) return;

    setBusyBlueprintId(startup.id);
    setBusyAction("withdraw");
    setNotice(null);
    try {
      await withdrawDiscoverApplication(startup.applicationId);
      const withdrawnAt = new Date().toISOString();
      updateBlueprint(startup.id, {
        applied: false,
        applicationStatus: "withdrawn",
        withdrawnAt,
      });
      setApplicationsCount((count) => Math.max(0, count - 1));
      setNotice({ tone: "success", text: "Application withdrawn." });
    } catch (err) {
      setNotice({ tone: "error", text: getApiErrorMessage(err) });
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
    }
  };

  const getViabilityColor = (score: number) => {
    if (score >= 85) return "#2e8b6a";
    if (score >= 70) return "#b98319";
    return "#d94f4f";
  };

  if (detailStartup) {
    return (
      <div className={styles.discoverContainer}>
        <main className={styles.mainWrapper}>
          <DeveloperBlueprintDetail
            key={detailStartup.id}
            blueprint={detailStartup}
            getViabilityColor={getViabilityColor}
            busyAction={
              busyBlueprintId === detailStartup.id ? (busyAction ?? undefined) : undefined
            }
            busyRole={busyBlueprintId === detailStartup.id ? (busyRole ?? undefined) : undefined}
            onBack={() => setDetailStartup(null)}
            onApply={handleApply}
            onWithdraw={handleWithdraw}
            onSave={handleSave}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.discoverContainer}>
      <main className={styles.mainWrapper}>
        <Topbar
          title="Discover Opportunities"
          subtitle="Public startup blueprints ranked by your skills, profile, and build relevance."
          onNavigate={onNavigate}
        />

        <div className={styles.statsRow}>
          {discoverStats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>

        {notice && (
          <div className={`${styles.notice} ${notice.tone === "error" ? styles.noticeError : ""}`}>
            {notice.text}
          </div>
        )}

        <FeaturedMatchCard
          featuredMatch={featuredMatch}
          getViabilityColor={getViabilityColor}
          busyAction={featuredMatch?.id === busyBlueprintId ? (busyAction ?? undefined) : undefined}
          onSave={handleSave}
          onView={handleViewBlueprint}
        />

        <div className={styles.discoverTabs}>
          <button
            className={viewMode === "all" ? styles.discoverTabActive : ""}
            onClick={() => setViewMode("all")}
          >
            All Public
          </button>
          <button
            className={viewMode === "saved" ? styles.discoverTabActive : ""}
            onClick={() => {
              setViewMode("saved");
              void loadSavedBlueprints();
            }}
          >
            Saved ({savedCount})
          </button>
        </div>

        {viewMode === "all" && (
          <FilterBar
            filterOptions={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        )}

        {viewMode === "all" ? (
          <div className={styles.mainGrid}>
            <OpportunitiesList
              opportunities={opportunities}
              selectedStartup={null}
              loading={loading}
              error={error}
              getViabilityColor={getViabilityColor}
              busyBlueprintId={busyBlueprintId}
              busyAction={busyAction}
              onSelectStartup={handleSelectStartup}
              onViewBlueprint={handleViewBlueprint}
              onSave={handleSave}
              onResetFilters={handleClearFilters}
              onRetry={loadBlueprints}
            />
          </div>
        ) : (
          <SavedBlueprintsList
            items={savedItems}
            getViabilityColor={getViabilityColor}
            busyBlueprintId={busyBlueprintId}
            busyAction={busyAction}
            onViewBlueprint={handleViewBlueprint}
            onSave={handleSave}
          />
        )}

        <div className={styles.footer}>
          <span>Evolv - Discover Opportunities</span>
          <div className={styles.footerRight}>
            <div className={styles.greenDot}></div>
            <span>2026 Evolv. All rights reserved.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

function SavedBlueprintsList({
  items,
  getViabilityColor,
  busyBlueprintId,
  busyAction,
  onViewBlueprint,
  onSave,
}: {
  items: SavedDiscoverBlueprint[];
  getViabilityColor: (score: number) => string;
  busyBlueprintId: string | null;
  busyAction: "apply" | "save" | "withdraw" | null;
  onViewBlueprint: (opportunity: Opportunity) => void;
  onSave: (opportunity: Opportunity) => void;
}) {
  if (items.length === 0) {
    return (
      <div className={styles.statePanel}>
        <h4>No saved blueprints yet.</h4>
        <p>Use Save on any public blueprint and it will appear here.</p>
      </div>
    );
  }

  return (
    <section className={styles.savedList}>
      {items.map((item) => {
        if (!item.available || !item.blueprint) {
          return (
            <article key={item.id} className={styles.savedUnavailableCard}>
              <div>
                <strong>{item.name}</strong>
                <span>Unavailable</span>
              </div>
              <p>This saved blueprint is no longer public, so details are hidden.</p>
            </article>
          );
        }

        const blueprint = item.blueprint;
        const hasRoles = blueprint.roles.length > 0;
        return (
          <article key={item.id} className={styles.savedCard}>
            <div className={styles.savedCardMain}>
              <div className={styles.oppLogo}>{blueprint.logo}</div>
              <div>
                <strong>{blueprint.name}</strong>
                <span>
                  {blueprint.industry} - {blueprint.stage}
                </span>
                <p>{blueprint.summary}</p>
              </div>
            </div>
            <div className={styles.savedCardActions}>
              <span style={{ color: getViabilityColor(blueprint.viability) }}>
                {blueprint.matchScore}% match
              </span>
              <button className={styles.viewBtnSm} onClick={() => onViewBlueprint(blueprint)}>
                View
              </button>
              <button
                className={styles.saveBtnSm}
                onClick={() => onSave(blueprint)}
                disabled={busyBlueprintId === blueprint.id && busyAction === "save"}
              >
                Remove
              </button>
              <button
                className={`${devPrimaryBtn.button} ${styles.applyBtnSm}`}
                onClick={() => onViewBlueprint(blueprint)}
                disabled={!hasRoles || blueprint.applied}
              >
                {blueprint.applied ? <CheckCircle2 size={14} /> : <Layers3 size={14} />}
                {blueprint.applied ? "Applied" : hasRoles ? "Choose role" : "No roles yet"}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default Discover;
