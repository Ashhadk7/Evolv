"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Money, Plus, X } from "@phosphor-icons/react";
import {
  fmtDate,
  fmtMoney,
  todayISO,
  type BlueprintContent,
  type ExpenseCategory,
  type ProjectExpense,
} from "@/features/blueprints/blueprint-content";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Developer Payment",
  "Hosting",
  "Domain",
  "Tools & Services",
  "API Costs",
  "Other",
];

const EXPENSE_CATEGORY_COLOR: Record<ExpenseCategory, { bg: string; color: string }> = {
  "Developer Payment": { bg: "#e8f5ef", color: "#1d6e47" },
  Hosting: { bg: "#eaf2fb", color: "#2e5fa3" },
  Domain: { bg: "#f5eefc", color: "#6b3fa0" },
  "Tools & Services": { bg: "#fdf3e7", color: "#a35c1a" },
  "API Costs": { bg: "#fffaef", color: "#b07d10" },
  Other: { bg: "#f1f3f2", color: "#647a6e" },
};

export function SpendHistoryModal({
  expenses,
  phases,
  spent,
  onAdd,
  onClose,
}: {
  expenses: ProjectExpense[];
  phases: BlueprintContent["phases"];
  total: number;
  spent: number;
  onAdd: (e: Omit<ProjectExpense, "id">) => void;
  onClose: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<{
    label: string;
    category: ExpenseCategory;
    amount: number;
    phaseIndex: number | null;
  }>({ label: "", category: "Hosting", amount: 0, phaseIndex: null });

  const submit = () => {
    if (!draft.label.trim() || draft.amount <= 0) return;
    onAdd({
      label: draft.label.trim(),
      category: draft.category,
      amount: draft.amount,
      date: todayISO(),
      phaseIndex: draft.phaseIndex,
    });
    setDraft({ label: "", category: "Hosting", amount: 0, phaseIndex: null });
    setFormOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#0f1c18]/45 backdrop-blur-[3px] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[26px_26px_22px] w-[min(520px,100%)] max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <Money size={17} weight="duotone" className="text-bp-success" />
            <span className="text-bp-ink text-[16px] font-extrabold">
              Spend History
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-bp-tint w-[30px] h-[30px] flex items-center justify-center rounded-lg border border-bp-border-soft cursor-pointer"
          >
            <X size={13} className="text-bp-muted" />
          </button>
        </div>

        <div className="p-[22px_24px] bg-gradient-to-br from-[#f2f9f5] to-[#e8f5ef] border-[1.5px] border-[#cfeadd] rounded-2xl mb-5 shrink-0 flex items-center justify-between shadow-[0_6px_20px_-8px_rgba(66,132,117,0.25)]">
          <div>
            <div className="text-[11.5px] font-extrabold text-[#2d6b53] uppercase tracking-[0.08em] mb-1.5">
              Total Spent
            </div>
            <div className="text-bp-ink text-[34px] font-black leading-none tracking-[-0.02em] tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
              {fmtMoney(spent)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.25">
            <div className="text-bp-teal text-[12.5px] font-bold">
              {expenses.length} recorded transaction{expenses.length === 1 ? "" : "s"}
            </div>
            {expenses.length > 0 && (
              <div className="text-bp-muted text-[11px] font-medium">
                Latest: {fmtDate(expenses[0].date)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3.5">
          {expenses.length === 0 && (
            <div className="text-bp-muted text-[12.5px] py-4.5 text-center">
              Nothing logged yet. Developer payments appear here automatically once released.
            </div>
          )}
          {expenses.map((e) => {
            const tone = EXPENSE_CATEGORY_COLOR[e.category];
            return (
              <div
                key={e.id}
                className="bg-bp-card flex items-center gap-2.5 p-[9px_12px] border border-bp-border-soft rounded-lg"
              >
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.75 rounded-full shrink-0 whitespace-nowrap ${
                    e.category === "Developer Payment" ? "bg-[#e8f5ef] text-[#1d6e47]" :
                    e.category === "Hosting" ? "bg-[#eaf2fb] text-[#2e5fa3]" :
                    e.category === "Domain" ? "bg-[#f5eefc] text-[#6b3fa0]" :
                    e.category === "Tools & Services" ? "bg-[#fdf3e7] text-[#a35c1a]" :
                    e.category === "API Costs" ? "bg-[#fffaef] text-[#b07d10]" :
                    "bg-[#f1f3f2] text-[#647a6e]"
                  }`}
                >
                  {e.category}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-bp-ink text-[12px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    {e.label}
                  </div>
                  <div className="text-bp-label text-[10px]">
                    {fmtDate(e.date)}
                    {e.phaseIndex !== null ? ` · ${phases[e.phaseIndex]?.name}` : ""}
                  </div>
                </div>
                <span className="text-bp-ink text-[13px] font-extrabold shrink-0 tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                  {fmtMoney(e.amount)}
                </span>
              </div>
            );
          })}
        </div>

        {formOpen ? (
          <div className="bg-bp-tint shrink-0 p-[13px_14px] border border-bp-border-soft rounded-xl flex flex-col gap-2.25">
            <input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="e.g. AWS hosting — July"
              autoFocus
              className="text-bp-ink w-full text-[12.5px] p-[8px_10px] rounded-lg border border-bp-border outline-none font-inherit"
            />
            <div className="grid grid-cols-[1.3fr_1fr] gap-2">
              <select
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as ExpenseCategory })
                }
                className="text-bp-ink bg-bp-card text-[12px] p-[8px_9px] rounded-lg border border-bp-border outline-none font-inherit"
              >
                {EXPENSE_CATEGORIES.filter((c) => c !== "Developer Payment").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={draft.amount || ""}
                onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) || 0 })}
                placeholder="Amount"
                className="text-bp-ink text-[12px] p-[8px_9px] rounded-lg border border-bp-border outline-none font-inherit tabular-nums font-feature-settings-[_tnum_1,_ss01_1]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={!draft.label.trim() || draft.amount <= 0}
                className="bp-gradient-btn flex-1 text-[12.5px] font-bold p-2.25 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add expense
              </button>
              <button
                onClick={() => setFormOpen(false)}
                className="text-bp-muted text-[12.5px] font-semibold px-3.5 py-2.25 rounded-lg bg-transparent border border-bp-border cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setFormOpen(true)}
            className="bg-bp-tint text-bp-forest shrink-0 flex items-center justify-center gap-1.75 w-full text-[12.5px] font-bold p-2.5 rounded-lg border border-dashed border-bp-forest cursor-pointer"
          >
            <Plus size={13} weight="bold" /> Log hosting, domain, tools, or API cost
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
