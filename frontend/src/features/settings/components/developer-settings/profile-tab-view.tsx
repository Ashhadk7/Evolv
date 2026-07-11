"use client";

import { RatingStars } from "@/components/shared/rating-stars";
import { formatFounderEducation } from "@/features/founder-dashboard/profile-utils";
import {
  getExternalUrl,
  formatProfileLink,
} from "@/features/settings/data/developer-settings-data";
import type {
  DeveloperEducation,
  DeveloperCertification,
  DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";
import type { DeveloperSettingsProfile } from "@/features/settings/data/developer-settings-data";
import styles from "./developer-settings.module.css";

export function ProfileTabView({
  profile,
  displayName,
  displayInitials,
  displayRole,
  displayPhoto,
  displayLocation,
  profileTags,
  ratingValue,
  reviewCount,
  profileLinks,
  skillEntries,
  educationRows,
  hasEducation,
  certifications,
  onEdit,
}: {
  profile: DeveloperSettingsProfile;
  displayName: string;
  displayInitials: string;
  displayRole: string;
  displayPhoto: string;
  displayLocation: string;
  profileTags: string[];
  ratingValue: number;
  reviewCount: number;
  profileLinks: { id: string; label: string; value: string; icon: string; required: boolean }[];
  skillEntries: DeveloperSkillEntry[];
  educationRows: DeveloperEducation[];
  hasEducation: boolean;
  certifications: DeveloperCertification[];
  onEdit: () => void;
}) {
  return (
    <div className={`${styles.card} ${styles.profileCard}`}>
      <div className={`${styles.cardHeader} ${styles.profileHeader}`}>
        <span>
          <i className="fas fa-user" /> Developer Profile
        </span>
        <button className={styles.addSkillBtn} onClick={onEdit}>
          <i className="fas fa-pen" /> Edit Profile
        </button>
      </div>

      <div className={styles.profileView}>
        <section className={styles.devProfileHero}>
          <div className={styles.profileAvatar}>
            {displayPhoto ? (
              <img src={displayPhoto} alt={displayName} />
            ) : (
              <span>{displayInitials}</span>
            )}
          </div>
          <div className={styles.profileHeroBody}>
            <div className={styles.profileEyebrow}>Developer profile</div>
            <h2>{displayName}</h2>
            <p className={styles.profileRole}>{displayRole}</p>
            {displayLocation && (
              <p className={styles.profileLocation}>
                <i className="fas fa-map-marker-alt" /> {displayLocation}
              </p>
            )}
            <p className={styles.profileBio}>
              {profile.bio ||
                "Add a short professional summary so founders can understand how you work."}
            </p>
            <p className={styles.profileLocation}>
              <i className="fas fa-envelope" /> {profile.email}
              {profile.phone && <><span> · </span><i className="fas fa-phone" /> {profile.phone}</>}
            </p>
            {profileTags.length > 0 && (
              <div className={styles.profileTagRow}>
                {profileTags.map((tag) => (
                  <span key={tag} className={styles.profileTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={styles.profileRatingCard}>
            <RatingStars rating={ratingValue} size={14} />
            <div className={styles.ratingNumber}>
              {ratingValue ? ratingValue.toFixed(1) : "New"}
            </div>
            <div className={styles.ratingSub}>
              {reviewCount} review{reviewCount === 1 ? "" : "s"}
            </div>
          </div>
        </section>

        <section className={styles.profileCardsGrid}>
          {profileLinks.map((link) => (
            <div key={link.id} className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <i className={link.icon} />
              </div>
              <div>
                <div className={styles.infoLabel}>
                  {link.label}
                  {link.required ? " *" : ""}
                </div>
                {link.value ? (
                  <a
                    href={getExternalUrl(link.value)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.infoValue}
                  >
                    {formatProfileLink(link.value)}
                  </a>
                ) : (
                  <div className={styles.infoMuted}>Not added yet</div>
                )}
              </div>
            </div>
          ))}
        </section>

        <div className={styles.profileContentGrid}>
          <section className={`${styles.profilePanel} ${styles.profilePanelWide}`}>
            <div className={styles.panelHeader}>
              <div>
                <span>Skills</span>
                <p>Tech stack, frameworks, and practical experience.</p>
              </div>
            </div>
            <div className={styles.skillFlowList}>
              {skillEntries.length ? (
                skillEntries.map((entry) => (
                  <div key={entry.id} className={styles.skillFlowItem}>
                    <div>
                      <div className={styles.itemTitle}>{entry.name || "Untitled skill"}</div>
                      <div className={styles.itemMeta}>{entry.kind || "Skill"}</div>
                    </div>
                    <span className={styles.experiencePill}>
                      {entry.experience || "Experience not added"}
                    </span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No skills added yet.</div>
              )}
            </div>
          </section>

          <section className={styles.profilePanel}>
            <div className={styles.panelHeader}>
              <div>
                <span>Education</span>
                <p>Degrees and academic background.</p>
              </div>
            </div>
            <div className={styles.stackList}>
              {hasEducation ? (
                educationRows.map((education) => (
                  <div key={education.id} className={styles.stackItem}>
                    <div className={styles.itemTitle}>
                      {formatFounderEducation(education) || "Education not added"}
                    </div>
                    {education.school && <div className={styles.itemMeta}>{education.school}</div>}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No education added yet.</div>
              )}
            </div>
          </section>

          <section className={styles.profilePanel}>
            <div className={styles.panelHeader}>
              <div>
                <span>Certifications</span>
                <p>Optional credentials and certificates.</p>
              </div>
            </div>
            <div className={styles.certGrid}>
              {certifications.length ? (
                certifications.map((certification) => (
                  <div key={certification.id} className={styles.certCard}>
                    {certification.image ? (
                      <img src={certification.image} alt={certification.name || "Certification"} />
                    ) : (
                      <div className={styles.certPlaceholder}>
                        <i className="fas fa-certificate" />
                      </div>
                    )}
                    <div className={styles.itemTitle}>
                      {certification.name || "Untitled certification"}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No certifications added yet.</div>
              )}
            </div>
          </section>

          <section className={`${styles.profilePanel} ${styles.profilePanelWide}`}>
            <div className={styles.panelHeader}>
              <div>
                <span>Reviews</span>
                <p>Feedback from founders and collaborators.</p>
              </div>
            </div>
            <div className={styles.reviewGrid}>
              {(profile.reviews || []).length ? (
                (profile.reviews || []).map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewTop}>
                      <div>
                        <div className={styles.itemTitle}>{review.reviewer}</div>
                        <div className={styles.itemMeta}>{review.date}</div>
                      </div>
                      <RatingStars rating={review.rating || 0} size={12} />
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No reviews yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
