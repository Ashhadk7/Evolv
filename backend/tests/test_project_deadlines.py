"""Deadline authoring and permission checks.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_project_deadlines.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

Each case runs in its own connection-level transaction that is always rolled back.
"""
from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.db.session import engine
from app.models.project import DeadlineStatus, Project, ProjectMember, ProjectMemberStatus
from app.models.user import DeveloperProfile, User
from app.schemas.projects import DeadlineCreate, DeadlineUpdate
from app.services import project_deadline_service as deadlines
from app.services.exceptions import (
    ProjectAccessDeniedError,
    ProjectMemberConflictError,
)

SOON = date.today() + timedelta(days=7)


def _fixture(db):
    member = (
        db.query(ProjectMember).filter(ProjectMember.status == ProjectMemberStatus.ACCEPTED).first()
    )
    project = db.get(Project, member.project_id)
    return project, db.get(User, project.founder_id), db.get(User, member.developer_id)


def _create(db, project, founder, assignees):
    return deadlines.create_deadline(
        db,
        project.id,
        founder,
        DeadlineCreate(note="Ship the beta build", due_date=SOON, assignee_ids=assignees),
    )


def test_founder_creates_a_deadline_with_assignees(db) -> None:
    project, founder, developer = _fixture(db)
    created = _create(db, project, founder, [developer.developer_profile.user_id])
    assert created.status == DeadlineStatus.PENDING
    assert [a.user_id for a in created.assignees] == [developer.developer_profile.user_id]
    assert created.can_edit is True


def test_a_developer_cannot_create_or_edit_a_deadline(db) -> None:
    project, founder, developer = _fixture(db)
    try:
        _create(db, project, developer, [])
    except ProjectAccessDeniedError:
        pass
    else:
        raise AssertionError("a developer must not create a deadline")

    created = _create(db, project, founder, [])
    try:
        deadlines.update_deadline(db, created.id, developer, DeadlineUpdate(note="moved"))
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a developer must not edit a deadline")


def test_only_accepted_members_can_be_assigned(db) -> None:
    project, founder, _ = _fixture(db)
    on_project = {
        m.developer_id
        for m in db.query(ProjectMember).filter(ProjectMember.project_id == project.id)
    }
    outsider = (
        db.query(DeveloperProfile).filter(DeveloperProfile.user_id.notin_(on_project)).first()
    )
    if outsider is None:
        return
    try:
        _create(db, project, founder, [outsider.user_id])
    except ProjectMemberConflictError:
        return
    raise AssertionError("assigning a non-member to a deadline must be rejected")


def test_assigned_developer_marks_their_line_met(db) -> None:
    project, founder, developer = _fixture(db)
    created = _create(db, project, founder, [developer.developer_profile.user_id])

    met = deadlines.set_met(db, created.id, developer, met=True)
    assert met.met_by_me is True
    assert met.status == DeadlineStatus.MET

    reopened = deadlines.set_met(db, created.id, developer, met=False)
    assert reopened.met_by_me is False
    assert reopened.status == DeadlineStatus.PENDING


def test_an_unassigned_developer_cannot_mark_met(db) -> None:
    project, founder, developer = _fixture(db)
    created = _create(db, project, founder, [])
    try:
        deadlines.set_met(db, created.id, developer, met=True)
    except ProjectAccessDeniedError:
        return
    raise AssertionError("an unassigned developer must not mark a deadline met")


def test_status_becomes_met_only_when_every_assignee_is_done(db) -> None:
    project, founder, developer = _fixture(db)
    others = [
        m.developer_id
        for m in db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.status == ProjectMemberStatus.ACCEPTED,
            ProjectMember.developer_id != developer.developer_profile.user_id,
        )
    ]
    if not others:
        return

    created = _create(db, project, founder, [developer.developer_profile.user_id, others[0]])
    partial = deadlines.set_met(db, created.id, developer, met=True)
    assert partial.met_by_me is True
    assert partial.status == DeadlineStatus.PENDING

    other_user = db.get(User, others[0])
    complete = deadlines.set_met(db, created.id, other_user, met=True)
    assert complete.status == DeadlineStatus.MET


def test_founder_can_replace_the_assignee_roster_and_delete(db) -> None:
    project, founder, developer = _fixture(db)
    created = _create(db, project, founder, [developer.developer_profile.user_id])

    cleared = deadlines.update_deadline(db, created.id, founder, DeadlineUpdate(assignee_ids=[]))
    assert cleared.assignees == []

    deadlines.delete_deadline(db, created.id, founder)
    assert created.id not in {d.id for d in deadlines.list_deadlines(db, project.id, founder)}


def test_developers_see_deadlines_but_cannot_edit_them(db) -> None:
    project, founder, developer = _fixture(db)
    created = _create(db, project, founder, [developer.developer_profile.user_id])
    visible = deadlines.list_deadlines(db, project.id, developer)
    seen = next(d for d in visible if d.id == created.id)
    assert seen.can_edit is False
    assert seen.assigned_to_me is True


def _run() -> None:
    cases = sorted(
        (name, fn)
        for name, fn in globals().items()
        if name.startswith("test_") and callable(fn)
    )
    for name, case in cases:
        connection = engine.connect()
        transaction = connection.begin()
        db = Session(bind=connection, join_transaction_mode="create_savepoint")
        try:
            case(db)
            print(f"  ok  {name}")
        finally:
            db.close()
            transaction.rollback()
            connection.close()
    print("\nAll deadline checks passed. Nothing was left in the database.")


if __name__ == "__main__":
    _run()
