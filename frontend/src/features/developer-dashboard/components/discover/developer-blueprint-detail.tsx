import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Code2,
  Layers3,
  ListChecks,
  MessageSquare,
  Send,
  Sparkles,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import { getApiErrorMessage } from "@/lib/api";
import { messagingApi } from "@/features/messaging/lib/messaging-api";
import type { Opportunity } from "./types";

export function DeveloperBlueprintDetail({
  blueprint,
  getViabilityColor,
  busyAction,
  busyRole,
  backLabel = "Back to Discover",
  onBack,
  onApply,
  onWithdraw,
  onSave,
}: {
  blueprint: Opportunity;
  getViabilityColor: (score: number) => string;
  busyAction?: "apply" | "save" | "withdraw";
  busyRole?: string;
  backLabel?: string;
  onBack: () => void;
  onApply: (blueprint: Opportunity, role: string) => void;
  onWithdraw?: (blueprint: Opportunity) => void;
  onSave: (blueprint: Opportunity) => void;
}) {
  const saving = busyAction === "save";
  const applying = busyAction === "apply";
  const withdrawing = busyAction === "withdraw";
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState(() => defaultFounderMessage(blueprint));
  const [messageBusy, setMessageBusy] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [messageStatus, setMessageStatus] = useState<
    "unknown" | "none" | "pending" | "accepted" | "declined"
  >("unknown");
  const visibleTech = blueprint.techStack.slice(0, 10);
  const extraTechCount = Math.max(0, blueprint.techStack.length - visibleTech.length);
  const isWithdrawn = blueprint.applicationStatus === "withdrawn";
  const appliedRoleStillVisible =
    blueprint.applied && blueprint.roles.some((role) => role.role === blueprint.appliedRole);
  const summaryCards = useMemo(
    () => [
      { label: "Timeline", value: blueprint.timeline },
      { label: "Developer Demand", value: blueprint.developerDemand },
      { label: "Viability", value: `${blueprint.viability}%`, color: getViabilityColor(blueprint.viability) },
    ],
    [blueprint.developerDemand, blueprint.timeline, blueprint.viability, getViabilityColor]
  );
  const messagePending = messageStatus === "pending";
  const messageAccepted = messageStatus === "accepted";

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
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      if (errorMessage.toLowerCase().includes("wait for this message request")) {
        setMessageStatus("pending");
      }
      setMessageError(errorMessage);
    } finally {
      setMessageBusy(false);
    }
  };

  const openFounderMessage = () => {
    if (messagePending) return;
    setMessageText(defaultFounderMessage(blueprint));
    setMessageError("");
    setMessageSent(false);
    setMessageOpen(true);
  };

  return (
    <div className={styles.detailPage}>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={16} /> {backLabel}
      </button>

      <section className={styles.detailHero}>
        <div className={styles.detailIdentity}>
          <div className={styles.detailLogo}>{blueprint.logo}</div>
          <div>
            <div className={styles.detailKicker}>
              {blueprint.industry} - {blueprint.stage}
            </div>
            <h1>{blueprint.name}</h1>
            <p>{blueprint.summary}</p>
          </div>
        </div>

        <div className={styles.detailActions}>
          <div className={styles.detailScore}>
            <span>{blueprint.matchScore}%</span>
            <small>profile match</small>
          </div>
          <button
            className={`${styles.saveBtnText} ${blueprint.saved ? styles.savedButton : ""}`}
            onClick={() => onSave(blueprint)}
            disabled={saving}
          >
            {blueprint.saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {blueprint.saved ? "Saved" : saving ? "Saving" : "Save"}
          </button>
        </div>
      </section>

      <section className={styles.detailSummaryStrip}>
        {summaryCards.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong style={{ color: item.color }}>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>
          <UserRound size={16} /> Founder
        </div>
        <div className={styles.founderContactCard}>
          <div>
            <span>Blueprint owner</span>
            <strong>{blueprint.founderName}</strong>
            {blueprint.differentiator && <p>{blueprint.differentiator}</p>}
          </div>
          <button
            className={`${devPrimaryBtn.button} ${styles.messageFounderBtn}`}
            onClick={openFounderMessage}
            disabled={messagePending}
            title={
              messagePending
                ? "Request already sent. Wait for the founder to accept."
                : messageAccepted
                  ? "Send a message"
                  : "Send a connection request"
            }
          >
            {messagePending ? <CheckCircle2 size={15} /> : <MessageSquare size={15} />}
            {messagePending ? "Request Sent" : "Message Founder"}
          </button>
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>
          <Layers3 size={16} /> Apply For A Role
        </div>
        {isWithdrawn && (
          <div className={styles.withdrawnNotice}>
            <XCircle size={15} /> Application withdrawn. You can apply again for an available role.
          </div>
        )}
        {blueprint.applied && onWithdraw && !appliedRoleStillVisible && (
          <button
            className={styles.roleWithdrawBtn}
            onClick={() => onWithdraw(blueprint)}
            disabled={withdrawing}
          >
            <XCircle size={14} /> {withdrawing ? "Withdrawing" : "Withdraw application"}
          </button>
        )}
        <div className={styles.roleGrid}>
          {blueprint.roles.length > 0 ? (
            blueprint.roles.map((role) => {
              const isAppliedRole = blueprint.applied && blueprint.appliedRole === role.role;
              const wasWithdrawnRole = isWithdrawn && blueprint.appliedRole === role.role;
              const appliedElsewhere = blueprint.applied && !isAppliedRole;
              const applyingRole = applying && busyRole === role.role;
              const canWithdraw = isAppliedRole && onWithdraw;
              return (
                <div key={`${role.role}-${role.count}`} className={styles.roleCard}>
                  <div className={styles.roleCardMain}>
                    <div>
                      <strong>{role.role}</strong>
                      <span>
                        {role.count} {role.count === 1 ? "seat" : "seats"}
                        {role.lead ? " - lead role" : ""}
                      </span>
                    </div>
                    <button
                      className={
                        canWithdraw
                          ? styles.roleWithdrawBtn
                          : `${devPrimaryBtn.button} ${styles.roleApplyBtn}`
                      }
                      onClick={() =>
                        canWithdraw ? onWithdraw(blueprint) : onApply(blueprint, role.role)
                      }
                      disabled={(blueprint.applied && !canWithdraw) || applying || withdrawing}
                    >
                      {canWithdraw ? (
                        <XCircle size={14} />
                      ) : isAppliedRole || appliedElsewhere ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Send size={14} />
                      )}
                      {canWithdraw
                        ? withdrawing
                          ? "Withdrawing"
                          : "Withdraw"
                        : isAppliedRole
                          ? "Applied"
                        : appliedElsewhere
                          ? "Already applied"
                          : applyingRole
                            ? "Applying"
                            : wasWithdrawnRole
                              ? "Reapply"
                            : "Apply"}
                    </button>
                  </div>
                  {role.skills.length > 0 && (
                    <div className={styles.roleSkills}>
                      {role.skills.slice(0, 6).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>Founder has not published role needs yet.</p>
          )}
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>
          <Code2 size={16} /> Tech Stack
        </div>
        <div className={styles.stackGrid}>
          {visibleTech.length > 0 ? (
            <>
              {visibleTech.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
              {extraTechCount > 0 && <span>+{extraTechCount} more</span>}
            </>
          ) : (
            <p>Tech stack has not been published yet.</p>
          )}
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>
          <ListChecks size={16} /> MVP Focus
        </div>
        <div className={styles.mvpList}>
          {blueprint.mvpFeatures.length > 0 ? (
            blueprint.mvpFeatures.map((feature) => <span key={feature}>{feature}</span>)
          ) : (
            <p>MVP scope is still being finalized by the founder.</p>
          )}
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>
          <Sparkles size={16} /> Why This Fits
        </div>
        <div className={styles.reasonGrid}>
          {blueprint.matchReasons.map((reason) => (
            <div key={reason} className={styles.reasonCard}>
              <CheckCircle2 size={15} />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </section>

      {messageOpen && (
        <div className={styles.messageOverlay}>
          <div className={styles.messageModal}>
            <button
              className={styles.messageCloseBtn}
              onClick={() => setMessageOpen(false)}
              aria-label="Close message form"
              title="Close message form"
            >
              <X size={16} />
            </button>
            <h3>Message {blueprint.founderName}</h3>
            <p>
              {messageAccepted
                ? "You are connected, so this message will go straight to the conversation."
                : "This sends a connection request with your note. The founder can accept it and reply from Inbox."}
            </p>
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              rows={6}
            />
            {messageError && <div className={styles.messageError}>{messageError}</div>}
            {messageSent && <div className={styles.messageSuccess}>Message request sent.</div>}
            <button
              className={`${devPrimaryBtn.button} ${styles.messageSendBtn}`}
              onClick={() => void sendFounderMessage()}
              disabled={!messageText.trim() || messageBusy}
            >
              <Send size={15} />{" "}
              {messageBusy ? "Sending" : messageAccepted ? "Send Message" : "Send Request"}
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
