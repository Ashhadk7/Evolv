"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowsClockwise, CheckCircle, Warning, Sparkle } from "@phosphor-icons/react";
import { getAccessToken } from "@/features/auth/lib/session";
import { blueprintFromWire as transformBlueprint } from "@/features/blueprints/blueprints-api";
import type { Blueprint } from "@/features/blueprints/types";

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

type ModalStep = "form" | "refining" | "completed" | "error";

interface Props {
  blueprintId: string;
  blueprintName: string;
  onRefined?: (updatedBp: Blueprint) => void;
}

export function RefineModal({ blueprintId, blueprintName, onRefined }: Props) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<RefinableSection>("market");
  const [feedback, setFeedback] = useState("");
  const [step, setStep] = useState<ModalStep>("form");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupTimers = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    return cleanupTimers;
  }, []);

  const handleSubmit = async () => {
    if (feedback.trim().length < 10) {
      setErrorMessage("Please provide at least 10 characters of feedback.");
      setStep("error");
      return;
    }

    setStep("refining");
    setProgress(15);
    setStatusMessage(`Initiating ${SECTION_LABELS[section]} AI analysis...`);
    setErrorMessage("");

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

      // Smooth simulated progress bar while polling
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return 88;
          return prev + 6;
        });
      }, 800);

      // Start background polling to detect completion
      let attempts = 0;
      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        try {
          const checkRes = await fetch(`${API_BASE}/blueprints/${blueprintId}`, {
            headers: { Authorization: `Bearer ${token || ""}` },
          });
          if (checkRes.ok) {
            const freshData = await checkRes.json();
            const versionObj = freshData.current_version || freshData.currentVersion;
            const contentJson = versionObj?.content_json || versionObj?.contentJson || {};
            const refState = contentJson.refinement || {};

            if (refState.status === "completed" || attempts >= 15) {
              cleanupTimers();
              setProgress(100);
              setStep("completed");
              setStatusMessage(`${SECTION_LABELS[section]} has been successfully refined!`);

              // Transform raw fresh response to Blueprint model and update parent page
              const freshBlueprint = transformBlueprint(freshData);
              onRefined?.(freshBlueprint);
            }
          }
        } catch {
          /* transient poll error retry */
        }

        if (attempts >= 22) {
          cleanupTimers();
          setErrorMessage("Refinement timed out. Please refresh to check status.");
          setStep("error");
        }
      }, 2000);
    } catch (err: unknown) {
      cleanupTimers();
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleClose = () => {
    cleanupTimers();
    setOpen(false);
    setStep("form");
    setProgress(0);
    setErrorMessage("");
    setStatusMessage("");
  };

  return (
    <>
      {/* Trigger button in Blueprint ActionBar */}
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
        <Sparkle size={15} weight="fill" style={{ color: "#89d7b7" }} />
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
              onClick={step === "refining" ? undefined : handleClose}
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
                width: "min(500px, calc(100vw - 32px))",
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
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e8f4ef", display: "flex", alignItems: "center", gap: 8 }}>
                    <Sparkle size={18} weight="fill" style={{ color: "#89d7b7" }} />
                    Refine Blueprint Section
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(232,244,239,0.5)", marginTop: 3 }}>
                    {blueprintName}
                  </div>
                </div>
                {step !== "refining" && (
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
                )}
              </div>

              {/* STEP 1: Form View */}
              {step === "form" && (
                <>
                  {/* Section selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(232,244,239,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Select Section to Refine
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {(Object.keys(SECTION_LABELS) as RefinableSection[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSection(s)}
                          style={{
                            padding: "6px 13px",
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
                    <div style={{ fontSize: 11.5, color: "rgba(232,244,239,0.4)", marginTop: 2 }}>
                      {SECTION_DESCRIPTIONS[section]}
                    </div>
                  </div>

                  {/* Feedback textarea */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(232,244,239,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Your Instructions / Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={`Example: Add Python FastAPI for the backend layer and PostgreSQL for database.`}
                      rows={4}
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

                  {/* Modal Actions */}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
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
                      Cancel
                    </button>

                    <button
                      onClick={handleSubmit}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 22px",
                        borderRadius: 10,
                        border: "1px solid rgba(137,215,183,0.3)",
                        background: "linear-gradient(180deg, #244b42 0%, #18382f 100%)",
                        color: "#abffdc",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Sparkle size={15} weight="fill" />
                      Refine Section
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2: Refining State (Progress Bar inside Modal) */}
              {step === "refining" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "12px 0 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      style={{ display: "flex", color: "#89d7b7" }}
                    >
                      <ArrowsClockwise size={26} weight="bold" />
                    </motion.div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#e8f4ef" }}>
                        Refining {SECTION_LABELS[section]}...
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(232,244,239,0.55)", marginTop: 2 }}>
                        Re-running agent analysis with your feedback. Please wait...
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ height: 8, width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: "10%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut", duration: 0.4 }}
                        style={{ height: "100%", background: "linear-gradient(90deg, #244b42 0%, #89d7b7 100%)" }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(232,244,239,0.4)" }}>
                      <span>{statusMessage || "Processing agent output..."}</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Completed State inside Modal */}
              {step === "completed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "10px 0 6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <CheckCircle size={32} weight="fill" style={{ color: "#5bc8a0" }} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#5bc8a0" }}>
                        Refinement Complete!
                      </div>
                      <div style={{ fontSize: 12.5, color: "rgba(232,244,239,0.75)", marginTop: 2 }}>
                        {SECTION_LABELS[section]} has been updated with your changes.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 10,
                      border: "1px solid rgba(137,215,183,0.3)",
                      background: "linear-gradient(180deg, #244b42 0%, #18382f 100%)",
                      color: "#abffdc",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    View Updated Section
                  </button>
                </div>
              )}

              {/* STEP 4: Error State */}
              {step === "error" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ff6b6b" }}>
                    <Warning size={20} weight="fill" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{errorMessage || "Refinement failed."}</span>
                  </div>
                  <button
                    onClick={() => setStep("form")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 9,
                      border: "1px solid rgba(137,215,183,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#e8f4ef",
                      fontSize: 12.5,
                      cursor: "pointer",
                      alignSelf: "flex-end",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
