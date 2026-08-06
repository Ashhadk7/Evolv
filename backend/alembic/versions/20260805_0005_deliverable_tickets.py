"""Turn deliverables into tickets: description, due date, comments, attachments.

Revision ID: 20260805_0005
Revises: 20260805_0004

Comments and attachments become polymorphic over (issue, deliverable) via a
nullable pair of foreign keys plus a database-level exactly-one-of check, so
the existing issue collaboration tables are reused rather than duplicated for
deliverables.
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260805_0005"
down_revision: str | Sequence[str] | None = "20260805_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ONE_TARGET = "(issue_id IS NOT NULL) <> (deliverable_id IS NOT NULL)"


def upgrade() -> None:
    op.add_column(
        "project_deliverables",
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
    )
    op.add_column("project_deliverables", sa.Column("due_date", sa.Date(), nullable=True))

    op.rename_table("project_issue_comments", "project_comments")
    op.alter_column(
        "project_comments", "issue_id", existing_type=sa.Uuid(as_uuid=True), nullable=True
    )
    op.add_column(
        "project_comments", sa.Column("deliverable_id", sa.Uuid(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        "project_comments_deliverable_id_fkey",
        "project_comments",
        "project_deliverables",
        ["deliverable_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_check_constraint("ck_project_comments_one_target", "project_comments", ONE_TARGET)
    op.create_index(
        "ix_project_comments_deliverable_id_created_at",
        "project_comments",
        ["deliverable_id", "created_at"],
    )

    op.alter_column(
        "project_attachments", "issue_id", existing_type=sa.Uuid(as_uuid=True), nullable=True
    )
    op.add_column(
        "project_attachments", sa.Column("deliverable_id", sa.Uuid(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        "project_attachments_deliverable_id_fkey",
        "project_attachments",
        "project_deliverables",
        ["deliverable_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_check_constraint(
        "ck_project_attachments_one_target", "project_attachments", ONE_TARGET
    )
    op.create_index(
        "ix_project_attachments_deliverable_id", "project_attachments", ["deliverable_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_project_attachments_deliverable_id", table_name="project_attachments")
    op.drop_constraint(
        "ck_project_attachments_one_target", "project_attachments", type_="check"
    )
    op.drop_constraint(
        "project_attachments_deliverable_id_fkey", "project_attachments", type_="foreignkey"
    )
    op.drop_column("project_attachments", "deliverable_id")
    op.alter_column(
        "project_attachments", "issue_id", existing_type=sa.Uuid(as_uuid=True), nullable=False
    )

    op.drop_index(
        "ix_project_comments_deliverable_id_created_at", table_name="project_comments"
    )
    op.drop_constraint("ck_project_comments_one_target", "project_comments", type_="check")
    op.drop_constraint(
        "project_comments_deliverable_id_fkey", "project_comments", type_="foreignkey"
    )
    op.drop_column("project_comments", "deliverable_id")
    op.alter_column(
        "project_comments", "issue_id", existing_type=sa.Uuid(as_uuid=True), nullable=False
    )
    op.rename_table("project_comments", "project_issue_comments")

    op.drop_column("project_deliverables", "due_date")
    op.drop_column("project_deliverables", "description")
