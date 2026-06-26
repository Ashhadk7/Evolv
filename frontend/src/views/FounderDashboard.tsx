"use client";

import { useState, useEffect } from "react";
import { Sidebar, type FounderTab } from "@/components/founder/Sidebar";
import { OnboardingWizard, type FounderProfile } from "@/components/founder/OnboardingWizard";
import { DashboardOverview } from "@/components/founder/DashboardOverview";
import { WorkspaceTab, DEFAULT_BLUEPRINTS, type Blueprint } from "@/components/founder/WorkspaceTab";
import { AnalysisTab } from "@/components/founder/AnalysisTab";
import { InboxTab } from "@/components/founder/InboxTab";
import { SettingsTab } from "@/components/founder/SettingsTab";

/* ── Default profile ── */
const DEFAULT_PROFILE: FounderProfile = {
  firstName: "Asad",
  lastName: "",
  bio: "",
  domains: [],
  linkedin: "",
  dob: "",
  gender: "",
  phone: "",
  education: "",
  description: "",
  email: "",
};

const STORAGE_KEY_PROFILE = "evolv_founder_profile";
const STORAGE_KEY_BLUEPRINTS = "evolv_founder_blueprints";

export default function FounderDashboard() {
  const [tab, setTab] = useState<FounderTab>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_PROFILE);
  const [blueprints, setBlueprints] = useState<Blueprint[]>(DEFAULT_BLUEPRINTS);
  const [openBlueprintId, setOpenBlueprintId] = useState<string | null>(null);
  const [triggerForge, setTriggerForge] = useState(false);

  /* ── Load from localStorage ── */
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedBlueprints = localStorage.getItem(STORAGE_KEY_BLUEPRINTS);
      if (storedBlueprints) setBlueprints(JSON.parse(storedBlueprints));
    } catch {
      /* ignore parse errors */
    }

    /* Show onboarding if ?setup=true in URL */
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("setup") === "true") {
        setShowOnboarding(true);
      }
    }
  }, []);

  /* ── Persist profile ── */
  const saveProfile = (p: FounderProfile) => {
    setProfile(p);
    try { localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(p)); } catch { /* ignore */ }
  };

  /* ── Persist blueprints ── */
  const saveBlueprints = (bps: Blueprint[]) => {
    setBlueprints(bps);
    try { localStorage.setItem(STORAGE_KEY_BLUEPRINTS, JSON.stringify(bps)); } catch { /* ignore */ }
  };

  /* ── Onboarding handlers ── */
  const handleOnboardingComplete = (p: FounderProfile) => {
    saveProfile(p);
    setShowOnboarding(false);
    /* Clear ?setup param from URL without reload */
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

  /* ── Navigate to workspace and open blueprint ── */
  const handleViewBlueprint = (id: string) => {
    setOpenBlueprintId(id);
    setTab("workspace");
  };

  return (
    <div className="founder-shell flex overflow-hidden" style={{ height: "100vh", background: "#f5f6f4" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .founder-shell button:not(:disabled) {
          cursor: pointer;
        }

        .founder-shell button:disabled {
          cursor: not-allowed;
        }
      ` }} />

      {/* Sidebar */}
      <Sidebar
        active={tab}
        onNavigate={setTab}
        profile={profile}
        inboxCount={3}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {tab === "dashboard" && (
          <DashboardOverview
            profile={profile}
            onNavigateWorkspace={(forge) => {
              setTab("workspace");
              if (forge) setTriggerForge(true);
            }}
            blueprints={blueprints}
            onViewBlueprint={handleViewBlueprint}
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
          />
        )}
        {tab === "analysis" && <AnalysisTab />}
        {tab === "inbox" && <InboxTab />}
        {tab === "settings" && (
          <SettingsTab profile={profile} onProfileSave={saveProfile} />
        )}
      </main>

      {/* Onboarding overlay */}
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
