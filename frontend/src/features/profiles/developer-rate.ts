export const RATE_PERIODS = ["hour", "day", "week", "month", "year"] as const;
export const RATE_CURRENCIES = ["USD", "PKR", "INR", "GBP", "EUR", "AED"] as const;

export type RatePeriod = (typeof RATE_PERIODS)[number];
export type RateCurrency = (typeof RATE_CURRENCIES)[number];

export const DEFAULT_RATE_PERIOD: RatePeriod = "month";
export const DEFAULT_RATE_CURRENCY: RateCurrency = "USD";

export interface DeveloperRate {
  amount: number;
  period: RatePeriod;
  currency: RateCurrency;
}

export function parseRateForm(
  amount: string | undefined,
  period: string | undefined,
  currency: string | undefined
): DeveloperRate | null {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    amount: Math.round(value),
    period: (RATE_PERIODS as readonly string[]).includes(period ?? "")
      ? (period as RatePeriod)
      : DEFAULT_RATE_PERIOD,
    currency: (RATE_CURRENCIES as readonly string[]).includes(currency ?? "")
      ? (currency as RateCurrency)
      : DEFAULT_RATE_CURRENCY,
  };
}

export function formatRate(rate: DeveloperRate | null): string {
  if (!rate) return "";
  return `${rate.currency} ${rate.amount.toLocaleString("en-US")}/${rate.period}`;
}
