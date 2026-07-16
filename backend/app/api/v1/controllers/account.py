from __future__ import annotations

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from sqlalchemy.exc import DataError, SQLAlchemyError

from app.api.deps import AccountServiceDep, CurrentUser, DbSession
from app.schemas.account import (
    AccountProfileResponse,
    AccountProfileUpdate,
    ChangePasswordRequest,
    DeleteAccountRequest,
    MessageResponse,
)
from app.services import storage as storage_service
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
    try:
        db.commit()
    except DataError as exc:
        # The only unbounded account field is avatar_url; a length overflow here
        # means the (base64) photo is too big for the column. Return a clear,
        # specific message instead of a 500 that dumps the whole blob to the logs.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Your profile photo is too large to save. Please choose an image under 2 MB.",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="We couldn't save your changes. Please try again.",
        ) from exc
    db.refresh(current_user)
    return AccountProfileResponse.model_validate(current_user)


@router.post("/avatar", response_model=AccountProfileResponse)
async def upload_avatar(
    db: DbSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> AccountProfileResponse:
    content_type = (file.content_type or "").lower()
    if content_type not in storage_service.ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Profile photo must be a PNG, JPEG, or WebP image.",
        )
    data = await file.read()
    if len(data) > storage_service.MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Your profile photo must be smaller than 2 MB.",
        )
    try:
        current_user.avatar_url = storage_service.upload_avatar(current_user.id, data, content_type)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="We couldn't upload your photo right now. Please try again.",
        ) from exc
    db.commit()
    db.refresh(current_user)
    return AccountProfileResponse.model_validate(current_user)


@router.delete("/avatar", response_model=AccountProfileResponse)
def delete_avatar(db: DbSession, current_user: CurrentUser) -> AccountProfileResponse:
    try:
        storage_service.delete_avatar(current_user.id)
    except httpx.HTTPError:
        pass  # best-effort delete; still clear the reference below
    current_user.avatar_url = None
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
