"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, EnvelopeSimple, HandCoins, X } from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { Label } from "@/components/shared/label";
import { fmtCents, type DeveloperInvite } from "@/features/projects/developer-projects-api";

function NegotiateRow({
  invite,
  busy,
  onSubmit,
  onCancel,
}: {
  invite: DeveloperInvite;
  busy: boolean;
  onSubmit: (amountCents: number) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(() => String(invite.amount_agreed_cents / 100));

  return (
    <div className="border-bp-border bg-bp-card mt-2.5 flex w-full items-center gap-2 rounded-lg border p-2">
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
        disabled={busy || !(Number(amount) > 0)}
        onClick={() => onSubmit(Math.round(Number(amount) * 100))}
        className="bp-primary-btn disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send counter
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onCancel}
        className="text-bp-muted cursor-pointer border-none bg-transparent px-2 py-1 text-[11.5px] font-semibold"
      >
        Cancel
      </button>
    </div>
  );
}

export function InviteTray({
  invites,
  onRespond,
  onNegotiate,
  busyId,
  highlightId,
}: {
  invites: DeveloperInvite[];
  onRespond: (invite: DeveloperInvite, accept: boolean) => void;
  onNegotiate: (invite: DeveloperInvite, amountCents: number) => void;
  busyId: string | null;
  /** Invite to scroll to and highlight, e.g. when arriving from a notification. */
  highlightId?: string | null;
}) {
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId]);

  if (invites.length === 0) return null;

  return (
    <div className="bg-bp-card border-bp-amber-line rounded-2xl border p-[18px_20px]">
      <div className="mb-3.5 flex items-center gap-2.5">
        <EnvelopeSimple size={17} weight="duotone" className="text-bp-amber" />
        <div>
          <Kicker>Awaiting your response</Kicker>
          <h2 className="text-bp-ink text-[15px] font-extrabold">
            {invites.length} pending {invites.length === 1 ? "invitation" : "invitations"}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {invites.map((invite) => (
            <motion.div
              key={invite.id}
              ref={invite.id === highlightId ? highlightedRef : undefined}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`bg-bp-amber-bg border-bp-amber-line flex flex-wrap items-center justify-between gap-3 rounded-xl border p-[12px_14px] ${
                invite.id === highlightId ? "ring-bp-forest ring-2 ring-offset-2" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="text-bp-ink text-[13.5px] font-bold">{invite.project_title}</div>
                <div className="text-bp-muted mt-0.5 text-[11.5px]">
                  Phase {invite.phase_index + 1} · invited by {invite.founder_name}
                </div>
              </div>

              {invite.status === "countered" ? (
                <div className="text-right">
                  <Label>Your counter</Label>
                  <div className="text-bp-ink text-[14px] font-extrabold tabular-nums">
                    {fmtCents(invite.counter_amount_cents ?? 0)}
                  </div>
                  <div className="text-bp-muted text-[11px]">
                    Waiting on {invite.founder_name}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Label>Offered</Label>
                    <div className="text-bp-ink text-[14px] font-extrabold tabular-nums">
                      {fmtCents(invite.amount_agreed_cents)}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === invite.id}
                    onClick={() => onRespond(invite, true)}
                    className="bp-primary-btn disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={14} weight="bold" /> Accept
                  </button>
                  <button
                    type="button"
                    disabled={busyId === invite.id}
                    onClick={() => setNegotiatingId(invite.id)}
                    className="border-bp-border text-bp-muted flex cursor-pointer items-center gap-1.5 rounded-[9px] border bg-transparent px-3.5 py-[7px] text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HandCoins size={13} weight="bold" /> Negotiate
                  </button>
                  <button
                    type="button"
                    disabled={busyId === invite.id}
                    onClick={() => onRespond(invite, false)}
                    className="border-bp-border text-bp-muted flex cursor-pointer items-center gap-1.5 rounded-[9px] border bg-transparent px-3.5 py-[7px] text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={13} weight="bold" /> Decline
                  </button>
                </div>
              )}

              {negotiatingId === invite.id && invite.status !== "countered" && (
                <NegotiateRow
                  invite={invite}
                  busy={busyId === invite.id}
                  onCancel={() => setNegotiatingId(null)}
                  onSubmit={(amountCents) => {
                    onNegotiate(invite, amountCents);
                    setNegotiatingId(null);
                  }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
