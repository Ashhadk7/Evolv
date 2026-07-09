import { CreditCard, Warning } from "@phosphor-icons/react";
import { SectionHead } from "@/components/shared/section-head";
import { fmtMoney, fmtDate } from "@/features/blueprints/blueprint-content";
import type { PhaseAssignment } from "@/features/blueprints/blueprint-content";

export function PaymentStatusPanel({ assignment }: { assignment: PhaseAssignment | null }) {
  return (
    <div className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-6">
      <SectionHead
        icon={<CreditCard size={20} weight="duotone" className="text-bp-amber" />}
        title="Payment Status"
      />
      {assignment && (
        <div className="mt-5">
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-bp-label text-[11px] uppercase tracking-wide mb-1">
                Agreed Amount
              </div>
              <div className="text-bp-ink text-[20px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                {fmtMoney(assignment.amountAgreed)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-bp-label text-[11px] uppercase tracking-wide mb-1">
                Paid to Date
              </div>
              <div className="text-bp-success text-[20px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                {fmtMoney(assignment.amountPaid)}
              </div>
            </div>
          </div>

          {assignment.payments.length > 0 && (
            <div className="mt-6">
              <div className="text-bp-ink text-[11px] font-bold mb-3">
                Payment History
              </div>
              <div className="flex flex-col gap-2">
                {assignment.payments.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-bp-tint flex justify-between text-[12px] p-[8px_12px] rounded-lg"
                  >
                    <span className="text-bp-muted">{fmtDate(p.date)}</span>
                    <span className="text-bp-success font-bold">
                      +{fmtMoney(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-bp-amber-bg mt-6 p-3 border border-bp-amber-line rounded-lg flex gap-2.5">
            <Warning size={16} weight="duotone" className="text-bp-amber shrink-0" />
            <div className="text-[11.5px] text-[#7a5c10] leading-relaxed">
              Payments are released by the founder. Complete deliverables to trigger milestones.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
