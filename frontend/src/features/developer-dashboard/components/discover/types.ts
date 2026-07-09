import type { opportunities } from "@/features/developer-dashboard/data/developer-data";

export type Opportunity = (typeof opportunities)[number] & { matchScore?: number };

export type DiscoverFilters = {
  industry?: string | null;
  fundingStage?: string | null;
  matchScore?: string | null;
  viability?: string | null;
  techStack?: string | null;
};
