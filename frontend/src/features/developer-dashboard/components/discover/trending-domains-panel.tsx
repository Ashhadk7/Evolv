import styles from "@/features/developer-dashboard/components/discover.module.css";
import { trendingDomains } from "@/features/developer-dashboard/data/developer-data";

export function TrendingDomainsPanel() {
  return (
    <div className={styles.trendingBox}>
      <div className={styles.trendingTitle}>
        <i className="fas fa-chart-line" style={{ color: "#5BC8A0" }}></i> Trending Domains
      </div>
      {trendingDomains.map((d) => (
        <div key={d.id} className={styles.trendingItem}>
          <div className={styles.trendingIcon}>{d.name[0]}</div>
          <div className={styles.trendingInfo}>
            <div className={styles.trendingName}>{d.name}</div>
            <div className={styles.trendingBar}>
              <div className={styles.trendingFill} style={{ width: `${d.demand}%` }}></div>
            </div>
          </div>
          <div className={styles.trendingGrowth}>↑{d.growth}%</div>
        </div>
      ))}
    </div>
  );
}
