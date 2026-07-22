"use client";

import type { RefObject } from "react";
import { EDUCATION_LEVELS, getDegreeOptions } from "@/features/founder-dashboard/profile-utils";
import {
  PROFILE_TAGS,
  SKILL_KINDS,
  SKILL_EXPERIENCE,
  type DeveloperSettingsProfile,
} from "@/features/settings/data/developer-settings-data";
import type {
  DeveloperCertification,
  DeveloperEducation,
  DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";
import styles from "./developer-settings.module.css";

export function ProfileTabEdit({
  profile,
  displayName,
  displayInitials,
  displayPhoto,
  photoInputRef,
  onPhotoUpload,
  photoUploading,
  onChangeField,
  profileTags,
  onToggleTag,
  skillEntries,
  onUpdateSkillEntry,
  onAddSkillEntry,
  onRemoveSkillEntry,
  educationRows,
  onUpdateEducation,
  onAddEducation,
  onRemoveEducation,
  certifications,
  onUpdateCertification,
  onAddCertification,
  onRemoveCertification,
  onCertificationImage,
  saved,
  onCancel,
  onSave,
}: {
  profile: DeveloperSettingsProfile;
  displayName: string;
  displayInitials: string;
  displayPhoto: string;
  photoInputRef: RefObject<HTMLInputElement | null>;
  onPhotoUpload: (file: File | null | undefined) => void | Promise<void>;
  photoUploading: boolean;
  onChangeField: (
    key: "name" | "email" | "role" | "github" | "linkedin" | "portfolioLink" | "bio",
    value: string
  ) => void;
  profileTags: string[];
  onToggleTag: (tag: string) => void;
  skillEntries: DeveloperSkillEntry[];
  onUpdateSkillEntry: (id: string, patch: Partial<DeveloperSkillEntry>) => void;
  onAddSkillEntry: () => void;
  onRemoveSkillEntry: (id: string) => void;
  educationRows: DeveloperEducation[];
  onUpdateEducation: (id: string, patch: Partial<DeveloperEducation>) => void;
  onAddEducation: () => void;
  onRemoveEducation: (id: string) => void;
  certifications: DeveloperCertification[];
  onUpdateCertification: (id: string, patch: Partial<DeveloperCertification>) => void;
  onAddCertification: () => void;
  onRemoveCertification: (id: string) => void;
  onCertificationImage: (id: string, file: File | null | undefined) => void;
  saved: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className={`${styles.card} ${styles.profileCard}`}>
      <div className={`${styles.cardHeader} ${styles.profileHeader}`}>
        <span>
          <i className="fas fa-user" /> Developer Profile
        </span>
      </div>

      <div className={styles.profileEdit}>
        <section className={styles.editHero}>
          <button
            type="button"
            className={`${styles.profileAvatar} ${styles.profileAvatarButton}`}
            onClick={() => photoInputRef.current?.click()}
            aria-label="Change profile photo"
            disabled={photoUploading}
          >
            {displayPhoto ? (
              <img src={displayPhoto} alt={displayName} />
            ) : (
              <span>{displayInitials}</span>
            )}
          </button>
          <div>
            <div className={styles.itemTitle}>Profile photo</div>
            <p className={styles.itemMeta}>
              Upload a clear image, or leave it blank to show initials.
            </p>
            <button
              className={styles.changePhotoBtn}
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
            >
              <i className="fas fa-camera" /> {photoUploading ? "Uploading..." : "Change Photo"}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              disabled={photoUploading}
              onChange={(e) => void onPhotoUpload(e.target.files?.[0])}
            />
          </div>
        </section>

        <section className={styles.editSection}>
          <div className={styles.panelHeader} style={{ padding: 10 }}>
            <div>
              <span>Basic profile</span>
              <p>Name, headline, summary, and public links.</p>
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onChangeField("name", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => onChangeField("email", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Professional Role *</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => onChangeField("role", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>GitHub *</label>
              <input
                type="url"
                value={profile.github || ""}
                onChange={(e) => onChangeField("github", e.target.value)}
                placeholder="https://github.com/yourname"
              />
            </div>
            <div className={styles.formGroup}>
              <label>LinkedIn *</label>
              <input
                type="url"
                value={profile.linkedin || ""}
                onChange={(e) => onChangeField("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Portfolio link</label>
              <input
                type="url"
                value={profile.portfolioLink || ""}
                onChange={(e) => onChangeField("portfolioLink", e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label>Professional Summary *</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => onChangeField("bio", e.target.value)}
                placeholder="Tell founders how you work and what you build."
              />
            </div>
          </div>
        </section>

        <section className={styles.editSection}>
          <div className={styles.panelHeader} style={{ padding: 10 }}>
            <div>
              <span>Profile tags</span>
              <p>Optional labels shown below your role.</p>
            </div>
          </div>
          <div className={styles.profileTagPicker}>
            {PROFILE_TAGS.map((tag) => (
              <button
                style={{ marginLeft: 10, marginBottom: 10 }}
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={`${styles.profileTagOption} ${profileTags.includes(tag) ? styles.profileTagOptionActive : ""}`}
              >
                <i className={profileTags.includes(tag) ? "fas fa-check" : "fas fa-plus"} /> {tag}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.editSection}>
          <div className={styles.panelHeader} style={{ padding: 10 }}>
            <div>
              <span>Skills, tech stack &amp; frameworks *</span>
              <p>Add each skill with the experience level attached to it.</p>
            </div>
          </div>
          <div className={styles.editItemList}>
            {skillEntries.map((entry, index) => (
              <div key={entry.id} className={styles.editItemCard}>
                <div className={styles.editItemHeader}>
                  <span>Skill {index + 1}</span>
                  <button
                    className={styles.iconDangerBtn}
                    onClick={() => onRemoveSkillEntry(entry.id)}
                  >
                    <i className="fas fa-trash" /> Remove
                  </button>
                </div>
                <div className={`${styles.formGrid} ${styles.formGridTight}`}>
                  <div className={styles.formGroup}>
                    <label>Type</label>
                    <select
                      value={entry.kind || "Skill"}
                      onChange={(e) => onUpdateSkillEntry(entry.id, { kind: e.target.value })}
                    >
                      {SKILL_KINDS.map((kind) => (
                        <option key={kind}>{kind}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Name</label>
                    <input
                      value={entry.name || ""}
                      onChange={(e) => onUpdateSkillEntry(entry.id, { name: e.target.value })}
                      placeholder="React, Figma, Laravel..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Experience</label>
                    <select
                      value={entry.experience || ""}
                      onChange={(e) => onUpdateSkillEntry(entry.id, { experience: e.target.value })}
                    >
                      <option value="">Select experience</option>
                      {SKILL_EXPERIENCE.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className={`${styles.addSkillBtn} ${styles.sectionAction}`}
            style={{ margin: 20 }}
            onClick={onAddSkillEntry}
          >
            <i className="fas fa-plus" /> Add skill / stack / framework
          </button>
        </section>

        <section className={styles.editSection}>
          <div className={styles.panelHeader} style={{ padding: 10 }}>
            <div>
              <span>Education *</span>
              <p>Add one or more education entries.</p>
            </div>
          </div>
          <div className={styles.editItemList}>
            {educationRows.map((education, index) => (
              <div key={education.id} className={styles.editItemCard}>
                <div className={styles.editItemHeader}>
                  <span>Education {index + 1}</span>
                  <button
                    className={styles.iconDangerBtn}
                    onClick={() => onRemoveEducation(education.id)}
                  >
                    <i className="fas fa-trash" /> Remove
                  </button>
                </div>
                <div className={`${styles.formGrid} ${styles.formGridTight}`}>
                  <div className={styles.formGroup}>
                    <label>Education level</label>
                    <select
                      value={education.level}
                      onChange={(e) => onUpdateEducation(education.id, { level: e.target.value })}
                    >
                      <option value="">Select level</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Degree / program</label>
                    <select
                      disabled={!education.level}
                      value={education.degree}
                      onChange={(e) => onUpdateEducation(education.id, { degree: e.target.value })}
                    >
                      <option value="">
                        {education.level ? "Select degree" : "Select level first"}
                      </option>
                      {getDegreeOptions(education.level).map((degree) => (
                        <option key={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>
                  {education.degree === "Other" && (
                    <div className={styles.formGroup}>
                      <label>Other degree</label>
                      <input
                        value={education.customDegree || ""}
                        onChange={(e) =>
                          onUpdateEducation(education.id, { customDegree: e.target.value })
                        }
                      />
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label>School / university</label>
                    <input
                      value={education.school || ""}
                      onChange={(e) => onUpdateEducation(education.id, { school: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className={`${styles.addSkillBtn} ${styles.sectionAction}`}
            style={{ margin: 20 }}
            onClick={onAddEducation}
          >
            <i className="fas fa-plus" /> Add education
          </button>
        </section>

        <section className={styles.editSection}>
          <div className={styles.panelHeader} style={{ padding: 10 }}>
            <div>
              <span>Certifications</span>
              <p>Optional certificates with proof images.</p>
            </div>
          </div>
          <div className={styles.editItemList}>
            {certifications.map((certification, index) => (
              <div key={certification.id} className={styles.editItemCard}>
                <div className={styles.editItemHeader}>
                  <span>Certification {index + 1}</span>
                  <button
                    className={styles.iconDangerBtn}
                    onClick={() => onRemoveCertification(certification.id)}
                  >
                    <i className="fas fa-trash" /> Remove
                  </button>
                </div>
                <div className={`${styles.formGrid} ${styles.formGridTight}`}>
                  <div className={styles.formGroup}>
                    <label>Certificate name</label>
                    <input
                      value={certification.name || ""}
                      onChange={(e) =>
                        onUpdateCertification(certification.id, { name: e.target.value })
                      }
                      placeholder="AWS Certified Developer"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Certificate image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onCertificationImage(certification.id, e.target.files?.[0])}
                    />
                  </div>
                </div>
                {certification.image && (
                  <img
                    className={styles.certEditImage}
                    src={certification.image}
                    alt={certification.name || "Certification"}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            className={`${styles.addSkillBtn} ${styles.sectionAction}`}
            style={{ margin: 20 }}
            onClick={onAddCertification}
          >
            <i className="fas fa-plus" /> Add certification
          </button>
        </section>

        <div className={`${styles.cardFooter} ${styles.profileFooter}`}>
          <button className={styles.secondaryBtn} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ""}`}
            onClick={onSave}
          >
            {saved ? (
              <>
                <i className="fas fa-check" /> Saved!
              </>
            ) : (
              <>
                <i className="fas fa-save" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
