from __future__ import annotations

import logging

from pydantic import SecretStr
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories import users as users_repository
from app.schemas.account import ChangePasswordRequest, DeleteAccountRequest
from app.schemas.auth import SigninRequest
from app.services.exceptions import ProfilePersistenceError
from app.services.supabase_auth import SupabaseAuthClient

logger = logging.getLogger(__name__)


class AccountService:
    def __init__(self, auth_client: SupabaseAuthClient) -> None:
        self._auth_client = auth_client

    def change_password(self, current_user: User, payload: ChangePasswordRequest) -> None:
        self._verify_current_password(current_user, payload.current_password)
        self._auth_client.update_password(
            current_user.id, payload.new_password.get_secret_value()
        )
        logger.info("Password changed for user %s.", current_user.id)

    def delete_account(
        self, db: Session, current_user: User, payload: DeleteAccountRequest
    ) -> None:
        self._verify_current_password(current_user, payload.password)

        try:
            users_repository.delete_user(db, current_user)
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.exception(
                "Database error while deleting account for user %s.", current_user.id
            )
            raise ProfilePersistenceError("Account could not be deleted.") from exc

        self._auth_client.delete_user(current_user.id)
        logger.info("Account deleted for user %s.", current_user.id)

    def _verify_current_password(self, current_user: User, password: SecretStr) -> None:
        self._auth_client.sign_in(SigninRequest(email=current_user.email, password=password))