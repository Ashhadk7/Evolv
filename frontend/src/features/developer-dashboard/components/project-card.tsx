import styles from "./project-card.module.css";

type ProjectCardData = {
  name: string;
  iconClass?: string;
  role: string;
  progress: number;
  progressColor?: string;
  teamMembers: string[];
  extraMembers?: number;
  stage: string;
  deadline: string;
  hoursLogged: string;
};

export const ProjectCard = ({ data }: { data: ProjectCardData }) => {
  const {
    name,
    iconClass,
    role,
    progress,
    progressColor,
    teamMembers,
    extraMembers,
    stage,
    deadline,
    hoursLogged,
  } = data;
  const logo =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "S";
  return (
    <div className={styles.projItem}>
      <div className={styles.top}>
        <div
          className={`${styles.icon} ${iconClass ? styles[iconClass] : ""}`}
          style={{ fontWeight: "bold", fontSize: "0.8rem" }}
        >
          {logo}
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          <div className={styles.role}>{role}</div>
        </div>
        <div className={styles.right}>
          <div className={styles.pct}>{progress}%</div>
        </div>
      </div>
      <div className={styles.progress}>
        <div
          className={`${styles.fill} ${progressColor ? styles[progressColor] : ""}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className={styles.avatars}>
        {teamMembers.map((member, idx) => (
          <div key={idx} className={styles.avatar}>
            {member}
          </div>
        ))}
        {!!extraMembers && extraMembers > 0 && (
          <div className={`${styles.avatar} ${styles.more}`}>+{extraMembers}</div>
        )}
      </div>
      <div className={styles.metaRow}>
        <span>Stage</span>
        <span className={styles.stageBadge}>{stage}</span>
        <span>Deadline</span>
        <span className={styles.deadlineValue}>{deadline}</span>
      </div>
      <div className={styles.metaRow}>
        <span>Hours Logged</span>
        <span className={styles.hoursValue}>{hoursLogged}</span>
      </div>
    </div>
  );
};
