import { ListChecks } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import type { BlueprintContent } from "@/features/blueprints/blueprint-content";

export function RoadmapSection({ content }: { content: BlueprintContent }) {
  if (content.phases.length === 0) return null;

  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <span className={styles.panelIcon}>
          <ListChecks size={21} aria-hidden="true" />
        </span>
        <div>
          <p className={styles.panelKicker}>Delivery</p>
          <h2 className={styles.panelTitle}>Development roadmap</h2>
        </div>
      </header>
      <ol className={styles.timeline}>
        {content.phases.map((phase, index) => (
          <li key={phase.name} className={styles.timelineItem}>
            <span className={styles.timelineDot} aria-hidden="true" />
            <div className={styles.timelineBody}>
              <p className={styles.timelineMeta}>
                <span>Phase {index + 1}</span>
                <span
                  className={
                    phase.status === "In Progress" ? styles.phaseTagActive : styles.phaseTag
                  }
                >
                  {phase.status}
                </span>
                <span>
                  {phase.weeks} {phase.weeks === 1 ? "week" : "weeks"}
                </span>
              </p>
              <p className={styles.timelineTitle}>{phase.name}</p>
              {phase.deliverables.length > 0 && (
                <p className={styles.timelineDesc}>{phase.deliverables.join(" · ")}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
