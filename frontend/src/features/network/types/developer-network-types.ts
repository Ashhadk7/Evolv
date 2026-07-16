import type { DeveloperNetworkMessageTarget } from "@/features/network/types";

// Shared between founder and developer network tabs — re-exported here so
// existing imports from this file keep working.
export type { NetworkTabFilter, StoredNetworkState } from "@/features/network/types";

export interface NetworkProps {
  onMessage?: (contact: DeveloperNetworkMessageTarget) => void;
  onPendingCountChange?: (count: number) => void;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}
