"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { getSession } from "@/features/auth/lib/session";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ProfileCompletionPrompt } from "@/components/layout/profile-completion-prompt";
import { founderNav } from "@/config/navigation";
import {
  getMissingFounderProfileFields,
  isFounderProfileComplete,
} from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";
import { MessagingPresence } from "@/features/messaging/components/messaging-presence";

const OnboardingWizard = dynamic(
  () => import("@/features/onboarding/components/onboarding-wizard").then((m) => m.OnboardingWizard),
  { ssr: false }
);

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
  const sessionEmail = getSession()?.user.email.trim().toLowerCase() ?? "";
  const profileEmail = (profile.email ?? "").trim().toLowerCase();
  const profileReady = dataLoaded && profileEmail === sessionEmail;
  const missingProfileFields = getMissingFounderProfileFields(profile);
  const needsOnlyPhoneVerification =
    missingProfileFields.length === 1 && missingProfileFields[0] === "verified phone number";

  return (
    <AuthGuard requiredRole="founder">
    <div className="founder-shell flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-[#f5f6f4]">
      <MessagingPresence enabled={profileReady && profileComplete} />
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

      <main className="flex-1 min-h-0 overflow-hidden bg-[#f5f6f4]">{profileReady ? children : null}</main>

      <ProfileCompletionPrompt
        visible={profileReady && !profileComplete && !showOnboarding && !profilePromptDismissed}
        missingProfileFields={missingProfileFields}
        messageSuffix="before sending messages or connection requests."
        title={needsOnlyPhoneVerification ? "Verify number" : "Complete profile setup"}
        message={
          needsOnlyPhoneVerification
            ? "Verify your phone number to complete your profile and appear in the network."
            : undefined
        }
        actionLabel={needsOnlyPhoneVerification ? "Verify number" : "Complete profile"}
        buttonPaddingX={5}
        onDismiss={() => setProfilePromptDismissed(true)}
        onOpenProfile={needsOnlyPhoneVerification ? nav.handleOpenSecurity : nav.handleOpenProfile}
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
