"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowsClockwise, CheckCircle, Warning } from "@phosphor-icons/react";
import { getAccessToken } from "@/features/auth/lib/session";

type RefinableSection =
  | "market"
  | "competitor"
  | "persona"
  | "product"
  | "strategy"
  | "techStack"
  | "synthesis";

const SECTION_LABELS: Record<RefinableSection, string> = {
  market: "Market Analysis",
  competitor: "Competitive Landscape",
  persona: "Target Users",
  product: "Product Scope",
  strategy: "Strategy & GTM",
  techStack: "Tech Stack",
  synthesis: "Venture Assessment",
};

const SECTION_DESCRIPTIONS: Record<RefinableSection, string> = {
  market: "Update market size, growth rates, demand signals and timing analysis.",
  competitor: "Re-evaluate the competitive landscape, positioning angle, and white space.",
  persona: "Refine the target user segments, pains, and acquisition channels.",
  product: "Adjust the feature prioritisation, MVP scope, and out-of-scope items.",
  strategy: "Rework the go-to-market channels, growth sequence, and risk register.",
  techStack: "Reconsider the technology choices, hosting layers, and team roles.",
  synthesis: "Re-run the overall venture assessment, verdict, and executive summary.",
};

type RefineStatus = "idle" | "loading" | "queued" | "error";

interface Props {
  blueprintId: string;
  blueprintName: string;
  isFounder?: boolean;
  onQueued?: () => void;
}

export function RefineModal({ blueprintId, blueprintName, isFounder = true, onQueued }: Props) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<RefinableSection>("market");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<RefineStatus>("idle");
  const [message, setMessage] = useState("");

  if (!isFounder) return null;

  const handleSubmit = async () => {
    if (feedback.trim().length < 10) {
      setMessage("Please provide at least 10 characters of feedback.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/blueprints/${blueprintId}/refine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ section, feedback: feedback.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Refine request failed.");
      }

      setStatus("queued");
      setMessage(data.message || "Refine queued. Refresh in ~15s.");
      setFeedback("");
      onQueued?.();
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStatus("idle");
    setMessage("");
    setFeedback("");
  };

  return (
    <>
      {/* Trigger button — sits in the blueprint action area */}
      <button
        onClick={() => setOpen(true)}
        title="Refine a section with AI"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: 10,
          border: "1px solid rgba(137,215,183,0.22)",
          background: "linear-gradient(180deg, #244b42 0%, #18382f 55%, #102b24 100%)",
          color: "#abffdc",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "inset 0 1px 0 rgba(171,255,220,0.12)",
          whiteSpace: "nowrap",
        }}
      >
        <ArrowsClockwise size={14} weight="bold" />
        Refine with AI
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 80,
                background: "rgba(10,26,20,0.72)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: 32, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 32, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 81,
                width: "min(480px, calc(100vw - 32px))",
                borderRadius: 20,
                border: "1px solid rgba(137,215,183,0.14)",
                background: "linear-gradient(180deg, #1a3830 0%, #152d27 100%)",
                boxShadow: "0 32px 80px rgba(9,26,20,0.55)",
                padding: "28px 26px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e8f4ef" }}>
                    Refine Blueprint Section
                  </div>
                  <div style={{ fontSize: 11.5, color: "rgba(232,244,239,0.5)", marginTop: 3 }}>
                    {blueprintName}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(232,244,239,0.45)",
                    padding: 2,
                  }}
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Section selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(232,244,239,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Section to Refine
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {(Object.keys(SECTION_LABELS) as RefinableSection[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSection(s)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: section === s
                          ? "1px solid rgba(137,215,183,0.5)"
                          : "1px solid rgba(137,215,183,0.12)",
                        background: section === s
                          ? "rgba(137,215,183,0.14)"
                          : "rgba(255,255,255,0.03)",
                        color: section === s ? "#89d7b7" : "rgba(232,244,239,0.55)",
                        fontSize: 12,
                        fontWeight: section === s ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {SECTION_LABELS[s]}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(232,244,239,0.38)", marginTop: 2 }}>
                  {SECTION_DESCRIPTIONS[section]}
                </div>
              </div>

              {/* Feedback textarea */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(232,244,239,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={`What should change in ${SECTION_LABELS[section]}? Be specific — the AI will use this to re-run the analysis.`}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(137,215,183,0.16)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#e8f4ef",
                    fontSize: 13,
                    lineHeight: 1.55,
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 11, color: "rgba(232,244,239,0.3)", textAlign: "right" }}>
                  {feedback.length}/1500
                </div>
              </div>

              {/* Status message */}
              {message && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: status === "queued" ? "rgba(91,200,160,0.1)" : "rgba(255,107,107,0.1)",
                    border: `1px solid ${status === "queued" ? "rgba(91,200,160,0.2)" : "rgba(255,107,107,0.2)"}`,
                    fontSize: 12.5,
                    color: status === "queued" ? "#5bc8a0" : "#ff6b6b",
                  }}
                >
                  {status === "queued"
                    ? <CheckCircle size={15} weight="fill" />
                    : <Warning size={15} weight="fill" />}
                  {message}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={handleClose}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "1px solid rgba(137,215,183,0.15)",
                    background: "transparent",
                    color: "rgba(232,244,239,0.55)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {status === "queued" ? "Close" : "Cancel"}
                </button>

                {status !== "queued" && (
                  <button
                    onClick={handleSubmit}
                    disabled={status === "loading"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 20px",
                      borderRadius: 10,
                      border: "1px solid rgba(137,215,183,0.3)",
                      background: "linear-gradient(180deg, #244b42 0%, #18382f 100%)",
                      color: "#abffdc",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      opacity: status === "loading" ? 0.7 : 1,
                    }}
                  >
                    {status === "loading" ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ display: "flex" }}
                        >
                          <ArrowsClockwise size={14} weight="bold" />
                        </motion.span>
                        Queuing…
                      </>
                    ) : (
                      <>
                        <ArrowsClockwise size={14} weight="bold" />
                        Refine Section
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
