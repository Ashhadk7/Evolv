"""Counter-offer lifecycle checks: invite -> counter -> accept/reject/re-negotiate.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_project_negotiate.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

This writes to the configured database inside a transaction that is always rolled
back, so it leaves no rows behind. Companion to test_project_membership.py, which
covers the plain accept/decline path this file does not repeat.
"""
from __future__ import annotations

from uuid import uuid4

try:
    import pytest
except ImportError:  # pytest is optional; direct execution below doesn't need it
    pytest = None

from sqlalchemy.orm import Session

from app.db.session import engine
from app.models.notification import Notification
from app.models.project import Project, ProjectMember, ProjectMemberStatus
from app.models.user import DeveloperProfile, User
from app.schemas.projects import ProjectMemberInvite
from app.services import project_membership_service as service
from app.services.exceptions import ProjectMemberConflictError


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


def _latest_notification(db, user_id):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .first()
    )


def test_countering_an_invite_moves_it_to_countered(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    countered = service.propose_counter(db, member.id, developer, amount_cents=75_000)
    assert countered.status == ProjectMemberStatus.COUNTERED
    assert countered.counter_amount_cents == 75_000


def test_countering_notifies_the_founder(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.propose_counter(db, member.id, developer, amount_cents=75_000)
    notification = _latest_notification(db, founder.id)
    assert notification is not None
    assert "counter" in notification.title.lower()


def test_only_an_invited_member_can_be_countered(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.respond_to_invite(db, member.id, developer, accept=True)
    try:
        service.propose_counter(db, member.id, developer, amount_cents=1000)
    except ProjectMemberConflictError:
        return
    raise AssertionError("countering an already-accepted invite must conflict")


def test_only_the_invited_developer_can_counter(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    other = (
        db.query(User)
        .join(DeveloperProfile, DeveloperProfile.user_id == User.id)
        .filter(User.id != developer.id)
        .first()
    )
    if other is None:
        return
    try:
        service.propose_counter(db, member.id, other, amount_cents=1000)
    except Exception as exc:
        from app.services.exceptions import ProjectMemberNotFoundError

        assert isinstance(exc, ProjectMemberNotFoundError)
        return
    raise AssertionError("a different developer must not be able to counter this invite")


def test_founder_accepting_a_counter_locks_in_the_countered_amount(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer, cents=50_000)
    service.propose_counter(db, member.id, developer, amount_cents=75_000)
    accepted = service.respond_to_counter(db, member.id, founder, action="accept")
    assert accepted.status == ProjectMemberStatus.ACCEPTED
    assert accepted.amount_agreed_cents == 75_000
    assert accepted.counter_amount_cents is None


def test_founder_accepting_a_counter_notifies_the_developer(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.propose_counter(db, member.id, developer, amount_cents=75_000)
    service.respond_to_counter(db, member.id, founder, action="accept")
    notification = _latest_notification(db, developer.id)
    assert notification is not None
    assert "accepted" in notification.title.lower()


def test_founder_rejecting_a_counter_declines_the_membership(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.propose_counter(db, member.id, developer, amount_cents=75_000)
    rejected = service.respond_to_counter(db, member.id, founder, action="reject")
    assert rejected.status == ProjectMemberStatus.DECLINED
    assert rejected.counter_amount_cents is None


def test_founder_re_negotiating_resets_to_invited_with_the_new_amount(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer, cents=50_000)
    service.propose_counter(db, member.id, developer, amount_cents=90_000)
    renegotiated = service.respond_to_counter(
        db, member.id, founder, action="negotiate", amount_cents=70_000
    )
    assert renegotiated.status == ProjectMemberStatus.INVITED
    assert renegotiated.amount_agreed_cents == 70_000
    assert renegotiated.counter_amount_cents is None


def test_re_negotiated_invite_can_be_accepted_like_a_fresh_invite(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer, cents=50_000)
    service.propose_counter(db, member.id, developer, amount_cents=90_000)
    service.respond_to_counter(db, member.id, founder, action="negotiate", amount_cents=70_000)
    accepted = service.respond_to_invite(db, member.id, developer, accept=True)
    assert accepted.status == ProjectMemberStatus.ACCEPTED
    assert accepted.amount_agreed_cents == 70_000


def test_re_negotiating_without_an_amount_is_rejected(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.propose_counter(db, member.id, developer, amount_cents=90_000)
    try:
        service.respond_to_counter(db, member.id, founder, action="negotiate", amount_cents=None)
    except ProjectMemberConflictError:
        return
    raise AssertionError("negotiate without an amount must be rejected")


def test_responding_to_counter_requires_a_pending_counter(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    try:
        service.respond_to_counter(db, member.id, founder, action="accept")
    except ProjectMemberConflictError:
        return
    raise AssertionError("responding to a counter that does not exist must conflict")


def test_a_developer_cannot_respond_to_their_own_counter(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.propose_counter(db, member.id, developer, amount_cents=90_000)
    from app.services.exceptions import FounderProfileRequiredError

    try:
        service.respond_to_counter(db, member.id, developer, action="accept")
    except FounderProfileRequiredError:
        return
    raise AssertionError("a developer must not be able to respond to their own counter")


def test_a_founder_cannot_respond_to_a_counter_on_another_founders_project(db) -> None:
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.propose_counter(db, member.id, developer, amount_cents=90_000)
    from app.models.user import UserRole
    from app.services.exceptions import ProjectAccessDeniedError

    other = db.query(User).filter(User.role == UserRole.FOUNDER, User.id != founder.id).first()
    if other is None or other.founder_profile is None:
        return
    try:
        service.respond_to_counter(db, member.id, other, action="accept")
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a founder must not resolve a counter on another founder's project")


def test_countered_membership_still_blocks_a_duplicate_invite(db) -> None:
    """`countered` must count as an active engagement, same as invited/accepted -
    otherwise a founder could invite over an unresolved counter-offer."""
    project, founder, developer = _fixture(db)
    member = _invite(db, project, founder, developer)
    service.propose_counter(db, member.id, developer, amount_cents=90_000)
    try:
        _invite(db, project, founder, developer)
    except Exception as exc:
        assert isinstance(exc, ProjectMemberConflictError)
        return
    raise AssertionError("a second invite must not be creatable over an unresolved counter")


# ---------------------------------------------------------------------------
# Integration tests: exercise paths this rollback-per-test harness cannot cover
# (live websocket delivery, real Pinecone-backed notification fan-out, etc).
# Skipped by default; run manually against a fully configured dev environment.
# Under pytest these are collected and reported as skipped. Under the direct
# `_run()` runner below they are filtered out via `_INTEGRATION_ONLY`, since
# there is no pytest to interpret the skip marker.
# ---------------------------------------------------------------------------

_INTEGRATION_ONLY: set[str] = set()


def _integration_only(reason: str):
    def _decorator(fn):
        _INTEGRATION_ONLY.add(fn.__name__)
        return pytest.mark.skip(reason=reason)(fn) if pytest is not None else fn

    return _decorator


@_integration_only(reason="Requires a live websocket client connected as the founder.")
def test_counter_offer_notification_arrives_over_the_live_websocket() -> None:
    """Manual integration check: connect a websocket client as the founder,
    have a developer counter an invite via the API, and assert the client
    receives a `notification.created` frame with type=project within a few
    seconds. FastAPI's TestClient does not exercise the websocket broadcast
    path exercised by BackgroundTasks in production, so this needs a real
    server + client pair, not the rollback-per-test harness used above."""


@_integration_only(reason="Requires the developer's push/email channel to be configured.")
def test_counter_offer_email_or_push_notification_is_sent() -> None:
    """Manual integration check: verify the out-of-band notification channel
    (email/push, if enabled for the recipient) actually fires when a founder
    accepts, rejects, or re-negotiates a counter-offer."""


def _run() -> None:
    cases = sorted(
        (name, fn)
        for name, fn in globals().items()
        if name.startswith("test_") and callable(fn) and name not in _INTEGRATION_ONLY
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
    print("\nAll counter-offer lifecycle checks passed. Nothing was left in the database.")


if __name__ == "__main__":
    _run()
