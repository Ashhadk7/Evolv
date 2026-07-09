import { STORAGE_KEY, initialConnected } from "@/features/network/lib/founder-network-constants";
import { INITIAL_PENDING_IDS } from "@/features/network/data";
import { createNetworkStorage } from "@/features/network/lib/network-storage";

export const { loadStoredState, saveStoredState, getInitialNetworkState } = createNetworkStorage({
  storageKey: STORAGE_KEY,
  initialConnected,
  initialPendingIds: INITIAL_PENDING_IDS,
});
