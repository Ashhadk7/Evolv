"use client";

import { useEffect, useState } from "react";
import type { FounderContactProfile } from "@/features/network/types";
import {
  fetchBlueprintMatches,
  matchedDeveloperToProfile,
  type BlueprintMatchesResponse,
} from "@/features/network/lib/matching-api";

/**
 * A single role's matched developers, keyed by role title.
 * Mirrors `RoleMatchResponse` from the backend but with profiles
 * already converted to the frontend `FounderContactProfile` shape.
 */
export interface RoleMatchedDevelopers {
  roleTitle: string;
  requiredSkills: string[];
  developers: FounderContactProfile[];
}

export interface UseBlueprintMatchesResult {
  /** All matched developers, de-duped across all roles (highest match_score kept). */
  allDevelopers: FounderContactProfile[];
  /** Per-role grouped matches. */
  roleMatches: RoleMatchedDevelopers[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches developer matches from GET /blueprints/{blueprintId}/matches.
 * Falls back to an empty list on error so the UI never breaks.
 */
export function useBlueprintMatches(
  blueprintId: string,
  options: { limit?: number } = {}
): UseBlueprintMatchesResult {
  const { limit = 10 } = options;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<BlueprintMatchesResponse | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchBlueprintMatches(blueprintId, { limit })
      .then((data) => {
        if (active) {
          setResponse(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const message =
            err instanceof Error ? err.message : "Failed to load developer matches.";
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [blueprintId, limit]);

  if (!response) {
    return { allDevelopers: [], roleMatches: [], loading, error };
  }

  // Convert per-role matches.
  const roleMatches: RoleMatchedDevelopers[] = response.roles.map((role) => ({
    roleTitle: role.role_title,
    requiredSkills: role.required_skills,
    developers: role.matches.map(matchedDeveloperToProfile),
  }));

  // Build a de-duped list of all developers, keeping highest match_score.
  const seen = new Map<string, FounderContactProfile>();
  for (const role of roleMatches) {
    for (const dev of role.developers) {
      const existing = seen.get(dev.id);
      if (!existing || dev.match > existing.match) {
        seen.set(dev.id, dev);
      }
    }
  }
  const allDevelopers = Array.from(seen.values()).sort((a, b) => b.match - a.match);

  return { allDevelopers, roleMatches, loading, error };
}
