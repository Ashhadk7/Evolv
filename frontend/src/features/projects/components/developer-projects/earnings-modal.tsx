"use client";

import { Coins } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { ScrollArea } from "@/components/shared/scroll-area";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import {
  fmtCents,
  type DeveloperEarnings,
  type DeveloperPayment,
} from "@/features/projects/developer-projects-api";
import { ModalShell } from "../modal-shell";

const STATUS_TONE: Record<DeveloperPayment["status"], "mint" | "amber" | "red" | "neutral"> = {
  succeeded: "mint",
  processing: "amber",
  pending: "amber",
  failed: "red",
  cancelled: "neutral",
};

function paymentLabel(payment: DeveloperPayment): string {
  if (payment.status !== "succeeded") return payment.status;
  return payment.provider === "manual" ? "Recorded by founder" : "Paid";
}

export function EarningsModal({
  earnings,
  phaseNameFor,
  onClose,
}: {
  earnings: DeveloperEarnings;
  phaseNameFor: (index: number) => string | undefined;
  onClose: () => void;
}) {
  const phaseLabel = (index: number) => phaseNameFor(index) ?? `Phase ${index + 1}`;

  return (
    <ModalShell
      icon={<Coins size={16} weight="duotone" className="text-bp-success" />}
      title="Your earnings"
      subtitle={`${earnings.engagements.length} phase${earnings.engagements.length === 1 ? "" : "s"} on this project`}
      onClose={onClose}
    >
      <div className="border-bp-border-soft bg-bp-tint mb-4 grid grid-cols-3 gap-3 rounded-xl border p-[14px_16px]">
        <div>
          <Label>Received</Label>
          <div className="text-bp-success text-[16px] font-extrabold tabular-nums">
            {fmtCents(earnings.paid_cents, earnings.currency)}
          </div>
        </div>
        <div>
          <Label>Outstanding</Label>
          <div className="text-bp-ink text-[16px] font-extrabold tabular-nums">
            {fmtCents(earnings.outstanding_cents, earnings.currency)}
          </div>
        </div>
        <div>
          <Label>Agreed</Label>
          <div className="text-bp-body text-[16px] font-extrabold tabular-nums">
            {fmtCents(earnings.agreed_cents, earnings.currency)}
          </div>
        </div>
      </div>

      {earnings.engagements.length > 1 && (
        <div className="mb-4">
          <Label>By phase</Label>
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0">
            {earnings.engagements.map((engagement) => (
              <li
                key={engagement.phase_index}
                className="border-bp-border-soft flex items-center justify-between gap-2 rounded-lg border p-[8px_11px]"
              >
                <span className="text-bp-ink text-[12px] font-bold">
                  {phaseLabel(engagement.phase_index)}
                </span>
                <span className="text-bp-muted text-[11.5px] tabular-nums">
                  <span className="text-bp-success font-bold">
                    {fmtCents(engagement.paid_cents, earnings.currency)}
                  </span>
                  {" of "}
                  {fmtCents(engagement.agreed_cents, earnings.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Label>Payment history</Label>
      {earnings.payments.length === 0 ? (
        <p className="text-bp-muted m-0 mt-1 text-[12px] leading-relaxed">
          No payments recorded yet. Amounts appear here as your founder releases them.
        </p>
      ) : (
        <ScrollArea size="sm">
          <ul className="m-0 mt-1 flex list-none flex-col gap-2 p-0">
            {earnings.payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-bp-ink text-[12.5px] font-bold tabular-nums">
                    {fmtCents(payment.amount_cents, payment.currency)}
                  </div>
                  <div className="text-bp-muted text-[11px]">
                    {fmtDate((payment.settled_at ?? payment.created_at).slice(0, 10))}
                    {earnings.engagements.length > 1 && ` · ${phaseLabel(payment.phase_index)}`}
                  </div>
                </div>
                <Chip tone={STATUS_TONE[payment.status]}>{paymentLabel(payment)}</Chip>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </ModalShell>
  );
}
