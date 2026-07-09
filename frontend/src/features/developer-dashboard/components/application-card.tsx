import styles from "./application-card.module.css";

type ApplicationCardData = {
  name: string;
  iconClass?: string;
  role: string;
  date: string;
  status: string;
};

export const ApplicationCard = ({ data }: { data: ApplicationCardData }) => {
  const { name, iconClass, role, date, status } = data;
  const logo =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "S";

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      Interview: "interview",
      Pending: "pending",
      Accepted: "accepted",
      Declined: "declined",
    };
    return map[status] || "";
  };

  return (
    <div className={styles.appItem}>
      <div
        className={`${styles.icon} ${iconClass ? styles[iconClass] : ""}`}
        style={{ fontWeight: "bold", fontSize: "0.8rem" }}
      >
        {logo}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.role}>
          {role} · <span className={styles.date}>{date}</span>
        </div>
      </div>
      <span className={`${styles.status} ${styles[getStatusClass(status)]}`}>{status}</span>
      <span className={styles.chevron}>
        <i className="fas fa-chevron-right"></i>
      </span>
    </div>
  );
};
