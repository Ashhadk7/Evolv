"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  buildArchitecture,
  buildBlueprintContent,
  fmtMoney,
  type BlueprintContent,
  type Phase,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import { NetworkProfileDetailScreen } from "@/features/network/components/network-profile-detail";
import type { FounderContactProfile, FounderNetworkMessageTarget } from "@/features/network/types";
import { ChatPanel } from "../chat-panel";
import { deriveStack } from "../derive-stack";
import { BlueprintActionBar } from "../blueprint-action-bar";
import { BlueprintPrintCover } from "../blueprint-print-cover";
import {
  BlueprintHeroSection,
  BlueprintVentureAssessmentSection,
} from "../blueprint-overview-sections";
import {
  BlueprintExecutiveSummarySection,
  BlueprintSignalsSection,
} from "../blueprint-summary-sections";
import { BlueprintIdeaSection, BlueprintPersonasSection } from "../blueprint-audience-sections";
import { BlueprintProductScopeSection } from "../blueprint-product-scope-section";
import { BlueprintTechStackSection } from "../blueprint-tech-stack-section";
import {
  buildAiRecs,
  buildAnalytics,
  buildFeatureItems,
  buildGapAnalysis,
  buildGoToMarket,
  buildInfoGrid,
  buildRiskRows,
  buildTeamRoles,
  buildVentureAssessment,
  TOC_SECTIONS,
} from "./blueprint-detail-data";
import { useBlueprintUrlSync } from "./hooks/use-blueprint-url-sync";
import { useBlueprintScrollProgress } from "./hooks/use-blueprint-scroll-progress";
import { useBlueprintToast } from "./hooks/use-blueprint-toast";
import { useBlueprintPublishShare } from "./hooks/use-blueprint-publish-share";
import { useBlueprintEditor } from "./hooks/use-blueprint-editor";
import { useBlueprintMatches } from "./hooks/use-blueprint-matches";
import { TeamTalentSection } from "./team-talent-section";
import { RoadmapSection } from "./roadmap-section";
import { MarketAnalysisSection } from "./market-analysis-section";
import { CompetitiveLandscapeSection } from "./competitive-landscape-section";
import { GapAnalysisSection } from "./gap-analysis-section";
import { GoToMarketSection } from "./go-to-market-section";
import { FinancialsSection } from "./financials-section";
import { RisksSection } from "./risks-section";
import { FooterBar } from "./footer-bar";
import { EditModeBar } from "./edit-mode-bar";
import { DetailToast } from "./detail-toast";

