from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode
from uuid import UUID

import httpx
from cryptography.fernet import Fernet
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.google_calendar import GoogleCalendarCredential
from app.models.user import User
from app.repositories import users as users_repository
from app.schemas.calendar import CreateMeetResponse

CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events"


def configuration_ready() -> bool:
    return bool(
        settings.GOOGLE_CALENDAR_CLIENT_ID
        and settings.GOOGLE_CALENDAR_CLIENT_SECRET
        and settings.GOOGLE_CALENDAR_REDIRECT_URI
    )


def authorization_url(user: User) -> str:
    require_configuration()
    parameters = {
        "client_id": settings.GOOGLE_CALENDAR_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_CALENDAR_REDIRECT_URI,
        "response_type": "code",
        "scope": CALENDAR_SCOPE,
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "consent",
        "login_hint": user.email,
        "state": create_state(user.id),
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(parameters)}"


def exchange_authorization_code(db: Session, *, code: str, state_value: str) -> None:
    require_configuration()
    user_id = verify_state(state_value)
    user = users_repository.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    response = httpx.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_CALENDAR_CLIENT_ID,
            "client_secret": settings.GOOGLE_CALENDAR_CLIENT_SECRET.get_secret_value(),
            "redirect_uri": settings.GOOGLE_CALENDAR_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        timeout=20,
    )
    if response.is_error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Google Calendar authorization could not be completed.",
        )
    save_credentials(db, user_id=user.id, token_data=response.json())


def create_meet_event(
    db: Session,
    *,
    current_user: User,
    participant_id: UUID,
    duration_minutes: int,
) -> CreateMeetResponse:
    require_configuration()
    participant = users_repository.get_user_by_id(db, participant_id)
    if participant is None or participant.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")
    credential = db.get(GoogleCalendarCredential, current_user.id)
    if credential is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Connect Google Calendar before creating a Meet link.",
        )
    access_token = valid_access_token(db, credential)
    starts_at = datetime.now(UTC) + timedelta(minutes=1)
    ends_at = starts_at + timedelta(minutes=duration_minutes)
    event = {
        "summary": f"Evolv meeting with {participant.first_name} {participant.last_name}",
        "description": "Meeting created from an Evolv conversation.",
        "start": {"dateTime": starts_at.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": ends_at.isoformat(), "timeZone": "UTC"},
        "attendees": [{"email": participant.email}],
        "conferenceData": {
            "createRequest": {
                "requestId": secrets.token_urlsafe(24),
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }
    response = httpx.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        params={"conferenceDataVersion": 1, "sendUpdates": "all"},
        headers={"Authorization": f"Bearer {access_token}"},
        json=event,
        timeout=20,
    )
    if response.is_error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Google Calendar could not create the meeting.",
        )
    data = response.json()
    meet_url = data.get("hangoutLink") or next(
        (
            item.get("uri")
            for item in data.get("conferenceData", {}).get("entryPoints", [])
            if item.get("entryPointType") == "video"
        ),
        None,
    )
    if not meet_url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Google created the event without a Meet link.",
        )
    return CreateMeetResponse(meet_url=meet_url, event_url=data.get("htmlLink"))


def valid_access_token(db: Session, credential: GoogleCalendarCredential) -> str:
    if credential.expires_at > datetime.now(UTC) + timedelta(minutes=1):
        return decrypt_token(credential.access_token)
    if not credential.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Reconnect Google Calendar to create a meeting.",
        )
    response = httpx.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": settings.GOOGLE_CALENDAR_CLIENT_ID,
            "client_secret": settings.GOOGLE_CALENDAR_CLIENT_SECRET.get_secret_value(),
            "refresh_token": decrypt_token(credential.refresh_token),
            "grant_type": "refresh_token",
        },
        timeout=20,
    )
    if response.is_error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Reconnect Google Calendar to create a meeting.",
        )
    token_data = response.json()
    credential.access_token = encrypt_token(token_data["access_token"])
    credential.expires_at = datetime.now(UTC) + timedelta(seconds=token_data["expires_in"])
    db.commit()
    return str(token_data["access_token"])


def save_credentials(db: Session, *, user_id: UUID, token_data: dict[str, object]) -> None:
    credential = db.get(GoogleCalendarCredential, user_id)
    if credential is None:
        credential = GoogleCalendarCredential(
            user_id=user_id,
            access_token=encrypt_token(token_data["access_token"]),
            refresh_token=encrypt_token(token_data["refresh_token"])
            if token_data.get("refresh_token")
            else None,
            expires_at=datetime.now(UTC) + timedelta(seconds=int(token_data["expires_in"])),
            scope=str(token_data.get("scope") or CALENDAR_SCOPE),
        )
        db.add(credential)
    else:
        credential.access_token = encrypt_token(token_data["access_token"])
        if token_data.get("refresh_token"):
            credential.refresh_token = encrypt_token(token_data["refresh_token"])
        credential.expires_at = datetime.now(UTC) + timedelta(
            seconds=int(token_data["expires_in"])
        )
        credential.scope = str(token_data.get("scope") or CALENDAR_SCOPE)
    db.commit()


def create_state(user_id: UUID) -> str:
    payload = json.dumps(
        {"user_id": str(user_id), "expires_at": int((datetime.now(UTC) + timedelta(minutes=10)).timestamp())},
        separators=(",", ":"),
    ).encode()
    signature = hmac.new(settings.SECRET_KEY.encode(), payload, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(payload + signature).decode().rstrip("=")


def verify_state(value: str) -> UUID:
    try:
        decoded = base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
        payload, signature = decoded[:-32], decoded[-32:]
        expected = hmac.new(settings.SECRET_KEY.encode(), payload, hashlib.sha256).digest()
        if not hmac.compare_digest(signature, expected):
            raise ValueError
        data = json.loads(payload)
        if int(data["expires_at"]) < int(datetime.now(UTC).timestamp()):
            raise ValueError
        return UUID(data["user_id"])
    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authorization state is invalid or expired.",
        ) from exc


def require_configuration() -> None:
    if not configuration_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Calendar integration is not configured.",
        )


def token_cipher() -> Fernet:
    digest = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_token(value: object) -> str:
    return token_cipher().encrypt(str(value).encode()).decode()


def decrypt_token(value: str) -> str:
    return token_cipher().decrypt(value.encode()).decode()
