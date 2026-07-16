"use client";

// Developer navigation + orchestration handlers, shared by the developer layout
// and every developer page. Mirror of use-founder-navigation.
import { useRouter } from "next/navigation";
import {
  getMissingDeveloperProfileFields,
  isDeveloperProfileComplete,
  type DeveloperProfile,
} from "@/features/developer-dashboard/profile-utils";
import type { DeveloperNetworkMessageTarget } from "@/features/network/types";
import { useDeveloperDashboardStore } from "./store";

export function useDeveloperNavigation() {
  const router = useRouter();
  const go = (tab: string) => router.push(`/developer/${tab}`);

  const navigateDeveloper = (tab: string) => {
    useDeveloperDashboardStore.getState().setPendingProtectedAction(null);
    go(tab);
  };

  const handleOpenProfile = () => {
    const s = useDeveloperDashboardStore.getState();
    s.setSettingsTab("profile");
    s.setShowOnboarding(false);
    s.setProfilePromptDismissed(true);
    go("settings");
  };

  const handleOpenSecurity = () => {
    const s = useDeveloperDashboardStore.getState();
    s.setSettingsTab("security");
    s.setShowOnboarding(false);
    s.setPendingProtectedAction(null);
    s.setProfilePromptDismissed(true);
    go("settings");
  };

  const handleOpenNetworkMessage = (contact: DeveloperNetworkMessageTarget) => {
    useDeveloperDashboardStore.getState().addNetworkInboxContact(contact);
    go("inbox");
  };

  const requireDeveloperProfile = (afterComplete?: () => void) => {
    const s = useDeveloperDashboardStore.getState();
    if (isDeveloperProfileComplete(s.profile)) {
      afterComplete?.();
      return;
    }
    const missing = getMissingDeveloperProfileFields(s.profile);
    if (missing.length === 1 && missing[0] === "verified phone number") {
      s.setPendingProtectedAction(null);
      s.setShowOnboarding(false);
      s.setProfilePromptDismissed(false);
      return;
    }
    s.setPendingProtectedAction(afterComplete ?? null);
    s.setProfilePromptDismissed(true);
    s.setShowOnboarding(true);
  };

  const handleOnboardingComplete = async (updatedProfile?: DeveloperProfile) => {
    const s = useDeveloperDashboardStore.getState();
    const pendingAction = s.pendingProtectedAction;
    await s.completeProfile(updatedProfile);
    s.setShowOnboarding(false);
    s.setProfilePromptDismissed(true);
    s.setPendingProtectedAction(null);
    if (pendingAction) window.setTimeout(pendingAction, 0);
  };

  const handleOnboardingSkip = () => {
    const s = useDeveloperDashboardStore.getState();
    s.setPendingProtectedAction(null);
    s.setShowOnboarding(false);
    s.setProfilePromptDismissed(true);
  };

  return {
    go,
    navigateDeveloper,
    handleOpenProfile,
    handleOpenSecurity,
    handleOpenNetworkMessage,
    requireDeveloperProfile,
    handleOnboardingComplete,
    handleOnboardingSkip,
  };
}
