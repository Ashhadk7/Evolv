"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, EnvelopeSimple, X } from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { Label } from "@/components/shared/label";
import { fmtCents, type DeveloperInvite } from "@/features/projects/developer-projects-api";

export function InviteTray({
  invites,
  onRespond,
  busyId,
}: {
  invites: DeveloperInvite[];
  onRespond: (invite: DeveloperInvite, accept: boolean) => void;
  busyId: string | null;
}) {
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
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-bp-amber-bg border-bp-amber-line flex flex-wrap items-center justify-between gap-3 rounded-xl border p-[12px_14px]"
            >
              <div className="min-w-0">
                <div className="text-bp-ink text-[13.5px] font-bold">{invite.project_title}</div>
                <div className="text-bp-muted mt-0.5 text-[11.5px]">
                  Phase {invite.phase_index + 1} · invited by {invite.founder_name}
                </div>
              </div>

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
                  onClick={() => onRespond(invite, false)}
                  className="border-bp-border text-bp-muted flex cursor-pointer items-center gap-1.5 rounded-[9px] border bg-transparent px-3.5 py-[7px] text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={13} weight="bold" /> Decline
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

