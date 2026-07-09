"use client";

// Founder navigation + orchestration handlers, shared by the founder layout and
// every founder page. Each handler composes a store action with router navigation.
// Reads use `getState()` so this hook does not subscribe/re-render on store changes.
import { useRouter } from "next/navigation";
import {
  getMissingFounderProfileFields,
  normalizeFounderProfileForSave,
} from "@/features/founder-dashboard/profile-utils";
import { clearAuthSession } from "@/features/auth/lib/auth-session";
import { PHONE_VERIFICATION_LABEL } from "@/features/auth/lib/phone-verification";
import type { FounderProfile } from "./types";
import type { FounderNetworkMessageTarget } from "@/features/network/types";
import { useFounderDashboardStore } from "./store";
import { STORAGE_KEY_BLUEPRINTS, STORAGE_KEY_PROFILE } from "./profile";

function cleanupSetupParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("setup");
  window.history.replaceState({}, "", url.toString());
}

function onlyPhoneVerificationMissing(missing: string[]) {
  return missing.length === 1 && missing[0] === PHONE_VERIFICATION_LABEL;
}

export function useFounderNavigation() {
  const router = useRouter();
  const go = (tab: string) => router.push(`/founder/${tab}`);

  const navigateFounder = (tab: string) => {
    const s = useFounderDashboardStore.getState();
    s.setPendingProtectedAction(null);
    s.setPendingProtectedTab(null);
    go(tab);
  };

  const handleViewBlueprint = (id: string) => {
    useFounderDashboardStore.getState().setOpenBlueprintId(id);
    go("workspace");
  };

  const handleOpenNetworkMessage = (contact: FounderNetworkMessageTarget) => {
    useFounderDashboardStore.getState().addNetworkInboxContact(contact);
    go("inbox");
  };

  const handleOpenProfile = () => {
    const s = useFounderDashboardStore.getState();
    const missing = getMissingFounderProfileFields(s.profile);
    s.setSettingsSection(onlyPhoneVerificationMissing(missing) ? "security" : "profile");
    s.setShowOnboarding(false);
    s.setPendingProtectedTab(null);
    s.setProfilePromptDismissed(true);
    s.bumpSettingsEditSignal();
    go("settings");
  };

  const handleOpenPaymentSettings = () => {
    const s = useFounderDashboardStore.getState();
    s.setSettingsSection("payment");
    s.setShowOnboarding(false);
    s.setPendingProtectedTab(null);
    go("settings");
  };

  const requireFounderProfile = (afterComplete?: () => void) => {
    const s = useFounderDashboardStore.getState();
    const missing = getMissingFounderProfileFields(s.profile);
    if (!missing.length) {
      afterComplete?.();
      return;
    }
    s.setPendingProtectedAction(afterComplete ?? null);
    s.setPendingProtectedTab(null);
    s.setProfilePromptDismissed(true);
    if (onlyPhoneVerificationMissing(missing)) {
      s.setSettingsSection("security");
      s.setShowOnboarding(false);
      go("settings");
      return;
    }
    s.setShowOnboarding(true);
  };

  const handleOnboardingComplete = (p: FounderProfile) => {
    const s = useFounderDashboardStore.getState();
    const pendingAction = s.pendingProtectedAction;
    const nextProfile = normalizeFounderProfileForSave(p) as FounderProfile;
    const missing = getMissingFounderProfileFields(nextProfile);
    s.setPendingProtectedAction(null);
    s.saveProfile(nextProfile);
    s.setShowOnboarding(false);
    s.setProfilePromptDismissed(true);
    if (!missing.length && pendingAction) {
      window.setTimeout(pendingAction, 0);
      s.setPendingProtectedTab(null);
    } else if (pendingAction && onlyPhoneVerificationMissing(missing)) {
      s.setPendingProtectedAction(pendingAction);
      s.setSettingsSection("security");
      go("settings");
    } else if (s.pendingProtectedTab) {
      go(s.pendingProtectedTab);
      s.setPendingProtectedTab(null);
    }
    cleanupSetupParam();
  };

  const handleOnboardingSkip = () => {
    const s = useFounderDashboardStore.getState();
    s.setPendingProtectedAction(null);
    s.setShowOnboarding(false);
    s.setProfilePromptDismissed(true);
    s.setPendingProtectedTab(null);
    cleanupSetupParam();
  };

  const handleLogout = () => {
    try {
      clearAuthSession();
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_BLUEPRINTS);
    } catch {
      /* ignore */
    }
    window.location.href = "/sign-in";
  };

  return {
    go,
    navigateFounder,
    handleViewBlueprint,
    handleOpenNetworkMessage,
    handleOpenProfile,
    handleOpenPaymentSettings,
    requireFounderProfile,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handleLogout,
  };
}
