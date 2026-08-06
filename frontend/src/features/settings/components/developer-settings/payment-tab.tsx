"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createStripeConnectAccountLink,
  fetchStripeConnectStatus,
  type StripeConnectStatus,
} from "@/features/payments/stripe-connect-api";
import type { DeveloperSettingsProfile } from "@/features/settings/data/developer-settings-data";
import { getApiErrorMessage } from "@/lib/api";
import styles from "./developer-settings.module.css";

function statusFromProfile(profile: DeveloperSettingsProfile): StripeConnectStatus {
  return {
    account_id: profile.stripeAccountId || null,
    onboarding_complete: Boolean(profile.stripeOnboardingComplete),
    charges_enabled: Boolean(profile.stripeChargesEnabled),
    payouts_enabled: Boolean(profile.stripePayoutsEnabled),
    currently_due: [],
    disabled_reason: null,
  };
}

export function PaymentTab({
  profile,
}: {
  profile: DeveloperSettingsProfile;
}) {
  const profileStatus = statusFromProfile(profile);
  const [remoteStatus, setRemoteStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const status = remoteStatus ?? profileStatus;

  useEffect(() => {
    let active = true;
    fetchStripeConnectStatus()
      .then((nextStatus) => {
        if (active) setRemoteStatus(nextStatus);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const statusCopy = useMemo(() => {
    if (status.payouts_enabled) {
      return {
        label: "Connected",
        detail: "Stripe payouts are ready.",
        color: "#1d6e47",
        background: "rgba(91,200,160,0.14)",
      };
    }
    if (status.account_id) {
      return {
        label: "Setup needed",
        detail: "Finish Stripe onboarding to receive payouts.",
        color: "#8a6a18",
        background: "rgba(242,180,75,0.16)",
      };
    }
    return {
      label: "Not connected",
      detail: "Connect Stripe to receive project payouts.",
      color: "#7a7a7a",
      background: "rgba(0,0,0,0.04)",
    };
  }, [status]);

  const handleConnect = async () => {
    if (typeof window === "undefined" || connecting) return;
    setConnecting(true);
    try {
      const settingsUrl = `${window.location.origin}/developer/settings`;
      const accountLink = await createStripeConnectAccountLink({
        refreshUrl: settingsUrl,
        returnUrl: settingsUrl,
      });
      setRemoteStatus(accountLink);
      window.location.assign(accountLink.url);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setConnecting(false);
    }
  };

  const buttonLabel = status.account_id
    ? status.payouts_enabled
      ? "Update Stripe account"
      : "Continue Stripe setup"
    : "Connect Stripe";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>
          <i className="fas fa-credit-card" /> Payment &amp; Billing
        </span>
      </div>

      <div className={styles.sectionDivider}>Stripe Connect</div>
      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <div
            style={{
              alignItems: "center",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
              display: "flex",
              gap: "1rem",
              justifyContent: "space-between",
              padding: "1rem 1.2rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span
                  style={{
                    background: statusCopy.background,
                    borderRadius: 999,
                    color: statusCopy.color,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "0.25rem 0.65rem",
                  }}
                >
                  {loading ? "Checking..." : statusCopy.label}
                </span>
                <span style={{ color: "#1f2f29", fontSize: "0.92rem", fontWeight: 800 }}>
                  Stripe payouts
                </span>
              </div>
              <p className={styles.emptyState} style={{ margin: "0.6rem 0 0", padding: 0 }}>
                {statusCopy.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={connecting}
              className="bp-gradient-btn"
              style={{
                borderRadius: 8,
                fontSize: "0.85rem",
                fontWeight: 800,
                minHeight: 42,
                padding: "0.55rem 1.15rem",
                whiteSpace: "nowrap",
              }}
            >
              {connecting ? "Opening Stripe..." : buttonLabel}
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Account</label>
          <input value={status.account_id ?? "Not connected"} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label>Currency</label>
          <input value="USD" readOnly />
        </div>
      </div>

      <div className={styles.sectionDivider}>Payout Summary</div>
      <p className={styles.emptyState} style={{ margin: 0, padding: "0 1.2rem 1.5rem" }}>
        Payout history will appear once project payments are connected.
      </p>
    </div>
  );
}
