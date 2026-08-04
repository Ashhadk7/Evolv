"use client";

import { useState } from "react";
import { Coins, CreditCard } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { fmtMoney } from "@/features/blueprints/blueprint-content";
import { ModalShell } from "./modal-shell";

export function PaymentModal({
  developerName,
  amountAgreed,
  amountPaid,
  feePct,
  onSend,
  onClose,
}: {
  developerName: string;
  amountAgreed: number;
  amountPaid: number;
  feePct: number;
  onSend: (amount: number) => void;
  onClose: () => void;
}) {
  const due = Math.max(0, amountAgreed - amountPaid);
  const [amount, setAmount] = useState(due);
  const fee = Math.round(amount * feePct);
  const takeHome = amount - fee;
  const statusLabel =
    amountPaid <= 0
      ? "Not paid yet"
      : amountPaid >= amountAgreed
        ? "Paid in full"
        : "Partially paid";

  return (
    <ModalShell
      icon={<CreditCard size={16} weight="duotone" className="text-bp-teal" />}
      title={`Pay ${developerName}`}
      subtitle="USD card payment"
      onClose={onClose}
    >
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <div className="bg-bp-tint rounded-lg border border-bp-border-soft p-[10px_12px]">
          <div className="text-bp-label text-[9.5px] uppercase tracking-wider">Agreed</div>
          <div className="text-bp-ink text-[15px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
            {fmtMoney(amountAgreed)}
          </div>
        </div>
        <div className="bg-bp-tint rounded-lg border border-bp-border-soft p-[10px_12px]">
          <div className="text-bp-label text-[9.5px] uppercase tracking-wider">Paid</div>
          <div className="text-bp-success text-[15px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
            {fmtMoney(amountPaid)}
          </div>
        </div>
        <div className="bg-bp-tint rounded-lg border border-bp-border-soft p-[10px_12px]">
          <div className="text-bp-label text-[9.5px] uppercase tracking-wider">Due</div>
          <div
            className={`${due > 0 ? "text-bp-amber" : "text-bp-success"} text-[15px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]`}
          >
            {fmtMoney(due)}
          </div>
        </div>
      </div>

      <Chip
        tone={
          statusLabel === "Paid in full"
            ? "mint"
            : statusLabel === "Partially paid"
              ? "amber"
              : "neutral"
        }
      >
        {statusLabel}
      </Chip>

      <div className="mt-4">
        <Label>Amount to pay now</Label>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-bp-ink text-[20px] font-extrabold">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="text-bp-ink flex-1 rounded-lg border border-bp-border p-[8px_12px] text-[20px] font-extrabold tabular-nums outline-none font-feature-settings-[_tnum_1,_ss01_1]"
          />
        </div>
      </div>

      <div className="bg-bp-tint mb-4.5 flex flex-col gap-2 rounded-xl border border-bp-border-soft p-[14px_16px]">
        <div className="flex justify-between text-[12.5px]">
          <span className="text-bp-muted">Founder payment</span>
          <span className="text-bp-ink font-bold">{fmtMoney(amount)}</span>
        </div>
        <div className="flex justify-between text-[12.5px]">
          <span className="text-bp-muted">Evolv platform fee ({Math.round(feePct * 100)}%)</span>
          <span className="text-bp-amber font-bold">-{fmtMoney(fee)}</span>
        </div>
        <div className="bg-bp-border my-0.5 h-[1px]" />
        <div className="flex justify-between text-[13px]">
          <span className="text-bp-ink font-bold">{developerName} receives</span>
          <span className="text-bp-success font-extrabold">{fmtMoney(takeHome)}</span>
        </div>
      </div>

      <button
        onClick={() => onSend(amount)}
        disabled={amount <= 0 || due <= 0}
        className="bp-primary-btn flex w-full items-center justify-center gap-2 rounded-xl p-3 text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Coins size={15} weight="fill" /> Send payment
      </button>
    </ModalShell>
  );
}
