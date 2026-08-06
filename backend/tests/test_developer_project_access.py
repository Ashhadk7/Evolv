"""Authorisation and privacy checks for the developer project read model.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_developer_project_access.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

These run against the configured database read-only — they never write. The point
is the authorisation matrix and the privacy boundary: a developer must see their
own engagement and nothing else, and the milestones blob must never reach them.
"""
from __future__ import annotations

from uuid import uuid4

from app.db.session import SessionLocal
from app.models.project import Project, ProjectMember, ProjectMemberStatus
from app.models.user import User, UserRole
from app.repositories import projects as projects_repository
from app.schemas.projects import DeveloperProjectDetail, DeveloperProjectSummary
from app.services import developer_project_service
from app.services.exceptions import (
    DeveloperProfileRequiredError,
    ProjectAccessDeniedError,
    ProjectNotFoundError,
)

FORBIDDEN_FIELDS = {
    "budget",
    "amount_agreed",
    "amountAgreed",
    "expenses",
    "totalPaid",
    "total_paid",
    "milestones",
    "phaseStates",
    "assignment",
    "removals",
}


def _member_developer(db) -> User | None:
    membership = (
        db.query(ProjectMember)
        .filter(ProjectMember.status == ProjectMemberStatus.ACCEPTED)
        .first()
    )
    if membership is None:
        return None
    return db.get(User, membership.developer_id)


def _founder(db) -> User | None:
    return db.query(User).filter(User.role == UserRole.FOUNDER).first()


def test_founder_cannot_use_the_developer_read_model(db) -> None:
    founder = _founder(db)
    assert founder is not None, "no founder in the database to test with"
    try:
        developer_project_service.list_projects(db, founder)
    except DeveloperProfileRequiredError:
        return
    raise AssertionError("a founder must not be able to list developer projects")


def test_unknown_project_is_not_found(db) -> None:
    developer = _member_developer(db)
    assert developer is not None, "no accepted membership in the database to test with"
    try:
        developer_project_service.get_project(db, uuid4(), developer)
    except ProjectNotFoundError:
        return
    raise AssertionError("an unknown project id must raise ProjectNotFoundError")


def test_non_member_cannot_read_a_project(db) -> None:
    developer = _member_developer(db)
    assert developer is not None
    my_ids = {
        m.project_id
        for m in projects_repository.list_accepted_memberships_for_developer(
            db, developer.developer_profile.user_id
        )
    }
    other = db.query(Project).filter(Project.id.notin_(my_ids or {uuid4()})).first()
    if other is None:
        return
    try:
        developer_project_service.get_project(db, other.id, developer)
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a non-member must not be able to read a project")


def test_developer_only_sees_projects_they_are_accepted_on(db) -> None:
    developer = _member_developer(db)
    assert developer is not None
    developer_id = developer.developer_profile.user_id

    summaries = developer_project_service.list_projects(db, developer)
    memberships = projects_repository.list_accepted_memberships_for_developer(db, developer_id)
    expected = {m.project_id for m in memberships}

    assert {s.id for s in summaries} == expected
    for summary in summaries:
        assert isinstance(summary, DeveloperProjectSummary)
        assert summary.my_phase_indices, "a listed project must name the developer's phases"


def test_earnings_never_exceed_this_developers_own_engagement(db) -> None:
    developer = _member_developer(db)
    assert developer is not None
    developer_id = developer.developer_profile.user_id

    for summary in developer_project_service.list_projects(db, developer):
        mine = [
            m
            for m in projects_repository.list_memberships_on_project(db, summary.id, developer_id)
            if m.status == ProjectMemberStatus.ACCEPTED
        ]
        assert summary.earnings.agreed_cents == sum(m.amount_agreed_cents for m in mine)
        assert summary.earnings.paid_cents >= 0
        assert summary.earnings.outstanding_cents == max(
            0, summary.earnings.agreed_cents - summary.earnings.paid_cents
        )


def test_response_never_carries_founder_only_fields(db) -> None:
    developer = _member_developer(db)
    assert developer is not None

    for summary in developer_project_service.list_projects(db, developer):
        detail = developer_project_service.get_project(db, summary.id, developer)
        assert isinstance(detail, DeveloperProjectDetail)
        leaked = FORBIDDEN_FIELDS & _keys(detail.model_dump())
        assert not leaked, f"developer response leaked founder-only fields: {sorted(leaked)}"


def test_deliverables_are_only_toggleable_on_the_developers_own_phases(db) -> None:
    developer = _member_developer(db)
    assert developer is not None

    for summary in developer_project_service.list_projects(db, developer):
        detail = developer_project_service.get_project(db, summary.id, developer)
        mine = set(detail.my_phase_indices)
        for phase in detail.phases:
            assert phase.is_mine == (phase.phase_index in mine)
            for deliverable in phase.deliverables:
                assert deliverable.can_toggle == (deliverable.phase_index in mine)


def _keys(value: object) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        for key, item in value.items():
            found.add(str(key))
            found |= _keys(item)
    elif isinstance(value, list):
        for item in value:
            found |= _keys(item)
    return found


def _run() -> None:
    db = SessionLocal()
    try:
        for name, case in sorted(globals().items()):
            if name.startswith("test_") and callable(case):
                case(db)
                print(f"  ok  {name}")
    finally:
        db.close()
    print("\nAll developer project access checks passed.")


if __name__ == "__main__":
    _run()
