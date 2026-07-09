import { useState } from "react";

import { Topbar } from "@/features/developer-dashboard/components/topbar";
import { StatCard } from "@/features/developer-dashboard/components/stat-card";
import styles from "@/features/developer-dashboard/components/applications.module.css";
import {
  applicationsData,
  appStats,
  applicationsStatusConfig as statusConfig,
  applicationsPipelineStages as pipelineStages,
  applicationsLogoColors as logoColors,
} from "@/features/developer-dashboard/data/developer-data";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";

const Applications = ({ onNavigate }: DeveloperPageProps) => {
  const [selectedApp, setSelectedApp] = useState(applicationsData[0]);
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered =
    filterStatus === "All"
      ? applicationsData
      : applicationsData.filter((a) => a.status === filterStatus);

  return (
    <div className={styles.container}>
      <main className={styles.mainWrapper}>
        <Topbar
          title="My Applications"
          subtitle="Track and manage your startup application pipeline."
          onNavigate={onNavigate}
        />

        {/* KPI Cards */}
        <div className={styles.kpiRow}>
          {appStats.map((s) => (
            <StatCard key={s.id} {...s} />
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>
            <i className="fas fa-filter"></i> Status:
          </span>
          {["All", ...pipelineStages].map((s) => (
            <button
              key={s}
              className={`${styles.filterChip} ${filterStatus === s ? styles.filterActive : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div className={styles.mainGrid}>
          {/* Left: Applications Table */}
          <div className={styles.leftCol}>
            <div className={styles.tableWrap}>
              <div className={styles.tableHeader}>
                <span>Startup</span>
                <span>Role</span>
                <span>Match</span>
                <span>Applied</span>
                <span>Status</span>
                <span>Next Action</span>
              </div>
              {filtered.map((app) => {
                const cfg = statusConfig[app.status] || {};
                return (
                  <div
                    key={app.id}
                    className={`${styles.tableRow} ${selectedApp?.id === app.id ? styles.rowSelected : ""}`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className={styles.startupCell}>
                      <span
                        className={styles.startupLogo}
                        style={{
                          background: logoColors[app.startup]?.bg || "#F7F6F3",
                          color: logoColors[app.startup]?.color || "#1B1B1B",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        {app.logo}
                      </span>
                      <div>
                        <div className={styles.startupName}>{app.startup}</div>
                        <div className={styles.startupIndustry}>{app.industry}</div>
                      </div>
                    </div>
                    <div className={styles.roleCell}>{app.role}</div>
                    <div className={styles.matchCell}>
                      <span className={styles.matchBadge}>{app.matchScore}%</span>
                    </div>
                    <div className={styles.dateCell}>{app.appliedDate}</div>
                    <div className={styles.statusCell}>
                      <span
                        className={styles.statusBadge}
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        <i className={`fas fa-${cfg.icon}`}></i> {app.status}
                      </span>
                    </div>
                    <div className={styles.nextCell}>{app.nextAction}</div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className={styles.emptyRow}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <p>No applications found for this filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Application Detail Panel */}
          {selectedApp && (
            <div className={styles.detailPanel}>
              {/* Header */}
              <div className={styles.dpHeader}>
                <div
                  className={styles.dpLogo}
                  style={{
                    background: logoColors[selectedApp.startup]?.bg || "#F7F6F3",
                    color: logoColors[selectedApp.startup]?.color || "#1B1B1B",
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                  }}
                >
                  {selectedApp.logo}
                </div>
                <div className={styles.dpInfo}>
                  <div className={styles.dpStartup}>{selectedApp.startup}</div>
                  <div className={styles.dpRole}>{selectedApp.role}</div>
                  <div className={styles.dpMeta}>
                    <span>
                      <i className="fas fa-industry"></i> {selectedApp.industry}
                    </span>
                    <span>
                      <i className="fas fa-seedling"></i> {selectedApp.stage}
                    </span>
                  </div>
                </div>
                <div className={styles.dpMatch}>{selectedApp.matchScore}%</div>
              </div>

              {/* Status Banner */}
              <div
                className={styles.statusBanner}
                style={{
                  background: statusConfig[selectedApp.status]?.bg,
                  borderColor: statusConfig[selectedApp.status]?.color,
                }}
              >
                <i
                  className={`fas fa-${statusConfig[selectedApp.status]?.icon}`}
                  style={{ color: statusConfig[selectedApp.status]?.color }}
                ></i>
                <span
                  style={{
                    color: statusConfig[selectedApp.status]?.color,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  {selectedApp.status}
                </span>
                <span className={styles.nextActionText}>— {selectedApp.nextAction}</span>
              </div>

              {/* Description */}
              <div className={styles.dpSection}>
                <div className={styles.dpSectionTitle}>
                  <i className="fas fa-align-left"></i> Description
                </div>
                <p className={styles.dpDesc}>{selectedApp.description}</p>
              </div>

              {/* Why Matched */}
              <div className={styles.dpSection}>
                <div className={styles.dpSectionTitle}>
                  <i className="fas fa-robot"></i> Why Matched
                </div>
                <div className={styles.whyList}>
                  {selectedApp.whyMatched.map((w, i) => (
                    <div key={i} className={styles.whyItem}>
                      <i className="fas fa-check-circle"></i> {w}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className={styles.dpSection}>
                <div className={styles.dpSectionTitle}>
                  <i className="fas fa-code"></i> Tech Stack
                </div>
                <div className={styles.techTags}>
                  {selectedApp.techStack.map((t, i) => (
                    <span key={i} className={styles.techTag}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Founder */}
              <div className={styles.dpSection}>
                <div className={styles.dpSectionTitle}>
                  <i className="fas fa-user"></i> Founder
                </div>
                <div className={styles.founderCard}>
                  <div className={styles.founderAvatar}>{selectedApp.founder[0]}</div>
                  <div>
                    <div className={styles.founderName}>{selectedApp.founder}</div>
                    <div className={styles.founderRole}>{selectedApp.founderRole}</div>
                  </div>
                  <button className={styles.msgBtn} onClick={() => onNavigate("inbox")}>
                    <i className="fas fa-comment" /> Message
                  </button>
                </div>
              </div>

              {/* Upcoming Interviews */}
              {selectedApp.upcomingInterviews.length > 0 && (
                <div className={styles.dpSection}>
                  <div className={styles.dpSectionTitle}>
                    <i className="fas fa-calendar"></i> Upcoming Interviews
                  </div>
                  {selectedApp.upcomingInterviews.map((iv, i) => (
                    <div key={i} className={styles.interviewCard}>
                      <div className={styles.ivDate}>{iv.date}</div>
                      <div className={styles.ivTime}>{iv.time}</div>
                      <div className={styles.ivType}>{iv.type}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Timeline */}
              <div className={styles.dpSection}>
                <div className={styles.dpSectionTitle}>
                  <i className="fas fa-history"></i> Activity Timeline
                </div>
                <div className={styles.timeline}>
                  {selectedApp.timeline.map((ev, i) => (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineLeft}>
                        <div
                          className={styles.timelineDot}
                          style={{ background: ev.color, borderColor: ev.color }}
                        >
                          <i
                            className={`fas fa-${ev.icon}`}
                            style={{ color: "#fff", fontSize: "0.45rem" }}
                          ></i>
                        </div>
                        {i < selectedApp.timeline.length - 1 && (
                          <div className={styles.timelineLine}></div>
                        )}
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineEvent}>{ev.event}</div>
                        <div className={styles.timelineDate}>{ev.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span>Evolv · Applications</span>
          <div className={styles.footerRight}>
            <div className={styles.greenDot}></div>
            <span>© 2025 Evolv. All rights reserved.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Applications;
