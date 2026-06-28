"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sidebar, type FounderTab } from "@/components/founder/Sidebar";
import { OnboardingWizard, type FounderProfile } from "@/components/founder/OnboardingWizard";
import { type SettingsSection } from "@/components/founder/SettingsTab";
import { type FounderNetworkMessageTarget } from "@/components/founder/NetworkTab";
import { type InboxLaunchContact } from "@/components/founder/InboxTab";

// Eagerly load the default tab
import { DashboardOverview } from "@/components/founder/DashboardOverview";
import { DEFAULT_BLUEPRINTS, type Blueprint } from "@/components/founder/WorkspaceTab";

// Lazy-load non-default tabs
const WorkspaceTab  = dynamic(() => import("@/components/founder/WorkspaceTab").then(m => ({ default: m.WorkspaceTab })));
const AnalysisTab   = dynamic(() => import("@/components/founder/AnalysisTab").then(m => ({ default: m.AnalysisTab })));
const InboxTab      = dynamic(() => import("@/components/founder/InboxTab").then(m => ({ default: m.InboxTab })));
const NetworkTab    = dynamic(() => import("@/components/founder/NetworkTab").then(m => ({ default: m.NetworkTab })));
const SettingsTab   = dynamic(() => import("@/components/founder/SettingsTab").then(m => ({ default: m.SettingsTab })));

const DEFAULT_PROFILE: FounderProfile = {
  firstName: "Asad", lastName: "", bio: "", domains: [], linkedin: "",
  dob: "", gender: "", phone: "", education: "", description: "",
  headline: "", location: "", country: "", primaryGoal: "", idNumber: "",
  email: "", avatarUrl: "", profileComplete: false,
};

const STORAGE_KEY_PROFILE    = "evolv_founder_profile";
const STORAGE_KEY_BLUEPRINTS = "evolv_founder_blueprints";

type StoredFounderRecord = Partial<FounderProfile> & {
  profile?: Partial<FounderProfile>;
  role?: string;
};

function mergeFounderProfiles(...profiles: Array<Partial<FounderProfile> | null | undefined>): FounderProfile {
  const merged: FounderProfile = { ...DEFAULT_PROFILE, domains: [] };
  const target = merged as Record<string, unknown>;

  profiles.forEach((profile) => {
    if (!profile) return;

    Object.entries(profile).forEach(([key, value]) => {
      if (key === "domains") {
        if (Array.isArray(value) && value.length > 0) target.domains = value;
        return;
      }
      if (key === "profileComplete") {
        if (value === true) target.profileComplete = true;
        return;
      }
      if (typeof value === "string" && value.trim()) target[key] = value;
      else if (value !== undefined && value !== null && typeof value !== "string") target[key] = value;
    });
  });

  merged.domains = Array.isArray(merged.domains) ? merged.domains : [];
  merged.bio = merged.bio || merged.headline || "";
  merged.description = merged.description || "";
  return merged;
}

