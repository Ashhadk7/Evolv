"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Sparkle, X } from "@phosphor-icons/react";
import { generateBlueprint } from "@/features/blueprints/blueprints-api";
import type { Blueprint } from "@/features/blueprints/types";
import { FORGE_AGENTS, WORKSPACE_INDUSTRIES } from "@/features/workspace/data/workspace-data";
import { getApiErrorMessage } from "@/lib/api";

interface ForgeModalProps {
  onClose: () => void;
  onCreated: (bp: Blueprint) => void;
}

export function ForgeModal({ onClose, onCreated }: ForgeModalProps) {
  const [phase, setPhase] = useState<"input" | "generating" | "done">("input");
  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [stage, setStage] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [region, setRegion] = useState("");
  const [monetization, setMonetization] = useState("");
  const [constraints, setConstraints] = useState("");
  const [generatedBlueprint, setGeneratedBlueprint] = useState<Blueprint | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [agentIndex, setAgentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGeneration = async () => {
    if (!idea.trim() || !industry) return;
    setGenerationError("");
    setGeneratedBlueprint(null);
    setPhase("generating");
    setAgentIndex(0);
    setProgress(0);

    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick += 1;
      setProgress((current) => Math.min(current + 2, 92));
      setAgentIndex(tick % FORGE_AGENTS.length);
    }, 900);

    try {
      const blueprint = await generateBlueprint({
        idea,
        industry,
        target_customer: targetCustomer,
        problem,
        solution,
        stage,
        budget,
        timeline,
        region,
        monetization,
        constraints,
      });
      setGeneratedBlueprint(blueprint);
      setAgentIndex(FORGE_AGENTS.length - 1);
      setProgress(100);
      setPhase("done");
    } catch (error) {
      setGenerationError(getApiErrorMessage(error));
      setPhase("input");
    } finally {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handleAccept = () => {
    if (!generatedBlueprint) return;
    onCreated(generatedBlueprint);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,22,18,0.75)] p-4 backdrop-blur-[6px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="max-h-[88vh] w-[720px] overflow-hidden rounded-[20px] border border-[#d8e8e0] bg-white shadow-[0_32px_80px_rgba(26,49,44,0.22)]"
      >
        <div className="flex items-center justify-between border-b border-[#eaf0eb] px-6 py-[18px]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#1a312c]">
              <Sparkle size={15} weight="fill" className="text-[#89d7b7]" />
            </div>
            <span className="text-sm font-extrabold text-[#1a2e26]">Forge New Blueprint</span>
          </div>
          <button
            onClick={onClose}
            className="flex cursor-pointer rounded-lg border-none bg-transparent p-1.5 transition-colors hover:bg-[#f5f7f5]"
          >
            <X size={15} className="text-[#7a9e8e]" />
          </button>
        </div>

        <div className="max-h-[calc(88vh-72px)] overflow-y-auto px-6 pt-5 pb-6">
          <AnimatePresence mode="wait">
            {phase === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-[18px]"
              >
                {generationError && (
                  <div className="rounded-xl border border-[#f1d3c7] bg-[#fff6f2] px-3.5 py-3 text-[12.5px] leading-[1.45] text-[#9b4a2f]">
                    {generationError}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-[11px] font-bold tracking-[0.04em] text-[#5a8070] uppercase">
                    Describe your startup idea
                  </label>
                  <textarea
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    placeholder="e.g. An AI platform that helps small restaurants optimise menu pricing dynamically..."
                    className="min-h-[110px] w-full resize-none rounded-xl border border-[#d8e8e0] bg-[#f5f8f6] px-4 py-[13px] font-[inherit] text-[13px] leading-[1.6] text-[#1a2e26] outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[11px] font-bold tracking-[0.04em] text-[#5a8070] uppercase">
                    Select industry
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WORKSPACE_INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => setIndustry(ind)}
                        className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                          industry === ind
                            ? "border border-[rgba(137,215,183,0.3)] bg-[#1a312c] text-[#89d7b7]"
                            : "border border-[#d8e8e0] bg-[#eef4f1] text-[#428475]"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  <Field
                    label="Target customer"
                    value={targetCustomer}
                    onChange={setTargetCustomer}
                    placeholder="small clinics, founders, restaurant owners"
                  />
                  <Field
                    label="Stage"
                    value={stage}
                    onChange={setStage}
                    placeholder="Idea, validation, MVP, launched"
                  />
                  <Field
                    label="Estimated budget"
                    value={budget}
                    onChange={setBudget}
                    placeholder="$5K, $25K, PKR 2M"
                  />
                  <Field
                    label="Timeline"
                    value={timeline}
                    onChange={setTimeline}
                    placeholder="8 weeks, 3 months"
                  />
                  <Field
                    label="Region"
                    value={region}
                    onChange={setRegion}
                    placeholder="Pakistan, US, global"
                  />
                  <Field
                    label="Monetization"
                    value={monetization}
                    onChange={setMonetization}
                    placeholder="Subscription, commission, freemium"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  <LongField
                    label="Problem"
                    value={problem}
                    onChange={setProblem}
                    placeholder="What painful workflow or need are you solving?"
                  />
                  <LongField
                    label="Proposed solution"
                    value={solution}
                    onChange={setSolution}
                    placeholder="How do you think the product should solve it?"
                  />
                </div>

                <div>
                  <LongField
                    label="Constraints"
                    value={constraints}
                    onChange={setConstraints}
                    placeholder="Must-haves, limits, compliance, integrations"
                  />
                </div>

                <motion.button
                  onClick={startGeneration}
                  disabled={!idea.trim() || !industry}
                  whileHover={idea.trim() && industry ? { scale: 1.01 } : {}}
                  whileTap={idea.trim() && industry ? { scale: 0.98 } : {}}
                  className="bp-primary-btn w-full disabled:opacity-40"
                >
                  <Sparkle size={14} weight="fill" /> Generate Blueprint
                </motion.button>
              </motion.div>
            )}

            {phase === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-2"
              >
                <div className="mb-6 text-center">
                  <div className="mb-1 text-sm font-bold text-[#1a2e26]">
                    Generating your blueprint...
                  </div>
                  <div className="text-xs text-[#7a9e8e]">4 AI agents are working on your idea</div>
                </div>
                <div className="mb-6 flex flex-col gap-3.5">
                  {FORGE_AGENTS.map((agent, index) => {
                    const done = progress === 100 || index < agentIndex;
                    const active = progress !== 100 && index === agentIndex;
                    return (
                      <div key={agent.label} className="flex items-center gap-3">
                        <div
                          className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            done
                              ? "bg-[#dcf0e6] text-[#1d6e47]"
                              : active
                                ? "bg-[#1a312c] text-[#89d7b7]"
                                : "bg-[#f0f5f2] text-[#9ab4a4]"
                          }`}
                        >
                          {done ? "OK" : index + 1}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-semibold ${
                              done
                                ? "text-[#9ab4a4]"
                                : active
                                  ? "text-[#1a2e26]"
                                  : "text-[#b0c0b8]"
                            }`}
                          >
                            {agent.label}
                          </div>
                          {active && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-0.5 text-[11px] text-[#7a9e8e]"
                            >
                              {agent.desc}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e0ede6]">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#1a312c,#428475,#89d7b7)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="mt-1.5 text-right text-[11px] text-[#7a9e8e]">{progress}%</div>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center"
              >
                <div className="mb-1.5 text-base font-extrabold text-[#1a2e26]">
                  Blueprint ready
                </div>
                <div className="mb-7 text-[13px] text-[#7a9e8e]">
                  All 4 agents completed analysis successfully.
                </div>
                <motion.button
                  onClick={handleAccept}
                  disabled={!generatedBlueprint}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bp-primary-btn disabled:opacity-40"
                >
                  <CheckCircle size={15} weight="fill" /> View Blueprint
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold tracking-[0.04em] text-[#5a8070] uppercase">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#d8e8e0] bg-[#f5f8f6] px-3.5 font-[inherit] text-[13px] text-[#1a2e26] outline-none"
      />
    </div>
  );
}

function LongField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold tracking-[0.04em] text-[#5a8070] uppercase">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[86px] w-full resize-none rounded-xl border border-[#d8e8e0] bg-[#f5f8f6] px-3.5 py-3 font-[inherit] text-[13px] leading-[1.5] text-[#1a2e26] outline-none"
      />
    </div>
  );
}
