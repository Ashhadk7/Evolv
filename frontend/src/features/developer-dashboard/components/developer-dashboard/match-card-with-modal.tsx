import type { ActionModalData } from "@/features/developer-dashboard/components/action-modal";
import matchCardStyles from "@/features/developer-dashboard/components/match-card.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import {
  MODALS,
  type MatchData,
} from "@/features/developer-dashboard/data/developer-dashboard-modals";

type MatchWithModalProps = {
  data: MatchData;
  openModal: (cfg: ActionModalData) => void;
};

export const MatchCardWithModal = ({ data, openModal }: MatchWithModalProps) => {
  const {
    name,
    icon,
    matchScore,
    description,
    techStack,
    industry,
    stage,
    budget,
    teamSize,
    iconClass,
  } = data;
  const logo =
    name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "S";
  return (
    <div className={matchCardStyles.matchCard}>
      <div className={matchCardStyles.top}>
        <div className={matchCardStyles.left}>
          <div
            className={`${matchCardStyles.icon} ${iconClass ? matchCardStyles[iconClass] : ""}`}
            style={{ fontWeight: "bold" }}
          >
            {logo}
          </div>
          <span className={matchCardStyles.name}>{name}</span>
        </div>
        <span className={matchCardStyles.score}>{matchScore}%</span>
      </div>
      <div className={matchCardStyles.desc}>{description}</div>
      <div className={matchCardStyles.tags}>
        {techStack.map((tech, idx) => (
          <span key={idx} className={matchCardStyles.techTag}>
            {tech}
          </span>
        ))}
      </div>
      <div className={matchCardStyles.meta}>
        <span>
          <i className={`fas fa-${icon}`}></i> {industry}
        </span>
        <span>
          <i className="fas fa-seedling"></i> {stage}
        </span>
        <span>
          <i className="fas fa-dollar-sign"></i> {budget}
        </span>
        <span>
          <i className="fas fa-users"></i> {teamSize}
        </span>
      </div>
      <div className={matchCardStyles.actions}>
        <button
          className={`${devPrimaryBtn.button} ${matchCardStyles.btn} ${matchCardStyles.primary}`}
          onClick={() => openModal(MODALS.reviewMatch(data))}
        >
          <i className="fas fa-eye"></i> Review
        </button>
        <button className={matchCardStyles.btn} onClick={() => openModal(MODALS.saveMatch(data))}>
          <i className="fas fa-bookmark"></i> Save
        </button>
      </div>
    </div>
  );
};
