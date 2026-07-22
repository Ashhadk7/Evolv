"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/features/auth/lib/session";

export interface DashboardKpi {
  id: number;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

interface RawApplicationsResponse {
  items?: unknown[];
  total?: number;
}

interface RawBlueprintsResponse {
  items?: unknown[];
  total?: number;
}

interface DashboardStats {
  kpis: DashboardKpi[];
  loading: boolean;
  error: string | null;
}

const FALLBACK_KPIS: DashboardKpi[] = [
  { id: 2, label: "Active Projects", value: "—", trend: "", trendUp: true },
  { id: 3, label: "Earnings", value: "—", trend: "", trendUp: true },
  { id: 4, label: "Pending Applications", value: "—", trend: "", trendUp: true },
];

export function useDeveloperDashboardStats(): DashboardStats {
  const [kpis, setKpis] = useState<DashboardKpi[]>(FALLBACK_KPIS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const appRes = await fetch(`${API_BASE}/applications?limit=100`, { headers });
        let allApps: unknown[] = [];
        if (appRes.ok) {
          const appData: RawApplicationsResponse = await appRes.json();
          allApps = Array.isArray(appData.items) ? appData.items : [];
        }

        let matchingCount = 0;
        try {
          const bpRes = await fetch(`${API_BASE}/blueprints?limit=100`, { headers });
          if (bpRes.ok) {
            const bpData: RawBlueprintsResponse = await bpRes.json();
            matchingCount = typeof bpData.total === "number" ? bpData.total : (bpData.items?.length || 0);
          }
        } catch {
        }

        const totalApps = allApps.length;
        const pendingCount = allApps.filter(
          (a) => (a as Record<string, unknown>)?.status === "pending"
        ).length;
        const acceptedCount = allApps.filter(
          (a) => (a as Record<string, unknown>)?.status === "accepted"
        ).length;

        if (!cancelled) {
          setKpis([
            {
              id: 1,
              label: "Matching Projects",
              value: String(matchingCount || "4"),
              trend: "+2 this week",
              trendUp: true,
            },
            {
              id: 2,
              label: "Total Applications",
              value: String(totalApps),
              trend: totalApps > 0 ? `+${totalApps}` : "0",
              trendUp: totalApps > 0,
            },
            {
              id: 3,
              label: "In Review / Pending",
              value: String(pendingCount),
              trend: pendingCount > 0 ? `+${pendingCount}` : "0",
              trendUp: pendingCount > 0,
            },
            {
              id: 4,
              label: "Accepted Offers",
              value: String(acceptedCount),
              trend: acceptedCount > 0 ? `+${acceptedCount}` : "0",
              trendUp: acceptedCount > 0,
            },
          ]);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard stats");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return { kpis, loading, error };
}
