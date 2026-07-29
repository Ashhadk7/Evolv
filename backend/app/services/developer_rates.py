from __future__ import annotations

import re
from dataclasses import dataclass
from statistics import median

WEEKS_PER_MONTH = 4.33
WEEKS_PER_YEAR = 52.0
HOURS_PER_WEEK = 40.0

PERIOD_TO_WEEKLY = {
    "hour": HOURS_PER_WEEK,
    "day": 5.0,
    "week": 1.0,
    "month": 1 / WEEKS_PER_MONTH,
    "year": 1 / WEEKS_PER_YEAR,
}

_CURRENCY_TO_USD = {
    "USD": 1.0,
    "PKR": 1 / 280.0,
    "INR": 1 / 83.0,
    "GBP": 1.27,
    "EUR": 1.08,
    "AED": 1 / 3.67,
}

_SYMBOL_CURRENCY = {"$": "USD", "£": "GBP", "€": "EUR", "₨": "PKR", "₹": "INR"}

_AMOUNT = re.compile(
    r"(?P<symbol>[$£€₨₹])?\s*(?P<code>USD|PKR|INR|GBP|EUR|AED)?\s*"
    r"(?P<value>\d[\d,]*(?:\.\d+)?)\s*(?P<scale>[kKmM])?",
)
_PERIOD = re.compile(r"\b(hour|hourly|hr|day|daily|week|weekly|wk|month|monthly|mo|year|yearly|annum)\b", re.I)

_PERIOD_ALIASES = {
    "hourly": "hour", "hr": "hour",
    "daily": "day",
    "weekly": "week", "wk": "week",
    "monthly": "month", "mo": "month",
    "yearly": "year", "annum": "year",
}


@dataclass(frozen=True)
class DeveloperRate:
    amount: int
    period: str
    currency: str

    def weekly_usd(self) -> float:
        return self.amount * PERIOD_TO_WEEKLY[self.period] * _CURRENCY_TO_USD[self.currency]


def parse_rate(text: str | None) -> DeveloperRate | None:
    """Best-effort read of a free-text rate such as "PKR 80,000/month" or "$5k".

    Returns None for anything without a number ("negotiable", "depends"), which
    keeps unusable entries out of the median rather than guessing a value for
    them. Defaults to a monthly USD figure, the most common way a rate is
    written when the period is left off.
    """
    if not text:
        return None
    match = _AMOUNT.search(text)
    if match is None:
        return None

    value = float(match.group("value").replace(",", ""))
    scale = (match.group("scale") or "").lower()
    if scale == "k":
        value *= 1_000
    elif scale == "m":
        value *= 1_000_000
    if value <= 0:
        return None

    currency = match.group("code") or _SYMBOL_CURRENCY.get(match.group("symbol") or "", "USD")

    period_match = _PERIOD.search(text)
    period = "month"
    if period_match:
        found = period_match.group(1).lower()
        period = _PERIOD_ALIASES.get(found, found)

    return DeveloperRate(amount=round(value), period=period, currency=currency.upper())


def median_weekly_usd(rates: list[DeveloperRate]) -> int | None:
    """Median weekly USD across developer rates, or None when there is no data.

    Median rather than mean: a single enterprise contractor should not drag the
    quote for everyone else.
    """
    weekly = [rate.weekly_usd() for rate in rates if rate.amount > 0]
    return round(median(weekly)) if weekly else None
