"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle, LinkSimple, CreditCard, CurrencyDollar } from "@phosphor-icons/react";
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
  currency: string;
  budgetRange: string;
  companyName: string;
  paymentMethod: string;
};

const DEFAULT_BILLING: BillingState = {
  plan: "Founder Launch",
  billingEmail: "",
  currency: "USD",
  budgetRange: "$50K - $100K",
  companyName: "",
  paymentMethod: "card",
};

function billingFromProfile(profile: FounderProfile): BillingState {
  return {
    plan: profile.billingPlan || DEFAULT_BILLING.plan,
    billingEmail: profile.billingEmail || profile.email || DEFAULT_BILLING.billingEmail,
    currency: profile.billingCurrency || DEFAULT_BILLING.currency,
    budgetRange: profile.billingBudgetRange || DEFAULT_BILLING.budgetRange,
    companyName: profile.billingCompanyName || DEFAULT_BILLING.companyName,
    paymentMethod: profile.paymentMethod || DEFAULT_BILLING.paymentMethod,
  };
}

function profileWithBilling(profile: FounderProfile, billing: BillingState): FounderProfile {
  return {
    ...profile,
    billingPlan: billing.plan,
    billingEmail: billing.billingEmail,
    billingCurrency: billing.currency,
    billingBudgetRange: billing.budgetRange,
    billingCompanyName: billing.companyName,
    paymentMethod: billing.paymentMethod,
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

  const updateStripeConnected = async (stripeConnected: boolean) => {
    try {
      await onSave({ ...profileWithBilling(profile, billing), stripeConnected });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const connectStripe = () => void updateStripeConnected(true);
  const disconnectStripe = () => void updateStripeConnected(false);

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LinkSimple size={16} weight="bold" style={{ color: MID }} />
            <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
              Stripe Connect
            </h4>
          </div>
          {profile.stripeConnected && (
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ background: "#e8f5ef", color: "#1d6e47" }}
            >
              <CheckCircle size={12} weight="fill" /> Connected
            </span>
          )}
        </div>
        <p className="mb-4 text-[12.5px] leading-relaxed" style={{ color: TEXT_MUTED }}>
          Connect a Stripe account so you can pay developers per milestone. Funds route through
          Evolv&apos;s platform account, the platform fee is deducted, and the rest is released to
          the developer.
        </p>
        {profile.stripeConnected ? (
          <button
            type="button"
            onClick={disconnectStripe}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-bold"
            style={{ borderColor: BORDER, color: TEXT_MUTED, background: "#fff" }}
          >
            Disconnect Stripe account
          </button>
        ) : (
          <button
            type="button"
            onClick={connectStripe}
            className="bp-gradient-btn flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-extrabold"
          >
            <LinkSimple size={15} weight="bold" /> Connect Stripe account
          </button>
        )}
      </section>

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
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              Preferred currency
            </span>
            <select
              value={billing.currency}
              onChange={(event) =>
                setBilling((current) => ({ ...current, currency: event.target.value }))
              }
              className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>PKR</option>
            </select>
          </label>
        </div>
      </section>

      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center gap-2">
          <CurrencyDollar size={16} weight="bold" style={{ color: MID }} />
          <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
            Founder Funding Preferences
          </h4>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              Expected build budget
            </span>
            <select
              value={billing.budgetRange}
              onChange={(event) =>
                setBilling((current) => ({ ...current, budgetRange: event.target.value }))
              }
              className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Under $25K</option>
              <option>$25K - $50K</option>
              <option>$50K - $100K</option>
              <option>$100K - $250K</option>
              <option>$250K+</option>
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              Payment method
            </span>
            <div className="flex flex-wrap gap-2">
              {["card", "bank", "stripe"].map((method) => {
                const active = billing.paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setBilling((current) => ({ ...current, paymentMethod: method }))}
                    className="w-15 rounded-lg border px-3.5 py-2 text-[12px] font-bold capitalize transition"
                    style={{
                      borderColor: active ? MID : BORDER,
                      background: active ? "#e8f5ef" : "#fff",
                      color: active ? MID : TEXT_MUTED,
                    }}
                  >
                    {method === "card" ? "Card" : method}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
