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
  defaultNotifications,
  getProfileName,
  getProfileInitials,
  hydrateDeveloperProfile,
} from "@/features/settings/data/developer-settings-data";
import type { PaymentData, SettingsTab } from "./developer-settings-types";
import styles from "./developer-settings.module.css";
import { DeleteAccountModal } from "@/features/settings/components/delete-account-modal";
import { SettingsSidebarNav } from "./settings-sidebar-nav";
import { ProfileTabView } from "./profile-tab-view";
import { ProfileTabEdit } from "./profile-tab-edit";
import { PaymentTab } from "./payment-tab";
import { NotificationsTab } from "./notifications-tab";
import { SecurityTab } from "./security-tab";
import { PreferencesTab } from "./preferences-tab";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { getApiErrorMessage } from "@/lib/api";
import { uploadAvatar } from "@/features/profiles/profile-api";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "@/features/notifications/notifications-api";

const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;

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
  const dashboardProfile = useDeveloperDashboardStore((state) => state.profile);
  const completeProfile = useDeveloperDashboardStore((state) => state.completeProfile);
  const activeTab = useDeveloperDashboardStore((state) => state.settingsTab);
  const setActiveTab = useDeveloperDashboardStore((state) => state.setSettingsTab);
  const [profile, setProfile] = useState(() => hydrateDeveloperProfile(dashboardProfile));
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [paySaved, setPaySaved] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [payData, setPayData] = useState<PaymentData>({
    method: "bank",
    accountName: "",
    accountNumber: "",
    bankName: "",
    currency: "USD",
    paypal: "",
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    queueMicrotask(() => setProfile(hydrateDeveloperProfile(dashboardProfile)));
  }, [dashboardProfile]);

  useEffect(() => {
    let active = true;
    fetchNotificationPreferences()
      .then((preferences) => {
        if (!active) return;
        setNotifications({
          newMatch: preferences.newMatch,
          blueprintPublished: preferences.blueprintPublished,
          applicationUpdate: preferences.applicationUpdate,
          connectionRequest: preferences.connectionRequest,
          connectionAccepted: preferences.connectionAccepted,
          messageReceived: preferences.messageReceived,
          weeklyDigest: preferences.weeklyDigest,
          founderViewed: preferences.founderViewed,
          marketingEmails: preferences.marketingEmails,
          sound: preferences.sound,
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
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
  const displayRole = profile.role || profile.jobTitle || "Role not added";
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

  const handleSave = async () => {
    setSaved(false);
    setSaveError("");
    try {
      const parts = profile.name.trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] || profile.firstName || dashboardProfile.firstName || "";
      const lastName =
        parts.length > 1
          ? parts.slice(1).join(" ")
          : profile.lastName || dashboardProfile.lastName || "";
      const normalized = normalizeDeveloperProfileForSave({
        ...profile,
        firstName,
        lastName,
        jobTitle: profile.role,
        role: profile.role,
        education: formatFounderEducations(profile.educations || []),
      });
      await completeProfile(normalized);
      setProfile(hydrateDeveloperProfile({ ...normalized, name: profile.name }));
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaved(false);
      setSaveError(getApiErrorMessage(error));
    }
  };

  const cancelEditing = () => {
    setProfile(hydrateDeveloperProfile(dashboardProfile));
    setEditing(false);
  };

  const handlePhotoUpload = async (file: File | null | undefined) => {
    if (!file) return;
    setSaveError("");

    if (!file.type || !file.type.startsWith("image/")) {
      setSaveError("Please choose a PNG, JPEG, or WebP image.");
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setSaveError("Your profile photo must be smaller than 2 MB.");
      return;
    }

    setPhotoUploading(true);
    try {
      const url = await uploadAvatar(file);
      setProfile((p) => ({ ...p, avatarUrl: url, photo: url }));
      useDeveloperDashboardStore.setState((state) => ({
        profile: { ...state.profile, avatarUrl: url, photo: url },
      }));
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleChangeField = (
    key: "name" | "email" | "role" | "github" | "linkedin" | "portfolioLink" | "bio",
    value: string
  ) => setProfile((p) => ({ ...p, [key]: value }));

  const handlePaySave = () => {
    setPaySaved(true);
    setTimeout(() => setPaySaved(false), 2000);
  };

  const handleNotificationSave = async () => {
    setNotificationsSaved(false);
    setSaveError("");
    try {
      const savedPreferences = await updateNotificationPreferences(notifications);
      setNotifications({
        newMatch: savedPreferences.newMatch,
        blueprintPublished: savedPreferences.blueprintPublished,
        applicationUpdate: savedPreferences.applicationUpdate,
        connectionRequest: savedPreferences.connectionRequest,
        connectionAccepted: savedPreferences.connectionAccepted,
        messageReceived: savedPreferences.messageReceived,
        weeklyDigest: savedPreferences.weeklyDigest,
        founderViewed: savedPreferences.founderViewed,
        marketingEmails: savedPreferences.marketingEmails,
        sound: savedPreferences.sound,
      });
      setNotificationsSaved(true);
      setTimeout(() => setNotificationsSaved(false), 2000);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    }
  };

  const handleDeleteAccount = () => {
    setDeleteAccountOpen(true);
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
              {saveError && <p className={styles.saveError}>{saveError}</p>}

              {activeTab === "profile" &&
                (editing ? (
                  <ProfileTabEdit
                    profile={profile}
                    displayName={displayName}
                    displayInitials={displayInitials}
                    displayPhoto={displayPhoto}
                    photoInputRef={photoInputRef}
                    onPhotoUpload={handlePhotoUpload}
                    photoUploading={photoUploading}
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
                    onSave={() => void handleSave()}
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
                  saved={notificationsSaved}
                  onSave={() => void handleNotificationSave()}
                />
              )}

              {activeTab === "security" && <SecurityTab />}

              {activeTab === "preferences" && (
                <PreferencesTab
                  preferredBudget={profile.preferredBudget}
                  experienceYears={profile.experienceYears}
                  onChangeBudget={(value) => setProfile({ ...profile, preferredBudget: value })}
                  onChangeExperienceYears={(value) =>
                    setProfile({ ...profile, experienceYears: value })
                  }
                  saved={saved}
                  onSave={() => void handleSave()}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </div>
  );
};

export default Settings;
