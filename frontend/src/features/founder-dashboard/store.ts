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
import type { Blueprint } from "@/features/blueprints/types";
import type { SettingsSection } from "@/features/settings/components/founder-settings-tab";
import type { InboxLaunchContact } from "@/features/messaging/types/inbox-types";
import { normalizeFounderProfileForSave } from "@/features/founder-dashboard/profile-utils";
import { loadFounderProfile, saveFounderProfile } from "@/features/profiles/profile-api";
import { getSession } from "@/features/auth/lib/session";
import { listBlueprints } from "@/features/blueprints/blueprints-api";
import { DEFAULT_FOUNDER_PROFILE, STORAGE_KEY_BLUEPRINTS, mergeFounderProfiles } from "./profile";

interface FounderDashboardState {
  // ── data ──
  profile: FounderProfile;
  blueprints: Blueprint[];
  dataLoaded: boolean;
  // ── cross-tab UI state ──
  triggerForge: boolean;
  networkRequestCount: number;
  inboxActiveContactId: string;
  networkInboxContacts: InboxLaunchContact[];
  settingsSection: SettingsSection;
  // ── onboarding / profile-gating ──
  showOnboarding: boolean;
  profilePromptDismissed: boolean;
  pendingProtectedTab: string | null;
  /** Deferred action to run once the profile is completed (was a ref in the view). */
  pendingProtectedAction: (() => void) | null;

  // ── actions (data + persistence) ──
  loadData: () => Promise<void>;
  saveProfile: (p: FounderProfile) => Promise<void>;
  /** Accepts an updater so callers awaiting a request can patch one blueprint
   *  without writing back a list snapshot that went stale while they waited. */
  saveBlueprints: (bps: Blueprint[] | ((prev: Blueprint[]) => Blueprint[])) => void;
  // ── granular setters ──
  setTriggerForge: (v: boolean) => void;
  setNetworkRequestCount: (n: number) => void;
  setInboxActiveContactId: (id: string) => void;
  addNetworkInboxContact: (contact: InboxLaunchContact) => void;
  setSettingsSection: (s: SettingsSection) => void;
  setShowOnboarding: (v: boolean) => void;
  setProfilePromptDismissed: (v: boolean) => void;
  setPendingProtectedTab: (t: string | null) => void;
  setPendingProtectedAction: (fn: (() => void) | null) => void;
}

export const useFounderDashboardStore = create<FounderDashboardState>((set) => ({
  profile: DEFAULT_FOUNDER_PROFILE,
  blueprints: [],
  dataLoaded: false,
  triggerForge: false,
  networkRequestCount: 0,
  inboxActiveContactId: "",
  networkInboxContacts: [],
  settingsSection: "profile",
  showOnboarding: false,
  profilePromptDismissed: false,
  pendingProtectedTab: null,
  pendingProtectedAction: null,

  loadData: async () => {
    // 1. Instantly surface locally cached blueprints so UI renders immediately
    try {
      const storedBlueprints = localStorage.getItem(STORAGE_KEY_BLUEPRINTS);
      if (storedBlueprints) {
        const parsed = JSON.parse(storedBlueprints) as Blueprint[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ blueprints: parsed });
        }
      }
    } catch {
      /* ignore storage errors */
    }

    // 2. Fetch profile and blueprints in parallel
    try {
      const [profileRes, blueprintsRes] = await Promise.allSettled([
        loadFounderProfile(),
        listBlueprints(),
      ]);

      if (profileRes.status === "fulfilled") {
        set({ profile: mergeFounderProfiles(DEFAULT_FOUNDER_PROFILE, profileRes.value) });
      } else {
        const user = getSession()?.user;
        set({
          profile: {
            ...DEFAULT_FOUNDER_PROFILE,
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            email: user?.email ?? "",
          },
        });
      }

      if (blueprintsRes.status === "fulfilled") {
        set({ blueprints: blueprintsRes.value });
        try {
          localStorage.setItem(STORAGE_KEY_BLUEPRINTS, JSON.stringify(blueprintsRes.value));
        } catch {
          /* ignore storage errors */
        }
      }
    } catch (err) {
      console.error("[founder-dashboard] Unexpected error loading dashboard data:", err);
    } finally {
      set({ dataLoaded: true });
    }
  },

  saveProfile: async (p) => {
    const nextProfile = normalizeFounderProfileForSave(p) as FounderProfile;
    set({ profile: await saveFounderProfile(nextProfile) });
  },

  saveBlueprints: (bps) => {
    set((state) => {
      const next = typeof bps === "function" ? bps(state.blueprints) : bps;
      try {
        localStorage.setItem(STORAGE_KEY_BLUEPRINTS, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return { blueprints: next };
    });
  },

  setTriggerForge: (v) => set({ triggerForge: v }),
  setNetworkRequestCount: (n) => set({ networkRequestCount: n }),
  setInboxActiveContactId: (id) => set({ inboxActiveContactId: id }),
  addNetworkInboxContact: (contact) =>
    set((s) => ({
      networkInboxContacts: [contact, ...s.networkInboxContacts.filter((c) => c.id !== contact.id)],
      inboxActiveContactId: contact.conversationId ?? contact.id,
    })),
  setSettingsSection: (section) => set({ settingsSection: section }),
  setShowOnboarding: (v) => set({ showOnboarding: v }),
  setProfilePromptDismissed: (v) => set({ profilePromptDismissed: v }),
  setPendingProtectedTab: (t) => set({ pendingProtectedTab: t }),
  setPendingProtectedAction: (fn) => set({ pendingProtectedAction: fn }),
}));
