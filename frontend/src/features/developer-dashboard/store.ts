// ─────────────────────────────────────────────────────────────────────────────
// Developer dashboard shared state (Zustand) — mirror of the founder store.
// Owns data + persistence; navigation lives in use-developer-navigation.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import {
  isDeveloperProfileComplete,
  normalizeDeveloperProfileForSave,
  type DeveloperProfile,
} from "@/features/developer-dashboard/profile-utils";
import type { PhoneVerificationStatus } from "@/features/auth/lib/phone-verification";
import type { DeveloperInboxLaunchContact } from "@/features/messaging/types/developer-inbox-types";
import { DEFAULT_DEVELOPER_PROFILE } from "./profile";

interface DeveloperDashboardState {
  profile: DeveloperProfile;
  dataLoaded: boolean;
  userName: string;
  showOnboarding: boolean;
  profilePromptDismissed: boolean;
  inboxActiveContactId: string;
  networkInboxContacts: DeveloperInboxLaunchContact[];
  pendingProtectedAction: (() => void) | null;

  loadData: () => void;
  completeProfile: (updatedProfile?: DeveloperProfile) => void;
  setPhoneVerificationStatus: (status: PhoneVerificationStatus) => void;
  setShowOnboarding: (v: boolean) => void;
  setProfilePromptDismissed: (v: boolean) => void;
  setInboxActiveContactId: (id: string) => void;
  addNetworkInboxContact: (contact: DeveloperInboxLaunchContact) => void;
  setPendingProtectedAction: (fn: (() => void) | null) => void;
}

export const useDeveloperDashboardStore = create<DeveloperDashboardState>((set, get) => ({
  profile: DEFAULT_DEVELOPER_PROFILE,
  dataLoaded: false,
  userName: "",
  showOnboarding: false,
  profilePromptDismissed: false,
  inboxActiveContactId: "asad",
  networkInboxContacts: [],
  pendingProtectedAction: null,

  loadData: () => {
    try {
      const raw = localStorage.getItem("evolv_user");
      if (raw) {
        const user = JSON.parse(raw);
        set({
          profile: normalizeDeveloperProfileForSave({ ...DEFAULT_DEVELOPER_PROFILE, ...user }),
          userName: [user.firstName, user.lastName].filter(Boolean).join(" "),
        });
      } else {
        const defaultUser = {
          ...DEFAULT_DEVELOPER_PROFILE,
          firstTime: false,
          profileComplete: false,
        };
        localStorage.setItem("evolv_user", JSON.stringify(defaultUser));
        set({ profile: defaultUser, userName: "" });
      }
    } catch {
      /* ignore */
    }
    set({ dataLoaded: true });
  },

  completeProfile: (updatedProfile) => {
    const nextProfile = normalizeDeveloperProfileForSave(updatedProfile ?? get().profile);
    const profileComplete = isDeveloperProfileComplete(nextProfile);
    try {
      const raw = localStorage.getItem("evolv_user");
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "evolv_user",
        JSON.stringify({ ...existing, ...nextProfile, profileComplete, firstTime: false })
      );
    } catch {
      /* ignore */
    }
    set({ profile: { ...nextProfile, profileComplete, firstTime: false } });
  },

  setPhoneVerificationStatus: (status) => {
    const current = get().profile;
    const nextProfile = normalizeDeveloperProfileForSave({
      ...current,
      phone: status.phone ?? current.phone,
      phoneVerified: status.phoneVerified,
    });
    try {
      const raw = localStorage.getItem("evolv_user");
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem("evolv_user", JSON.stringify({ ...existing, ...nextProfile }));
    } catch {
      /* ignore */
    }
    set({ profile: nextProfile });
    const pendingAction = get().pendingProtectedAction;
    if (pendingAction && isDeveloperProfileComplete(nextProfile)) {
      set({ pendingProtectedAction: null, profilePromptDismissed: true });
      window.setTimeout(pendingAction, 0);
    }
  },

  setShowOnboarding: (v) => set({ showOnboarding: v }),
  setProfilePromptDismissed: (v) => set({ profilePromptDismissed: v }),
  setInboxActiveContactId: (id) => set({ inboxActiveContactId: id }),
  addNetworkInboxContact: (contact) =>
    set((s) => ({
      networkInboxContacts: [contact, ...s.networkInboxContacts.filter((c) => c.id !== contact.id)],
      inboxActiveContactId: contact.id,
    })),
  setPendingProtectedAction: (fn) => set({ pendingProtectedAction: fn }),
}));
