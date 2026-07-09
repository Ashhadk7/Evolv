"use client";

import { useState } from "react";
import { CheckCircle, User, Warning } from "@phosphor-icons/react";
import { Avatar } from "@/components/shared/avatar";
import { Label } from "@/components/shared/label";
import { fmtMoney } from "@/features/blueprints/blueprint-content";
import type { FounderContactProfile } from "@/features/network/types";
import { ModalShell } from "./modal-shell";

export function AddDeveloperModal({
  developer,
  defaultAmount,
  onConfirm,
  onClose,
}: {
  developer: FounderContactProfile;
  defaultAmount: number;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  return (
    <ModalShell
      icon={<User size={16} weight="duotone" className="text-bp-teal" />}
      title={`Hire ${developer.name}`}
      subtitle={developer.role}
      onClose={onClose}
    >
      <div className="bg-bp-tint flex items-center gap-3 p-[12px_14px] border border-bp-border-soft rounded-xl mb-4">
        <Avatar initials={developer.initials} size={34} />
        <div className="flex-1 min-w-0">
          <div className="text-bp-ink text-[13px] font-bold">
            {developer.name}
          </div>
          <div className="text-bp-muted text-[11px]">
            {developer.skills.slice(0, 2).join(" · ")}
          </div>
        </div>
        <span className="text-[12px] font-extrabold px-2.5 py-1 rounded-full bg-[#e8f5ef] text-[#1d6e47] tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
          {developer.match}%
        </span>
      </div>
      <Label>Amount agreed for this phase</Label>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-bp-ink text-[20px] font-extrabold">
          $
        </span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="text-bp-ink flex-1 text-[20px] font-extrabold border border-bp-border rounded-lg p-[8px_12px] outline-none font-inherit tabular-nums font-feature-settings-[_tnum_1,_ss01_1]"
        />
      </div>
      <p className="text-bp-muted text-[11.5px] leading-relaxed mb-4.5">
        This is the total you&apos;re confirming with {developer.name.split(" ")[0]} for this phase
        — you can pay it in installments as work progresses, not all at once.
      </p>
      <button
        onClick={() => onConfirm(Math.max(0, amount))}
        disabled={amount <= 0}
        className="bp-primary-btn w-full flex items-center justify-center gap-2 text-[13.5px] font-bold p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle size={15} weight="fill" /> Confirm & hire
      </button>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Remove developer — mandatory reason, permanent audit trail  */
/* ═══════════════════════════════════════════════════════ */
export function RemoveDeveloperModal({
  developerName,
  phaseName,
  amountPaid,
  onConfirm,
  onClose,
}: {
  developerName: string;
  phaseName: string;
  amountPaid: number;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <ModalShell
      icon={<Warning size={16} weight="duotone" className="text-bp-red" />}
      title={`Remove ${developerName}`}
      subtitle={phaseName}
      onClose={onClose}
    >
      <div className="bg-bp-tint flex justify-between p-[12px_14px] border border-bp-border-soft rounded-xl mb-3.5">
        <span className="text-bp-muted text-[12.5px]">
          Already paid to {developerName.split(" ")[0]}
        </span>
        <span className="text-bp-ink text-[14px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
          {fmtMoney(amountPaid)}
        </span>
      </div>
      <p className="bg-bp-amber-bg text-[11.5px] text-[#7a5c10] leading-relaxed border border-bp-amber-line rounded-xl p-[10px_12px] mb-3.5">
        Removing does not refund what&apos;s already been paid. Evolv keeps a permanent record of
        this removal — the reason and amount paid — in case it&apos;s ever reported or disputed.
      </p>
      <Label>Reason for removal (required)</Label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        autoFocus
        placeholder="e.g. Missed two deadlines and deliverables didn't match the spec after feedback."
        className="text-bp-ink w-full min-h-[80px] text-[12.5px] p-[10px_12px] rounded-lg border border-bp-border outline-none font-inherit resize-y mb-4"
      />
      <button
        onClick={() => onConfirm(reason.trim())}
        disabled={!reason.trim()}
        className={`w-full flex items-center justify-center gap-2 text-[13.5px] font-bold p-3 rounded-xl text-white border-none transition ${reason.trim() ? "bg-bp-red cursor-pointer" : "bg-bp-border cursor-not-allowed opacity-50"}`}
      >
        Remove & record
      </button>
    </ModalShell>
  );
}
