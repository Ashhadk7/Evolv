"use client";

// Developer navigation + orchestration handlers, shared by the developer layout
// and every developer page. Mirror of use-founder-navigation.
import { useRouter } from "next/navigation";
import {
  getMissingDeveloperProfileFields,
  normalizeDeveloperProfileForSave,
  type DeveloperProfile,
} from "@/features/developer-dashboard/profile-utils";
import { PHONE_VERIFICATION_LABEL } from "@/features/auth/lib/phone-verification";
import type { DeveloperNetworkMessageTarget } from "@/features/network/types";
import { useDeveloperDashboardStore } from "./store";

function onlyPhoneVerificationMissing(missing: string[]) {
  return missing.length === 1 && missing[0] === PHONE_VERIFICATION_LABEL;
}

export function useDeveloperNavigation() {
  const router = useRouter();
  const go = (tab: string) => router.push(`/developer/${tab}`);

  const navigateDeveloper = (tab: string) => {
    useDeveloperDashboardStore.getState().setPendingProtectedAction(null);
    go(tab);
  };

  const handleOpenProfile = () => {
    const s = useDeveloperDashboardStore.getState();
    const missing = getMissingDeveloperProfileFields(s.profile);
    s.setShowOnboarding(false);
    s.setProfilePromptDismissed(true);
    router.push(
      onlyPhoneVerificationMissing(missing) ? "/developer/settings?tab=security" : "/developer/settings"
    );
  };

  const handleOpenNetworkMessage = (contact: DeveloperNetworkMessageTarget) => {
    useDeveloperDashboardStore.getState().addNetworkInboxContact(contact);
    go("inbox");
  };

  const requireDeveloperProfile = (afterComplete?: () => void) => {
    const s = useDeveloperDashboardStore.getState();
    const missing = getMissingDeveloperProfileFields(s.profile);
    if (!missing.length) {
      afterComplete?.();
      return;
    }
    s.setPendingProtectedAction(afterComplete ?? null);
    s.setProfilePromptDismissed(true);
    if (onlyPhoneVerificationMissing(missing)) {
      s.setShowOnboarding(false);
      router.push("/developer/settings?tab=security");
      return;
    }
    s.setShowOnboarding(true);
  };

  const handleOnboardingComplete = (updatedProfile?: DeveloperProfile) => {
    const s = useDeveloperDashboardStore.getState();
    const pendingAction = s.pendingProtectedAction;
    const nextProfile = normalizeDeveloperProfileForSave(updatedProfile ?? s.profile);
    const missing = getMissingDeveloperProfileFields(nextProfile);
    s.completeProfile(nextProfile);
    s.setShowOnboarding(false);
    s.setProfilePromptDismissed(true);
    s.setPendingProtectedAction(null);
    if (!missing.length && pendingAction) {
      window.setTimeout(pendingAction, 0);
    } else if (pendingAction && onlyPhoneVerificationMissing(missing)) {
      s.setPendingProtectedAction(pendingAction);
      router.push("/developer/settings?tab=security");
    }
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
    handleOpenNetworkMessage,
    requireDeveloperProfile,
    handleOnboardingComplete,
    handleOnboardingSkip,
  };
}
