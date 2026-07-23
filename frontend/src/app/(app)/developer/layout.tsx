"use client";

import "../../developer.css";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ProfileCompletionPrompt } from "@/components/layout/profile-completion-prompt";
import { DevOnboardingModal } from "@/features/onboarding/components/developer-onboarding-modal";
import { developerNav } from "@/config/navigation";
import {
  getMissingDeveloperProfileFields,
  isDeveloperProfileComplete,
} from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";
import { MessagingPresence } from "@/features/messaging/components/messaging-presence";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeId = pathname.split("/")[2] || "dashboard";
  const isSettings = pathname === "/developer/settings";

  const {
    profile,
    dataLoaded,
    userName,
    networkRequestCount,
    showOnboarding,
    profilePromptDismissed,
    loadData,
    setProfilePromptDismissed,
  } = useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();

  useEffect(() => {
    const loadTimer = window.setTimeout(() => loadData(), 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadData]);

  const profileComplete = isDeveloperProfileComplete(profile);
  const missingProfileFields = getMissingDeveloperProfileFields(profile);
  const needsOnlyPhoneVerification =
    missingProfileFields.length === 1 && missingProfileFields[0] === "verified phone number";

  return (
    <AuthGuard requiredRole="developer">
    <div className="flex min-h-screen bg-[#f5f6f4]">
      <MessagingPresence enabled={profileComplete} />
      {!isSettings && (
        <DashboardSidebar
          sections={developerNav}
          activeId={activeId}
          onNavigate={(id) => nav.navigateDeveloper(id)}
          roleLabel="Developer"
          profile={{
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
          }}
          initialNotifs={[]}
          inboxCount={0}
          networkCount={networkRequestCount}
          navPillId="dev-nav-pill"
          sticky
          avatarFallback="D"
        />
      )}

      <div className="min-w-0 flex-1">{dataLoaded ? children : null}</div>

      <ProfileCompletionPrompt
        visible={!profileComplete && !showOnboarding && !profilePromptDismissed}
        missingProfileFields={missingProfileFields}
        messageSuffix="before applying, messaging, or using network actions."
        title={needsOnlyPhoneVerification ? "Verify number" : "Complete profile setup"}
        message={
          needsOnlyPhoneVerification
            ? "Verify your phone number to complete your profile and appear in the network."
            : undefined
        }
        actionLabel={needsOnlyPhoneVerification ? "Verify number" : "Complete profile"}
        headerClassName="pr-3.5 pl-3.5"
        buttonPaddingX={10}
        onDismiss={() => setProfilePromptDismissed(true)}
        onOpenProfile={needsOnlyPhoneVerification ? nav.handleOpenSecurity : nav.handleOpenProfile}
      />

      {showOnboarding && (
        <DevOnboardingModal
          initialProfile={profile}
          onComplete={nav.handleOnboardingComplete}
          onSkip={nav.handleOnboardingSkip}
          userName={userName}
        />
      )}
    </div>
    </AuthGuard>
  );
}
