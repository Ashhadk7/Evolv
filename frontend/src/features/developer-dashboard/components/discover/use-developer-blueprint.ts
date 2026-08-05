"use client";

import { useEffect, useState } from "react";

import {
  buildBlueprintContent,
  type BlueprintContent,
} from "@/features/blueprints/blueprint-content";
import { getBlueprint } from "@/features/blueprints/blueprints-api";
import type { Blueprint } from "@/features/blueprints/types";

export interface DeveloperBlueprintDocument {
  blueprint: Blueprint;
  content: BlueprintContent;
}

export function useDeveloperBlueprint(blueprintId: string) {
  const [document, setDocument] = useState<DeveloperBlueprintDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      getBlueprint(blueprintId)
        .then((blueprint) => {
          if (!active) return;
          setDocument({ blueprint, content: buildBlueprintContent(blueprint) });
        })
        .catch(() => {
          if (active) setError("The full blueprint document could not be loaded.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [blueprintId]);

  return { document, loading, error };
}
