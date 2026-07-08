from __future__ import annotations

import json
from functools import lru_cache

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from firebase_admin.exceptions import FirebaseError

from app.core.config import settings
from app.services.exceptions import AuthProviderConfigurationError, PhoneVerificationError


@lru_cache
def _get_firebase_app() -> firebase_admin.App:
    try:
        credentials_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON.get_secret_value())
    except json.JSONDecodeError as exc:
        raise AuthProviderConfigurationError("Firebase credentials JSON is invalid.") from exc

    return firebase_admin.initialize_app(
        credentials.Certificate(credentials_dict),
        name="evolv-backend",
    )


def verify_phone_id_token(id_token: str) -> str:
    if not id_token.strip():
        raise PhoneVerificationError("Firebase ID token is required.")

    try:
        decoded_token = firebase_auth.verify_id_token(id_token, app=_get_firebase_app())
    except (ValueError, FirebaseError) as exc:
        raise PhoneVerificationError("Firebase ID token is invalid or expired.") from exc

    phone_number = decoded_token.get("phone_number")
    if not phone_number:
        raise PhoneVerificationError("Firebase ID token does not contain a verified phone number.")

    return str(phone_number)
