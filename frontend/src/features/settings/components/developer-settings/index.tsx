"use client";

import { useEffect, useRef, useState } from "react";
import {
  createBlankDeveloperCertification,
  createBlankDeveloperSkill,
  getDeveloperCertifications,
  getDeveloperSkillEntries,
  getMissingDeveloperProfileFields,
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
import type { SettingsTab } from "./developer-settings-types";
import styles from "./developer-settings.module.css";
import { DeleteAccountModal } from "@/features/settings/components/delete-account-modal";
import { SettingsSidebarNav } from "./settings-sidebar-nav";
import { ProfileTabView } from "./profile-tab-view";
import { ProfileTabEdit } from "./profile-tab-edit";
import { PaymentTab } from "./payment-tab";
import { NotificationsTab } from "./notifications-tab";
import { SecurityTab } from "./security-tab";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { getApiErrorMessage } from "@/lib/api";
import { uploadAvatar, uploadCertificationImage } from "@/features/profiles/profile-api";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "@/features/notifications/notifications-api";
import { ArrowLeft, User, CreditCard, LockKey, Bell, WarningCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_CERTIFICATE_BYTES = 5 * 1024 * 1024;

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "payment", label: "Payment", icon: "credit-card" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "security", label: "Security", icon: "lock" },
];

const SECTION_COPY: Record<SettingsTab, { title: string; subtitle: string }> = {
  profile: { title: "Profile", subtitle: "Update your developer details and public profile." },
  payment: { title: "Payment", subtitle: "Manage payout details, billing method, and earnings." },
  notifications: { title: "Notifications", subtitle: "Control which notifications you receive." },
  security: { title: "Security", subtitle: "Protect your developer account and login access." },
};

function formatDeveloperSettingsError(error: unknown): string {
  return getApiErrorMessage(error).replace(/\bbio\b/g, "professional summary");
}

