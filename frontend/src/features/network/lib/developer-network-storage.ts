import { STORAGE_KEY, initialConnected } from "@/features/network/lib/developer-network-constants";
import { INITIAL_DEVELOPER_PENDING_IDS } from "@/features/developer-dashboard/data/developer-network-data";
import { createNetworkStorage } from "@/features/network/lib/network-storage";

export const { loadStoredState, saveStoredState, getInitialNetworkState } = createNetworkStorage({
  storageKey: STORAGE_KEY,
  initialConnected,
  initialPendingIds: INITIAL_DEVELOPER_PENDING_IDS,
});
