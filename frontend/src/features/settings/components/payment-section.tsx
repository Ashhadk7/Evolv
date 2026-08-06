"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import { getApiErrorMessage } from "@/lib/api";
import {
  MID,
  TEXT_BODY,
  TEXT_MUTED,
  BORDER,
  FIELD_BG,
} from "@/features/settings/lib/settings-theme";
import { Field } from "./field";

type BillingState = {
  plan: string;
  billingEmail: string;
  companyName: string;
};

const DEFAULT_BILLING: BillingState = {
  plan: "Founder Launch",
  billingEmail: "",
  companyName: "",
};

function billingFromProfile(profile: FounderProfile): BillingState {
  return {
    plan: profile.billingPlan || DEFAULT_BILLING.plan,
    billingEmail: profile.billingEmail || profile.email || DEFAULT_BILLING.billingEmail,
    companyName: profile.billingCompanyName || DEFAULT_BILLING.companyName,
  };
}

function profileWithBilling(profile: FounderProfile, billing: BillingState): FounderProfile {
  return {
    ...profile,
    stripeConnected: false,
    billingPlan: billing.plan,
    billingEmail: billing.billingEmail,
    billingCurrency: "USD",
    billingBudgetRange: "",
    billingCompanyName: billing.companyName,
    paymentMethod: "card",
  };
}

export function PaymentSection({
  profile,
  onSave,
}: {
  profile: FounderProfile;
  onSave: (p: FounderProfile) => Promise<void>;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [billing, setBilling] = useState<BillingState>(() => billingFromProfile(profile));

  useEffect(() => {
    let active = true;
    const nextBilling = billingFromProfile(profile);
    queueMicrotask(() => {
      if (active) setBilling(nextBilling);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(profileWithBilling(profile, billing));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center gap-2">
          <CreditCard size={16} weight="bold" style={{ color: MID }} />
          <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
            Payment & Billing
          </h4>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Company / Startup Name"
            value={billing.companyName}
            onChange={(value) => setBilling((current) => ({ ...current, companyName: value }))}
            placeholder="Your startup"
          />
          <Field
            label="Billing Email"
            type="email"
            value={billing.billingEmail}
            onChange={(value) => setBilling((current) => ({ ...current, billingEmail: value }))}
            placeholder="billing@example.com"
          />
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              Workspace plan
            </span>
            <select
              value={billing.plan}
              onChange={(event) =>
                setBilling((current) => ({ ...current, plan: event.target.value }))
              }
              className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Founder Launch</option>
              <option>Founder Growth</option>
              <option>Investor Ready</option>
              <option>Enterprise Founder Team</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-[12.5px] leading-relaxed" style={{ color: TEXT_MUTED }}>
          Payments are handled in USD. Project payment checkout will collect founder card payments
          through Evolv when milestone payments are connected.
        </p>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="bp-gradient-btn mt-5 flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-extrabold"
          style={{ margin: 15 }}
        >
          <Check size={15} weight="bold" />
          {saving ? "Saving..." : saved ? "Saved" : "Save Payment Info"}
        </button>
      </section>
    </div>
  );
}
