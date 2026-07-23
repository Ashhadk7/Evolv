import { useEffect, useMemo, useState } from "react";

import { Topbar } from "@/features/developer-dashboard/components/topbar";
import { StatCard } from "@/features/developer-dashboard/components/stat-card";
import styles from "@/features/developer-dashboard/components/applications.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";
import {
  applyToDiscoverBlueprint,
  listDiscoverBlueprints,
  saveDiscoverBlueprint,
  unsaveDiscoverBlueprint,
  withdrawDiscoverApplication,
  type ApplicationStatus,
  type DiscoverBlueprint,
} from "@/features/developer-dashboard/lib/discover-api";
import { getApiErrorMessage } from "@/lib/api";
import { DeveloperBlueprintDetail } from "./discover/developer-blueprint-detail";

const APPLIED_STATUS = {
  color: "#5BC8A0",
  bg: "rgba(91, 200, 160, 0.1)",
  icon: "paper-plane",
};

const STATUS_STYLES: Record<ApplicationStatus, { color: string; bg: string; icon: string }> = {
  applied: APPLIED_STATUS,
  withdrawn: {
    color: "#a84f3f",
    bg: "#fff6f3",
    icon: "circle-xmark",
  },
};

type StatusFilter = "all" | ApplicationStatus;

function formatDate(value: string | null) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function primaryRole(app: DiscoverBlueprint) {
  return app.roles[0]?.role || "Role to be discussed";
}

function applicationRole(app: DiscoverBlueprint) {
  return app.appliedRole || primaryRole(app);
}

function applicationStatus(app: DiscoverBlueprint): ApplicationStatus {
  return app.applicationStatus === "withdrawn" ? "withdrawn" : "applied";
}

function isApplicationRecord(app: DiscoverBlueprint) {
  return app.applied || app.applicationStatus === "applied" || app.applicationStatus === "withdrawn";
}

function nextStep(app: DiscoverBlueprint) {
  if (applicationStatus(app) === "withdrawn") return "Withdrawn - apply again from blueprint";
  return app.appliedAt ? "Awaiting founder response" : "Application submitted";
}

