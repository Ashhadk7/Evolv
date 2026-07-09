"use client";

import { useEffect, useRef, useState } from "react";
import {
  createBlankDeveloperCertification,
  createBlankDeveloperSkill,
  getDeveloperCertifications,
  getDeveloperSkillEntries,
  normalizeDeveloperProfileForSave,
  type DeveloperCertification,
  type DeveloperEducation,
  type DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";
import {
  createBlankEducation,
  formatFounderEducation,
  formatFounderEducations,
} from "@/features/founder-dashboard/profile-utils";
import {
  defaultProfile,
  defaultNotifications,
  getProfileName,
  getProfileInitials,
  hydrateDeveloperProfile,
} from "@/features/settings/data/developer-settings-data";
import type { PaymentData, PasswordData, SettingsTab } from "./developer-settings-types";
import styles from "./developer-settings.module.css";
import { SettingsSidebarNav } from "./settings-sidebar-nav";
import { ProfileTabView } from "./profile-tab-view";
import { ProfileTabEdit } from "./profile-tab-edit";
import { PaymentTab } from "./payment-tab";
import { NotificationsTab } from "./notifications-tab";
import { SecurityTab } from "./security-tab";
import { PreferencesTab } from "./preferences-tab";

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "payment", label: "Payment", icon: "credit-card" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "security", label: "Security", icon: "lock" },
  { id: "preferences", label: "Preferences", icon: "sliders-h" },
];

const SECTION_COPY: Record<SettingsTab, { title: string; subtitle: string }> = {
  profile: { title: "Profile", subtitle: "Update your developer details and public profile." },
  payment: { title: "Payment", subtitle: "Manage payout details, billing method, and earnings." },
  notifications: { title: "Notifications", subtitle: "Control which notifications you receive." },
  security: { title: "Security", subtitle: "Protect your developer account and login access." },
  preferences: {
    title: "Preferences",
    subtitle: "Tune your startup match and opportunity preferences.",
  },
};

