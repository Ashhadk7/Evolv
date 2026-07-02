"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle, X } from "@phosphor-icons/react";
import { Sidebar, type FounderTab } from "@/components/founder/Sidebar";
import { OnboardingWizard, type FounderProfile } from "@/components/founder/OnboardingWizard";
import { type SettingsSection } from "@/components/founder/SettingsTab";
import { type FounderNetworkMessageTarget } from "@/components/founder/NetworkTab";
import { type InboxLaunchContact } from "@/components/founder/InboxTab";
import {
  getMissingFounderProfileFields,
  isFounderProfileComplete,
  normalizeFounderProfileForSave,
} from "@/components/founder/profileUtils";

// Eagerly load the default tab
import { DashboardOverview } from "@/components/founder/DashboardOverview";
import { DEFAULT_BLUEPRINTS, type Blueprint } from "@/components/founder/WorkspaceTab";

// Lazy-load non-default tabs
const WorkspaceTab  = dynamic(() => import("@/components/founder/WorkspaceTab").then(m => ({ default: m.WorkspaceTab })));
const ProjectsTab   = dynamic(() => import("@/components/founder/ProjectsTab").then(m => ({ default: m.ProjectsTab })));
const InboxTab      = dynamic(() => import("@/components/founder/InboxTab").then(m => ({ default: m.InboxTab })));
const NetworkTab    = dynamic(() => import("@/components/founder/NetworkTab").then(m => ({ default: m.NetworkTab })));
const SettingsTab   = dynamic(() => import("@/components/founder/SettingsTab").then(m => ({ default: m.SettingsTab })));

const DEFAULT_PROFILE: FounderProfile = {
  firstName: "Asad", lastName: "", bio: "", domains: [], linkedin: "",
  dob: "", gender: "", phone: "", education: "", educationLevel: "", degreeName: "", degreeSelection: "", customDegreeName: "", educations: [], description: "",
  headline: "", location: "", country: "", countryCode: "", stateProvince: "", city: "", primaryGoal: "",
  email: "", avatarUrl: "", profileComplete: false, stripeConnected: false,
};

const STORAGE_KEY_PROFILE    = "evolv_founder_profile";
const STORAGE_KEY_BLUEPRINTS = "evolv_founder_blueprints";

type StoredFounderRecord = Partial<FounderProfile> & {
  profile?: Partial<FounderProfile>;
  role?: string;
};

