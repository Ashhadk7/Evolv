import { useEffect, useMemo, useState } from "react";

import { StatCard } from "@/features/developer-dashboard/components/stat-card";
import dashboardStyles from "@/features/developer-dashboard/components/developer-dashboard.module.css";
// import type { DeveloperPageProps } from "@/features/developer-dashboard/types";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import {
  listDiscoverBlueprints,
  type DiscoverBlueprint,
  type DiscoverResponse,
} from "@/features/developer-dashboard/lib/discover-api";
import { getApiErrorMessage } from "@/lib/api";
// import { TopbarWithModal } from "./topbar-with-modal";

function formatDate(value: string | null) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function primaryRole(blueprint: DiscoverBlueprint) {
  return blueprint.appliedRole || blueprint.roles[0]?.role || "Role to be discussed";
}
import {
  recentMatches,
  applications,
  projects,
} from "@/features/developer-dashboard/data/dashboard-data";
import { MODALS } from "@/features/developer-dashboard/data/developer-dashboard-modals";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";
import { useDeveloperDashboardStats } from "@/features/developer-dashboard/use-developer-dashboard-stats";
import { TopbarWithModal } from "./topbar-with-modal";
import { FeaturedMatchWithModal } from "./featured-match-with-modal";
import { MatchCardWithModal } from "./match-card-with-modal";
import { featuredMatch } from "@/features/developer-dashboard/data/discover-data";

const DeveloperDashboard = ({ onNavigate }: DeveloperPageProps) => {
  const profile = useDeveloperDashboardStore((state) => state.profile);
  const greetingName = profile.firstName || "";
  const [overview, setOverview] = useState<DiscoverResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Real KPI data from the backend (with graceful stub fallback)
  const { kpis, loading: statsLoading } = useDeveloperDashboardStats();

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setError("");
      try {
        const response = await listDiscoverBlueprints();
        if (!cancelled) setOverview(response);
      } catch (err) {
        if (!cancelled) {
          setOverview(null);
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  const topMatches = useMemo(() => overview?.items.slice(0, 3) ?? [], [overview]);
  const applied = useMemo(
    () => overview?.items.filter((item) => item.applied).slice(0, 3) ?? [],
    [overview]
  );
  const stats = useMemo(
    () => [
      { id: 1, label: "Public Blueprints", value: overview?.total ?? 0 },
      { id: 2, label: "High Matches", value: overview?.highMatchCount ?? 0 },
      { id: 3, label: "Saved", value: overview?.savedCount ?? 0 },
      { id: 4, label: "Applications", value: overview?.applicationsCount ?? 0 },
    ],
    [overview]
  );

  const statusText = loading ? "Loading dashboard..." : error;

  return (
    <div className={dashboardStyles.dashboardContainer} suppressHydrationWarning>
      <main className={dashboardStyles.mainWrapper}>
        <TopbarWithModal
          title={greetingName ? `Hi, ${greetingName}` : "Welcome back"}
          subtitle="Review public blueprints, saved opportunities, and submitted applications."
          profile={{
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl,
          }}
          onNavigate={onNavigate}
        />

        <div className={dashboardStyles.kpiRow}>
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>

        <div className={dashboardStyles.row3}>
          <div className={dashboardStyles.sectionHeader}>
            <h3>
              <i className="fas fa-star" style={{ color: "#C4973A" }} /> Top Blueprint Matches
            </h3>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("discover");
              }}
            >
              View discover
            </a>
          </div>

          <div className={dashboardStyles.matchesGrid}>
            {topMatches.map((match) => (
              <button
                key={match.id}
                type="button"
                className={dashboardStyles.matchItem}
                onClick={() => onNavigate("discover")}
              >
                <div className={dashboardStyles.matchTop}>
                  <span className={dashboardStyles.matchLogo}>{match.logo}</span>
                  <span className={dashboardStyles.matchScore}>{match.matchScore}%</span>
                </div>
                <strong>{match.name}</strong>
                <span>{match.industry}</span>
                <p>{match.summary}</p>
                <div className={dashboardStyles.tagRow}>
                  {match.techStack.slice(0, 3).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </button>
            ))}

            {(statusText || topMatches.length === 0) && (
              <div className={dashboardStyles.emptyPanel}>
                {statusText || "Complete your profile to get ranked public blueprint matches."}
              </div>
            )}
          </div>
        </div>

        <div className={dashboardStyles.row4}>
          <div className={dashboardStyles.panel}>
            <div className={dashboardStyles.panelHeader}>
              <span className={dashboardStyles.panelTitle}>
                <i className="fas fa-paper-plane" /> Applications
              </span>
              <a
                href="#"
                className={dashboardStyles.panelLink}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("applications");
                }}
              >
                View all
              </a>
            </div>

            <div className={dashboardStyles.listStack}>
              {applied.map((application) => (
                <button
                  key={application.id}
                  type="button"
                  className={dashboardStyles.listItem}
                  onClick={() => onNavigate("applications")}
                >
                  <div>
                    <strong>{application.name}</strong>
                    <span>{primaryRole(application)}</span>
                  </div>
                  <small>{formatDate(application.appliedAt)}</small>
                </button>
              ))}
              {!loading && !error && applied.length === 0 && (
                <p className={dashboardStyles.panelEmpty}>
                  Applied blueprints will appear here after you apply from Discover.
                </p>
              )}
              {error && <p className={dashboardStyles.panelEmpty}>{error}</p>}
            </div>
          </div>

          <div className={dashboardStyles.panel}>
            <div className={dashboardStyles.panelHeader}>
              <span className={dashboardStyles.panelTitle}>
                <i className="fas fa-calendar-check" /> Active Projects
              </span>
            </div>
            <p className={dashboardStyles.panelEmpty}>
              Active projects will appear here once an application moves forward.
            </p>
          </div>
        </div>

        <div className={dashboardStyles.footer}>
          <span>Evolv - Developer Dashboard</span>
          <div className={dashboardStyles.footerRight}>
            <div className={dashboardStyles.greenDot}></div>
            <span>(c) 2026 Evolv. All rights reserved.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeveloperDashboard;
