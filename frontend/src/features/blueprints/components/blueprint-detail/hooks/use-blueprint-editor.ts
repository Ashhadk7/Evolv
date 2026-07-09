// Edit-mode draft state (description, features, cost, tech stack) for the blueprint
// detail view, extracted from blueprint-detail.tsx.
"use client";

import { useState } from "react";
import type {
  BlueprintContent,
  StackLayerKey,
  TechStackModel,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";

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

  const updateTechStackLayer = (key: StackLayerKey, value: string) =>
    setDraftTechStack((prev) => ({ ...prev, [key]: { ...prev[key], chosen: value } }));

  const saveEdits = () => {
    onSave?.({
      ...bp,
      ideaDesc: draftDesc,
      features: draftFeatures,
      cost: draftCost,
      techStack: {
        frontend: draftTechStack.frontend.chosen,
        backend: draftTechStack.backend.chosen,
        ai: bp.techStack.ai,
        db: draftTechStack.database.chosen,
        vectorDb: draftTechStack.vectorDb.chosen,
        aiProvider: draftTechStack.aiProvider.chosen,
        hosting: draftTechStack.hosting.chosen,
      },
    });
    setEditing(false);
    showToast("Changes saved");
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
