import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowsClockwise, CheckCircle } from "@phosphor-icons/react";
import { getAccessToken } from "@/features/auth/lib/session";
import {
  buildArchitecture,
  buildBlueprintContent,
  deriveProductFeatures,
  fmtMoney,
  type BlueprintContent,
  type Phase,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import { NetworkProfileDetailScreen } from "@/features/network/components/network-profile-detail";
import type { FounderContactProfile, FounderNetworkMessageTarget } from "@/features/network/types";
import { ChatPanel } from "../chat-panel";
import { RefineModal } from "../refine-modal";
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

const SECTION_NAME_LABELS: Record<string, string> = {
  market: "Market Analysis",
  competitor: "Competitive Landscape",
  persona: "Target Users",
  product: "Product Scope",
  strategy: "Strategy & GTM",
  techStack: "Tech Stack",
  synthesis: "Venture Assessment",
};

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
  startInEdit = false,
}: {
  bp: Blueprint;
  onBack: () => void;
  onSave?: (updated: Blueprint) => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
  /** Opens straight into edit mode — used by the workspace card's Edit action. */
  startInEdit?: boolean;
}) {
  const reduce = useReducedMotion();
  const [currentBp, setCurrentBp] = useState<Blueprint>(bp);
  const [selectedDeveloper, setSelectedDeveloper] = useState<FounderContactProfile | null>(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState("all");
  const [developerConnections, setDeveloperConnections] = useState<Record<string, boolean>>({});
  
  // Real-time automated polling state for AI refinement
  const [refiningSection, setRefiningSection] = useState<string | null>(null);
  const [refineStatus, setRefineStatus] = useState<"idle" | "refining" | "success">("idle");
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const content: BlueprintContent = buildBlueprintContent(currentBp);
  const [phases, setPhases] = useState<Phase[]>(() => content.phases);
  const [editPhase, setEditPhase] = useState<number | null>(null);
  const [hirePanelPhase, setHirePanelPhase] = useState<number | null>(null);
  const [phaseHires, setPhaseHires] = useState<Record<number, string>>({});

  const { toast, showToast } = useBlueprintToast();
  const { handleBack } = useBlueprintUrlSync(onBack);
  const { allDevelopers: matchedDevelopers } = useBlueprintMatches(currentBp.id, { limit: 10 });
  const { scrollRef, progress, onScroll, restoreBlueprintScrollRef } =
    useBlueprintScrollProgress(selectedDeveloper);
  const { published, copyLink, togglePublish } = useBlueprintPublishShare(currentBp, onSave, showToast);
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
  } = useBlueprintEditor(currentBp, content, onSave, showToast, startInEdit);

  // Auto-polling effect when refinement starts
  const startAutoPolling = (section: string) => {
    setRefiningSection(section);
    setRefineStatus("refining");
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const token = getAccessToken();
        const res = await fetch(`${API_BASE}/blueprints/${currentBp.id}`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        if (res.ok) {
          const fresh = await res.json();
          // Check if blueprint version or refinement state completed
          const versionObj = fresh.current_version || fresh.currentVersion;
          const contentJson = versionObj?.content_json || versionObj?.contentJson || {};
          const refState = contentJson.refinement || {};

          if (refState.status === "completed" || attempts >= 12) {
            if (pollTimer.current) clearInterval(pollTimer.current);
            // Transform fresh backend response to frontend Blueprint shape
            const updatedBp: Blueprint = {
              ...currentBp,
              updatedAt: fresh.updated_at || fresh.updatedAt || new Date().toISOString(),
              aiRecommend: versionObj?.ai_recommend || versionObj?.aiRecommend || currentBp.aiRecommend,
              viability: versionObj?.viability ?? currentBp.viability,
              contentJson,
            };
            setCurrentBp(updatedBp);
            onSave?.(updatedBp);
            setRefineStatus("success");

            // Hide success banner after 4 seconds
            setTimeout(() => {
              setRefineStatus("idle");
              setRefiningSection(null);
            }, 4000);
            return;
          }
        }
      } catch {
        /* keep polling on transient errors */
      }

      if (attempts >= 20) {
        if (pollTimer.current) clearInterval(pollTimer.current);
        setRefineStatus("idle");
        setRefiningSection(null);
      }
    };

    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(poll, 2500);
  };

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

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
    verdict,
    subScores,
  } = content.viability;
  // The synthesis verdict is the stage label when present; legacy blueprints
  // fall back to the old score-threshold tiers.
  const stageLabel = verdict
    ? verdict === "Build"
      ? "Build Ready"
      : verdict === "Validate first"
        ? "Validation Stage"
        : "Rethink Advised"
    : viabilityScore >= 82
      ? "Launch Ready"
      : viabilityScore >= 72
        ? "Build Ready"
        : viabilityScore >= 62
          ? "Validation Stage"
          : "Concept Stage";
  const subScoreRow = subScores;
  const architecture = buildArchitecture(draftTechStack);

  const { strengths, assessmentRisks } = buildVentureAssessment(bp, content);

  const desc = editing ? draftDesc : bp.ideaDesc;
  const infoGrid = buildInfoGrid(bp, desc);

  const personas = content.personas;

  // Editing works on names only (draftFeatures); the read view shows the full
  // structured spec (module, user story, acceptance criteria, real priority).
  const derivedFeatures = deriveProductFeatures(bp);
  const featureItems = editing
    ? buildFeatureItems(draftFeatures, derivedFeatures)
    : derivedFeatures;

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

  // Source pool for the scorecard verification chips. Scorecard cites the
  // shared research block the backend built: first 5 market sources (1-5) then
  // first 5 competitor sources (6-10) — it must be rebuilt the same way here,
  // or every citation past 5 resolves to a source the agent never read.
  const verificationSources = [
    ...content.marketAnalysis.sources.slice(0, 5),
    ...content.competitorInsight.sources.slice(0, 5),
  ];

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
        onRefined={(updatedBp) => {
          setCurrentBp(updatedBp);
          onSave?.(updatedBp);
        }}
      />

      {/* -- Scroll body -- */}
      <div ref={scrollRef} onScroll={onScroll} className="blueprint-scroll flex-1 overflow-y-auto px-3 py-4 md:px-0.5 md:pt-6 md:pb-2">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-[22px] px-0.5 pt-6 pb-2">
          {/* Live Automated AI Refinement Status Banner */}
          {refineStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                padding: "16px 22px",
                borderRadius: "14px",
                background:
                  refineStatus === "refining"
                    ? "linear-gradient(90deg, #18382f 0%, #102b24 100%)"
                    : "linear-gradient(90deg, #1d6e47 0%, #184b33 100%)",
                border: "1px solid rgba(137,215,183,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#abffdc",
                boxShadow: "0 12px 32px rgba(9,26,20,0.45)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {refineStatus === "refining" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{ display: "flex" }}
                  >
                    <ArrowsClockwise size={22} weight="bold" />
                  </motion.div>
                ) : (
                  <CheckCircle size={24} weight="fill" style={{ color: "#5bc8a0" }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {refineStatus === "refining"
                      ? `AI is refining the ${SECTION_NAME_LABELS[refiningSection || ""] || refiningSection || "selected"} section...`
                      : `Refinement Complete! The ${SECTION_NAME_LABELS[refiningSection || ""] || refiningSection || "selected"} section has been updated.`}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(232,244,239,0.7)", marginTop: 2 }}>
                    {refineStatus === "refining"
                      ? "Re-running agent analysis with your feedback. Content will update automatically on this page."
                      : "The blueprint analysis has updated on screen automatically."}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <BlueprintPrintCover
            bp={bp}
            grade={grade}
            viabilityScore={viabilityScore}
            tocSections={TOC_SECTIONS}
          />

          <BlueprintHeroSection
            bp={bp}
            stageLabel={stageLabel}
            tagline={content.synthesis.tagline}
            verdict={verdict}
            phasesCount={phases.length}
            buildWeeks={cost.buildWeeks}
            viabilityScore={viabilityScore}
            viabilityReasoning={viabilityReasoning}
            subScoreRow={subScoreRow}
            combinedSources={verificationSources}
          />

          <div id="venture-assessment" className="scroll-mt-24">
            <BlueprintVentureAssessmentSection
              bp={bp}
              strengths={strengths}
              risks={assessmentRisks}
            />
          </div>

          <div id="executive-summary" className="scroll-mt-24">
            <BlueprintExecutiveSummarySection
              bp={bp}
              executiveSummary={content.synthesis.executiveSummary}
              keyAssumptions={content.synthesis.keyAssumptions}
              contradictions={content.synthesis.contradictions}
              snapshot={{
                totalBuildCost: fmtMoney(cost.total),
                timelineLabel: cost.timelineLabel,
                phaseCount: phases.length,
                roleCount: roles.length,
                mvpFeatureCount:
                  content.mvpPlan.mustHave.length + content.mvpPlan.shouldHave.length,
              }}
            />
          </div>

          <div id="signals" className="scroll-mt-24">
            <BlueprintSignalsSection analytics={analytics} recommendations={aiRecs} />
          </div>
          <div id="the-idea" className="scroll-mt-24">
            <BlueprintIdeaSection infoGrid={infoGrid} />
          </div>

          <div id="target-users" className="scroll-mt-24">
            <BlueprintPersonasSection personas={personas} />
          </div>
          <div id="product-scope" className="scroll-mt-24">
            <BlueprintProductScopeSection
              featureItems={featureItems}
              outOfScope={content.mvpPlan.outOfScope}
              dataEntities={content.mvpPlan.dataEntities}
              nonFunctional={content.mvpPlan.nonFunctional}
            />
          </div>
          <div id="tech-stack" className="scroll-mt-24">
            <BlueprintTechStackSection
              editing={editing}
              draftTechStack={draftTechStack}
              architecture={architecture}
              stack={stack}
              onToggleEditing={() => setEditing((current) => !current)}
              onChangeLayer={updateTechStackLayer}
            />
          </div>

          <div id="roles-developers" className="scroll-mt-24">
            <TeamTalentSection
              roles={roles}
              developerConnections={developerConnections}
              activeRoleFilter={activeRoleFilter}
              onRoleFilterChange={setActiveRoleFilter}
              onSelectDeveloper={handleViewMatchedDeveloper}
              matchedDevelopers={matchedDevelopers}
            />
          </div>

          <div id="development-roadmap" className="scroll-mt-24">
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
          </div>

          <div id="market-analysis" className="scroll-mt-24">
            <MarketAnalysisSection marketAnalysis={content.marketAnalysis} />
          </div>

          <div id="competitive-landscape" className="scroll-mt-24">
            <CompetitiveLandscapeSection
              bpName={bp.name}
              competitorRows={competitorRows}
              insight={content.competitorInsight}
            />
          </div>

          <div id="gap-analysis" className="scroll-mt-24">
            <GapAnalysisSection gaps={gaps} additions={additions} pathToComplete={pathToComplete} />
          </div>

          <div id="go-to-market" className="scroll-mt-24">
            <GoToMarketSection gtmChannels={gtmChannels} gtmPhases={gtmPhases} />
          </div>

          <div id="financials" className="scroll-mt-24">
            <FinancialsSection
              cost={cost}
              fin={fin}
              phases={phases}
              rateBasis={content.rateBasis}
              reduce={reduce}
            />
          </div>

          <div id="risks" className="scroll-mt-24">
            <RisksSection riskRows={riskRows} />
          </div>

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
