from fastapi import APIRouter, status

from app.api.deps import CurrentFounder, DbSession
from app.schemas.founder_profiles import (
    FounderProfileCreate,
    FounderProfileResponse,
    FounderProfileUpdate,
)
from app.services import founder_profiles as founder_profile_service

router = APIRouter()


@router.post("", response_model=FounderProfileResponse, status_code=status.HTTP_201_CREATED)
def create_founder_profile(
    payload: FounderProfileCreate, db: DbSession, current_user: CurrentFounder
) -> FounderProfileResponse:
    return founder_profile_service.create_profile(db, payload, current_user)


@router.get("", response_model=FounderProfileResponse)
def get_my_founder_profile(db: DbSession, current_user: CurrentFounder) -> FounderProfileResponse:
    return founder_profile_service.get_profile(db, current_user)


@router.patch("", response_model=FounderProfileResponse)
def update_founder_profile(
    payload: FounderProfileUpdate, db: DbSession, current_user: CurrentFounder
) -> FounderProfileResponse:
    return founder_profile_service.update_profile(db, payload, current_user)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_founder_profile(db: DbSession, current_user: CurrentFounder) -> None:
    founder_profile_service.delete_profile(db, current_user)
