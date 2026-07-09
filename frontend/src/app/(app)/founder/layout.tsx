"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ProfileCompletionPrompt } from "@/components/layout/profile-completion-prompt";
import { getPhoneStatus } from "@/features/auth/lib/auth-api";
import { getStoredAuthSession } from "@/features/auth/lib/auth-session";
import {
  PHONE_VERIFICATION_LABEL,
  toPhoneVerificationStatus,
} from "@/features/auth/lib/phone-verification";
import { useRequireAuth } from "@/features/auth/hooks/use-require-auth";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { founderNav } from "@/config/navigation";
import { founderNotifs } from "@/features/notifications/data";
import {
  getMissingFounderProfileFields,
  isFounderProfileComplete,
} from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authorized = useRequireAuth("founder");
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
    setPhoneVerificationStatus,
    setProfilePromptDismissed,
  } = useFounderDashboardStore();
  const nav = useFounderNavigation();

  useEffect(() => {
    if (!authorized) return;
    const loadTimer = window.setTimeout(() => {
      loadData();
      syncPhoneStatus(setPhoneVerificationStatus);
      const params = new URLSearchParams(window.location.search);
      if (params.get("setup") === "true") {
        const url = new URL(window.location.href);
        url.searchParams.delete("setup");
        window.history.replaceState({}, "", url.toString());
      }
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [authorized, loadData, setPhoneVerificationStatus]);

  const profileComplete = isFounderProfileComplete(profile);
  const missingProfileFields = getMissingFounderProfileFields(profile);
  const onlyPhoneMissing =
    missingProfileFields.length === 1 && missingProfileFields[0] === PHONE_VERIFICATION_LABEL;

  if (!authorized) return <div className="min-h-screen bg-[#f5f6f4]" />;

  return (
    <div className="founder-shell flex h-screen overflow-hidden bg-[#f5f6f4]">
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
          initialNotifs={founderNotifs}
          inboxCount={3}
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
        actionLabel={onlyPhoneMissing ? "Verify phone" : "Complete profile"}
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
  );
}

async function syncPhoneStatus(
  setPhoneVerificationStatus: (status: ReturnType<typeof toPhoneVerificationStatus>) => void
) {
  const session = getStoredAuthSession();
  if (!session) return;

  try {
    const response = await getPhoneStatus(session.accessToken);
    setPhoneVerificationStatus(toPhoneVerificationStatus(response));
  } catch {
    /* status sync should not block the dashboard */
  }
}
