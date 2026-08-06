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

from app.models.project import (
    PaymentStatus,
    Project,
    ProjectMember,
    ProjectMemberStatus,
    ProjectPayment,
)
from app.models.user import User, UserRole
from app.repositories import developer_profiles as developer_profiles_repository
from app.repositories import projects as projects_repository
from app.repositories import users as users_repository
from app.schemas.projects import (
    DeveloperInviteResponse,
    ProjectPaymentCheckoutCancel,
    ProjectPaymentCheckoutSessionCreate,
    ProjectPaymentCheckoutSessionResponse,
    ProjectMemberInvite,
    ProjectMemberPaymentResponse,
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
    db: Session,
    member: ProjectMember,
    paid_cents: int | None = None,
    payment_rows: list[ProjectPayment] | None = None,
) -> ProjectMemberResponse:
    developer = users_repository.get_user_by_id(db, member.developer_id)
    name = display_name(developer)
    if payment_rows is None:
        payment_rows = projects_repository.list_payments_for_members(db, [member.id])
    if paid_cents is None:
        paid_cents = sum(
            payment.amount_cents
            for payment in payment_rows
            if payment.status == PaymentStatus.SUCCEEDED
        )
    developer_profile = member.developer
    return ProjectMemberResponse(
        id=member.id,
        project_id=member.project_id,
        developer_id=member.developer_id,
        developer_name=name,
        developer_initials=initials(name),
        phase_index=member.phase_index,
        status=member.status,
        amount_agreed_cents=member.amount_agreed_cents,
        counter_amount_cents=member.counter_amount_cents,
        amount_paid_cents=paid_cents,
        developer_stripe_ready=payments.developer_stripe_ready(developer_profile),
        developer_stripe_account_id=developer_profile.stripe_account_id
        if developer_profile is not None
        else None,
        payments=[
            ProjectMemberPaymentResponse(
                id=payment.id,
                amount_cents=payment.amount_cents,
                currency=payment.currency,
                status=payment.status,
                provider=payment.provider,
                created_at=payment.created_at,
                settled_at=payment.settled_at,
            )
            for payment in payment_rows
        ],
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
    member_ids = [m.id for m in members]
    paid = projects_repository.sum_settled_payments_by_member(db, member_ids)
    payment_rows = projects_repository.list_payments_for_members(db, member_ids)
    payments_by_member: dict[UUID, list[ProjectPayment]] = {}
    for payment in payment_rows:
        payments_by_member.setdefault(payment.member_id, []).append(payment)
    return [
        _member_response(
            db,
            member,
            paid.get(member.id, 0),
            payments_by_member.get(member.id, []),
        )
        for member in members
    ]


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


def propose_counter(
    db: Session,
    member_id: UUID,
    current_user: User,
    *,
    amount_cents: int,
    background_tasks: BackgroundTasks | None = None,
) -> ProjectMemberResponse:
    """Developer counters the founder's invite instead of accepting/declining it."""
    developer_id = _require_developer(current_user)

    member = projects_repository.get_member_by_id(db, member_id)
    if member is None or member.developer_id != developer_id:
        raise ProjectMemberNotFoundError()
    if member.status != ProjectMemberStatus.INVITED:
        raise ProjectMemberConflictError(
            f"This invitation was already {member.status.value}."
        )

    member.counter_amount_cents = amount_cents
    _transition(db, member, ProjectMemberStatus.COUNTERED)

    project = projects_repository.get_project_by_id(db, member.project_id)
    if project is not None:
        notifications_service.notify_project_invite_countered(
            db,
            member=member,
            project=project,
            developer=current_user,
            background_tasks=background_tasks,
        )
    return _member_response(db, member)


def respond_to_counter(
    db: Session,
    member_id: UUID,
    current_user: User,
    *,
    action: str,
    amount_cents: int | None = None,
    background_tasks: BackgroundTasks | None = None,
) -> ProjectMemberResponse:
    """Founder accepts, rejects, or re-counters the developer's counter-offer."""
    founder_id = _require_founder(current_user)

    member = projects_repository.get_member_by_id(db, member_id)
    if member is None:
        raise ProjectMemberNotFoundError()
    project = _owned_project(db, member.project_id, founder_id)

    if member.status != ProjectMemberStatus.COUNTERED:
        raise ProjectMemberConflictError(
            "There is no counter-offer awaiting your response on this invitation."
        )

    if action == "accept":
        member.amount_agreed_cents = member.counter_amount_cents or member.amount_agreed_cents
        member.counter_amount_cents = None
        _transition(db, member, ProjectMemberStatus.ACCEPTED)
        outcome = "accepted"
    elif action == "reject":
        member.counter_amount_cents = None
        _transition(db, member, ProjectMemberStatus.DECLINED)
        outcome = "rejected"
    elif action == "negotiate":
        if amount_cents is None:
            raise ProjectMemberConflictError("A counter amount is required to negotiate.")
        member.amount_agreed_cents = amount_cents
        member.counter_amount_cents = None
        _transition(db, member, ProjectMemberStatus.INVITED)
        outcome = "countered"
    else:
        raise ProjectMemberConflictError("Unknown action.")

    notifications_service.notify_project_counter_response(
        db,
        member=member,
        project=project,
        founder=current_user,
        outcome=outcome,
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


def create_payment_checkout_session(
    db: Session,
    member_id: UUID,
    current_user: User,
    payload: ProjectPaymentCheckoutSessionCreate,
) -> ProjectPaymentCheckoutSessionResponse:
    founder_id = _require_founder(current_user)

    member = projects_repository.get_member_by_id(db, member_id)
    if member is None:
        raise ProjectMemberNotFoundError("Membership not found.")
    project = _owned_project(db, member.project_id, founder_id)

    if member.status != ProjectMemberStatus.ACCEPTED:
        raise ProjectMemberConflictError(
            "You can only pay a developer who has accepted this engagement."
        )

    developer_profile = member.developer
    if not payments.developer_stripe_ready(developer_profile):
        raise ProjectMemberConflictError(
            f"{_member_response(db, member).developer_name} has not finished Stripe payout setup yet."
        )

    counted_cents = projects_repository.sum_payments_by_member_statuses(
        db,
        [member.id],
        (
            PaymentStatus.PENDING,
            PaymentStatus.PROCESSING,
            PaymentStatus.SUCCEEDED,
        ),
    ).get(member.id, 0)
    remaining_cents = max(0, member.amount_agreed_cents - counted_cents)
    if payload.amount_cents > remaining_cents:
        raise ProjectMemberConflictError(
            "This payment is more than the remaining amount for this phase."
        )

    result = payments.create_checkout_session(
        db,
        project_id=project.id,
        member_id=member.id,
        developer_account_id=developer_profile.stripe_account_id or "",
        developer_name=_member_response(db, member).developer_name,
        project_title=project.title,
        phase_index=member.phase_index,
        founder=current_user,
        amount_cents=payload.amount_cents,
        currency=DEFAULT_CURRENCY,
        idempotency_key=payload.idempotency_key,
        success_url=payload.success_url,
        cancel_url=payload.cancel_url,
    )
    return ProjectPaymentCheckoutSessionResponse(
        session_id=result.session_id,
        url=result.url,
    )


def sync_payment_checkout_session(
    db: Session,
    *,
    session_id: str,
    current_user: User,
    cancel_requested: bool = False,
) -> ProjectMemberResponse:
    founder_id = _require_founder(current_user)
    payment = projects_repository.get_payment_by_provider_ref(db, session_id)
    if payment is None:
        raise ProjectMemberNotFoundError("Payment session not found.")

    member = projects_repository.get_member_by_id(db, payment.member_id)
    if member is None:
        raise ProjectMemberNotFoundError("Membership not found.")
    _owned_project(db, member.project_id, founder_id)

    payments.sync_checkout_session(db, session_id=session_id, cancel_requested=cancel_requested)
    db.refresh(member)
    return _member_response(db, member)


def cancel_payment_checkout_session(
    db: Session,
    *,
    current_user: User,
    payload: ProjectPaymentCheckoutCancel,
) -> ProjectMemberResponse:
    founder_id = _require_founder(current_user)
    payment = projects_repository.get_payment_by_idempotency_key(db, payload.idempotency_key)
    if payment is None:
        raise ProjectMemberNotFoundError("Payment session not found.")

    member = projects_repository.get_member_by_id(db, payment.member_id)
    if member is None:
        raise ProjectMemberNotFoundError("Membership not found.")
    _owned_project(db, member.project_id, founder_id)

    if payment.provider_ref:
        payments.sync_checkout_session(
            db,
            session_id=payment.provider_ref,
            cancel_requested=True,
        )
    else:
        projects_repository.update_payment_status(
            payment,
            status=PaymentStatus.CANCELLED,
            failure_reason="Checkout was cancelled before payment.",
            settled_at=None,
        )
        _commit(db, "Payment status could not be updated.")

    db.refresh(member)
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
                status=invite.status,
                amount_agreed_cents=invite.amount_agreed_cents,
                counter_amount_cents=invite.counter_amount_cents,
                invited_at=invite.invited_at,
            )
        )
    return responses
