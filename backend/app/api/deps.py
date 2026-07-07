from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.auth_service import AuthService
from app.services.supabase_auth import SupabaseAuthClient

DbSession = Annotated[Session, Depends(get_db)]


def get_auth_service() -> AuthService:
    return AuthService(auth_provider=SupabaseAuthClient())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
