"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Handshake,
  MessageSquare,
  RefreshCcw,
  Send,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import { getApiErrorMessage } from "@/lib/api";
import { messagingApi } from "@/features/messaging/lib/messaging-api";
import {
  buildArchitecture,
  deriveProductFeatures,
} from "@/features/blueprints/blueprint-content";
import {
  BlueprintIdeaSection,
  BlueprintPersonasSection,
} from "@/features/blueprints/components/blueprint-audience-sections";
import { BlueprintExecutiveSummarySection } from "@/features/blueprints/components/blueprint-summary-sections";
import { BlueprintProductScopeSection } from "@/features/blueprints/components/blueprint-product-scope-section";
import { BlueprintTechStackSection } from "@/features/blueprints/components/blueprint-tech-stack-section";
import { buildInfoGrid } from "@/features/blueprints/components/blueprint-detail/blueprint-detail-data";
import { deriveStack } from "@/features/blueprints/components/derive-stack";
import { useDeveloperBlueprint } from "../use-developer-blueprint";
import { RoadmapSection } from "./document-sections";
import { ApplicantsCard, FounderCard, MatchCard, RolesCard } from "./match-rail";
import type { Opportunity } from "../types";

type MessageStatus = "unknown" | "none" | "pending" | "accepted" | "declined";

