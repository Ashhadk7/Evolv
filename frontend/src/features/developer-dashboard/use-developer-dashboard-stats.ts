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

/**
 * Fetches real KPI data from the backend to power the developer dashboard widgets.
 * Falls back to stub data gracefully so the UI never breaks on API errors.
 *
 * Currently wires:
 *  - Pending Applications count → GET /api/v1/applications?status=pending&limit=1
 *  - (Earnings + Active Projects are stub until backend exposes those endpoints)
 */
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
        // Fetch applications to count pending ones
        const appRes = await fetch(`${API_BASE}/applications?limit=100`, { headers });
        if (!appRes.ok) throw new Error(`Applications API returned ${appRes.status}`);
        const appData: RawApplicationsResponse = await appRes.json();
        const allApps = Array.isArray(appData.items) ? appData.items : [];

        const pendingCount = allApps.filter(
          (a) => (a as Record<string, unknown>)?.status === "pending"
        ).length;

        if (!cancelled) {
          setKpis([
            {
              id: 2,
              label: "Active Projects",
              value: "—", // stub — no projects endpoint yet
              trend: "",
              trendUp: true,
            },
            {
              id: 3,
              label: "Earnings",
              value: "—", // stub — no earnings endpoint yet
              trend: "",
              trendUp: true,
            },
            {
              id: 4,
              label: "Pending Applications",
              value: String(pendingCount),
              trend: pendingCount > 0 ? `+${pendingCount}` : "0",
              trendUp: pendingCount > 0,
            },
          ]);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          // Graceful degradation: keep stub data, surface error for debugging
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
