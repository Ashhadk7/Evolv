"""Create project workspace tables and backfill them from the milestones blob.

Revision ID: 20260805_0001
Revises: 20260802_0001
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import date
from typing import Any
from uuid import UUID, uuid4

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260805_0001"
down_revision: str | Sequence[str] | None = "20260802_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

MEMBER_STATUSES = ("invited", "accepted", "declined", "revoked", "removed")
ISSUE_PRIORITIES = ("high", "medium", "low")
ISSUE_STATUSES = ("open", "in_progress", "in_review", "resolved")
DEADLINE_STATUSES = ("pending", "met", "missed")
PAYMENT_STATUSES = ("pending", "processing", "succeeded", "failed", "cancelled")
PAYMENT_PROVIDERS = ("manual", "stripe")

ENUMS = {
    "project_member_status": MEMBER_STATUSES,
    "project_issue_priority": ISSUE_PRIORITIES,
    "project_issue_status": ISSUE_STATUSES,
    "project_deadline_status": DEADLINE_STATUSES,
    "project_payment_status": PAYMENT_STATUSES,
    "project_payment_provider": PAYMENT_PROVIDERS,
}

TABLES = (
    "project_payments",
    "project_deadlines",
    "project_issues",
    "project_deliverables",
    "project_members",
)

ABANDONED_TABLES = (
    "reviews",
    "phase_payments",
    "phase_assignments",
    "phase_deliverables",
    "project_expenses",
    "project_issues",
    "project_deadlines",
    "project_phases",
    "activity_log",
)


def _enum(name: str) -> postgresql.ENUM:
    return postgresql.ENUM(*ENUMS[name], name=name, create_type=False)


def _timestamp(name: str, *, nullable: bool = True) -> sa.Column:
    return sa.Column(
        name,
        sa.DateTime(timezone=True),
        server_default=sa.text("now()") if not nullable else None,
        nullable=nullable,
    )


def _drop_abandoned(bind: sa.engine.Connection) -> None:
    inspector = sa.inspect(bind)
    existing = set(inspector.get_table_names())
    for table in ABANDONED_TABLES:
        if table not in existing:
            continue
        rows = bind.execute(sa.text(f'SELECT count(*) FROM "{table}"')).scalar() or 0
        if rows:
            raise RuntimeError(
                f'Refusing to drop "{table}": it holds {rows} rows. '
                "This migration only removes the empty, unmapped tables left behind by an "
                "earlier schema draft. Inspect the data and drop it manually before retrying."
            )
        op.drop_table(table)


def upgrade() -> None:
    bind = op.get_bind()
    _drop_abandoned(bind)

    for name in ENUMS:
        _enum(name).create(bind, checkfirst=True)

    op.create_table(
        "project_members",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("project_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("developer_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("phase_index", sa.Integer(), nullable=False),
        sa.Column(
            "status", _enum("project_member_status"), nullable=False, server_default="invited"
        ),
        sa.Column("amount_agreed_cents", sa.Integer(), nullable=False, server_default="0"),
        _timestamp("invited_at", nullable=False),
        _timestamp("responded_at"),
        _timestamp("removed_at"),
        sa.Column("removal_reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["developer_id"], ["developer_profiles.user_id"], ondelete="CASCADE"
        ),
    )
    op.create_index(
        "ix_project_members_project_id_phase_index",
        "project_members",
        ["project_id", "phase_index"],
    )
    op.create_index(
        "ix_project_members_developer_id_status",
        "project_members",
        ["developer_id", "status"],
    )
    op.create_index(
        "uq_project_members_active_engagement",
        "project_members",
        ["project_id", "phase_index", "developer_id"],
        unique=True,
        postgresql_where=sa.text("status IN ('invited', 'accepted')"),
    )

    op.create_table(
        "project_deliverables",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("project_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("phase_index", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("done", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("completed_by", sa.Uuid(as_uuid=True), nullable=True),
        _timestamp("completed_at"),
        _timestamp("created_at", nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["completed_by"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index(
        "ix_project_deliverables_project_id_phase_index",
        "project_deliverables",
        ["project_id", "phase_index"],
    )

    op.create_table(
        "project_issues",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("project_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("phase_index", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "priority", _enum("project_issue_priority"), nullable=False, server_default="medium"
        ),
        sa.Column("status", _enum("project_issue_status"), nullable=False, server_default="open"),
        sa.Column("reporter_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("assignee_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        _timestamp("created_at", nullable=False),
        _timestamp("updated_at", nullable=False),
        _timestamp("resolved_at"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reporter_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["assignee_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index(
        "ix_project_issues_project_id_status", "project_issues", ["project_id", "status"]
    )
    op.create_index("ix_project_issues_assignee_id", "project_issues", ["assignee_id"])

    op.create_table(
        "project_deadlines",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("project_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("phase_index", sa.Integer(), nullable=True),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column(
            "priority", _enum("project_issue_priority"), nullable=False, server_default="medium"
        ),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column(
            "status", _enum("project_deadline_status"), nullable=False, server_default="pending"
        ),
        sa.Column("created_by", sa.Uuid(as_uuid=True), nullable=True),
        _timestamp("created_at", nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index(
        "ix_project_deadlines_project_id_due_date",
        "project_deadlines",
        ["project_id", "due_date"],
    )

    op.create_table(
        "project_payments",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("project_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("member_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("amount_cents", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column(
            "status", _enum("project_payment_status"), nullable=False, server_default="pending"
        ),
        sa.Column(
            "provider", _enum("project_payment_provider"), nullable=False, server_default="manual"
        ),
        sa.Column("provider_ref", sa.String(length=255), nullable=True),
        sa.Column("idempotency_key", sa.String(length=255), nullable=True),
        sa.Column("initiated_by", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        _timestamp("created_at", nullable=False),
        _timestamp("settled_at"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["member_id"], ["project_members.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("idempotency_key", name="uq_project_payments_idempotency_key"),
    )
    op.create_index(
        "ix_project_payments_member_id_created_at",
        "project_payments",
        ["member_id", "created_at"],
    )

    _backfill(bind)


def downgrade() -> None:
    for table in TABLES:
        op.drop_table(table)

    bind = op.get_bind()
    for name in ENUMS:
        postgresql.ENUM(name=name).drop(bind, checkfirst=True)


# ── backfill ──────────────────────────────────────────────────────────────────


def _project_state(milestones: Any) -> dict[str, Any] | None:
    if not isinstance(milestones, list):
        return None
    for entry in milestones:
        if isinstance(entry, dict) and entry.get("key") == "projectState":
            value = entry.get("value")
            if isinstance(value, dict) and isinstance(value.get("phaseStates"), list):
                return value
    return None


def _cents(value: Any) -> int:
    try:
        return max(0, round(float(value) * 100))
    except (TypeError, ValueError):
        return 0


def _iso_date(value: Any) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def _uuid_key(value: Any) -> str | None:
    try:
        return str(UUID(str(value)))
    except (TypeError, ValueError, AttributeError):
        return None


def _lower(value: Any, allowed: tuple[str, ...], fallback: str) -> str:
    normalized = str(value).strip().lower().replace(" ", "_")
    return normalized if normalized in allowed else fallback


def _deliverables(phase_state: dict[str, Any]) -> list[dict[str, Any]]:
    entries = phase_state.get("deliverables")
    if isinstance(entries, list):
        return [
            {"text": str(entry.get("text", "")).strip(), "done": bool(entry.get("done"))}
            for entry in entries
            if isinstance(entry, dict) and str(entry.get("text", "")).strip()
        ]
    legacy = phase_state.get("deliverablesDone")
    if isinstance(legacy, list):
        return [
            {"text": f"Deliverable {index + 1}", "done": bool(done)}
            for index, done in enumerate(legacy)
        ]
    return []


def _amount_paid(assignment: dict[str, Any]) -> int:
    if assignment.get("amountPaid") is not None:
        return _cents(assignment["amountPaid"])
    if assignment.get("paymentStatus") == "Released":
        return _cents(assignment.get("amountAgreed"))
    return 0


def _payments(assignment: dict[str, Any]) -> list[dict[str, Any]]:
    entries = assignment.get("payments")
    if isinstance(entries, list) and entries:
        return [
            {"amount_cents": _cents(entry.get("amount")), "date": _iso_date(entry.get("date"))}
            for entry in entries
            if isinstance(entry, dict) and _cents(entry.get("amount")) > 0
        ]
    paid = _amount_paid(assignment)
    if paid > 0:
        return [{"amount_cents": paid, "date": _iso_date(assignment.get("hiredAt"))}]
    return []


def _backfill(bind: sa.engine.Connection) -> None:
    if bind.execute(sa.text("SELECT 1 FROM project_members LIMIT 1")).first() is not None:
        return

    known_developers = {
        _uuid_key(row[0])
        for row in bind.execute(sa.text("SELECT user_id FROM developer_profiles")).fetchall()
    }
    projects = bind.execute(sa.text("SELECT id, milestones FROM projects")).fetchall()

    for project_id, milestones in projects:
        state = _project_state(milestones)
        if state is None:
            continue

        for phase_index, phase_state in enumerate(state["phaseStates"]):
            if not isinstance(phase_state, dict):
                continue

            for position, deliverable in enumerate(_deliverables(phase_state)):
                bind.execute(
                    sa.text(
                        "INSERT INTO project_deliverables "
                        "(id, project_id, phase_index, position, text, done) "
                        "VALUES (:id, :project_id, :phase_index, :position, :text, :done)"
                    ),
                    {
                        "id": uuid4(),
                        "project_id": project_id,
                        "phase_index": phase_index,
                        "position": position,
                        "text": deliverable["text"],
                        "done": deliverable["done"],
                    },
                )

            assignment = phase_state.get("assignment")
            if not isinstance(assignment, dict):
                continue
            developer_id = _uuid_key(assignment.get("developerId"))
            if developer_id is None or developer_id not in known_developers:
                continue

            member_id = uuid4()
            bind.execute(
                sa.text(
                    "INSERT INTO project_members "
                    "(id, project_id, developer_id, phase_index, status, "
                    "amount_agreed_cents, invited_at, responded_at) "
                    "VALUES (:id, :project_id, :developer_id, :phase_index, 'accepted', "
                    ":amount, COALESCE(:hired_at, now()), COALESCE(:hired_at, now()))"
                ),
                {
                    "id": member_id,
                    "project_id": project_id,
                    "developer_id": developer_id,
                    "phase_index": phase_index,
                    "amount": _cents(assignment.get("amountAgreed")),
                    "hired_at": _iso_date(assignment.get("hiredAt")),
                },
            )

            for payment in _payments(assignment):
                bind.execute(
                    sa.text(
                        "INSERT INTO project_payments "
                        "(id, project_id, member_id, amount_cents, status, provider, "
                        "settled_at) "
                        "VALUES (:id, :project_id, :member_id, :amount, 'succeeded', "
                        "'manual', COALESCE(:settled_at, now()))"
                    ),
                    {
                        "id": uuid4(),
                        "project_id": project_id,
                        "member_id": member_id,
                        "amount": payment["amount_cents"],
                        "settled_at": payment["date"],
                    },
                )

        for issue in state.get("issues") or []:
            if not isinstance(issue, dict) or not str(issue.get("title", "")).strip():
                continue
            status = _lower(issue.get("status"), ISSUE_STATUSES, "open")
            bind.execute(
                sa.text(
                    "INSERT INTO project_issues "
                    "(id, project_id, phase_index, title, description, priority, status, "
                    "created_at, resolved_at) "
                    "VALUES (:id, :project_id, :phase_index, :title, :description, "
                    ":priority, :status, COALESCE(:created_at, now()), :resolved_at)"
                ),
                {
                    "id": uuid4(),
                    "project_id": project_id,
                    "phase_index": issue.get("phaseIndex"),
                    "title": str(issue["title"]).strip()[:255],
                    "description": str(issue.get("description") or ""),
                    "priority": _lower(issue.get("priority"), ISSUE_PRIORITIES, "medium"),
                    "status": status,
                    "created_at": _iso_date(issue.get("createdAt")),
                    "resolved_at": _iso_date(issue.get("createdAt"))
                    if status == "resolved"
                    else None,
                },
            )

        for deadline in state.get("deadlines") or []:
            if not isinstance(deadline, dict):
                continue
            due_date = _iso_date(deadline.get("date"))
            note = str(deadline.get("note") or "").strip()
            if due_date is None or not note:
                continue
            bind.execute(
                sa.text(
                    "INSERT INTO project_deadlines "
                    "(id, project_id, phase_index, note, priority, due_date, status, "
                    "created_at) "
                    "VALUES (:id, :project_id, :phase_index, :note, :priority, :due_date, "
                    ":status, COALESCE(:created_at, now()))"
                ),
                {
                    "id": uuid4(),
                    "project_id": project_id,
                    "phase_index": deadline.get("phaseIndex"),
                    "note": note,
                    "priority": _lower(deadline.get("priority"), ISSUE_PRIORITIES, "medium"),
                    "due_date": due_date,
                    "status": _lower(deadline.get("status"), DEADLINE_STATUSES, "pending"),
                    "created_at": _iso_date(deadline.get("createdAt")),
                },
            )
