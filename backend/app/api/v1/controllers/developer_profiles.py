from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.developer_profiles import (
    DeveloperProfileCreate,
    DeveloperProfileResponse,
    DeveloperProfileUpdate,
)
from app.services import developer_profiles as developer_profile_service

router = APIRouter()


@router.post("", response_model=DeveloperProfileResponse, status_code=status.HTTP_201_CREATED)
def create_developer_profile(
    payload: DeveloperProfileCreate, db: DbSession, current_user: CurrentUser
) -> DeveloperProfileResponse:
    return developer_profile_service.create_profile(db, payload, current_user)


@router.get("", response_model=DeveloperProfileResponse)
def get_my_developer_profile(db: DbSession, current_user: CurrentUser) -> DeveloperProfileResponse:
    return developer_profile_service.get_profile(db, current_user)


@router.patch("", response_model=DeveloperProfileResponse)
def update_developer_profile(
    payload: DeveloperProfileUpdate, db: DbSession, current_user: CurrentUser
) -> DeveloperProfileResponse:
    return developer_profile_service.update_profile(db, payload, current_user)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_developer_profile(db: DbSession, current_user: CurrentUser) -> None:
    developer_profile_service.delete_profile(db, current_user)
