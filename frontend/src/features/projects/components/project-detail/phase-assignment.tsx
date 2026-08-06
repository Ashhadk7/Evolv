"use client";

import { useState } from "react";
import { Check, CheckCircle, HandCoins, User, X } from "@phosphor-icons/react";
import { Avatar } from "@/components/shared/avatar";
import { fmtDate, fmtMoney } from "@/features/blueprints/blueprint-content";
import type { ProjectMemberWire } from "@/features/projects/projects-api";

function initialsOf(name: string): string {
  const [first = "", last = ""] = name.split(" ");
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "D";
}

function MemberDetailPopup({
  member,
  onClose,
}: {
  member: ProjectMemberWire;
  onClose: () => void;
}) {
  const agreed = member.amount_agreed_cents / 100;
  const paid = member.amount_paid_cents / 100;
  const outstanding = Math.max(0, agreed - paid);
  const pct = agreed > 0 ? Math.round((paid / agreed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#08160f]/60 p-4 backdrop-blur-[3px]">
      <div className="bg-bp-card border-bp-border w-full max-w-[320px] rounded-2xl border p-[22px_24px] shadow-[0_24px_60px_-20px_rgba(9,32,26,0.45)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar initials={initialsOf(member.developer_name)} size={34} />
            <div>
              <div className="text-bp-ink text-[14px] font-extrabold">{member.developer_name}</div>
              <div className="text-bp-muted text-[11px]">
                Joined {fmtDate(member.invited_at.slice(0, 10))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-bp-muted cursor-pointer border-none bg-transparent p-1"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-[12.5px]">
            <span className="text-bp-muted">Agreed</span>
            <span className="text-bp-ink font-extrabold tabular-nums">{fmtMoney(agreed)}</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-bp-muted">Paid</span>
            <span className="text-bp-success font-extrabold tabular-nums">{fmtMoney(paid)}</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-bp-muted">Outstanding</span>
            <span className="text-bp-ink font-extrabold tabular-nums">{fmtMoney(outstanding)}</span>
          </div>
          <div className="bg-bp-tint mt-1 h-[6px] overflow-hidden rounded-full">
            <div
              className="bg-bp-success h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-bp-muted text-right text-[11px] tabular-nums">{pct}% paid</div>
        </div>
      </div>
    </div>
  );
}

function CounterRespondRow({
  member,
  onRespond,
}: {
  member: ProjectMemberWire;
  onRespond: (action: "accept" | "reject" | "negotiate", amountCents?: number) => void;
}) {
  const [negotiating, setNegotiating] = useState(false);
  const [amount, setAmount] = useState(() =>
    String((member.counter_amount_cents ?? member.amount_agreed_cents) / 100)
  );

  if (negotiating) {
    return (
      <div className="border-bp-border bg-bp-card mt-2 flex w-full items-center gap-2 rounded-lg border p-2">
        <span className="text-bp-ink text-[13px] font-extrabold">$</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          className="text-bp-ink min-w-0 flex-1 border-none bg-transparent text-[13px] font-bold outline-none"
        />
        <button
          type="button"
          disabled={!(Number(amount) > 0)}
          onClick={() => onRespond("negotiate", Math.round(Number(amount) * 100))}
          className="bp-primary-btn disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send offer
        </button>
        <button
          type="button"
          onClick={() => setNegotiating(false)}
          className="text-bp-muted cursor-pointer border-none bg-transparent px-2 py-1 text-[11.5px] font-semibold"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onRespond("accept")}
        className="bp-primary-btn"
      >
        <Check size={14} weight="bold" /> Accept
      </button>
      <button
        type="button"
        onClick={() => setNegotiating(true)}
        className="border-bp-border text-bp-muted flex cursor-pointer items-center gap-1.5 rounded-[9px] border bg-transparent px-3.5 py-[7px] text-xs font-bold"
      >
        <HandCoins size={13} weight="bold" /> Counter
      </button>
      <button
        type="button"
        onClick={() => onRespond("reject")}
        className="text-bp-red cursor-pointer border-none bg-transparent px-2 py-1.5 text-[11.5px] font-semibold"
      >
        <X size={13} weight="bold" /> Reject
      </button>
    </div>
  );
}

export function PhaseAssignment({
  pendingInvites,
  acceptedMembers,
  counteredMembers,
  onPay,
  onRemoveDev,
  onFindMatches,
  onRevokeInvite,
  onRespondToCounter,
}: {
  pendingInvites: ProjectMemberWire[];
  acceptedMembers: ProjectMemberWire[];
  counteredMembers: ProjectMemberWire[];
  onPay: (member: ProjectMemberWire) => void;
  onRemoveDev: (memberId: string) => void;
  onFindMatches: () => void;
  onRevokeInvite: (memberId: string) => void;
  onRespondToCounter: (
    memberId: string,
    action: "accept" | "reject" | "negotiate",
    amountCents?: number
  ) => void;
}) {
  const [detailMember, setDetailMember] = useState<ProjectMemberWire | null>(null);
  const hasAnyone =
    pendingInvites.length > 0 || acceptedMembers.length > 0 || counteredMembers.length > 0;

  return (
    <>
      <div className="text-bp-forest mb-3 text-[11px] font-extrabold tracking-[0.08em] uppercase">
        Phase Assignment
      </div>

      {acceptedMembers.map((member) => (
        <div
          key={member.id}
          className="border-bp-border-soft bg-bp-card mb-2 flex flex-wrap items-center gap-3 rounded-xl border px-[18px] py-3.5"
        >
          <button
            type="button"
            onClick={() => setDetailMember(member)}
            className="cursor-pointer border-none bg-transparent p-0"
          >
            <Avatar initials={initialsOf(member.developer_name)} size={36} />
          </button>
          <div className="min-w-[150px] flex-1">
            <button
              type="button"
              onClick={() => setDetailMember(member)}
              className="text-bp-ink cursor-pointer border-none bg-transparent p-0 text-[13.5px] font-bold text-left"
            >
              {member.developer_name}
            </button>
            <div className="text-bp-muted mt-0.5 text-[11.5px]">
              {fmtMoney(member.amount_paid_cents / 100)} / {fmtMoney(member.amount_agreed_cents / 100)} paid
            </div>
          </div>
          <button onClick={() => onPay(member)} className="bp-primary-btn">Pay</button>
          <button
            onClick={() => onRemoveDev(member.id)}
            className="text-bp-red cursor-pointer border-none bg-transparent px-2 py-1.5 text-[11.5px] font-semibold"
          >
            Remove
          </button>
        </div>
      ))}

      {counteredMembers.map((member) => (
        <div
          key={member.id}
          className="border-bp-amber-line bg-bp-amber-bg mb-2 flex flex-wrap items-center gap-3 rounded-xl border px-[18px] py-3.5"
        >
          <Avatar initials={initialsOf(member.developer_name)} size={36} />
          <div className="min-w-[150px] flex-1">
            <div className="text-bp-ink text-[13.5px] font-bold">{member.developer_name}</div>
            <div className="text-bp-muted mt-0.5 text-[11.5px]">
              Countered with{" "}
              {fmtMoney((member.counter_amount_cents ?? member.amount_agreed_cents) / 100)} ·
              you offered {fmtMoney(member.amount_agreed_cents / 100)}
            </div>
          </div>
          <CounterRespondRow
            member={member}
            onRespond={(action, amountCents) => onRespondToCounter(member.id, action, amountCents)}
          />
        </div>
      ))}

      {pendingInvites.map((invite) => (
        <div
          key={invite.id}
          className="border-bp-amber-line bg-bp-amber-bg mb-2 flex flex-wrap items-center gap-3 rounded-xl border px-[18px] py-3.5"
        >
          <Avatar initials={initialsOf(invite.developer_name)} size={36} />
          <div className="min-w-[150px] flex-1">
            <div className="text-bp-ink text-[13.5px] font-bold">{invite.developer_name}</div>
            <div className="text-bp-muted mt-0.5 text-[11.5px]">
              Invited {fmtDate(invite.invited_at.slice(0, 10))} — awaiting response ·{" "}
              {fmtMoney(invite.amount_agreed_cents / 100)} offered
            </div>
          </div>
          <button
            onClick={() => onRevokeInvite(invite.id)}
            className="text-bp-red cursor-pointer border-none bg-transparent px-2 py-1.5 text-[11.5px] font-semibold"
          >
            Cancel invite
          </button>
        </div>
      ))}

      {!hasAnyone && (
        <div className="border-bp-forest bg-bp-card flex items-center gap-3 rounded-xl border-[1.5px] border-dashed px-[18px] py-3.5">
          <User size={18} weight="duotone" className="text-bp-teal shrink-0" />
          <div className="flex-1">
            <div className="text-bp-ink text-[13px] font-extrabold">No developer assigned</div>
            <div className="text-bp-muted mt-0.5 text-[11.5px] font-medium">
              Pick someone from the developers panel to staff this phase.
            </div>
          </div>
          <button onClick={onFindMatches} className="bp-primary-btn">Find matches</button>
        </div>
      )}

      {hasAnyone && (
        <button
          onClick={onFindMatches}
          className="text-bp-teal mt-2 cursor-pointer border-none bg-transparent p-0 text-[11px] font-bold"
        >
          + Add another developer
        </button>
      )}

      {detailMember && (
        <MemberDetailPopup member={detailMember} onClose={() => setDetailMember(null)} />
      )}
    </>
  );
}
