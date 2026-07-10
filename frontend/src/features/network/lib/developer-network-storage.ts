import { createNetworkStorage } from "@/features/network/lib/network-storage";

export const { loadStoredState, saveStoredState, getInitialNetworkState } = createNetworkStorage({
  storageKey: "evolv_developer_network_state",
  initialConnected: {},
  initialPendingIds: [],
});
