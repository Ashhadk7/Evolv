"use client";

import { useEffect, useState } from "react";
import {
  blueprintMatchesToProfiles,
  fetchBlueprintMatches,
} from "@/features/network/lib/matching-api";
import type { FounderContactProfile } from "@/features/network/types";

/** Per-role cap sent to GET /blueprints/{id}/matches, mirroring the detail view. */
const MATCH_LIMIT = 10;

type MatchesByBlueprint = Record<string, FounderContactProfile[]>;

export interface WorkspaceMatches {
  /** Matched developers per blueprint id, best match first. */
  byBlueprint: MatchesByBlueprint;
  /** Distinct matched developers across every blueprint on the page. */
  total: number;
  loading: boolean;
}

/**
 * Loads developer matches for the blueprints shown in the workspace list.
 *
 * The blueprint list endpoint carries no match data, so each card's matches come
 * from its own `/matches` call. They are fetched together here rather than per
 * card so the "Developer matches" KPI can count real people instead of a
 * placeholder, and so one failing blueprint only empties its own card.
 */
export function useWorkspaceMatches(blueprintIds: string[]): WorkspaceMatches {
  // Effects compare deps by identity; a joined key keeps a re-rendered array of
  // the same ids from re-firing every request.
  const idsKey = blueprintIds.join(",");
  // The key is stored with the result so `loading` can be derived from "the
  // result on hand is for a different set of ids" instead of a second setState.
  const [result, setResult] = useState<{ key: string; byBlueprint: MatchesByBlueprint }>({
    key: "",
    byBlueprint: {},
  });

  useEffect(() => {
    if (!idsKey) return;
    let active = true;

    Promise.all(
      idsKey.split(",").map(async (id): Promise<[string, FounderContactProfile[]]> => {
        try {
          const response = await fetchBlueprintMatches(id, { limit: MATCH_LIMIT });
          return [id, blueprintMatchesToProfiles(response)];
        } catch {
          // A blueprint whose matches fail to load shows no chips; the rest of
          // the page must still render.
          return [id, []];
        }
      })
    ).then((entries) => {
      if (active) setResult({ key: idsKey, byBlueprint: Object.fromEntries(entries) });
    });

    return () => {
      active = false;
    };
  }, [idsKey]);

  const settled = result.key === idsKey;
  const byBlueprint = settled ? result.byBlueprint : {};

  const distinct = new Set<string>();
  for (const developers of Object.values(byBlueprint)) {
    for (const developer of developers) distinct.add(developer.id);
  }

  return { byBlueprint, total: distinct.size, loading: Boolean(idsKey) && !settled };
}
