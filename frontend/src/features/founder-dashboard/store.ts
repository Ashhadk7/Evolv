// ─────────────────────────────────────────────────────────────────────────────
// Founder dashboard shared state (Zustand).
// Holds the cross-tab state that used to live as useState in the 400-line
// FounderDashboard view. This is the foundation for Phase 3: once tabs become
// real routes, each route reads/writes this store instead of prop-drilling.
//
// The store owns DATA + persistence only. Navigation (router.push / <Link>) stays
// in the component/route layer, which composes these actions with the router.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import type { FounderProfile } from "./types";
import { DEFAULT_BLUEPRINTS } from "@/features/workspace/components/workspace-tab";
import type { Blueprint } from "@/features/blueprints/types";
import type { SettingsSection } from "@/features/settings/components/founder-settings-tab";
import type { InboxLaunchContact } from "@/features/messaging/types/inbox-types";
import {
  isFounderProfileComplete,
  normalizeFounderProfileForSave,
} from "@/features/founder-dashboard/profile-utils";
import type { PhoneVerificationStatus } from "@/features/auth/lib/phone-verification";
import {
  DEFAULT_FOUNDER_PROFILE,
  STORAGE_KEY_BLUEPRINTS,
  STORAGE_KEY_PROFILE,
  mergeFounderProfiles,
  type StoredFounderRecord,
} from "./profile";

interface FounderDashboardState {
  // ── data ──
  profile: FounderProfile;
  blueprints: Blueprint[];
  dataLoaded: boolean;
  // ── cross-tab UI state ──
  openBlueprintId: string | null;
  triggerForge: boolean;
  networkRequestCount: number;
  inboxActiveContactId: string;
  networkInboxContacts: InboxLaunchContact[];
  settingsSection: SettingsSection;
  settingsEditSignal: number;
  // ── onboarding / profile-gating ──
  showOnboarding: boolean;
  profilePromptDismissed: boolean;
  pendingProtectedTab: string | null;
  /** Deferred action to run once the profile is completed (was a ref in the view). */
  pendingProtectedAction: (() => void) | null;

  // ── actions (data + persistence) ──
  loadData: () => void;
  saveProfile: (p: FounderProfile) => void;
  setPhoneVerificationStatus: (status: PhoneVerificationStatus) => void;
  saveBlueprints: (bps: Blueprint[]) => void;
  // ── granular setters ──
  setOpenBlueprintId: (id: string | null) => void;
  setTriggerForge: (v: boolean) => void;
  setNetworkRequestCount: (n: number) => void;
  setInboxActiveContactId: (id: string) => void;
  addNetworkInboxContact: (contact: InboxLaunchContact) => void;
  setSettingsSection: (s: SettingsSection) => void;
  bumpSettingsEditSignal: () => void;
  setShowOnboarding: (v: boolean) => void;
  setProfilePromptDismissed: (v: boolean) => void;
  setPendingProtectedTab: (t: string | null) => void;
  setPendingProtectedAction: (fn: (() => void) | null) => void;
}

export const useFounderDashboardStore = create<FounderDashboardState>((set, get) => ({
  profile: DEFAULT_FOUNDER_PROFILE,
  blueprints: DEFAULT_BLUEPRINTS,
  dataLoaded: false,
  openBlueprintId: null,
  triggerForge: false,
  networkRequestCount: 3,
  inboxActiveContactId: "sarah",
  networkInboxContacts: [],
  settingsSection: "profile",
  settingsEditSignal: 0,
  showOnboarding: false,
  profilePromptDismissed: false,
  pendingProtectedTab: null,
  pendingProtectedAction: null,

  loadData: () => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      const savedProfile = storedProfile
        ? (JSON.parse(storedProfile) as StoredFounderRecord)
        : null;
      const savedUsers = JSON.parse(
        localStorage.getItem("evolv_users") ?? "[]"
      ) as StoredFounderRecord[];
      const matchingUser = savedUsers.find(
        (user) =>
          user.role === "founder" &&
          (!savedProfile?.email || user.email?.toLowerCase() === savedProfile.email.toLowerCase())
      );

      const nextProfile = mergeFounderProfiles(
        DEFAULT_FOUNDER_PROFILE,
        matchingUser?.profile,
        savedProfile
      );
      set({ profile: nextProfile });
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(nextProfile));

      const storedBlueprints = localStorage.getItem(STORAGE_KEY_BLUEPRINTS);
      if (storedBlueprints) set({ blueprints: JSON.parse(storedBlueprints) as Blueprint[] });
    } catch {
      /* ignore */
    }
    set({ dataLoaded: true });
  },

  saveProfile: (p) => {
    const nextProfile = normalizeFounderProfileForSave(p) as FounderProfile;
    set({ profile: nextProfile });
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(nextProfile));

      if (nextProfile.email) {
        const savedUsers = JSON.parse(
          localStorage.getItem("evolv_users") ?? "[]"
        ) as StoredFounderRecord[];
        const updatedUsers = savedUsers.map((user) => {
          const sameFounder =
            user.role === "founder" &&
            user.email?.toLowerCase() === nextProfile.email?.toLowerCase();

          return sameFounder
            ? {
                ...user,
                firstName: nextProfile.firstName,
                lastName: nextProfile.lastName,
                email: nextProfile.email,
                profile: { ...(user.profile ?? {}), ...nextProfile },
              }
            : user;
        });
        localStorage.setItem("evolv_users", JSON.stringify(updatedUsers));
      }
    } catch {
      /* ignore */
    }
  },

  setPhoneVerificationStatus: (status) => {
    const current = get().profile;
    const nextProfile = normalizeFounderProfileForSave({
      ...current,
      phone: status.phone ?? current.phone,
      phoneVerified: status.phoneVerified,
    }) as FounderProfile;
    const pendingAction = get().pendingProtectedAction;

    get().saveProfile(nextProfile);
    if (pendingAction && isFounderProfileComplete(nextProfile)) {
      set({ pendingProtectedAction: null, pendingProtectedTab: null, profilePromptDismissed: true });
      window.setTimeout(pendingAction, 0);
    }
  },

  saveBlueprints: (bps) => {
    set({ blueprints: bps });
    try {
      localStorage.setItem(STORAGE_KEY_BLUEPRINTS, JSON.stringify(bps));
    } catch {
      /* ignore */
    }
  },

  setOpenBlueprintId: (id) => set({ openBlueprintId: id }),
  setTriggerForge: (v) => set({ triggerForge: v }),
  setNetworkRequestCount: (n) => set({ networkRequestCount: n }),
  setInboxActiveContactId: (id) => set({ inboxActiveContactId: id }),
  addNetworkInboxContact: (contact) =>
    set((s) => ({
      networkInboxContacts: [contact, ...s.networkInboxContacts.filter((c) => c.id !== contact.id)],
      inboxActiveContactId: contact.id,
    })),
  setSettingsSection: (section) => set({ settingsSection: section }),
  bumpSettingsEditSignal: () => set((s) => ({ settingsEditSignal: s.settingsEditSignal + 1 })),
  setShowOnboarding: (v) => set({ showOnboarding: v }),
  setProfilePromptDismissed: (v) => set({ profilePromptDismissed: v }),
  setPendingProtectedTab: (t) => set({ pendingProtectedTab: t }),
  setPendingProtectedAction: (fn) => set({ pendingProtectedAction: fn }),
}));
