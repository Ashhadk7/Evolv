"""Membership lifecycle checks: invite -> accept/decline/revoke/remove.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_project_membership.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

This writes to the configured database inside a transaction that is always rolled
back, so it leaves no rows behind.
"""
from __future__ import annotations

from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.blueprint import BlueprintVisibility
from app.db.session import engine
from app.models.project import Project, ProjectMember, ProjectMemberStatus
from app.models.user import DeveloperProfile, User, UserRole
from app.repositories import applications as applications_repository
from app.repositories import projects as projects_repository
from app.services import application_service
from app.schemas.projects import ProjectMemberInvite, ProjectPaymentRecord
from app.services import developer_project_service
from app.services import project_membership_service as service
from app.services.exceptions import (
    AlreadyEngagedError,
    DeveloperProfileRequiredError,
    FounderProfileRequiredError,
    ProjectAccessDeniedError,
    ProjectInvalidPhaseError,
    ProjectMemberConflictError,
    ProjectMemberNotFoundError,
)


def _fixture(db):
    project = db.query(Project).filter(Project.milestones.isnot(None)).first()
    founder = db.get(User, project.founder_id)
    developer_ids = {
        m.developer_id
        for m in db.query(ProjectMember).filter(ProjectMember.project_id == project.id)
    }
    profile = (
        db.query(DeveloperProfile)
        .filter(DeveloperProfile.user_id.notin_(developer_ids or {uuid4()}))
        .first()
    )
    assert profile is not None, "need a developer not already on this project"
    return project, founder, db.get(User, profile.user_id)


def _invite(db, project, founder, developer, phase_index=0, cents=50_000):
    return service.invite_developer(
        db,
        project.id,
        founder,
        ProjectMemberInvite(
            developer_id=developer.developer_profile.user_id,
            phase_index=phase_index,
            amount_agreed_cents=cents,
        ),
    )