function mergeFounderProfiles(...profiles: Array<Partial<FounderProfile> | null | undefined>): FounderProfile {
  const merged: FounderProfile = { ...DEFAULT_PROFILE, domains: [] };
  const target = merged as unknown as Record<string, unknown>;

  profiles.forEach((profile) => {
    if (!profile) return;

    Object.entries(profile).forEach(([key, value]) => {
      if (key === "idNumber") return;
      if (key === "domains") {
        if (Array.isArray(value) && value.length > 0) target.domains = value;
        return;
      }
      if (key === "educations") {
        if (Array.isArray(value) && value.length > 0) target.educations = value;
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
  merged.educations = Array.isArray(merged.educations) ? merged.educations : [];
  merged.bio = merged.bio || merged.headline || "";
  merged.description = merged.description || "";
  return normalizeFounderProfileForSave(merged) as FounderProfile;
}

function FounderDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs: FounderTab[] = ["dashboard", "workspace", "projects", "network", "inbox", "settings"];
  const tab = (tabParam && validTabs.includes(tabParam as FounderTab)) ? (tabParam as FounderTab) : "dashboard";

  const setTab = (nextTab: FounderTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_PROFILE);
  const [blueprints, setBlueprints] = useState<Blueprint[]>(DEFAULT_BLUEPRINTS);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [openBlueprintId, setOpenBlueprintId] = useState<string | null>(null);
  const [triggerForge, setTriggerForge] = useState(false);
  const [networkRequestCount, setNetworkRequestCount] = useState(3);
  const [inboxActiveContactId, setInboxActiveContactId] = useState("sarah");
  const [networkInboxContacts, setNetworkInboxContacts] = useState<InboxLaunchContact[]>([]);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("profile");
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(false);
  const [pendingProtectedTab, setPendingProtectedTab] = useState<FounderTab | null>(null);
  const [settingsEditSignal, setSettingsEditSignal] = useState(0);
  const pendingProtectedActionRef = useRef<(() => void) | null>(null);

  const isProfileComplete = (p: FounderProfile) =>
    isFounderProfileComplete(p);

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
      setDataLoaded(true);
      
      const params = new URLSearchParams(window.location.search);
      if (params.get("setup") === "true") {
        params.delete("setup");
        const url = new URL(window.location.href);
        url.searchParams.delete("setup");
        window.history.replaceState({}, "", url.toString());
      }
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  const saveProfile = (p: FounderProfile) => {
    const nextProfile = normalizeFounderProfileForSave(p) as FounderProfile;
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
    const pendingAction = pendingProtectedActionRef.current;
    pendingProtectedActionRef.current = null;
    saveProfile(p);
    setShowOnboarding(false);
    setProfilePromptDismissed(true);
    if (pendingAction) {
      window.setTimeout(pendingAction, 0);
      setPendingProtectedTab(null);
    } else if (pendingProtectedTab) {
      setTab(pendingProtectedTab);
      setPendingProtectedTab(null);
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("setup");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleOnboardingSkip = () => {
    pendingProtectedActionRef.current = null;
    setShowOnboarding(false);
    setProfilePromptDismissed(true);
    setPendingProtectedTab(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("setup");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const profileComplete = isProfileComplete(profile);

  const requireFounderProfile = (afterComplete?: () => void) => {
    if (profileComplete) {
      afterComplete?.();
      return;
    }
    pendingProtectedActionRef.current = afterComplete ?? null;
    setPendingProtectedTab(null);
    setProfilePromptDismissed(true);
    setShowOnboarding(true);
  };

  const navigateFounder = (nextTab: FounderTab) => {
    pendingProtectedActionRef.current = null;
    setPendingProtectedTab(null);
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
    setPendingProtectedTab(null);
    setProfilePromptDismissed(true);
    setSettingsEditSignal((value) => value + 1);
    setTab("settings");
  };

  const handleOpenPaymentSettings = () => {
    setSettingsSection("payment");
    setShowOnboarding(false);
    setPendingProtectedTab(null);
    setTab("settings");
  };

  const missingProfileFields = getMissingFounderProfileFields(profile);

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
        {!dataLoaded ? null : (
          <>
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
            onCompleteProfile={handleOpenProfile}
            onMessage={handleOpenNetworkMessage}
            onRequireProfile={requireFounderProfile}
          />
        )}
        {tab === "projects" && (
          <ProjectsTab
            blueprints={blueprints}
            onBlueprintsChange={saveBlueprints}
            onViewBlueprint={handleViewBlueprint}
            onNavigateNetwork={() => setTab("network")}
            onMessage={handleOpenNetworkMessage}
            stripeConnected={Boolean(profile.stripeConnected)}
            onNavigateSettingsPayment={handleOpenPaymentSettings}
          />
        )}
        {tab === "network" && (
          <NetworkTab
            onMessage={handleOpenNetworkMessage}
            onPendingCountChange={setNetworkRequestCount}
            profileComplete={profileComplete}
            onRequireProfile={requireFounderProfile}
          />
        )}
        {tab === "inbox" && (
          <InboxTab
            activeContactId={inboxActiveContactId}
            onActiveContactChange={setInboxActiveContactId}
            extraContacts={networkInboxContacts}
            currentUser={profile}
            profileComplete={profileComplete}
            onRequireProfile={requireFounderProfile}
          />
        )}
        {tab === "settings" && (
          <SettingsTab
            profile={profile}
            onProfileSave={saveProfile}
            section={settingsSection}
            onSectionChange={setSettingsSection}
            editSignal={settingsEditSignal}
          />
        )}
        </>
        )}
      </main>

      <AnimatePresence>
        {!profileComplete && !showOnboarding && !profilePromptDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed bottom-5 right-5 z-40 w-[320px] overflow-hidden bg-white"
            style={{ border: "1px solid #d9e7df", borderRadius: 12, boxShadow: "0 18px 44px rgba(15,28,24,0.16)" }}
          >
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#e8f5ef", color: "#428475" }}>
                <CheckCircle size={17} weight="fill" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-extrabold" style={{ color: "#1a2e26" }}>Complete profile setup</p>
                  <button
                    type="button"
                    onClick={() => setProfilePromptDismissed(true)}
                    className="rounded-md p-1 transition hover:bg-[#f0f5f2]"
                    aria-label="Dismiss profile setup reminder"
                    style={{ color: "#7a9e8e" }}
                  >
                    <X size={13} weight="bold" />
                  </button>
                </div>
                <p className="mt-1 text-[12px] leading-5" style={{ color: "#6b8e7e" }}>
                  Add {missingProfileFields.slice(0, 2).join(", ") || "your details"} before sending messages or connection requests.
                </p>
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="mt-3 flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12px] font-bold"
                  style={{ background: "#1a312c", color: "#89d7b7", paddingLeft: 5, paddingRight:5 }}
                >
                  Complete profile
                  <ArrowRight size={13} weight="bold" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default function FounderDashboard() {
  return (
    <Suspense fallback={null}>
      <FounderDashboardContent />
    </Suspense>
  );
}
