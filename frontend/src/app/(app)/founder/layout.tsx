"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ProfileCompletionPrompt } from "@/components/layout/profile-completion-prompt";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { founderNav } from "@/config/navigation";
import {
  getMissingFounderProfileFields,
  isFounderProfileComplete,
} from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";
import { MessagingPresence } from "@/features/messaging/components/messaging-presence";

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // URL is /founder/<tab> — segment [2] is the active tab.
  const activeId = pathname.split("/")[2] || "dashboard";
  const isSettings = pathname === "/founder/settings";

  const {
    profile,
    dataLoaded,
    networkRequestCount,
    showOnboarding,
    profilePromptDismissed,
    loadData,
    setProfilePromptDismissed,
  } = useFounderDashboardStore();
  const nav = useFounderNavigation();

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadData();
      const params = new URLSearchParams(window.location.search);
      if (params.get("setup") === "true") {
        const url = new URL(window.location.href);
        url.searchParams.delete("setup");
        window.history.replaceState({}, "", url.toString());
      }
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadData]);

  const profileComplete = isFounderProfileComplete(profile);
  const missingProfileFields = getMissingFounderProfileFields(profile);

  return (
    <AuthGuard requiredRole="founder">
    <div className="founder-shell flex h-screen overflow-hidden bg-[#f5f6f4]">
      <MessagingPresence enabled={profileComplete} />
      <style
        dangerouslySetInnerHTML={{
          __html: `.founder-shell button:not(:disabled){cursor:pointer}.founder-shell button:disabled{cursor:not-allowed}`,
        }}
      />

      {!isSettings && (
        <DashboardSidebar
          sections={founderNav}
          activeId={activeId}
          onNavigate={(id) => nav.navigateFounder(id)}
          roleLabel="Founder"
          profile={profile}
          initialNotifs={[]}
          inboxCount={0}
          networkCount={networkRequestCount}
          onOpenProfile={nav.handleOpenProfile}
          onLogout={nav.handleLogout}
          navPillId="founder-nav-pill"
          avatarFallback="F"
        />
      )}

      <main className="flex-1 overflow-hidden">{dataLoaded ? children : null}</main>

      <ProfileCompletionPrompt
        visible={!profileComplete && !showOnboarding && !profilePromptDismissed}
        missingProfileFields={missingProfileFields}
        messageSuffix="before sending messages or connection requests."
        buttonPaddingX={5}
        onDismiss={() => setProfilePromptDismissed(true)}
        onOpenProfile={nav.handleOpenProfile}
      />

      {showOnboarding && (
        <OnboardingWizard
          initialProfile={profile}
          onComplete={nav.handleOnboardingComplete}
          onSkip={nav.handleOnboardingSkip}
        />
      )}
    </div>
    </AuthGuard>
  );
}
