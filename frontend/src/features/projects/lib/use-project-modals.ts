import { useState } from "react";
import type { FounderContactProfile } from "@/features/network/types";

export function useProjectModals() {
  const [payModalPhase, setPayModalPhase] = useState<number | null>(null);
  
  const [addDevTarget, setAddDevTarget] = useState<{
    phaseIdx: number;
    dev: FounderContactProfile;
  } | null>(null);
  
  const [removeDevPhase, setRemoveDevPhase] = useState<number | null>(null);
  
  const [spendModalOpen, setSpendModalOpen] = useState(false);

  return {
    payModalPhase,
    setPayModalPhase,
    addDevTarget,
    setAddDevTarget,
    removeDevPhase,
    setRemoveDevPhase,
    spendModalOpen,
    setSpendModalOpen,
  };
}