export function DeveloperBlueprintDetail({
  blueprint,
  busyAction,
  backLabel = "Discover",
  onBack,
  onApply,
  onWithdraw,
  onSave,
}: {
  blueprint: Opportunity;
  busyAction?: "apply" | "save" | "withdraw";
  backLabel?: string;
  onBack: () => void;
  onApply: (blueprint: Opportunity, role: string) => void;
  onWithdraw?: (blueprint: Opportunity) => void;
  onSave: (blueprint: Opportunity) => void;
}) {
  const { document: doc, loading, error } = useDeveloperBlueprint(blueprint.id);
  const saving = busyAction === "save";
  const withdrawing = busyAction === "withdraw";
  const isWithdrawn = blueprint.applicationStatus === "withdrawn";

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState(() => defaultFounderMessage(blueprint));
  const [messageBusy, setMessageBusy] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [messageStatus, setMessageStatus] = useState<MessageStatus>("unknown");

  const document = useMemo(() => {
    if (!doc) return null;
    return {
      tagline: doc.content.synthesis.tagline,
      infoGrid: buildInfoGrid(doc.blueprint, doc.blueprint.ideaDesc),
      features: deriveProductFeatures(doc.blueprint),
      stack: deriveStack(doc.content.techStack),
      architecture: buildArchitecture(doc.content.techStack),
    };
  }, [doc]);

  useEffect(() => {
    let active = true;
    void messagingApi
      .inbox()
      .then((inbox) => {
        if (!active) return;
        const existing = [...inbox.conversations, ...inbox.pending, ...inbox.requests].find(
          (conversation) => conversation.participant.id === blueprint.founderId
        );
        setMessageStatus(existing?.status ?? "none");
      })
      .catch(() => {
        if (active) setMessageStatus("none");
      });
    return () => {
      active = false;
    };
  }, [blueprint.founderId]);

  const messagePending = messageStatus === "pending";
  const messageAccepted = messageStatus === "accepted";

  const openFounderMessage = () => {
    if (messagePending) return;
    setMessageText(defaultFounderMessage(blueprint));
    setMessageError("");
    setMessageSent(false);
    setMessageOpen(true);
  };

  const sendFounderMessage = async () => {
    const note = messageText.trim();
    if (!note) return;
    setMessageBusy(true);
    setMessageError("");
    try {
      const result = await messagingApi.start(blueprint.founderId, note);
      setMessageStatus(result.conversation.status);
      setMessageSent(true);
      window.setTimeout(() => {
        setMessageOpen(false);
        setMessageSent(false);
      }, 1200);
    } catch (caught) {
      const errorMessage = getApiErrorMessage(caught);
      if (errorMessage.toLowerCase().includes("wait for this message request")) {
        setMessageStatus("pending");
      }
      setMessageError(errorMessage);
    } finally {
      setMessageBusy(false);
    }
  };

  const applyForBestRole = () =>
    onApply(blueprint, blueprint.bestRole ?? blueprint.roles[0]?.role ?? "");

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailBar}>
        <button type="button" className={styles.btnGhost} onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
        </button>
        <div className={styles.detailBarActions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => onSave(blueprint)}
            disabled={saving}
          >
            {blueprint.saved ? (
              <BookmarkCheck size={14} aria-hidden="true" />
            ) : (
              <Bookmark size={14} aria-hidden="true" />
            )}
            {blueprint.saved ? "Saved" : saving ? "Saving" : "Save"}
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={openFounderMessage}
            disabled={messagePending}
          >
            <MessageSquare size={14} aria-hidden="true" />
            {messagePending ? "Request sent" : "Message founder"}
          </button>
          {blueprint.applied && onWithdraw ? (
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => onWithdraw(blueprint)}
              disabled={withdrawing}
            >
              <XCircle size={14} aria-hidden="true" />
              {withdrawing ? "Withdrawing" : "Withdraw"}
            </button>
          ) : (
            <button type="button" className={styles.btnPrimary} onClick={applyForBestRole}>
              <Handshake size={14} aria-hidden="true" /> Apply to build
            </button>
          )}
        </div>
      </div>

      <header className={styles.detailHead}>
        <div className={styles.detailBadges}>
          <span className={styles.publishedBadge}>
            <span className={styles.publishedDot} aria-hidden="true" /> Published
          </span>
          <span className={styles.pill}>
            {blueprint.industry} · {blueprint.stage}
          </span>
        </div>
        <h1>{blueprint.name}</h1>
        {document?.tagline && <p className={styles.detailTagline}>{document.tagline}</p>}
        {isWithdrawn && (
          <p className={styles.withdrawnNotice}>
            <XCircle size={15} aria-hidden="true" /> Application withdrawn. You can apply again for
            an available role.
          </p>
        )}
      </header>

      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          {loading && (
            <div className={styles.statePanel} aria-live="polite">
              <RefreshCcw size={22} className={styles.spinIcon} aria-hidden="true" />
              <h4>Loading the blueprint document</h4>
            </div>
          )}

          {!loading && error && (
            <div className={styles.statePanel} role="alert">
              <TriangleAlert size={22} aria-hidden="true" />
              <h4>Document unavailable</h4>
              <p>{error}</p>
            </div>
          )}

          {doc && document && (
            <>
              <BlueprintExecutiveSummarySection
                bp={doc.blueprint}
                executiveSummary={doc.content.synthesis.executiveSummary}
                keyAssumptions={doc.content.synthesis.keyAssumptions}
              />
              <BlueprintIdeaSection infoGrid={document.infoGrid} />
              <BlueprintPersonasSection personas={doc.content.personas} />
              <BlueprintProductScopeSection
                featureItems={document.features}
                outOfScope={doc.content.mvpPlan.outOfScope}
                dataEntities={doc.content.mvpPlan.dataEntities}
                nonFunctional={doc.content.mvpPlan.nonFunctional}
              />
              <BlueprintTechStackSection
                editing={false}
                draftTechStack={doc.content.techStack}
                architecture={document.architecture}
                stack={document.stack}
                onChangeLayer={() => undefined}
              />
              <RoadmapSection content={doc.content} />
            </>
          )}
        </div>

        <aside className={styles.detailRail}>
          <MatchCard blueprint={blueprint} onApply={applyForBestRole} />
          <ApplicantsCard blueprint={blueprint} />
          <RolesCard blueprint={blueprint} onApply={(role) => onApply(blueprint, role)} />
          <FounderCard
            blueprint={blueprint}
            messagePending={messagePending}
            onMessage={openFounderMessage}
          />
        </aside>
      </div>

      {messageOpen && (
        <div className={styles.modalOverlay} onMouseDown={() => setMessageOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Message ${blueprint.founderName}`}
            className={styles.messageModal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setMessageOpen(false)}
              aria-label="Close message form"
            >
              <X size={16} aria-hidden="true" />
            </button>
            <h3>Message {blueprint.founderName}</h3>
            <p className={styles.modalSubtitle}>
              {messageAccepted
                ? "You are connected, so this goes straight to the conversation."
                : "This sends a connection request with your note. The founder can accept it and reply from Inbox."}
            </p>
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              rows={6}
              aria-label="Message to founder"
            />
            {messageError && (
              <p className={styles.modalError} role="alert">
                {messageError}
              </p>
            )}
            {messageSent && <p className={styles.modalSuccessNote}>Message request sent.</p>}
            <button
              type="button"
              className={styles.btnPrimaryBlock}
              onClick={() => void sendFounderMessage()}
              disabled={!messageText.trim() || messageBusy}
            >
              <Send size={15} aria-hidden="true" />
              {messageBusy ? "Sending" : messageAccepted ? "Send message" : "Send request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function defaultFounderMessage(blueprint: Opportunity) {
  return `Hi ${blueprint.founderName}, I am interested in the ${blueprint.name} blueprint and would like to discuss where I can help.`;
}
