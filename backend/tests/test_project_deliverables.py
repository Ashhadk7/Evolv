"""Deliverable ticket, comment and permission checks.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_project_deliverables.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

Each case runs in its own connection-level transaction that is always rolled
back, so nothing is left in the database.
"""
from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.db.session import engine
from app.models.project import (
    DeliverableStatus,
    Project,
    ProjectMember,
    ProjectMemberStatus,
)
from app.models.user import DeveloperProfile, User
from app.schemas.projects import DeliverableCreate, DeliverableUpdate
from app.services import project_deliverable_service as deliverables
from app.services.exceptions import ProjectAccessDeniedError

SOON = date.today() + timedelta(days=5)


def _fixture(db):
    member = (
        db.query(ProjectMember).filter(ProjectMember.status == ProjectMemberStatus.ACCEPTED).first()
    )
    project = db.get(Project, member.project_id)
    return project, db.get(User, project.founder_id), db.get(User, member.developer_id), member


def _other_developer(db, project):
    """A developer with no membership on this project at all — a genuine
    outsider, not merely someone off a given phase (who may still have
    legitimate project-wide read access via another phase)."""
    on_project = {
        m.developer_id
        for m in db.query(ProjectMember).filter(ProjectMember.project_id == project.id)
    }
    profile = (
        db.query(DeveloperProfile).filter(DeveloperProfile.user_id.notin_(on_project)).first()
    )
    return db.get(User, profile.user_id) if profile else None


def _accepted_on_other_phase(db, project, phase_index):
    """A developer accepted on a *different* phase of the same project — has
    project-wide read access, but must not be able to toggle this phase."""
    row = db.query(ProjectMember).filter(
        ProjectMember.project_id == project.id,
        ProjectMember.phase_index != phase_index,
        ProjectMember.status == ProjectMemberStatus.ACCEPTED,
    ).first()
    return db.get(User, row.developer_id) if row else None


def _create(db, project, founder, phase_index):
    return deliverables.create_deliverable(
        db,
        project.id,
        founder,
        DeliverableCreate(
            text="Ship the login flow",
            description="Email/password + OAuth, with a working reset link.",
            phase_index=phase_index,
            due_date=SOON,
        ),
    )


def test_founder_creates_a_deliverable_with_description_and_due_date(db) -> None:
    project, founder, _, member = _fixture(db)
    created = _create(db, project, founder, member.phase_index)
    assert created.status == DeliverableStatus.TODO
    assert created.done is False
    assert created.due_date == SOON
    assert created.can_edit is True

    detail = deliverables.get_deliverable(db, created.id, founder)
    assert detail.description == "Email/password + OAuth, with a working reset link."


def test_a_developer_cannot_create_edit_or_delete_a_deliverable(db) -> None:
    project, founder, developer, member = _fixture(db)
    try:
        _create(db, project, developer, member.phase_index)
    except ProjectAccessDeniedError:
        pass
    else:
        raise AssertionError("a developer must not create a deliverable")

    created = _create(db, project, founder, member.phase_index)
    try:
        deliverables.update_deliverable(db, created.id, developer, DeliverableUpdate(text="x"))
    except ProjectAccessDeniedError:
        pass
    else:
        raise AssertionError("a developer must not edit a deliverable")

    try:
        deliverables.delete_deliverable(db, created.id, developer)
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a developer must not delete a deliverable")


def test_only_the_phase_holder_can_move_a_deliverable(db) -> None:
    project, founder, developer, member = _fixture(db)
    created = _create(db, project, founder, member.phase_index)

    other_phase_member = _accepted_on_other_phase(db, project, member.phase_index)
    if other_phase_member is not None:
        try:
            deliverables.set_status(
                db,
                created.id,
                other_phase_member,
                status=DeliverableStatus.IN_PROGRESS,
                comment=None,
            )
        except ProjectAccessDeniedError:
            pass
        else:
            raise AssertionError("a developer off this phase must not move it")

    mine = deliverables.set_status(
        db, created.id, developer, status=DeliverableStatus.IN_PROGRESS, comment=None
    )
    assert mine.status == DeliverableStatus.IN_PROGRESS


def test_a_developer_can_only_take_a_deliverable_as_far_as_review(db) -> None:
    project, founder, developer, member = _fixture(db)
    created = _create(db, project, founder, member.phase_index)

    deliverables.set_status(
        db, created.id, developer, status=DeliverableStatus.IN_PROGRESS, comment=None
    )
    submitted = deliverables.set_status(
        db, created.id, developer, status=DeliverableStatus.IN_REVIEW, comment=None
    )
    assert submitted.status == DeliverableStatus.IN_REVIEW
    assert submitted.done is False

    try:
        deliverables.set_status(
            db, created.id, developer, status=DeliverableStatus.DONE, comment=None
        )
    except ProjectAccessDeniedError:
        pass
    else:
        raise AssertionError("a developer must not sign their own work off as done")

    signed_off = deliverables.set_status(
        db, created.id, founder, status=DeliverableStatus.DONE, comment=None
    )
    assert signed_off.done is True


def test_marking_done_can_carry_a_comment_the_founder_sees(db) -> None:
    project, founder, developer, member = _fixture(db)
    created = _create(db, project, founder, member.phase_index)

    deliverables.set_status(
        db,
        created.id,
        developer,
        status=DeliverableStatus.IN_PROGRESS,
        comment="Reset link needed a longer TTL, fixed.",
    )

    detail = deliverables.get_deliverable(db, created.id, founder)
    assert detail.comment_count == 1
    assert detail.comments[0].body == "Reset link needed a longer TTL, fixed."
    assert detail.comments[0].is_mine is False  # founder viewing the developer's comment


def test_founder_can_reply_in_the_same_thread(db) -> None:
    project, founder, developer, member = _fixture(db)
    created = _create(db, project, founder, member.phase_index)

    deliverables.add_comment(db, created.id, developer, "Found an edge case on mobile Safari.")
    deliverables.add_comment(db, created.id, founder, "Good catch — file it as an issue too.")

    detail = deliverables.get_deliverable(db, created.id, developer)
    assert detail.comment_count == 2
    assert [c.author_name for c in detail.comments] == [
        f"{developer.first_name} {developer.last_name}".strip(),
        f"{founder.first_name} {founder.last_name}".strip(),
    ]


def test_clearing_the_due_date_removes_it_from_the_deadline_view(db) -> None:
    project, founder, _, member = _fixture(db)
    created = _create(db, project, founder, member.phase_index)

    from app.services import project_deadline_service

    with_due_date = project_deadline_service.list_deadlines(db, project.id, founder)
    assert any(d.source == "deliverable" and d.id == created.id for d in with_due_date)

    deliverables.update_deliverable(db, created.id, founder, DeliverableUpdate(clear_due_date=True))
    after = project_deadline_service.list_deadlines(db, project.id, founder)
    assert not any(d.source == "deliverable" and d.id == created.id for d in after)


def test_a_non_member_cannot_read_deliverables(db) -> None:
    project, founder, _, member = _fixture(db)
    created = _create(db, project, founder, member.phase_index)
    outsider = _other_developer(db, project)
    if outsider is None:
        return
    try:
        deliverables.get_deliverable(db, created.id, outsider)
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a non-member must not read a deliverable")


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
    print("\nAll deliverable checks passed. Nothing was left in the database.")


if __name__ == "__main__":
    _run()