const Settings = () => {
  const dashboardProfile = useDeveloperDashboardStore((state) => state.profile);
  const completeProfile = useDeveloperDashboardStore((state) => state.completeProfile);
  const activeTab = useDeveloperDashboardStore((state) => state.settingsTab);
  const setActiveTab = useDeveloperDashboardStore((state) => state.setSettingsTab);
  const [profile, setProfile] = useState(() => hydrateDeveloperProfile(dashboardProfile));
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [editing, setEditing] = useState(false);
  // Each tab's SaveButton owns its own button-level spinner; this flag is the
  // page-level one, so an in-flight save can still block cancel/re-submit.
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const router = useRouter();
  const [mobileDetailActive, setMobileDetailActive] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const activeTabExists = TABS.some((tab) => tab.id === activeTab);
  const visibleTab: SettingsTab = activeTabExists ? activeTab : "profile";

  const handleSelectMobileTab = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    setMobileDetailActive(true);
  };

  useEffect(() => {
    if (!activeTabExists) setActiveTab("profile");
  }, [activeTabExists, setActiveTab]);

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
          projectInvite: preferences.projectInvite,
          projectUpdate: preferences.projectUpdate,
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
    if (saving) return;
    setSaveError("");
    setSaving(true);
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
        rateCurrency: "USD",
        education: formatFounderEducations(profile.educations || []),
      });
      await completeProfile(normalized);
      setProfile(hydrateDeveloperProfile({ ...normalized, name: profile.name }));
      setEditing(false);
      const missing = getMissingDeveloperProfileFields(normalized);
      if (missing.length) {
        toast.warning(
          `Saved, but add ${missing.join(", ")} to complete your profile and appear in the network.`
        );
      } else {
        toast.success("Changes saved");
      }
    } catch (error) {
      const message = formatDeveloperSettingsError(error);
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    if (saving) return;
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
      setSaveError(formatDeveloperSettingsError(error));
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleChangeField = (
    key: "name" | "email" | "role" | "github" | "linkedin" | "portfolioLink" | "bio",
    value: string
  ) => setProfile((p) => ({ ...p, [key]: value }));

  const handleNotificationSave = async () => {
    setSaveError("");
    try {
      const savedPreferences = await updateNotificationPreferences(notifications);
      setNotifications({
        newMatch: savedPreferences.newMatch,
        blueprintPublished: savedPreferences.blueprintPublished,
        applicationUpdate: savedPreferences.applicationUpdate,
        projectInvite: savedPreferences.projectInvite,
        projectUpdate: savedPreferences.projectUpdate,
        connectionRequest: savedPreferences.connectionRequest,
        connectionAccepted: savedPreferences.connectionAccepted,
        messageReceived: savedPreferences.messageReceived,
        weeklyDigest: savedPreferences.weeklyDigest,
        founderViewed: savedPreferences.founderViewed,
        marketingEmails: savedPreferences.marketingEmails,
        sound: savedPreferences.sound,
      });
      toast.success("Notification preferences saved");
    } catch (error) {
      const message = formatDeveloperSettingsError(error);
      setSaveError(message);
      toast.error(message);
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

  const handleCertificationImage = async (id: string, file: File | null | undefined) => {
    if (!file) return;
    setSaveError("");

    if (!file.type || !file.type.startsWith("image/")) {
      setSaveError("Please choose a PNG, JPEG, or WebP image.");
      return;
    }

    if (file.size > MAX_CERTIFICATE_BYTES) {
      setSaveError("Your certificate image must be smaller than 5 MB.");
      return;
    }

    try {
      updateCertification(id, { image: await uploadCertificationImage(file) });
    } catch (error) {
      setSaveError(formatDeveloperSettingsError(error));
    }
  };

  const sectionCopy = SECTION_COPY[visibleTab];

  return (
    <div className="h-full overflow-y-auto md:overflow-hidden bg-[#f5f6f4]">
      {/* ── Mobile Menu View (Image 1) ── */}
      <div className={`md:hidden p-4 sm:p-6 flex flex-col gap-5 min-h-full ${mobileDetailActive ? "hidden" : "flex"}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/developer/dashboard")}
            className="w-9 h-9 rounded-full bg-white border border-[#eaeeed] flex items-center justify-center text-[#1a2e26] hover:bg-[#eaf5f0]"
          >
            <ArrowLeft size={16} weight="bold" />
          </button>
          <h1 className="text-xl font-extrabold text-[#1a2e26] tracking-tight">Settings</h1>
        </div>

        {/* Profile Card */}
        <button
          type="button"
          onClick={() => handleSelectMobileTab("profile")}
          className="w-full text-left bg-white border border-[#eaeeed] rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-[#89d7b7] transition-all"
        >
          <div className="flex items-center gap-3.5">
            {displayPhoto ? (
              <img src={displayPhoto} alt={displayName} className="w-12 h-12 rounded-full object-cover border border-[#eaeeed]" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#1a312c] text-[#89d7b7] flex items-center justify-center font-bold text-base">
                {displayInitials}
              </div>
            )}
            <div>
              <div className="font-bold text-[#1a2e26] text-[15px]">{displayName}</div>
              <div className="text-xs text-[#8aab9a] font-medium">Developer · {profile.jobTitle || profile.role || "AI Engineer"}</div>
            </div>
          </div>
          <span className="text-[#8aab9a] text-lg">›</span>
        </button>

        {/* Account Section */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8aab9a] mb-2 px-1">
            Account
          </div>
          <div className="bg-white border border-[#eaeeed] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#f2f6f4]">
            <button
              type="button"
              onClick={() => handleSelectMobileTab("profile")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f0] text-[#2e7d5c] flex items-center justify-center">
                  <User size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Edit profile</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMobileTab("payment")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f0] text-[#2e7d5c] flex items-center justify-center">
                  <CreditCard size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Payment & billing</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMobileTab("security")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f0] text-[#2e7d5c] flex items-center justify-center">
                  <LockKey size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Security & password</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8aab9a] mb-2 px-1">
            Preferences
          </div>
          <div className="bg-white border border-[#eaeeed] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#f2f6f4]">
            <button
              type="button"
              onClick={() => handleSelectMobileTab("notifications")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eef2fc] text-[#4a6baf] flex items-center justify-center">
                  <Bell size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Notifications</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="w-full p-4 flex items-center justify-between hover:bg-[#fdf0f0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#fdf0f0] text-[#b03030] flex items-center justify-center">
                  <WarningCircle size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#b03030]">Delete Account</span>
              </div>
              <span className="text-[#b03030]/60 text-lg">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─ Mobile Detail View ─ */}
      <div className={`md:hidden p-4 sm:p-6 flex flex-col gap-4 min-h-full ${mobileDetailActive ? "flex" : "hidden"}`}>
        <button
          type="button"
          onClick={() => setMobileDetailActive(false)}
          className="self-start flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#eaeeed] text-xs font-bold text-[#428475]"
        >
          <ArrowLeft size={14} weight="bold" /> Settings
        </button>
        <div className="bg-white border border-[#eaeeed] rounded-2xl p-5 shadow-sm w-full">
          <h2 className="text-xl font-extrabold text-[#1a2e26] mb-1">{sectionCopy.title}</h2>
          <p className="text-xs text-[#8aab9a] mb-6">{sectionCopy.subtitle}</p>
          {saveError && <p className={styles.saveError}>{saveError}</p>}

          {visibleTab === "profile" &&
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

          {visibleTab === "payment" && (
            <PaymentTab profile={profile} />
          )}

          {visibleTab === "notifications" && (
            <NotificationsTab
              notifications={notifications}
              onToggle={(key) => setNotifications({ ...notifications, [key]: !notifications[key] })}
              onSave={handleNotificationSave}
            />
          )}

          {visibleTab === "security" && <SecurityTab />}
        </div>
      </div>

      {/* ─ Desktop Side-by-Side Layout ─ */}
      <div className={`hidden md:block ${styles.container}`}>
        <main className={styles.mainWrapper}>
          <div className={styles.settingsLayout}>
            <SettingsSidebarNav
              tabs={TABS}
              activeTab={visibleTab}
              onSelectTab={setActiveTab}
              onDeleteAccount={handleDeleteAccount}
            />

            <div className={styles.contentCol}>
              <div className={`${styles.contentInner} ${visibleTab === "profile" ? styles.contentInnerWide : ""}`}>
                <h2 className={styles.pageTitle}>{sectionCopy.title}</h2>
                <p className={styles.pageSubtitle}>{sectionCopy.subtitle}</p>
                {saveError && <p className={styles.saveError}>{saveError}</p>}

                {visibleTab === "profile" &&
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

              {visibleTab === "payment" && (
                <PaymentTab profile={profile} />
              )}

              {visibleTab === "notifications" && (
                <NotificationsTab
                  notifications={notifications}
                  onToggle={(key) =>
                    setNotifications({ ...notifications, [key]: !notifications[key] })
                  }
                  onSave={handleNotificationSave}
                />
              )}

              {visibleTab === "security" && <SecurityTab />}

  
            </div>
          </div>
        </div>
        </main>
      </div>

      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </div>
  );
};

export default Settings;
