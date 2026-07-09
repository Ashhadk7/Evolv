from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DbSession, get_current_user
from app.models.user import UserRole
from app.repositories import users as users_repository
from app.schemas.auth import SignupRole
from app.schemas.users import UserListResponse, UserSummary

router = APIRouter(dependencies=[Depends(get_current_user)])

RoleFilter = Annotated[SignupRole | None, Query()]
SearchFilter = Annotated[str | None, Query(min_length=1, max_length=100)]
LimitFilter = Annotated[int, Query(ge=1, le=100)]
OffsetFilter = Annotated[int, Query(ge=0)]


@router.get("", response_model=UserListResponse)
def list_users(
    db: DbSession,
    role: RoleFilter = None,
    search: SearchFilter = None,
    limit: LimitFilter = 50,
    offset: OffsetFilter = 0,
) -> UserListResponse:
    users, total = users_repository.list_users(
        db,
        role=UserRole(role.value) if role else None,
        search=search,
        limit=limit,
        offset=offset,
    )
    return UserListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=[UserSummary.model_validate(user) for user in users],
    )


@router.get("/{user_id}", response_model=UserSummary)
def get_user(user_id: UUID, db: DbSession) -> UserSummary:
    user = users_repository.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return UserSummary.model_validate(user)
