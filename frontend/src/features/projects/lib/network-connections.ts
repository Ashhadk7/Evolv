// Reads/writes the same connection state the real Network page uses
// (localStorage["evolv_founder_network_state"]), so "Connect" here and
// the Network tab never disagree about who is actually connected.
const NETWORK_STORAGE_KEY = "evolv_founder_network_state";

export function readNetworkConnections(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { connected?: Record<string, boolean> };
    return parsed.connected ?? {};
  } catch {
    return {};
  }
}
export function writeNetworkConnection(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    const parsed = raw
      ? JSON.parse(raw)
      : { connected: {}, pendingIds: [], ignoredIds: [], outgoingIds: [], requestNotes: {} };
    parsed.connected = { ...parsed.connected, [id]: true };
    parsed.outgoingIds = Array.from(new Set([...(parsed.outgoingIds ?? []), id]));
    window.localStorage.setItem(NETWORK_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}