const Applications = ({ onNavigate }: DeveloperPageProps) => {
  const [applications, setApplications] = useState<DiscoverBlueprint[]>([]);
  const [detailApp, setDetailApp] = useState<DiscoverBlueprint | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyAction, setBusyAction] = useState<"apply" | "save" | "withdraw" | null>(null);
  const [busyBlueprintId, setBusyBlueprintId] = useState<string | null>(null);
  const [busyRole, setBusyRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setLoading(true);
      setError("");
      try {
        const response = await listDiscoverBlueprints();
        if (cancelled) return;
        setApplications(response.items.filter(isApplicationRecord));
      } catch (err) {
        if (cancelled) return;
        setApplications([]);
        setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadApplications();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateApplication = (id: string, changes: Partial<DiscoverBlueprint>) => {
    const applyChanges = (item: DiscoverBlueprint) =>
      item.id === id ? { ...item, ...changes } : item;
    setApplications((items) => items.map(applyChanges));
    setDetailApp((current) => (current?.id === id ? applyChanges(current) : current));
  };

  const handleSave = async (app: DiscoverBlueprint) => {
    setBusyBlueprintId(app.id);
    setBusyAction("save");
    setError("");
    try {
      if (app.saved) {
        await unsaveDiscoverBlueprint(app.id);
        updateApplication(app.id, { saved: false });
      } else {
        await saveDiscoverBlueprint(app.id);
        updateApplication(app.id, { saved: true });
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
    }
  };

  const handleWithdraw = async (app: DiscoverBlueprint) => {
    if (!app.applicationId) return;

    setBusyBlueprintId(app.id);
    setBusyAction("withdraw");
    setError("");
    try {
      await withdrawDiscoverApplication(app.applicationId);
      updateApplication(app.id, {
        applied: false,
        applicationStatus: "withdrawn",
        withdrawnAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
    }
  };

  const handleApply = async (app: DiscoverBlueprint, role: string) => {
    if (app.applied) return;

    setBusyBlueprintId(app.id);
    setBusyAction("apply");
    setBusyRole(role);
    setError("");
    try {
      const application = await applyToDiscoverBlueprint(app.id, role);
      updateApplication(app.id, {
        applied: true,
        applicationId: application.id,
        applicationStatus: application.status,
        appliedRole: application.role ?? role,
        appliedAt: application.applied_at,
        withdrawnAt: null,
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyBlueprintId(null);
      setBusyAction(null);
      setBusyRole(null);
    }
  };

  const getViabilityColor = (score: number) => {
    if (score >= 85) return "#2e8b6a";
    if (score >= 70) return "#b98319";
    return "#d94f4f";
  };

  const statusCounts = useMemo(
    () =>
      applications.reduce(
        (counts, app) => {
          counts[applicationStatus(app)] += 1;
          return counts;
        },
        { applied: 0, withdrawn: 0 } satisfies Record<ApplicationStatus, number>
      ),
    [applications]
  );

  const displayedApplications = useMemo(
    () =>
      statusFilter === "all"
        ? applications
        : applications.filter((app) => applicationStatus(app) === statusFilter),
    [applications, statusFilter]
  );

  const stats = useMemo(
    () => [
      {
        id: 1,
        label: "Applications",
        value: applications.length,
      },
      {
        id: 2,
        label: "Applied",
        value: statusCounts.applied,
      },
      {
        id: 3,
        label: "Withdrawn",
        value: statusCounts.withdrawn,
      },
      {
        id: 4,
        label: "Average Match",
        value: applications.length
          ? `${Math.round(
              applications.reduce((total, app) => total + app.matchScore, 0) / applications.length
            )}%`
          : "0%",
      },
    ],
    [applications, statusCounts.applied, statusCounts.withdrawn]
  );

  if (detailApp) {
    return (
      <div className={styles.container}>
        <main className={styles.mainWrapper}>
          <DeveloperBlueprintDetail
            key={detailApp.id}
            blueprint={detailApp}
            getViabilityColor={getViabilityColor}
            busyAction={busyBlueprintId === detailApp.id ? (busyAction ?? undefined) : undefined}
            busyRole={busyBlueprintId === detailApp.id ? (busyRole ?? undefined) : undefined}
            backLabel="Back to Applications"
            onBack={() => setDetailApp(null)}
            onApply={handleApply}
            onWithdraw={handleWithdraw}
            onSave={handleSave}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.mainWrapper}>
        <Topbar
          title="My Applications"
          subtitle="Track the public blueprints you have applied to."
          onNavigate={onNavigate}
        />

        <div className={styles.kpiRow}>
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>

        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>
            <i className="fas fa-filter" /> Status
          </span>
          {[
            { value: "all", label: `All (${applications.length})` },
            { value: "applied", label: `Applied (${statusCounts.applied})` },
            { value: "withdrawn", label: `Withdrawn (${statusCounts.withdrawn})` },
          ].map((filter) => (
            <button
              key={filter.value}
              className={`${styles.filterChip} ${
                statusFilter === filter.value ? styles.filterActive : ""
              }`}
              onClick={() => setStatusFilter(filter.value as StatusFilter)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className={`${styles.mainGrid} ${styles.mainGridFull}`}>
          <div className={styles.leftCol}>
            <div className={styles.tableWrap}>
              <div className={styles.tableHeader}>
                <span>Blueprint</span>
                <span>Role</span>
                <span>Match</span>
                <span>Applied</span>
                <span>Status</span>
                <span>Next Action</span>
              </div>

              {displayedApplications.map((app) => {
                const status = applicationStatus(app);
                const statusStyle = STATUS_STYLES[status];
                return (
                  <div
                    key={app.id}
                    className={`${styles.tableRow} ${
                      status === "withdrawn" ? styles.withdrawnRow : ""
                    }`}
                    onClick={() => setDetailApp(app)}
                  >
                    <div className={styles.startupCell}>
                      <span className={styles.startupLogo}>{app.logo}</span>
                      <div>
                        <div className={styles.startupName}>{app.name}</div>
                        <div className={styles.startupIndustry}>{app.industry}</div>
                      </div>
                    </div>
                    <div className={styles.roleCell}>{applicationRole(app)}</div>
                    <div className={styles.matchCell}>
                      <span className={styles.matchBadge}>{app.matchScore}%</span>
                    </div>
                    <div className={styles.dateCell}>{formatDate(app.appliedAt)}</div>
                    <div className={styles.statusCell}>
                      <span
                        className={styles.statusBadge}
                        style={{ color: statusStyle.color, background: statusStyle.bg }}
                      >
                        <i className={`fas fa-${statusStyle.icon}`} />{" "}
                        {status === "withdrawn" ? "Withdrawn" : "Applied"}
                      </span>
                    </div>
                    <div className={styles.nextCell}>{nextStep(app)}</div>
                  </div>
                );
              })}

              {(loading || error || displayedApplications.length === 0) && (
                <div className={styles.emptyRow}>
                  <div className={styles.emptyIcon}>
                    <i className={error ? "fas fa-triangle-exclamation" : "fas fa-clipboard-list"} />
                  </div>
                  <p>
                    {loading
                      ? "Loading applications..."
                      : error ||
                        (applications.length === 0
                          ? "Apply to a public blueprint from Discover to start your pipeline."
                          : statusFilter === "all"
                            ? "No applications match this view."
                            : `No ${statusFilter} applications in this view.`)}
                  </p>
                  {!loading && !error && applications.length === 0 && (
                    <button
                      className={`${devPrimaryBtn.button} ${styles.discoverCta}`}
                      onClick={() => onNavigate("discover")}
                    >
                      Open Discover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <span>Evolv - Applications</span>
          <div className={styles.footerRight}>
            <div className={styles.greenDot}></div>
            <span>(c) 2026 Evolv. All rights reserved.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Applications;
