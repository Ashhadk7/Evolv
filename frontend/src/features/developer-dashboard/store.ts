// ─────────────────────────────────────────────────────────────────────────────
// Developer dashboard shared state (Zustand) — mirror of the founder store.
// Owns data + persistence; navigation lives in use-developer-navigation.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import {
  normalizeDeveloperProfileForSave,
  type DeveloperProfile,
} from "@/features/developer-dashboard/profile-utils";
import type { DeveloperInboxLaunchContact } from "@/features/messaging/types/developer-inbox-types";
import { DEFAULT_DEVELOPER_PROFILE } from "./profile";
import { ApiError } from "@/lib/api";
import { getSession } from "@/features/auth/lib/session";
import { loadDeveloperProfile, saveDeveloperProfile } from "@/features/profiles/profile-api";

interface DeveloperDashboardState {
  profile: DeveloperProfile;
  dataLoaded: boolean;
  userName: string;
  showOnboarding: boolean;
  profilePromptDismissed: boolean;
  inboxActiveContactId: string;
  networkInboxContacts: DeveloperInboxLaunchContact[];
  networkRequestCount: number;
  pendingProtectedAction: (() => void) | null;

  loadData: () => Promise<void>;
  completeProfile: (updatedProfile?: DeveloperProfile) => Promise<void>;
  setShowOnboarding: (v: boolean) => void;
  setProfilePromptDismissed: (v: boolean) => void;
  setInboxActiveContactId: (id: string) => void;
  addNetworkInboxContact: (contact: DeveloperInboxLaunchContact) => void;
  setNetworkRequestCount: (n: number) => void;
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
  networkRequestCount: 0,
  pendingProtectedAction: null,

  loadData: async () => {
    try {
      const profile = await loadDeveloperProfile();
      set({ profile, userName: [profile.firstName, profile.lastName].filter(Boolean).join(" ") });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const user = getSession()?.user;
        set({ profile: { ...DEFAULT_DEVELOPER_PROFILE, firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", email: user?.email ?? "" }, userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") });
      }
    }
    set({ dataLoaded: true });
  },

  completeProfile: async (updatedProfile) => {
    const nextProfile = normalizeDeveloperProfileForSave(updatedProfile ?? get().profile);
    set({ profile: await saveDeveloperProfile({ ...nextProfile, firstTime: false }) });
  },

  setShowOnboarding: (v) => set({ showOnboarding: v }),
  setProfilePromptDismissed: (v) => set({ profilePromptDismissed: v }),
  setInboxActiveContactId: (id) => set({ inboxActiveContactId: id }),
  addNetworkInboxContact: (contact) =>
    set((s) => ({
      networkInboxContacts: [contact, ...s.networkInboxContacts.filter((c) => c.id !== contact.id)],
      inboxActiveContactId: contact.conversationId ?? contact.id,
    })),
  setNetworkRequestCount: (n) => set({ networkRequestCount: n }),
  setPendingProtectedAction: (fn) => set({ pendingProtectedAction: fn }),
}));
