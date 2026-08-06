"""The project membership lifecycle.

    invited --accept--> accepted --remove--> removed
       |  \\--decline--> declined
       \\----revoke----> revoked

Both the founder's and the developer's transitions live here so the state machine
has exactly one home.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import BackgroundTasks
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import Project, ProjectMember, ProjectMemberStatus
from app.models.user import User, UserRole
from app.repositories import developer_profiles as developer_profiles_repository
from app.repositories import projects as projects_repository
from app.repositories import users as users_repository
from app.schemas.projects import (
    DeveloperInviteResponse,
    ProjectMemberInvite,
    ProjectMemberResponse,
    ProjectPaymentRecord,
)
from app.services import notifications_service, payments
from app.services.exceptions import (
    DeveloperProfileRequiredError,
    FounderProfileRequiredError,
    ProjectAccessDeniedError,
    ProjectInvalidPhaseError,
    ProjectMemberConflictError,
    ProjectMemberNotFoundError,
    ProjectNotFoundError,
    ProjectPersistenceError,
)
from app.services.project_access import display_name, initials

DEFAULT_CURRENCY = "USD"


def _now() -> datetime:
    return datetime.now(UTC)


def _require_founder(user: User) -> UUID:
    if user.role != UserRole.FOUNDER or user.founder_profile is None:
        raise FounderProfileRequiredError("Only founders can manage project members.")
    return user.founder_profile.user_id


def _require_developer(user: User) -> UUID:
    if user.role != UserRole.DEVELOPER or user.developer_profile is None:
        raise DeveloperProfileRequiredError("Only developers can respond to project invitations.")
    return user.developer_profile.user_id


def _owned_project(db: Session, project_id: UUID, founder_id: UUID) -> Project:
    project = projects_repository.get_project_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError()
    if project.founder_id != founder_id:
        raise ProjectAccessDeniedError()
    return project


def _commit(db: Session, message: str) -> None:
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError(message) from exc


def _member_response(
    db: Session, member: ProjectMember, paid_cents: int | None = None
) -> ProjectMemberResponse:
    developer = users_repository.get_user_by_id(db, member.developer_id)
    name = display_name(developer)
    if paid_cents is None:
        paid_cents = projects_repository.sum_settled_payments_by_member(db, [member.id]).get(
            member.id, 0
        )
    return ProjectMemberResponse(
        id=member.id,
        project_id=member.project_id,
        developer_id=member.developer_id,
        developer_name=name,
        developer_initials=initials(name),
        phase_index=member.phase_index,
        status=member.status,
        amount_agreed_cents=member.amount_agreed_cents,
        amount_paid_cents=paid_cents,
        invited_at=member.invited_at,
        responded_at=member.responded_at,
        removed_at=member.removed_at,
        removal_reason=member.removal_reason,
    )


def list_members(db: Session, project_id: UUID, current_user: User) -> list[ProjectMemberResponse]:
    founder_id = _require_founder(current_user)
    _owned_project(db, project_id, founder_id)
    return _member_responses(db, projects_repository.list_members_for_project(db, project_id))


def members_by_project(
    db: Session, project_ids: list[UUID]
) -> dict[UUID, list[ProjectMemberResponse]]:
    grouped: dict[UUID, list[ProjectMemberResponse]] = {}
    for project_id in project_ids:
        grouped[project_id] = _member_responses(
            db, projects_repository.list_members_for_project(db, project_id)
        )
    return grouped


def _member_responses(db: Session, members: list[ProjectMember]) -> list[ProjectMemberResponse]:
    paid = projects_repository.sum_settled_payments_by_member(db, [m.id for m in members])
    return [_member_response(db, member, paid.get(member.id, 0)) for member in members]


def invite_developer(
    db: Session,
    project_id: UUID,
    current_user: User,
    payload: ProjectMemberInvite,
    background_tasks: BackgroundTasks | None = None,
) -> ProjectMemberResponse:
    founder_id = _require_founder(current_user)
    project = _owned_project(db, project_id, founder_id)

    phase_count = projects_repository.phase_count(project)
    if phase_count and payload.phase_index >= phase_count:
        raise ProjectInvalidPhaseError(
            f"This project has {phase_count} phase(s); phase {payload.phase_index + 1} "
            "does not exist."
        )

    known = developer_profiles_repository.get_existing_developer_ids(db, {payload.developer_id})
    if payload.developer_id not in known:
        raise ProjectMemberNotFoundError("That developer no longer exists.")

    existing = projects_repository.get_active_membership(
        db, project_id, payload.phase_index, payload.developer_id
    )
    if existing is not None:
        raise ProjectMemberConflictError(
            "That developer already has a pending or active engagement on this phase."
        )

    try:
        member = projects_repository.create_member(
            db,
            project_id=project_id,
            developer_id=payload.developer_id,
            phase_index=payload.phase_index,
            amount_agreed_cents=payload.amount_agreed_cents,
        )
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ProjectMemberConflictError(
            "That developer already has a pending or active engagement on this phase."
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("The invitation could not be saved.") from exc

    db.refresh(member)
    notifications_service.notify_project_invite(
        db, member=member, project=project, founder=current_user, background_tasks=background_tasks
    )
    return _member_response(db, member)


def _transition(
    db: Session,
    member: ProjectMember,
    status: ProjectMemberStatus,
    *,
    reason: str | None = None,
) -> None:
    member.status = status
    if status in (ProjectMemberStatus.ACCEPTED, ProjectMemberStatus.DECLINED):
        member.responded_at = _now()
    if status in (ProjectMemberStatus.REMOVED, ProjectMemberStatus.REVOKED):
        member.removed_at = _now()
        member.removal_reason = reason
    _commit(db, "The invitation could not be updated.")
    db.refresh(member)


def respond_to_invite(
    db: Session,
    member_id: UUID,
    current_user: User,
    *,
    accept: bool,
    background_tasks: BackgroundTasks | None = None,
) -> ProjectMemberResponse:
    developer_id = _require_developer(current_user)

    member = projects_repository.get_member_by_id(db, member_id)
    if member is None or member.developer_id != developer_id:
        raise ProjectMemberNotFoundError()
    if member.status != ProjectMemberStatus.INVITED:
        raise ProjectMemberConflictError(
            f"This invitation was already {member.status.value}."
        )

    _transition(
        db,
        member,
        ProjectMemberStatus.ACCEPTED if accept else ProjectMemberStatus.DECLINED,
    )

    project = projects_repository.get_project_by_id(db, member.project_id)
    if project is not None:
        notifications_service.notify_project_invite_response(
            db,
            member=member,
            project=project,
            developer=current_user,
            accepted=accept,
            background_tasks=background_tasks,
        )
    return _member_response(db, member)


def revoke_invite(db: Session, member_id: UUID, current_user: User) -> ProjectMemberResponse:
    founder_id = _require_founder(current_user)

    member = projects_repository.get_member_by_id(db, member_id)
    if member is None:
        raise ProjectMemberNotFoundError()
    _owned_project(db, member.project_id, founder_id)

    if member.status != ProjectMemberStatus.INVITED:
        raise ProjectMemberConflictError("Only a pending invitation can be revoked.")

    _transition(db, member, ProjectMemberStatus.REVOKED)
    return _member_response(db, member)


def remove_member(
    db: Session,
    member_id: UUID,
    current_user: User,
    reason: str,
    background_tasks: BackgroundTasks | None = None,
) -> ProjectMemberResponse:
    founder_id = _require_founder(current_user)

    member = projects_repository.get_member_by_id(db, member_id)
    if member is None:
        raise ProjectMemberNotFoundError()
    project = _owned_project(db, member.project_id, founder_id)

    if member.status != ProjectMemberStatus.ACCEPTED:
        raise ProjectMemberConflictError("Only an accepted member can be removed.")

    _transition(db, member, ProjectMemberStatus.REMOVED, reason=reason)
    notifications_service.notify_project_member_removed(
        db, member=member, project=project, founder=current_user, background_tasks=background_tasks
    )
    return _member_response(db, member)


def record_payment(
    db: Session,
    member_id: UUID,
    current_user: User,
    payload: ProjectPaymentRecord,
    background_tasks: BackgroundTasks | None = None,
) -> ProjectMemberResponse:
    founder_id = _require_founder(current_user)

    member = projects_repository.get_member_by_id(db, member_id)
    if member is None:
        raise ProjectMemberNotFoundError("Membership not found.")
    project = _owned_project(db, member.project_id, founder_id)

    if member.status != ProjectMemberStatus.ACCEPTED:
        raise ProjectMemberConflictError(
            "You can only pay a developer who has accepted this engagement."
        )

    provider = payments.get_provider()
    if provider.requires_onboarding(current_user):
        raise ProjectMemberConflictError(
            "Connect your payout account before sending a payment."
        )

    result = provider.create_payout(
        member_id=member.id,
        amount_cents=payload.amount_cents,
        idempotency_key=payload.idempotency_key,
    )

    try:
        projects_repository.create_payment(
            db,
            project_id=project.id,
            member_id=member.id,
            amount_cents=payload.amount_cents,
            currency=DEFAULT_CURRENCY,
            status=result.status,
            provider=result.provider,
            provider_ref=result.provider_ref,
            idempotency_key=payload.idempotency_key,
            initiated_by=current_user.id,
            failure_reason=result.failure_reason,
            settled_at=_now() if result.is_settled else None,
        )
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ProjectMemberConflictError("That payment has already been recorded.") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise ProjectPersistenceError("The payment could not be recorded.") from exc

    notifications_service.notify_project_payment(
        db,
        member=member,
        project=project,
        amount_cents=payload.amount_cents,
        background_tasks=background_tasks,
    )
    return _member_response(db, member)


def list_invites(db: Session, current_user: User) -> list[DeveloperInviteResponse]:
    developer_id = _require_developer(current_user)
    invites = projects_repository.list_pending_invites_for_developer(db, developer_id)
    if not invites:
        return []

    projects = {
        project.id: project
        for project in projects_repository.list_projects_by_ids(
            db, [invite.project_id for invite in invites]
        )
    }

    responses = []
    for invite in invites:
        project = projects.get(invite.project_id)
        if project is None:
            continue
        founder = users_repository.get_user_by_id(db, project.founder_id)
        responses.append(
            DeveloperInviteResponse(
                id=invite.id,
                project_id=project.id,
                project_title=project.title,
                founder_name=display_name(founder),
                phase_index=invite.phase_index,
                amount_agreed_cents=invite.amount_agreed_cents,
                invited_at=invite.invited_at,
            )
        )
    return responses
