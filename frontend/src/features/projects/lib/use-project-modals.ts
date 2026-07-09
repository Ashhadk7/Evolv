import { useState } from "react";
import type { ProjectDeadline, ProjectIssue } from "@/features/blueprints/blueprint-content";
import type { FounderContactProfile } from "@/features/network/types";

export function useProjectModals() {
  const [payModalPhase, setPayModalPhase] = useState<number | null>(null);
  
  const [addDevTarget, setAddDevTarget] = useState<{
    phaseIdx: number;
    dev: FounderContactProfile;
  } | null>(null);
  
  const [removeDevPhase, setRemoveDevPhase] = useState<number | null>(null);
  
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueDraft, setIssueDraft] = useState<{
    title: string;
    description: string;
    priority: ProjectIssue["priority"];
    phaseIndex: number | null;
  }>({ title: "", description: "", priority: "Medium", phaseIndex: null });
  
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [deadlineDraft, setDeadlineDraft] = useState<{
    note: string;
    priority: ProjectDeadline["priority"];
    phaseIndex: number | null;
    date: string;
  }>({ note: "", priority: "Medium", phaseIndex: null, date: "" });
  
  const [spendModalOpen, setSpendModalOpen] = useState(false);

  return {
    payModalPhase,
    setPayModalPhase,
    addDevTarget,
    setAddDevTarget,
    removeDevPhase,
    setRemoveDevPhase,
    issueModalOpen,
    setIssueModalOpen,
    issueDraft,
    setIssueDraft,
    deadlineModalOpen,
    setDeadlineModalOpen,
    deadlineDraft,
    setDeadlineDraft,
    spendModalOpen,
    setSpendModalOpen,
  };
}
