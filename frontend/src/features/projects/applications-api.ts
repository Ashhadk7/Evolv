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

/** Fetch applicant counts for multiple blueprints in parallel. Returns a map of blueprint_id → count. */
export async function fetchApplicationCounts(
  blueprintIds: string[]
): Promise<Map<string, number>> {
  if (blueprintIds.length === 0) return new Map();
  const results = await Promise.allSettled(
    blueprintIds.map(async (id) => {
      const apps = await listBlueprintApplications(id);
      return { id, count: apps.length };
    })
  );
  const map = new Map<string, number>();
  for (const r of results) {
    if (r.status === "fulfilled") map.set(r.value.id, r.value.count);
  }
  return map;
}
