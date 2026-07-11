from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import AccountServiceDep, CurrentUser, DbSession
from app.schemas.account import (
    AccountProfileResponse,
    AccountProfileUpdate,
    ChangePasswordRequest,
    DeleteAccountRequest,
    MessageResponse,
)
from app.services.exceptions import (
    AuthProviderError,
    InvalidCredentialsError,
    ProfilePersistenceError,
)

router = APIRouter()


@router.get("", response_model=AccountProfileResponse)
def get_account(current_user: CurrentUser) -> AccountProfileResponse:
    return AccountProfileResponse.model_validate(current_user)


@router.patch("", response_model=AccountProfileResponse)
def update_account(
    payload: AccountProfileUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> AccountProfileResponse:
    updates = payload.model_dump(exclude_unset=True)
    if "phone" in updates and updates["phone"] != current_user.phone:
        current_user.phone_verified = False
    for field, value in updates.items():
        setattr(current_user, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(current_user)
    return AccountProfileResponse.model_validate(current_user)


@router.patch("/password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    account_service: AccountServiceDep,
) -> MessageResponse:
    try:
        account_service.change_password(current_user, payload)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        ) from exc
    except AuthProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return MessageResponse(message="Password updated successfully.")


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    payload: DeleteAccountRequest,
    db: DbSession,
    current_user: CurrentUser,
    account_service: AccountServiceDep,
) -> None:
    try:
        account_service.delete_account(db, current_user, payload)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is incorrect.",
        ) from exc
    except AuthProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ProfilePersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account could not be deleted.",
        ) from exc
