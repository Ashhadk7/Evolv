import type { StoredNetworkState } from "@/features/network/types";

// Shared localStorage read/write logic for the founder and developer network
// tabs. The two roles differ only in storage key, initial connection state,
// and initial pending-request ids — all passed in as config.
export function createNetworkStorage(config: {
  storageKey: string;
  initialConnected: Record<string, boolean>;
  initialPendingIds: string[];
}) {
  const { storageKey, initialConnected, initialPendingIds } = config;

  function loadStoredState(): StoredNetworkState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveStoredState(state: StoredNetworkState) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Keep the in-memory state even if browser storage is unavailable.
    }
  }

  function getInitialNetworkState(): StoredNetworkState {
    const stored = loadStoredState();
    return {
      connected: { ...initialConnected, ...(stored?.connected ?? {}) },
      pendingIds: stored?.pendingIds ?? initialPendingIds,
      ignoredIds: stored?.ignoredIds ?? [],
      outgoingIds: stored?.outgoingIds ?? [],
      requestNotes: stored?.requestNotes ?? {},
    };
  }

  return { loadStoredState, saveStoredState, getInitialNetworkState };
}
