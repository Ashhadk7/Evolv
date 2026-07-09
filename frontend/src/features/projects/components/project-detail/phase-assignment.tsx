"use client";

import { CheckCircle, User } from "@phosphor-icons/react";
import { Avatar } from "@/components/shared/avatar";
import { fmtDate, fmtMoney, type ProjectPhaseState } from "@/features/blueprints/blueprint-content";

export function PhaseAssignment({
  ps,
  onPay,
  onRemoveDev,
  onFindMatches,
}: {
  ps: ProjectPhaseState;
  onPay: () => void;
  onRemoveDev: () => void;
  onFindMatches: () => void;
}) {
  return (
    <>
      <div className="text-bp-forest mb-3 text-[11px] font-extrabold tracking-[0.08em] uppercase">
        Phase Assignment
      </div>
      {ps.assignment ? (
        <div className="border-bp-border-soft bg-bp-card flex flex-wrap items-center gap-3 rounded-xl border px-[18px] py-3.5">
          <Avatar initials={ps.assignment.developerInitials} size={36} />
          <div className="min-w-[150px] flex-1">
            <div className="text-bp-ink text-[13.5px] font-bold">
              {ps.assignment.developerName}
            </div>
            <div className="text-bp-muted mt-0.5 text-[11.5px]">
              Hired {fmtDate(ps.assignment.hiredAt)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="text-bp-ink text-[12.5px] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
              {fmtMoney(ps.assignment.amountPaid)} / {fmtMoney(ps.assignment.amountAgreed)}{" "}
              paid
            </div>
            <div className="text-bp-label text-[10.5px] font-semibold">
              {ps.assignment.amountPaid >= ps.assignment.amountAgreed
                ? "Paid in full"
                : ps.assignment.amountPaid > 0
                  ? "Partially paid"
                  : "Not paid yet"}
            </div>
          </div>
          <button onClick={onPay} className="bp-primary-btn">
            Pay
          </button>
          {ps.status !== "Complete" && (
            <button
              onClick={onRemoveDev}
              className="text-bp-red cursor-pointer border-none bg-transparent px-2 py-1.5 text-[11.5px] font-semibold"
            >
              Remove
            </button>
          )}
        </div>
      ) : ps.status === "Complete" ? (
        <div className="border-bp-border-soft flex items-center gap-3 rounded-xl border bg-[#f8faf8] px-[18px] py-3.5">
          <CheckCircle size={18} weight="fill" className="text-bp-mint shrink-0" />
          <div className="flex-1">
            <div className="text-bp-ink text-[13px] font-extrabold">
              Completed without a network developer
            </div>
            <div className="text-bp-muted mt-0.5 text-[11.5px] font-medium">
              Re-open this phase if you need to hire someone.
            </div>
          </div>
        </div>
      ) : (
        <div className="border-bp-forest bg-bp-card flex items-center gap-3 rounded-xl border-[1.5px] border-dashed px-[18px] py-3.5">
          <User size={18} weight="duotone" className="text-bp-teal shrink-0" />
          <div className="flex-1">
            <div className="text-bp-ink text-[13px] font-extrabold">
              No developer assigned
            </div>
            <div className="text-bp-muted mt-0.5 text-[11.5px] font-medium">
              Pick someone from the developers panel to staff this phase.
            </div>
          </div>
          <button onClick={onFindMatches} className="bp-primary-btn">
            Find matches
          </button>
        </div>
      )}
    </>
  );
}
