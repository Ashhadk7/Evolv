import { useState } from "react";
import type { FounderContactProfile } from "@/features/network/types";
import type { ProjectMemberWire } from "@/features/projects/projects-api";

export function useProjectModals() {
  const [payModalTarget, setPayModalTarget] = useState<{
    member: ProjectMemberWire;
    phaseIdx: number;
  } | null>(null);

  const [addDevTarget, setAddDevTarget] = useState<{
    phaseIdx: number;
    dev: FounderContactProfile;
  } | null>(null);

  const [removeDevTarget, setRemoveDevTarget] = useState<{
    memberId: string;
    phaseIdx: number;
  } | null>(null);

  const [spendModalOpen, setSpendModalOpen] = useState(false);

  return {
    payModalTarget,
    setPayModalTarget,
    addDevTarget,
    setAddDevTarget,
    removeDevTarget,
    setRemoveDevTarget,
    spendModalOpen,
    setSpendModalOpen,
  };
}
