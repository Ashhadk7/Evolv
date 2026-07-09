import type { ActionModalData } from "@/features/developer-dashboard/components/action-modal";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import bannerStyles from "@/features/developer-dashboard/components/ai-match-banner.module.css";
import {
  MODALS,
  type MatchData,
} from "@/features/developer-dashboard/data/developer-dashboard-modals";

type MatchWithModalProps = {
  data: MatchData;
  openModal: (cfg: ActionModalData) => void;
};

export const FeaturedMatchWithModal = ({ data, openModal }: MatchWithModalProps) => {
  const { name, matchScore, techStack } = data;
  return (
    <div className={bannerStyles.container}>
      <div className={bannerStyles.left}>
        <div className={bannerStyles.iconBadge}>
          <i className="fas fa-bolt"></i>
        </div>
        <div className={bannerStyles.content}>
          <div className={bannerStyles.header}>
            <span className={bannerStyles.label}>AI Match Briefing</span>
            <span className={bannerStyles.badge}>OPPORTUNITY</span>
          </div>
          <p className={bannerStyles.text}>
            <strong>High-viability match detected</strong> &mdash; <strong>{name}</strong> matches{" "}
            <strong>{matchScore}%</strong> with your profile. They are looking for expertise in{" "}
            {techStack.slice(0, 3).join(", ")}.
          </p>
          <div className={bannerStyles.pills}>
            <span className={`${bannerStyles.pill} ${bannerStyles.scorePill}`}>
              Match rate: {matchScore}%
            </span>
            <span className={bannerStyles.pill}>HealthTech &middot; Series A ready</span>
            <span className={bannerStyles.pill}>Updated 2h ago</span>
          </div>
        </div>
      </div>
      <button
        className={`${devPrimaryBtn.button} ${bannerStyles.btn}`}
        onClick={() => openModal(MODALS.reviewMatch(data))}
      >
        Review Match <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
};
