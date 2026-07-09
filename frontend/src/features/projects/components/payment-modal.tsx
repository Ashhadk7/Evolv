"use client";

import { useState } from "react";
import { Coins, CreditCard, Lock } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { fmtMoney } from "@/features/blueprints/blueprint-content";
import { ModalShell } from "./modal-shell";

export function PaymentModal({
  developerName,
  amountAgreed,
  amountPaid,
  feePct,
  stripeConnected,
  onNavigateSettingsPayment,
  onSend,
  onClose,
}: {
  developerName: string;
  amountAgreed: number;
  amountPaid: number;
  feePct: number;
  stripeConnected: boolean;
  onNavigateSettingsPayment?: () => void;
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
      subtitle="via Stripe Connect"
      onClose={onClose}
    >
      {!stripeConnected ? (
        <div className="bg-bp-amber-bg flex gap-2.5 items-start p-[14px_16px] border border-bp-amber-line rounded-xl">
          <Lock
            size={14}
            weight="duotone"
            className="text-bp-amber shrink-0 mt-0.25"
          />
          <div className="flex-1">
            <div className="text-[12.5px] text-[#7a5c10] leading-relaxed mb-2.5">
              Connect your Stripe account to pay developers — funds route through Evolv&apos;s
              platform account, the platform fee is deducted, and the rest releases to their
              connected account.
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateSettingsPayment?.();
              }}
              className="bp-gradient-btn text-[12px] font-bold p-[8px_15px] rounded-lg cursor-pointer"
            >
              Connect Stripe account
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="bg-bp-tint p-[10px_12px] rounded-lg border border-bp-border-soft">
              <div className="text-bp-label text-[9.5px] uppercase tracking-wider">
                Agreed
              </div>
              <div className="text-bp-ink text-[15px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                {fmtMoney(amountAgreed)}
              </div>
            </div>
            <div className="bg-bp-tint p-[10px_12px] rounded-lg border border-bp-border-soft">
              <div className="text-bp-label text-[9.5px] uppercase tracking-wider">
                Paid
              </div>
              <div className="text-bp-success text-[15px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                {fmtMoney(amountPaid)}
              </div>
            </div>
            <div className="bg-bp-tint p-[10px_12px] rounded-lg border border-bp-border-soft">
              <div className="text-bp-label text-[9.5px] uppercase tracking-wider">
                Due
              </div>
              <div className={`${due > 0 ? "text-bp-amber" : "text-bp-success"} text-[15px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]`}>
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
            <div className="flex items-center gap-2 mb-4">
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
          </div>

          <div className="bg-bp-tint flex flex-col gap-2 p-[14px_16px] border border-bp-border-soft rounded-xl mb-4.5">
            <div className="flex justify-between text-[12.5px]">
              <span className="text-bp-muted">Sent to Evolv platform account</span>
              <span className="text-bp-ink font-bold">
                {fmtMoney(amount)}
              </span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-bp-muted">
                Evolv platform fee ({Math.round(feePct * 100)}%)
              </span>
              <span className="text-bp-amber font-bold">
                −{fmtMoney(fee)}
              </span>
            </div>
            <div className="bg-bp-border h-[1px] my-0.5" />
            <div className="flex justify-between text-[13px]">
              <span className="text-bp-ink font-bold">
                {developerName} receives
              </span>
              <span className="text-bp-success font-extrabold">
                {fmtMoney(takeHome)}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSend(amount)}
            disabled={amount <= 0 || due <= 0}
            className="bp-primary-btn w-full flex items-center justify-center gap-2 text-[13.5px] font-bold p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Coins size={15} weight="fill" /> Send payment
          </button>
        </>
      )}
    </ModalShell>
  );
}
