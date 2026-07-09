"use client";

import "../../developer.css";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ProfileCompletionPrompt } from "@/components/layout/profile-completion-prompt";
import { DevOnboardingModal } from "@/features/onboarding/components/developer-onboarding-modal";
import { developerNav } from "@/config/navigation";
import { getPhoneStatus } from "@/features/auth/lib/auth-api";
import { getStoredAuthSession } from "@/features/auth/lib/auth-session";
import {
  PHONE_VERIFICATION_LABEL,
  toPhoneVerificationStatus,
} from "@/features/auth/lib/phone-verification";
import { useRequireAuth } from "@/features/auth/hooks/use-require-auth";
import { developerNotifs } from "@/features/notifications/data";
import {
  getMissingDeveloperProfileFields,
  isDeveloperProfileComplete,
} from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authorized = useRequireAuth("developer");
  const activeId = pathname.split("/")[2] || "dashboard";
  const isSettings = pathname === "/developer/settings";

  const {
    profile,
    dataLoaded,
    userName,
    showOnboarding,
    profilePromptDismissed,
    loadData,
    setPhoneVerificationStatus,
    setProfilePromptDismissed,
  } = useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();

  useEffect(() => {
    if (!authorized) return;
    const loadTimer = window.setTimeout(() => {
      loadData();
      syncPhoneStatus(setPhoneVerificationStatus);
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [authorized, loadData, setPhoneVerificationStatus]);

  const profileComplete = isDeveloperProfileComplete(profile);
  const missingProfileFields = getMissingDeveloperProfileFields(profile);
  const onlyPhoneMissing =
    missingProfileFields.length === 1 && missingProfileFields[0] === PHONE_VERIFICATION_LABEL;

  if (!authorized) return <div className="min-h-screen bg-[#f5f6f4]" />;

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
        actionLabel={onlyPhoneMissing ? "Verify phone" : "Complete profile"}
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
