import { apiFetch } from "@/lib/api";

export interface ApplicationWire {
  id: string;
  developer_id: string;
  blueprint_id: string;
  connection_id: string | null;
  applied_at: string;
}

interface ApplicationListWire {
  total: number;
  limit: number;
  offset: number;
  items: ApplicationWire[];
}

interface BlueprintApplicationCountWire {
  blueprint_id: string;
  count: number;
  in_conversation: number;
}

interface BlueprintApplicationCountsWire {
  total: number;
  in_conversation: number;
  items: BlueprintApplicationCountWire[];
}

export interface ApplicationCountSummary {
  counts: Map<string, number>;
  total: number;
  inConversation: number;
}

export async function listBlueprintApplications(
  blueprintId: string
): Promise<ApplicationWire[]> {
  try {
    const data = await apiFetch<ApplicationListWire>(
      `/blueprints/${blueprintId}/applications?limit=100`,
      { auth: true }
    );
    return data.items;
  } catch (err) {
    console.error(`[applications] Failed to load applications for blueprint ${blueprintId}:`, err);
    return [];
  }
}

/** Fetch applicant counts for multiple blueprints in one aggregate backend call. */
export async function fetchApplicationSummary(
  blueprintIds: string[]
): Promise<ApplicationCountSummary> {
  if (blueprintIds.length === 0) {
    return { counts: new Map(), total: 0, inConversation: 0 };
  }

  const wanted = new Set(blueprintIds);
  const data = await apiFetch<BlueprintApplicationCountsWire>("/blueprints/application-counts", {
    auth: true,
  });
  const counts = new Map<string, number>();
  let total = 0;
  let inConversation = 0;

  for (const item of data.items) {
    if (!wanted.has(item.blueprint_id)) continue;
    counts.set(item.blueprint_id, item.count);
    total += item.count;
    inConversation += item.in_conversation;
  }

  for (const id of blueprintIds) {
    if (!counts.has(id)) counts.set(id, 0);
  }

  return { counts, total, inConversation };
}

export async function fetchApplicationCounts(
  blueprintIds: string[]
): Promise<Map<string, number>> {
  return (await fetchApplicationSummary(blueprintIds)).counts;
}