/* ------------------------------------------------------- */
/* Blueprint Detail view                                   */
/* ------------------------------------------------------- */
export function BlueprintDetail({
  bp,
  onBack,
  onSave,
  onMessage,
  profileComplete = true,
  onRequireProfile,
}: {
  bp: Blueprint;
  onBack: () => void;
  onSave?: (updated: Blueprint) => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}) {
  const reduce = useReducedMotion();
  const [selectedDeveloper, setSelectedDeveloper] = useState<FounderContactProfile | null>(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState("all");
  const [developerConnections, setDeveloperConnections] = useState<Record<string, boolean>>({});
  const [content] = useState<BlueprintContent>(() => buildBlueprintContent(bp));
  const [phases, setPhases] = useState<Phase[]>(() => content.phases);
  const [editPhase, setEditPhase] = useState<number | null>(null);
  const [hirePanelPhase, setHirePanelPhase] = useState<number | null>(null);
  const [phaseHires, setPhaseHires] = useState<Record<number, string>>({});

  const { toast, showToast } = useBlueprintToast();
  const { handleBack } = useBlueprintUrlSync(bp.id, onBack);
  const { allDevelopers: matchedDevelopers } = useBlueprintMatches(bp.id, { limit: 10 });
  const { scrollRef, progress, onScroll, restoreBlueprintScrollRef } =
    useBlueprintScrollProgress(selectedDeveloper);
  const { published, copyLink, togglePublish } = useBlueprintPublishShare(bp, onSave, showToast);
  const {
    editing,
    setEditing,
    draftDesc,
    draftFeatures,
    setDraftFeatures,
    draftTechStack,
    updateTechStackLayer,
    saveEdits,
    cancelEdits,
  } = useBlueprintEditor(bp, content, onSave, showToast);

  const requireProfileBeforeAction = (afterComplete?: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(afterComplete);
    return true;
  };
  const handleToggleDeveloperConnection = (id: string) => {
    if (requireProfileBeforeAction(() => handleToggleDeveloperConnection(id))) return;
    setDeveloperConnections((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleDeveloperMessage = (profile: FounderContactProfile) => {
    if (requireProfileBeforeAction()) return;
    onMessage?.({
      id: profile.id,
      name: profile.name,
      role: `${profile.role} - ${profile.company}`,
      match: profile.match,
      initials: profile.initials,
      online: profile.online,
      personType: profile.type,
      requestStatus: developerConnections[profile.id] ? undefined : "pending",
      requestDirection: developerConnections[profile.id] ? undefined : "outgoing",
      subject: developerConnections[profile.id] ? undefined : "Blueprint match",
    });
  };
  const handleViewMatchedDeveloper = (profile: FounderContactProfile) => {
    restoreBlueprintScrollRef.current = scrollRef.current?.scrollTop ?? null;
    setSelectedDeveloper(profile);
  };

  /* -- derived metrics — one viability score, sourced from content model -- */
  const {
    score: viabilityScore,
    grade,
    reasoning: viabilityReasoning,
    subScores,
  } = content.viability;
  const stageLabel =
    viabilityScore >= 82
      ? "Launch Ready"
      : viabilityScore >= 72
        ? "Build Ready"
        : viabilityScore >= 62
          ? "Validation Stage"
          : "Concept Stage";
  const subScoreRow = [
    { label: "Market", value: subScores.market },
    { label: "Execution", value: subScores.execution },
    { label: "Timing", value: subScores.timing },
    { label: "Team Fit", value: subScores.teamFit },
  ];
  const architecture = buildArchitecture(draftTechStack);

  const { strengths, assessmentRisks } = buildVentureAssessment(bp);

  const desc = editing ? draftDesc : bp.ideaDesc;
  const infoGrid = buildInfoGrid(bp, desc);

  const personas = content.personas;

  const featureItems = buildFeatureItems(editing ? draftFeatures : bp.features);

  const stack = deriveStack(draftTechStack);

  const cost = content.costModel;
  const fin = content.financials;
  const totalWeeks = cost.buildWeeks;

  const competitorRows = content.competitors;

  const { gaps, additions, pathToComplete } = buildGapAnalysis(bp);
  const { gtmChannels, gtmPhases } = buildGoToMarket(bp);
  const roles = buildTeamRoles(bp);
  const riskRows = buildRiskRows(bp);
  const analytics = buildAnalytics(bp);
  const aiRecs = buildAiRecs(bp);

  if (selectedDeveloper) {
    return (
      <NetworkProfileDetailScreen
        key={selectedDeveloper.id}
        profile={selectedDeveloper}
        connected={Boolean(developerConnections[selectedDeveloper.id])}
        backLabel="Back to Blueprint"
        onBack={() => setSelectedDeveloper(null)}
        onToggleConnection={handleToggleDeveloperConnection}
        onMessage={handleDeveloperMessage}
        profileComplete={profileComplete}
        onRequireProfile={onRequireProfile}
        messageLabel="Message"
      />
    );
  }

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-bp-page relative flex h-full flex-col overflow-hidden"
    >
      <BlueprintActionBar
        bp={bp}
        progress={progress}
        published={published}
        onBack={handleBack}
        onCopyLink={copyLink}
        onTogglePublish={togglePublish}
      />

      {/* -- Scroll body -- */}
      <div ref={scrollRef} onScroll={onScroll} className="blueprint-scroll flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-[22px] px-0.5 pt-6 pb-2">
          <BlueprintPrintCover
            bp={bp}
            grade={grade}
            viabilityScore={viabilityScore}
            tocSections={TOC_SECTIONS}
          />

          <BlueprintHeroSection
            bp={bp}
            stageLabel={stageLabel}
            phasesCount={phases.length}
            buildWeeks={cost.buildWeeks}
            viabilityScore={viabilityScore}
            viabilityReasoning={viabilityReasoning}
            subScoreRow={subScoreRow}
          />

          <BlueprintVentureAssessmentSection
            bp={bp}
            strengths={strengths}
            risks={assessmentRisks}
          />

          <BlueprintExecutiveSummarySection
            bp={bp}
            totalBuildCost={fmtMoney(cost.total)}
            timelineLabel={cost.timelineLabel}
            phaseCount={phases.length}
            roleCount={roles.length}
            mvpFeatureCount={content.mvpPlan.mustHave.length + content.mvpPlan.shouldHave.length}
          />

          <BlueprintSignalsSection analytics={analytics} recommendations={aiRecs} />
          <BlueprintIdeaSection infoGrid={infoGrid} />

          <BlueprintPersonasSection personas={personas} />
          <BlueprintProductScopeSection
            featureItems={featureItems}
            outOfScope={content.mvpPlan.outOfScope}
          />
          <BlueprintTechStackSection
            editing={editing}
            draftTechStack={draftTechStack}
            architecture={architecture}
            stack={stack}
            onToggleEditing={() => setEditing((current) => !current)}
            onChangeLayer={updateTechStackLayer}
          />

          <TeamTalentSection
            roles={roles}
            developerConnections={developerConnections}
            activeRoleFilter={activeRoleFilter}
            onRoleFilterChange={setActiveRoleFilter}
            onSelectDeveloper={handleViewMatchedDeveloper}
            matchedDevelopers={matchedDevelopers}
          />

          <RoadmapSection
            phases={phases}
            setPhases={setPhases}
            editing={editing}
            editPhase={editPhase}
            setEditPhase={setEditPhase}
            hirePanelPhase={hirePanelPhase}
            setHirePanelPhase={setHirePanelPhase}
            phaseHires={phaseHires}
            setPhaseHires={setPhaseHires}
            totalWeeks={totalWeeks}
            reduce={reduce}
            matchedDevelopers={matchedDevelopers}
          />

          <MarketAnalysisSection marketAnalysis={content.marketAnalysis} />

          <CompetitiveLandscapeSection
            bpName={bp.name}
            competitorRows={competitorRows}
            similarStartups={content.similarStartups}
          />

          <GapAnalysisSection gaps={gaps} additions={additions} pathToComplete={pathToComplete} />

          <GoToMarketSection gtmChannels={gtmChannels} gtmPhases={gtmPhases} />

          <FinancialsSection cost={cost} fin={fin} phases={phases} reduce={reduce} />

          <RisksSection riskRows={riskRows} />

          <FooterBar bpName={bp.name} updatedAt={bp.updatedAt} />
        </div>
      </div>

      <EditModeBar
        editing={editing}
        onAddFeature={() => setDraftFeatures((a) => [...a, "New feature"])}
        onCancel={cancelEdits}
        onSave={saveEdits}
      />

      <DetailToast toast={toast} />

      <ChatPanel bp={bp} blueprintId={bp.id} />
    </motion.div>
  );
}
