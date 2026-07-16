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
import { normalizeFounderProfileForSave } from "@/features/founder-dashboard/profile-utils";
import { ApiError } from "@/lib/api";
import { loadFounderProfile, saveFounderProfile } from "@/features/profiles/profile-api";
import { getSession } from "@/features/auth/lib/session";
import { listBlueprints } from "@/features/blueprints/blueprints-api";
import {
  DEFAULT_FOUNDER_PROFILE,
  STORAGE_KEY_BLUEPRINTS,
  mergeFounderProfiles,
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
  loadData: () => Promise<void>;
  saveProfile: (p: FounderProfile) => Promise<void>;
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

export const useFounderDashboardStore = create<FounderDashboardState>((set) => ({
  profile: DEFAULT_FOUNDER_PROFILE,
  blueprints: DEFAULT_BLUEPRINTS,
  dataLoaded: false,
  openBlueprintId: null,
  triggerForge: false,
  networkRequestCount: 0,
  inboxActiveContactId: "sarah",
  networkInboxContacts: [],
  settingsSection: "profile",
  settingsEditSignal: 0,
  showOnboarding: false,
  profilePromptDismissed: false,
  pendingProtectedTab: null,
  pendingProtectedAction: null,

  loadData: async () => {
    try {
      set({ profile: mergeFounderProfiles(DEFAULT_FOUNDER_PROFILE, await loadFounderProfile()) });

      try {
        const apiBlueprints = await listBlueprints();
        set({ blueprints: apiBlueprints });
        localStorage.setItem(STORAGE_KEY_BLUEPRINTS, JSON.stringify(apiBlueprints));
      } catch {
        const storedBlueprints = localStorage.getItem(STORAGE_KEY_BLUEPRINTS);
        if (storedBlueprints) set({ blueprints: JSON.parse(storedBlueprints) as Blueprint[] });
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const user = getSession()?.user;
        set({ profile: { ...DEFAULT_FOUNDER_PROFILE, firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", email: user?.email ?? "" } });
      }
    }
    set({ dataLoaded: true });
  },

  saveProfile: async (p) => {
    const nextProfile = normalizeFounderProfileForSave(p) as FounderProfile;
    set({ profile: await saveFounderProfile(nextProfile) });
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
