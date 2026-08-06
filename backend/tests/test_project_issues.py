"""Issue workflow and permission checks.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_project_issues.py
(Also discoverable by pytest as test_* functions if it's ever installed.)

Each case runs in its own connection-level transaction that is always rolled
back, so nothing is left in the database.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.session import engine
from app.models.project import IssueStatus, Project, ProjectMember, ProjectMemberStatus
from app.models.user import DeveloperProfile, User
from app.schemas.projects import IssueCreate, IssueUpdate, ProjectMemberInvite
from app.services import project_collaboration_service as collaboration
from app.services import project_issue_service as issues
from app.services import project_membership_service as membership
from app.services.exceptions import (
    ProjectAccessDeniedError,
    ProjectMemberConflictError,
    ProjectNotFoundError,
)


def _project_with_member(db):
    member = (
        db.query(ProjectMember).filter(ProjectMember.status == ProjectMemberStatus.ACCEPTED).first()
    )
    project = db.get(Project, member.project_id)
    return project, db.get(User, project.founder_id), db.get(User, member.developer_id)


def _outsider(db, project):
    on_project = {
        m.developer_id
        for m in db.query(ProjectMember).filter(ProjectMember.project_id == project.id)
    }
    profile = (
        db.query(DeveloperProfile).filter(DeveloperProfile.user_id.notin_(on_project)).first()
    )
    return db.get(User, profile.user_id) if profile else None


def _issue(db, project, founder, assignee=None):
    return issues.create_issue(
        db,
        project.id,
        founder,
        IssueCreate(
            title="Payment webhook drops retries",
            description="Retries are not replayed after a 500.",
            assignee_id=assignee.developer_profile.user_id if assignee else None,
        ),
    )


def test_only_the_founder_can_raise_an_issue(db) -> None:
    project, founder, developer = _project_with_member(db)
    created = _issue(db, project, founder)
    assert created.status == IssueStatus.OPEN
    assert created.can_edit is True

    try:
        _issue(db, project, developer)
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a developer must not be able to raise an issue")


def test_an_outsider_cannot_read_project_issues(db) -> None:
    project, founder, _ = _project_with_member(db)
    outsider = _outsider(db, project)
    if outsider is None:
        return
    try:
        issues.list_issues(db, project.id, outsider)
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a non-member must not read project issues")


def test_unknown_project_is_not_found(db) -> None:
    project, founder, _ = _project_with_member(db)
    other = db.query(Project).filter(Project.id != project.id).first()
    if other is None:
        return
    try:
        issues.list_issues(db, other.id, founder)
    except (ProjectAccessDeniedError, ProjectNotFoundError):
        return


def test_developer_can_only_move_issues_assigned_to_them(db) -> None:
    project, founder, developer = _project_with_member(db)
    unassigned = _issue(db, project, founder)

    try:
        issues.set_issue_status(db, unassigned.id, developer, IssueStatus.IN_PROGRESS)
    except ProjectAccessDeniedError:
        pass
    else:
        raise AssertionError("a developer must not move an issue that is not theirs")

    mine = _issue(db, project, founder, assignee=developer)
    moved = issues.set_issue_status(db, mine.id, developer, IssueStatus.IN_PROGRESS)
    assert moved.status == IssueStatus.IN_PROGRESS


def test_developer_cannot_resolve_only_send_to_review(db) -> None:
    project, founder, developer = _project_with_member(db)
    issue = _issue(db, project, founder, assignee=developer)
    issues.set_issue_status(db, issue.id, developer, IssueStatus.IN_PROGRESS)

    review = issues.set_issue_status(db, issue.id, developer, IssueStatus.IN_REVIEW)
    assert review.status == IssueStatus.IN_REVIEW
    assert IssueStatus.RESOLVED not in review.allowed_status_transitions

    try:
        issues.set_issue_status(db, issue.id, developer, IssueStatus.RESOLVED)
    except ProjectMemberConflictError:
        pass
    else:
        raise AssertionError("a developer must not resolve an issue")

    resolved = issues.set_issue_status(db, issue.id, founder, IssueStatus.RESOLVED)
    assert resolved.status == IssueStatus.RESOLVED
    assert resolved.resolved_at is not None


def test_founder_can_reopen_a_resolved_issue(db) -> None:
    project, founder, developer = _project_with_member(db)
    issue = _issue(db, project, founder, assignee=developer)
    issues.set_issue_status(db, issue.id, founder, IssueStatus.RESOLVED)
    reopened = issues.set_issue_status(db, issue.id, founder, IssueStatus.OPEN)
    assert reopened.status == IssueStatus.OPEN
    assert reopened.resolved_at is None


def test_assignee_must_be_an_accepted_member(db) -> None:
    project, founder, developer = _project_with_member(db)
    outsider = _outsider(db, project)
    if outsider is None:
        return
    try:
        issues.create_issue(
            db,
            project.id,
            founder,
            IssueCreate(title="Bad assignee", assignee_id=outsider.developer_profile.user_id),
        )
    except ProjectMemberConflictError:
        pass
    else:
        raise AssertionError("assigning a non-member must be rejected")

    invited = membership.invite_developer(
        db,
        project.id,
        founder,
        ProjectMemberInvite(
            developer_id=outsider.developer_profile.user_id,
            phase_index=0,
            amount_agreed_cents=1000,
        ),
    )
    try:
        issues.create_issue(
            db,
            project.id,
            founder,
            IssueCreate(title="Still pending", assignee_id=invited.developer_id),
        )
    except ProjectMemberConflictError:
        return
    raise AssertionError("assigning someone with a pending invite must be rejected")


def test_only_the_founder_edits_issue_fields(db) -> None:
    project, founder, developer = _project_with_member(db)
    issue = _issue(db, project, founder, assignee=developer)

    updated = issues.update_issue(db, issue.id, founder, IssueUpdate(title="Renamed by founder"))
    assert updated.title == "Renamed by founder"

    try:
        issues.update_issue(db, issue.id, developer, IssueUpdate(title="Renamed by dev"))
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a developer must not edit issue fields")


def test_clear_flags_remove_assignee_and_due_date(db) -> None:
    project, founder, developer = _project_with_member(db)
    issue = _issue(db, project, founder, assignee=developer)
    cleared = issues.update_issue(
        db, issue.id, founder, IssueUpdate(clear_assignee=True, clear_due_date=True)
    )
    assert cleared.assignee_id is None
    assert cleared.due_date is None


def test_members_and_founder_can_comment_and_only_authors_edit(db) -> None:
    project, founder, developer = _project_with_member(db)
    issue = _issue(db, project, founder, assignee=developer)

    dev_comment = issues.add_comment(db, issue.id, developer, "Reproduced on staging.")
    assert dev_comment.is_mine is True
    founder_comment = issues.add_comment(db, issue.id, founder, "Thanks — please prioritise.")
    assert founder_comment.author_id == founder.id

    edited = collaboration.update_comment(
        db, dev_comment.id, developer, "Reproduced on staging and prod."
    )
    assert edited.edited_at is not None

    try:
        collaboration.update_comment(db, founder_comment.id, developer, "hijack")
    except ProjectAccessDeniedError:
        pass
    else:
        raise AssertionError("a developer must not edit the founder's comment")

    detail = issues.get_issue(db, issue.id, developer)
    assert detail.comment_count == 2
    assert len(detail.comments) == 2

    collaboration.delete_comment(db, dev_comment.id, developer)
    after = issues.get_issue(db, issue.id, developer)
    assert after.comment_count == 1
    assert dev_comment.id not in {c.id for c in after.comments}


def test_an_outsider_cannot_comment(db) -> None:
    project, founder, _ = _project_with_member(db)
    outsider = _outsider(db, project)
    if outsider is None:
        return
    issue = _issue(db, project, founder)
    try:
        issues.add_comment(db, issue.id, outsider, "let me in")
    except ProjectAccessDeniedError:
        return
    raise AssertionError("a non-member must not comment")


def test_assignee_options_are_accepted_members_only(db) -> None:
    project, founder, developer = _project_with_member(db)
    options = issues.list_assignees(db, project.id, founder)
    accepted = {
        m.developer_id
        for m in db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.status == ProjectMemberStatus.ACCEPTED,
        )
    }
    assert {o.user_id for o in options} == accepted
    for option in options:
        assert option.phase_indices


def test_developer_sees_no_transitions_on_an_unassigned_issue(db) -> None:
    project, founder, developer = _project_with_member(db)
    issue = _issue(db, project, founder)
    listed = next(i for i in issues.list_issues(db, project.id, developer) if i.id == issue.id)
    assert listed.allowed_status_transitions == []
    assert listed.can_edit is False
    assert listed.assigned_to_me is False


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
    print("\nAll issue workflow checks passed. Nothing was left in the database.")


if __name__ == "__main__":
    _run()