export default function FounderDashboard() {
  const [tab, setTab] = useState<FounderTab>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_PROFILE);
  const [blueprints, setBlueprints] = useState<Blueprint[]>(DEFAULT_BLUEPRINTS);
  const [openBlueprintId, setOpenBlueprintId] = useState<string | null>(null);
  const [triggerForge, setTriggerForge] = useState(false);
  const [networkRequestCount, setNetworkRequestCount] = useState(3);
  const [inboxActiveContactId, setInboxActiveContactId] = useState("sarah");
  const [networkInboxContacts, setNetworkInboxContacts] = useState<InboxLaunchContact[]>([]);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("profile");

  const isProfileComplete = (p: FounderProfile) =>
    Boolean(p.profileComplete || (p.firstName && p.lastName && (p.bio || p.headline) && p.domains.length > 0));

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      try {
        const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
        const savedProfile = storedProfile ? (JSON.parse(storedProfile) as StoredFounderRecord) : null;
        const savedUsers = JSON.parse(localStorage.getItem("evolv_users") ?? "[]") as StoredFounderRecord[];
        const matchingUser = savedUsers.find((user) =>
          user.role === "founder" &&
          (!savedProfile?.email || user.email?.toLowerCase() === savedProfile.email.toLowerCase())
        );

        const nextProfile = mergeFounderProfiles(
          DEFAULT_PROFILE,
          matchingUser?.profile,
          savedProfile,
        );
        setProfile(nextProfile);
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(nextProfile));

        const storedBlueprints = localStorage.getItem(STORAGE_KEY_BLUEPRINTS);
        if (storedBlueprints) setBlueprints(JSON.parse(storedBlueprints));
      } catch { /* ignore */ }

      const params = new URLSearchParams(window.location.search);
      if (params.get("setup") === "true") setShowOnboarding(true);
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  const saveProfile = (p: FounderProfile) => {
    const nextProfile = { ...p, profileComplete: isProfileComplete(p) };
    setProfile(nextProfile);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(nextProfile));

      if (nextProfile.email) {
        const savedUsers = JSON.parse(localStorage.getItem("evolv_users") ?? "[]") as StoredFounderRecord[];
        const updatedUsers = savedUsers.map((user) => {
          const sameFounder =
            user.role === "founder" &&
            user.email?.toLowerCase() === nextProfile.email?.toLowerCase();

          return sameFounder
            ? {
                ...user,
                firstName: nextProfile.firstName,
                lastName: nextProfile.lastName,
                email: nextProfile.email,
                profile: { ...(user.profile ?? {}), ...nextProfile },
              }
            : user;
        });
        localStorage.setItem("evolv_users", JSON.stringify(updatedUsers));
      }
    } catch { /* ignore */ }
  };

  const saveBlueprints = (bps: Blueprint[]) => {
    setBlueprints(bps);
    try { localStorage.setItem(STORAGE_KEY_BLUEPRINTS, JSON.stringify(bps)); } catch { /* ignore */ }
  };

  const handleOnboardingComplete = (p: FounderProfile) => {
    saveProfile({ ...p, profileComplete: true });
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("setup");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("setup");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const profileComplete = isProfileComplete(profile);

  const navigateFounder = (nextTab: FounderTab) => {
    if (!profileComplete && (nextTab === "network" || nextTab === "inbox")) {
      setShowOnboarding(true);
      setTab("settings");
      return;
    }
    setTab(nextTab);
  };

  const handleViewBlueprint = (id: string) => {
    setOpenBlueprintId(id);
    setTab("workspace");
  };

  const handleOpenNetworkMessage = (contact: FounderNetworkMessageTarget) => {
    setNetworkInboxContacts((prev) => [contact, ...prev.filter((item) => item.id !== contact.id)]);
    setInboxActiveContactId(contact.id);
    setTab("inbox");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_BLUEPRINTS);
    } catch { /* ignore */ }
    window.location.href = "/sign-in";
  };

  const handleOpenProfile = () => {
    setSettingsSection("profile");
    setShowOnboarding(false);
    setTab("settings");
  };

  return (
    <div className="founder-shell flex overflow-hidden" style={{ height: "100vh", background: "#f5f6f4" }}>
      <style dangerouslySetInnerHTML={{ __html: `.founder-shell button:not(:disabled){cursor:pointer}.founder-shell button:disabled{cursor:not-allowed}` }} />

      <Sidebar
        active={tab}
        onNavigate={navigateFounder}
        profile={profile}
        inboxCount={3}
        networkCount={networkRequestCount}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-hidden">
        {tab === "dashboard" && (
          <DashboardOverview
            profile={profile}
            onNavigateWorkspace={(forge) => { setTab("workspace"); if (forge) setTriggerForge(true); }}
            blueprints={blueprints}
            onViewBlueprint={handleViewBlueprint}
            profileComplete={profileComplete}
          />
        )}
        {tab === "workspace" && (
          <WorkspaceTab
            initialBlueprints={blueprints}
            onBlueprintsChange={saveBlueprints}
            openBlueprintId={openBlueprintId}
            onClearOpen={() => setOpenBlueprintId(null)}
            triggerForge={triggerForge}
            onClearForge={() => setTriggerForge(false)}
            profileComplete={profileComplete}
            onCompleteProfile={() => { setTab("settings"); setSettingsSection("profile"); setShowOnboarding(true); }}
          />
        )}
        {tab === "analysis" && <AnalysisTab />}
        {tab === "network" && (
          <NetworkTab
            onMessage={handleOpenNetworkMessage}
            onPendingCountChange={setNetworkRequestCount}
          />
        )}
        {tab === "inbox" && (
          <InboxTab
            activeContactId={inboxActiveContactId}
            onActiveContactChange={setInboxActiveContactId}
            extraContacts={networkInboxContacts}
          />
        )}
        {tab === "settings" && (
          <SettingsTab
            profile={profile}
            onProfileSave={saveProfile}
            section={settingsSection}
            onSectionChange={setSettingsSection}
          />
        )}
      </main>

      {showOnboarding && (
        <OnboardingWizard
          initialProfile={profile}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
}