def test_invite_starts_as_pending_not_hired(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    assert member.status == ProjectMemberStatus.INVITED
    assert member.responded_at is None


def test_developer_accepting_moves_to_accepted(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    accepted = service.respond_to_invite(db, member.id, developer, accept=True)
    assert accepted.status == ProjectMemberStatus.ACCEPTED
    assert accepted.responded_at is not None


def test_developer_declining_moves_to_declined(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    declined = service.respond_to_invite(db, member.id, developer, accept=False)
    assert declined.status == ProjectMemberStatus.DECLINED


def test_an_invite_cannot_be_answered_twice(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.respond_to_invite(db, member.id, developer, accept=True)
    try:
        service.respond_to_invite(db, member.id, developer, accept=False)
    except ProjectMemberConflictError:
        return
    raise AssertionError("answering an invite twice must conflict")


def test_duplicate_active_invite_is_rejected(db) -> None:
    project, founder, developer = _fixture(db)
    _invite(db, project, founder, developer)
    try:
        _invite(db, project, founder, developer)
    except ProjectMemberConflictError:
        return
    raise AssertionError("a second active invite for the same phase must conflict")


def test_reinvite_is_allowed_after_a_decline(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.respond_to_invite(db, member.id, developer, accept=False)
    again = _invite(db, project, founder, developer)
    assert again.status == ProjectMemberStatus.INVITED


def test_only_the_invited_developer_can_respond(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    other = (
        db.query(User)
        .filter(User.role == UserRole.DEVELOPER, User.id != developer.id)
        .first()
    )
    if other is None:
        return
    try:
        service.respond_to_invite(db, member.id, other, accept=True)
    except ProjectMemberNotFoundError:
        return
    raise AssertionError("a different developer must not be able to accept an invite")


def test_a_founder_cannot_respond_to_an_invite(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    try:
        service.respond_to_invite(db, member.id, founder, accept=True)
    except DeveloperProfileRequiredError:
        return
    raise AssertionError("a founder must not be able to accept an invite")


def test_a_developer_cannot_invite(db) -> None:
    project, founder, developer = _fixture(db)
    try:
        _invite(db, project, developer, developer)
    except FounderProfileRequiredError:
        return
    raise AssertionError("a developer must not be able to invite")


def test_a_founder_cannot_invite_onto_someone_elses_project(db) -> None:
    project, founder, developer = _fixture(db)
    other = (
        db.query(User)
        .filter(User.role == UserRole.FOUNDER, User.id != founder.id)
        .first()
    )
    if other is None or other.founder_profile is None:
        return
    try:
        _invite(db, project, other, developer)
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a founder must not be able to staff another founder's project")


def test_invite_to_a_nonexistent_phase_is_rejected(db) -> None:
    project, founder, developer = _fixture(db)
    try:
        _invite(db, project, founder, developer, phase_index=999)
    except ProjectInvalidPhaseError:
        return
    raise AssertionError("inviting onto a phase that does not exist must fail")


def test_revoke_only_applies_to_a_pending_invite(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    revoked = service.revoke_invite(db, member.id, founder)
    assert revoked.status == ProjectMemberStatus.REVOKED

    member2 = _invite(db, project, founder, developer)
    service.respond_to_invite(db, member2.id, developer, accept=True)
    try:
        service.revoke_invite(db, member2.id, founder)
    except ProjectMemberConflictError:
        return
    raise AssertionError("an accepted membership must not be revocable")


def test_remove_requires_an_accepted_member_and_records_the_reason(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    try:
        service.remove_member(db, member.id, founder, "too early")
    except ProjectMemberConflictError:
        pass
    else:
        raise AssertionError("a pending invite must not be removable")

    service.respond_to_invite(db, member.id, developer, accept=True)
    removed = service.remove_member(db, member.id, founder, "missed deadlines")
    assert removed.status == ProjectMemberStatus.REMOVED
    assert removed.removal_reason == "missed deadlines"
    assert removed.removed_at is not None


def test_a_pending_invite_cannot_be_paid(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    try:
        service.record_payment(
            db,
            member.id,
            founder,
            ProjectPaymentRecord(amount_cents=1000, idempotency_key="pending-pay-guard"),
        )
    except ProjectMemberConflictError:
        return
    raise AssertionError("paying a developer who has not accepted must be rejected")


def test_payment_totals_accumulate_and_are_idempotent(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer, cents=100_000)
    service.respond_to_invite(db, member.id, developer, accept=True)

    first_key = ProjectPaymentRecord(amount_cents=40_000, idempotency_key="pay-first-instalment")
    second_key = ProjectPaymentRecord(amount_cents=25_000, idempotency_key="pay-second-instalment")

    assert service.record_payment(db, member.id, founder, first_key).amount_paid_cents == 40_000
    assert service.record_payment(db, member.id, founder, second_key).amount_paid_cents == 65_000

    try:
        service.record_payment(db, member.id, founder, second_key)
    except ProjectMemberConflictError:
        return
    raise AssertionError("replaying an idempotency key must not double-charge")


def test_developer_earnings_sum_multiple_phases_on_the_same_project(db) -> None:
    project, founder, developer = _fixture(db)
    if projects_repository.phase_count(project) < 2:
        return

    first = _invite(db, project, founder, developer, phase_index=0, cents=70_000)
    second = _invite(db, project, founder, developer, phase_index=1, cents=30_000)
    service.respond_to_invite(db, first.id, developer, accept=True)
    service.respond_to_invite(db, second.id, developer, accept=True)

    service.record_payment(
        db,
        first.id,
        founder,
        ProjectPaymentRecord(amount_cents=20_000, idempotency_key="phase-one-payment"),
    )
    service.record_payment(
        db,
        second.id,
        founder,
        ProjectPaymentRecord(amount_cents=30_000, idempotency_key="phase-two-payment"),
    )

    summary = next(
        item
        for item in developer_project_service.list_projects(db, developer)
        if item.id == project.id
    )
    assert summary.earnings.agreed_cents == 100_000
    assert summary.earnings.paid_cents == 50_000
    assert summary.earnings.outstanding_cents == 50_000
    assert summary.earnings.engagements[0].paid_cents == 20_000
    assert summary.earnings.engagements[1].paid_cents == 30_000


def test_hired_developer_cannot_apply_to_the_same_blueprint(db) -> None:
    project, founder, developer = _fixture(db)
    project.blueprint.visibility = BlueprintVisibility.PUBLIC
    db.flush()

    member = _invite(db, project, founder, developer)
    service.respond_to_invite(db, member.id, developer, accept=True)

    try:
        application_service.create_application(db, developer, project.blueprint_id)
    except AlreadyEngagedError:
        return
    raise AssertionError("an accepted project member must not be able to apply")


def test_project_members_are_hidden_from_application_lists_and_counts(db) -> None:
    project, founder, developer = _fixture(db)
    project.blueprint.visibility = BlueprintVisibility.PUBLIC
    db.flush()

    member = _invite(db, project, founder, developer)
    service.respond_to_invite(db, member.id, developer, accept=True)

    _, before_total = applications_repository.list_applications_for_blueprint(
        db, project.blueprint_id, limit=500, offset=0
    )
    before_counts, _, _, _ = applications_repository.count_applications_for_founder_blueprints(
        db, founder.founder_profile.user_id
    )

    existing = applications_repository.get_application_by_developer_and_blueprint(
        db, developer.developer_profile.user_id, project.blueprint_id
    )
    if existing is None:
        db.add(
            Application(
                developer_id=developer.developer_profile.user_id,
                blueprint_id=project.blueprint_id,
                role="Engineer",
            )
        )
    else:
        existing.status = "applied"
        existing.withdrawn_at = None
    db.flush()

    applications, after_total = applications_repository.list_applications_for_blueprint(
        db, project.blueprint_id, limit=500, offset=0
    )
    after_counts, _, _, _ = applications_repository.count_applications_for_founder_blueprints(
        db, founder.founder_profile.user_id
    )

    assert after_total == before_total
    assert after_counts.get(project.blueprint_id, 0) == before_counts.get(project.blueprint_id, 0)
    assert developer.developer_profile.user_id not in {
        application.developer_id for application in applications
    }


def test_a_founder_cannot_pay_a_member_on_another_founders_project(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.respond_to_invite(db, member.id, developer, accept=True)
    other = (
        db.query(User).filter(User.role == UserRole.FOUNDER, User.id != founder.id).first()
    )
    if other is None or other.founder_profile is None:
        return
    try:
        service.record_payment(
            db,
            member.id,
            other,
            ProjectPaymentRecord(amount_cents=1000, idempotency_key="cross-founder-pay"),
        )
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a founder must not pay on another founder's project")


def test_pending_invites_are_listed_for_the_developer_only(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)

    mine = service.list_invites(db, developer)
    assert member.id in {i.id for i in mine}

    invite = next(i for i in mine if i.id == member.id)
    assert invite.project_title == project.title
    assert invite.amount_agreed_cents == member.amount_agreed_cents

    exposed = set(invite.model_dump())
    assert "milestones" not in exposed
    assert "budget" not in exposed

    service.respond_to_invite(db, member.id, developer, accept=True)
    assert member.id not in {i.id for i in service.list_invites(db, developer)}


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
    print("\nAll membership lifecycle checks passed. Nothing was left in the database.")


if __name__ == "__main__":
    _run()