const Settings = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [paySaved, setPaySaved] = useState(false);
  const [payData, setPayData] = useState<PaymentData>({
    method: "bank",
    accountName: "Sarah Mitchell",
    accountNumber: "****4821",
    bankName: "HBL Pakistan",
    currency: "USD",
    paypal: "sarah.mitchell@evolv.dev",
  });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("evolv_user");
      if (raw) {
        const user = JSON.parse(raw);
        queueMicrotask(() => setProfile(hydrateDeveloperProfile(user)));
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const profileTags = Array.isArray(profile.tags) ? profile.tags : [];
  const skillEntries = getDeveloperSkillEntries(profile);
  const certifications = getDeveloperCertifications(profile);
  const educationRows: DeveloperEducation[] = profile.educations?.length
    ? profile.educations
    : [
        {
          id: "settings_primary_education",
          level: profile.educationLevel || "",
          degree: profile.degreeSelection === "Other" ? "Other" : profile.degreeName || "",
          customDegree: profile.customDegreeName || "",
          school: "",
        },
      ];
  const displayName = getProfileName(profile);
  const displayInitials = getProfileInitials(profile);
  const displayRole = profile.role || profile.jobTitle || "Developer";
  const displayPhoto = profile.avatarUrl || profile.photo || "";
  const displayLocation = profile.location || "";
  const ratingValue = Number(profile.rating) || 0;
  const reviewCount = (profile.reviews || []).length;
  const hasEducation = educationRows.some((education) => formatFounderEducation(education));
  const profileLinks = [
    {
      id: "github",
      label: "GitHub",
      value: profile.github || "",
      icon: "fab fa-github",
      required: true,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: profile.linkedin || profile.linkedIn || "",
      icon: "fab fa-linkedin",
      required: true,
    },
    {
      id: "portfolio",
      label: "Portfolio",
      value: profile.portfolioLink || "",
      icon: "fas fa-link",
      required: false,
    },
  ];

  const handleSave = () => {
    try {
      const raw = localStorage.getItem("evolv_user");
      const currentUser = raw ? JSON.parse(raw) : {};
      const parts = profile.name.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      const normalized = normalizeDeveloperProfileForSave({
        ...profile,
        firstName,
        lastName,
        jobTitle: profile.role,
        role: profile.role,
        education: formatFounderEducations(profile.educations || []),
      });
      localStorage.setItem("evolv_user", JSON.stringify({ ...currentUser, ...normalized }));
      setProfile((current) => ({ ...current, ...normalized, name: profile.name }));
    } catch {
      /* ignore malformed storage */
    }
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const cancelEditing = () => {
    try {
      const raw = localStorage.getItem("evolv_user");
      if (raw) setProfile(hydrateDeveloperProfile(JSON.parse(raw)));
    } catch {
      /* ignore malformed storage */
    }
    setEditing(false);
  };

  const handlePhotoUpload = (file: File | null | undefined) => {
    if (!file || !file.type || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const dataUrl = reader.result;
        setProfile((p) => ({ ...p, avatarUrl: dataUrl, photo: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangeField = (
    key: "name" | "email" | "role" | "github" | "linkedin" | "portfolioLink" | "bio",
    value: string
  ) => setProfile((p) => ({ ...p, [key]: value }));

  const handlePaySave = () => {
    setPaySaved(true);
    setTimeout(() => setPaySaved(false), 2000);
  };

  const handlePwSave = () => {
    if (!passwordData.current || !passwordData.newPass) return;
    setPwSaved(true);
    setPasswordData({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    // Preserved from the original component: no confirmation/localStorage
    // clearing was wired up here yet, matching prior behavior exactly.
  };

  const toggleTag = (tag: string) => {
    setProfile((p) => {
      const currentTags = Array.isArray(p.tags) ? p.tags : [];
      return {
        ...p,
        tags: currentTags.includes(tag)
          ? currentTags.filter((item) => item !== tag)
          : [...currentTags, tag],
      };
    });
  };

  const updateSkillEntry = (id: string, patch: Partial<DeveloperSkillEntry>) => {
    setProfile((p) => {
      const next = getDeveloperSkillEntries(p).map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry
      );
      return {
        ...p,
        skillEntries: next,
        techStack: next.map((entry) => entry.name).filter(Boolean),
      };
    });
  };

  const addSkillEntry = () => {
    setProfile((p) => ({
      ...p,
      skillEntries: [...getDeveloperSkillEntries(p), createBlankDeveloperSkill()],
    }));
  };

  const removeSkillEntry = (id: string) => {
    setProfile((p) => {
      const next = getDeveloperSkillEntries(p).filter((entry) => entry.id !== id);
      return {
        ...p,
        skillEntries: next,
        techStack: next.map((entry) => entry.name).filter(Boolean),
      };
    });
  };

  const updateEducation = (id: string, patch: Partial<DeveloperEducation>) => {
    setProfile((p) => {
      const rows: DeveloperEducation[] = p.educations?.length
        ? p.educations
        : [
            {
              id,
              level: p.educationLevel || "",
              degree: p.degreeSelection === "Other" ? "Other" : p.degreeName || "",
              customDegree: p.customDegreeName || "",
              school: "",
            },
          ];
      const educations = rows.map((education) => {
        if (education.id !== id) return education;
        const next = { ...education, ...patch };
        if (patch.level !== undefined) {
          next.degree = "";
          next.customDegree = "";
        }
        if (patch.degree && patch.degree !== "Other") next.customDegree = "";
        return next;
      });
      return { ...p, educations, education: formatFounderEducations(educations) };
    });
  };

  const addEducation = () => {
    setProfile((p) => ({ ...p, educations: [...educationRows, createBlankEducation()] }));
  };

  const removeEducation = (id: string) => {
    setProfile((p) => {
      const educations = (p.educations?.length ? p.educations : educationRows).filter(
        (education) => education.id !== id
      );
      if (!educations.length) {
        return {
          ...p,
          educations: [],
          education: "",
          educationLevel: "",
          degreeName: "",
          degreeSelection: "",
          customDegreeName: "",
        };
      }
      return { ...p, educations, education: formatFounderEducations(educations) };
    });
  };

  const updateCertification = (id: string, patch: Partial<DeveloperCertification>) => {
    setProfile((p) => ({
      ...p,
      certifications: getDeveloperCertifications(p).map((certification) =>
        certification.id === id ? { ...certification, ...patch } : certification
      ),
    }));
  };

  const addCertification = () => {
    setProfile((p) => ({
      ...p,
      certifications: [...getDeveloperCertifications(p), createBlankDeveloperCertification()],
    }));
  };

  const removeCertification = (id: string) => {
    setProfile((p) => ({
      ...p,
      certifications: getDeveloperCertifications(p).filter(
        (certification) => certification.id !== id
      ),
    }));
  };

  const handleCertificationImage = (id: string, file: File | null | undefined) => {
    if (!file || !file.type?.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateCertification(id, { image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const sectionCopy = SECTION_COPY[activeTab];

  return (
    <div className={styles.container}>
      <main className={styles.mainWrapper}>
        <div className={styles.settingsLayout}>
          <SettingsSidebarNav
            tabs={TABS}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onDeleteAccount={handleDeleteAccount}
          />

          <div className={styles.contentCol}>
            <div
              className={`${styles.contentInner} ${activeTab === "profile" ? styles.contentInnerWide : ""}`}
            >
              <h2 className={styles.pageTitle}>{sectionCopy.title}</h2>
              <p className={styles.pageSubtitle}>{sectionCopy.subtitle}</p>

              {activeTab === "profile" &&
                (editing ? (
                  <ProfileTabEdit
                    profile={profile}
                    displayName={displayName}
                    displayInitials={displayInitials}
                    displayPhoto={displayPhoto}
                    photoInputRef={photoInputRef}
                    onPhotoUpload={handlePhotoUpload}
                    onChangeField={handleChangeField}
                    profileTags={profileTags}
                    onToggleTag={toggleTag}
                    skillEntries={skillEntries}
                    onUpdateSkillEntry={updateSkillEntry}
                    onAddSkillEntry={addSkillEntry}
                    onRemoveSkillEntry={removeSkillEntry}
                    educationRows={educationRows}
                    onUpdateEducation={updateEducation}
                    onAddEducation={addEducation}
                    onRemoveEducation={removeEducation}
                    certifications={certifications}
                    onUpdateCertification={updateCertification}
                    onAddCertification={addCertification}
                    onRemoveCertification={removeCertification}
                    onCertificationImage={handleCertificationImage}
                    saved={saved}
                    onCancel={cancelEditing}
                    onSave={handleSave}
                  />
                ) : (
                  <ProfileTabView
                    profile={profile}
                    displayName={displayName}
                    displayInitials={displayInitials}
                    displayRole={displayRole}
                    displayPhoto={displayPhoto}
                    displayLocation={displayLocation}
                    profileTags={profileTags}
                    ratingValue={ratingValue}
                    reviewCount={reviewCount}
                    profileLinks={profileLinks}
                    skillEntries={skillEntries}
                    educationRows={educationRows}
                    hasEducation={hasEducation}
                    certifications={certifications}
                    onEdit={() => setEditing(true)}
                  />
                ))}

              {activeTab === "payment" && (
                <PaymentTab
                  payData={payData}
                  onChangePayData={(patch) => setPayData((prev) => ({ ...prev, ...patch }))}
                  paySaved={paySaved}
                  onSave={handlePaySave}
                />
              )}

              {activeTab === "notifications" && (
                <NotificationsTab
                  notifications={notifications}
                  onToggle={(key) =>
                    setNotifications({ ...notifications, [key]: !notifications[key] })
                  }
                  saved={saved}
                  onSave={handleSave}
                />
              )}

              {activeTab === "security" && (
                <SecurityTab
                  passwordData={passwordData}
                  onChangePasswordData={(patch) =>
                    setPasswordData((prev) => ({ ...prev, ...patch }))
                  }
                  pwSaved={pwSaved}
                  onSave={handlePwSave}
                />
              )}

              {activeTab === "preferences" && (
                <PreferencesTab
                  preferredBudget={profile.preferredBudget}
                  experienceYears={profile.experienceYears}
                  onChangeBudget={(value) => setProfile({ ...profile, preferredBudget: value })}
                  onChangeExperienceYears={(value) =>
                    setProfile({ ...profile, experienceYears: value })
                  }
                  saved={saved}
                  onSave={handleSave}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
