import { useState, useCallback, useEffect } from "react";

import { StatCard } from "@/features/developer-dashboard/components/stat-card";
import {
  ActionModal,
  type ActionModalData,
} from "@/features/developer-dashboard/components/action-modal";
import { ProjectCard } from "@/features/developer-dashboard/components/project-card";
import { ApplicationCard } from "@/features/developer-dashboard/components/application-card";
import dashboardStyles from "@/features/developer-dashboard/components/developer-dashboard.module.css";
import {
  statsData,
  featuredMatch,
  recentMatches,
  applications,
  projects,
} from "@/features/developer-dashboard/data/developer-data";
import { MODALS } from "@/features/developer-dashboard/data/developer-dashboard-modals";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";
import { TopbarWithModal } from "./topbar-with-modal";
import { FeaturedMatchWithModal } from "./featured-match-with-modal";
import { MatchCardWithModal } from "./match-card-with-modal";

const DeveloperDashboard = ({ onNavigate }: DeveloperPageProps) => {
  const [modal, setModal] = useState<ActionModalData | null>(null);
  const [userName, setUserName] = useState("Sarah");
  const openModal = useCallback((cfg: ActionModalData) => setModal(cfg), []);
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("evolv_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user.firstName) {
          queueMicrotask(() => setUserName(user.firstName));
        }
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  return (
    <div className={dashboardStyles.dashboardContainer} suppressHydrationWarning>
      <main className={dashboardStyles.mainWrapper}>
        <TopbarWithModal
          title={`Hi, ${userName}`}
          subtitle="Here's your developer dashboard overview."
          onNavigate={onNavigate}
        />

        {/* Compact Horizontal AI Match Banner */}
        <FeaturedMatchWithModal data={featuredMatch} openModal={openModal} />

        {/* Row 1: KPI Cards */}
        <div className={dashboardStyles.kpiRow}>
          {statsData.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>

        {/* Row 3: Recent Top Matches (Full Width) */}
        <div className={dashboardStyles.row3}>
          <div className={dashboardStyles.sectionHeader}>
            <h3>
              <i className="fas fa-star" style={{ color: "#C4973A" }}></i> Recent Top Matches
            </h3>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openModal(MODALS.viewAllMatches);
              }}
            >
              View all matches →
            </a>
          </div>
          <div className={dashboardStyles.matchesGrid}>
            {recentMatches.map((match) => (
              <MatchCardWithModal key={match.id} data={match} openModal={openModal} />
            ))}
          </div>
        </div>

        {/* Row 4: Applications | Active Projects */}
        <div className={dashboardStyles.row4}>
          <div className={dashboardStyles.panel}>
            <div className={dashboardStyles.panelHeader}>
              <span className={dashboardStyles.panelTitle}>
                <i className="fas fa-paper-plane"></i> Applications
              </span>
              <a
                href="#"
                className={dashboardStyles.panelLink}
                onClick={(e) => {
                  e.preventDefault();
                  openModal(MODALS.viewAllApplications);
                }}
              >
                View all →
              </a>
            </div>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{ cursor: "pointer" }}
                onClick={() => openModal(MODALS.applicationItem(app))}
              >
                <ApplicationCard data={app} />
              </div>
            ))}
          </div>

          <div className={dashboardStyles.panel}>
            <div className={dashboardStyles.panelHeader}>
              <span className={dashboardStyles.panelTitle}>
                <i className="fas fa-calendar-check"></i> Active Projects
              </span>
              <a
                href="#"
                className={dashboardStyles.panelLink}
                onClick={(e) => {
                  e.preventDefault();
                  openModal(MODALS.viewAllProjects);
                }}
              >
                View all →
              </a>
            </div>
            {projects.map((project) => (
              <ProjectCard key={project.id} data={project} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={dashboardStyles.footer}>
          <span>Evolv · Developer Dashboard</span>
          <div className={dashboardStyles.footerRight}>
            <div className={dashboardStyles.greenDot}></div>
            <span>© 2025 Evolv. All rights reserved.</span>
          </div>
        </div>
      </main>

      <ActionModal modal={modal} onClose={closeModal} />
    </div>
  );
};

export default DeveloperDashboard;
