import { apiFetch } from "@/lib/api";

export type StripeConnectStatus = {
  account_id: string | null;
  onboarding_complete: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  currently_due: string[];
  disabled_reason: string | null;
};

export type StripeConnectAccountLink = StripeConnectStatus & {
  url: string;
};

export function fetchStripeConnectStatus() {
  return apiFetch<StripeConnectStatus>("/payments/stripe/connect/status", { auth: true });
}

export function createStripeConnectAccountLink({
  refreshUrl,
  returnUrl,
}: {
  refreshUrl: string;
  returnUrl: string;
}) {
  return apiFetch<StripeConnectAccountLink>("/payments/stripe/connect/account-link", {
    method: "POST",
    auth: true,
    body: {
      refresh_url: refreshUrl,
      return_url: returnUrl,
    },
  });
}
