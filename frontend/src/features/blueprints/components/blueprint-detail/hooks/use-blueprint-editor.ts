// Edit-mode draft state (description, features, cost, tech stack) for the blueprint
// detail view, extracted from blueprint-detail.tsx.
"use client";

import { useEffect, useState } from "react";
import type {
  BlueprintContent,
  StackLayerKey,
  TechStackModel,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import { updateBlueprintContent } from "@/features/blueprints/blueprints-api";
import { getApiErrorMessage } from "@/lib/api";

export function useBlueprintEditor(
  bp: Blueprint,
  content: BlueprintContent,
  onSave: ((updated: Blueprint) => void) | undefined,
  showToast: (message: string) => void
) {
  const [editing, setEditing] = useState(false);
  const [draftDesc, setDraftDesc] = useState(bp.ideaDesc);
  const [draftFeatures, setDraftFeatures] = useState<string[]>(bp.features);
  const [draftCost, setDraftCost] = useState(bp.cost);
  const [draftTechStack, setDraftTechStack] = useState<TechStackModel>(() => content.techStack);

  // Sync draft state whenever fresh content/bp arrives (e.g. after AI refinement)
  const techStackKey = JSON.stringify(content.techStack);
  useEffect(() => {
    if (!editing) {
      setDraftTechStack(content.techStack);
      setDraftDesc(bp.ideaDesc);
      setDraftFeatures(bp.features);
      setDraftCost(bp.cost);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techStackKey, bp.id, editing]);

  const updateTechStackLayer = (key: StackLayerKey, value: string) =>
    setDraftTechStack((prev) => ({ ...prev, [key]: { ...prev[key], chosen: value } }));

  const saveEdits = async () => {
    // Persist to the backend first, then sync local state to what it returns —
    // so edits survive reload and the toast only claims success on success.
    try {
      const updated = await updateBlueprintContent(bp.id, {
        features: draftFeatures,
        techStack: {
          frontend: draftTechStack.frontend.chosen,
          backend: draftTechStack.backend.chosen,
          aiProvider: draftTechStack.aiProvider.chosen,
          database: draftTechStack.database.chosen,
          vectorDb: draftTechStack.vectorDb.chosen,
          hosting: draftTechStack.hosting.chosen,
        },
      });
      onSave?.(updated);
      setEditing(false);
      showToast("Changes saved");
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  };

  const cancelEdits = () => {
    setDraftDesc(bp.ideaDesc);
    setDraftFeatures(bp.features);
    setDraftCost(bp.cost);
    setDraftTechStack(content.techStack);
    setEditing(false);
  };

  return {
    editing,
    setEditing,
    draftDesc,
    draftFeatures,
    setDraftFeatures,
    draftCost,
    draftTechStack,
    updateTechStackLayer,
    saveEdits,
    cancelEdits,
  };
}
