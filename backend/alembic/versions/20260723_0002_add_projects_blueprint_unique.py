"""Add unique constraint on projects.blueprint_id.

A blueprint may only ever back a single project. This closes the gap where
duplicate POST /projects requests (retries, double-clicks, out-of-order
requests after a refresh) could otherwise insert more than one project row
for the same blueprint — the application-level "does a project already
exist" check alone cannot be relied upon under concurrent requests.

Revision ID: 20260723_0002
Revises: 20260723_0001
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "20260723_0002"
down_revision: str | Sequence[str] | None = "20260723_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # If duplicate rows already exist in this environment, keep only the
    # oldest project per blueprint before the constraint is added, so the
    # migration doesn't fail on pre-existing bad data.
    op.execute(
        """
        DELETE FROM projects
        WHERE id IN (
            SELECT id FROM (
                SELECT id,
                       ROW_NUMBER() OVER (
                           PARTITION BY blueprint_id
                           ORDER BY created_at ASC, id ASC
                       ) AS rn
                FROM projects
            ) ranked
            WHERE ranked.rn > 1
        )
        """
    )
    op.create_unique_constraint(
        "uq_projects_blueprint_id",
        "projects",
        ["blueprint_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_projects_blueprint_id", "projects", type_="unique")
