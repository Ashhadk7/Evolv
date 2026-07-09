"use client";

import "../../developer.css";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ProfileCompletionPrompt } from "@/components/layout/profile-completion-prompt";
import { DevOnboardingModal } from "@/features/onboarding/components/developer-onboarding-modal";
import { developerNav } from "@/config/navigation";
import { developerNotifs } from "@/features/notifications/data";
import {
  getMissingDeveloperProfileFields,
  isDeveloperProfileComplete,
} from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeId = pathname.split("/")[2] || "dashboard";
  const isSettings = pathname === "/developer/settings";

  const {
    profile,
    dataLoaded,
    userName,
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

  return (
    <div className="flex min-h-screen bg-[#f5f6f4]">
      {!isSettings && (
        <DashboardSidebar
          sections={developerNav}
          activeId={activeId}
          onNavigate={(id) => nav.navigateDeveloper(id)}
          roleLabel="Developer"
          profile={{
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl,
          }}
          initialNotifs={developerNotifs}
          inboxCount={3}
          networkCount={0}
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
        headerClassName="pr-3.5 pl-3.5"
        buttonPaddingX={10}
        onDismiss={() => setProfilePromptDismissed(true)}
        onOpenProfile={nav.handleOpenProfile}
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
  );
}
