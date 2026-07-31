"""add structured developer rate columns

Revision ID: 20260729_0003
Revises: 20260729_0002
Create Date: 2026-07-29

preferred_budget is free text, so nothing could compute with it. These columns
carry the same information in a usable shape and are back-filled from whatever
the existing text can be parsed into. The original string is kept: it is what
the developer typed, it still renders on the profile, and an unparseable entry
("negotiable") must not become a fabricated number.
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260729_0003"
down_revision = "20260729_0002"
branch_labels = None
depends_on = None

RATE_PERIODS = ("hour", "day", "week", "month", "year")


def upgrade() -> None:
    op.add_column("developer_profiles", sa.Column("rate_amount", sa.Integer(), nullable=True))
    op.add_column("developer_profiles", sa.Column("rate_period", sa.String(length=10), nullable=True))
    op.add_column("developer_profiles", sa.Column("rate_currency", sa.String(length=3), nullable=True))
    op.create_check_constraint(
        "ck_developer_profiles_rate_amount_positive",
        "developer_profiles",
        "rate_amount IS NULL OR rate_amount > 0",
    )
    op.create_check_constraint(
        "ck_developer_profiles_rate_period_known",
        "developer_profiles",
        sa.text("rate_period IS NULL OR rate_period IN {}".format(RATE_PERIODS)),
    )
    _backfill()


def _backfill() -> None:
    from app.services.developer_rates import parse_rate

    connection = op.get_bind()
    rows = connection.execute(
        sa.text(
            "SELECT user_id, preferred_budget FROM developer_profiles "
            "WHERE preferred_budget IS NOT NULL AND preferred_budget <> ''"
        )
    ).fetchall()

    for user_id, preferred_budget in rows:
        rate = parse_rate(preferred_budget)
        if rate is None:
            continue
        connection.execute(
            sa.text(
                "UPDATE developer_profiles SET rate_amount = :amount, "
                "rate_period = :period, rate_currency = :currency WHERE user_id = :user_id"
            ),
            {
                "amount": rate.amount,
                "period": rate.period,
                "currency": rate.currency,
                "user_id": user_id,
            },
        )


def downgrade() -> None:
    op.drop_constraint("ck_developer_profiles_rate_period_known", "developer_profiles")
    op.drop_constraint("ck_developer_profiles_rate_amount_positive", "developer_profiles")
    op.drop_column("developer_profiles", "rate_currency")
    op.drop_column("developer_profiles", "rate_period")
    op.drop_column("developer_profiles", "rate_amount")
