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
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [payData, setPayData] = useState<PaymentData>({
    method: "bank",
    accountName: "",
    accountNumber: "",
    bankName: "",
    currency: "USD",
    paypal: "",
  });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const activeTabExists = TABS.some((tab) => tab.id === activeTab);
  const visibleTab: SettingsTab = activeTabExists ? activeTab : "profile";

  const handleSelectMobileTab = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
  };

  useEffect(() => {
    if (!activeTabExists) setActiveTab("profile");
  }, [activeTabExists, setActiveTab]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (!requestedTab) return;

    const nextTab = TABS.find((tab) => tab.id === requestedTab)?.id;
    if (!nextTab) return;

    queueMicrotask(() => {
      setActiveTab(nextTab);
      setShowMobileMenu(false);
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    router.replace(
      params.toString() ? `/developer/settings?${params.toString()}` : "/developer/settings",
      { scroll: false }
    );
  }, [router, searchParams, setActiveTab]);

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

  const handleMobileSectionChange = (id: SettingsTab) => {
    setActiveTab(id);
    setShowMobileMenu(false);
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
    <>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f5f6f4]">
        {/* ─ Mobile Settings Menu ─ */}
        <div className={`md:hidden flex-col flex-1 overflow-y-auto ${showMobileMenu ? 'flex' : 'hidden'} min-h-screen w-full`} style={{ background: "#f5f6f4" }}>
          <div className="flex items-center gap-4 px-5 pt-6 pb-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/developer/dashboard";
                }
              }}
              className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm"
            >
               <i className="fas fa-arrow-left text-[#0f1c18] text-[14px]"></i>
            </button>
            <h1 className="text-[20px] font-extrabold text-[#0f1c18]">Settings</h1>
          </div>

          <div className="px-5 pb-8 mt-4 space-y-6">
            {/* Profile Card */}
            <button
              onClick={() => handleMobileSectionChange("profile")}
              className="w-full bg-white rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 text-left"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4cb896] to-[#89d7b7] text-[#0f1c18] font-bold text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-[#0f1c18] truncate">{displayName}</p>
                <p className="text-[13px] text-[#8ba69c] font-medium truncate">{displayRole}</p>
              </div>
              <div className="text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </button>

            {/* Account Section */}
            <div>
              <p className="text-[11px] font-bold text-[#8ba69c] uppercase tracking-wider mb-2.5 px-1">Account</p>
              <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden flex flex-col">
                <button onClick={() => handleMobileSectionChange("profile")} className="w-full flex items-center gap-4 p-4 text-left border-b border-gray-50 active:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-[#f2f8f5] text-[#428475] flex items-center justify-center shrink-0">
                    <i className="fas fa-user text-[14px]"></i>
                  </div>
                  <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Edit profile</span>
                  <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </button>
                
                <button onClick={() => handleMobileSectionChange("payment")} className="w-full flex items-center gap-4 p-4 text-left border-b border-gray-50 active:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-[#f2f8f5] text-[#428475] flex items-center justify-center shrink-0">
                    <i className="fas fa-credit-card text-[14px]"></i>
                  </div>
                  <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Payment & billing</span>
                  <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </button>

                <button onClick={() => handleMobileSectionChange("security")} className="w-full flex items-center gap-4 p-4 text-left active:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-[#f2f8f5] text-[#428475] flex items-center justify-center shrink-0">
                    <i className="fas fa-lock text-[14px]"></i>
                  </div>
                  <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Security & password</span>
                  <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </button>
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <p className="text-[11px] font-bold text-[#8ba69c] uppercase tracking-wider mb-2.5 px-1">Preferences</p>
              <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden flex flex-col">
                <button onClick={() => handleMobileSectionChange("notifications")} className="w-full flex items-center gap-4 p-4 text-left border-b border-gray-50 active:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-[#eff4fe] text-[#4f7bf6] flex items-center justify-center shrink-0">
                    <i className="fas fa-bell text-[14px]"></i>
                  </div>
                  <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Notifications</span>
                  <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </button>

                <button onClick={handleDeleteAccount} className="w-full flex items-center gap-4 p-4 text-left active:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-[#fef2f2] text-[#ef4444] flex items-center justify-center shrink-0">
                    <i className="fas fa-exclamation-triangle text-[14px]"></i>
                  </div>
                  <span className="flex-1 font-bold text-[14px] text-[#ef4444]">Delete Account</span>
                  <div className="text-[#fca5a5] shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className={`flex-1 min-w-0 min-h-0 h-full overflow-hidden ${showMobileMenu ? "hidden md:flex" : "flex flex-col"}`}>
          <div className="flex flex-col md:grid md:grid-cols-[220px_minmax(0,1fr)] items-stretch h-full min-h-0 w-full">
            <div className="hidden md:block border-r border-[#e0e9e3] bg-white">
              <SettingsSidebarNav
                tabs={TABS}
                activeTab={visibleTab}
                onSelectTab={setActiveTab}
                onDeleteAccount={handleDeleteAccount}
              />
            </div>

            <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 md:px-[40px] pt-4 md:pt-[28px] pb-8 md:pb-[32px]`}>
              <div className="md:hidden flex items-center mb-6 pt-2">
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="flex items-center gap-2 text-[13px] font-bold text-[#428475]"
                >
                  <div className="flex items-center justify-center w-7 h-7 bg-white rounded-full shadow-sm border border-gray-100">
                    <i className="fas fa-arrow-left text-[#0f1c18] text-[11px]"></i>
                  </div>
                  Settings
                </button>
              </div>

              <div
                className={`${styles.contentInner} ${visibleTab === "profile" ? styles.contentInnerWide : ""} max-w-full`}
              >
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
    </>
  );
};

export default Settings;
