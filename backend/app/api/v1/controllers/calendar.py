from fastapi import APIRouter, Query
from fastapi.responses import HTMLResponse

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.schemas.calendar import (
    CreateMeetRequest,
    CreateMeetResponse,
    GoogleCalendarAuthorizeResponse,
    GoogleCalendarStatusResponse,
)
from app.services import google_calendar

router = APIRouter()


@router.get("/google/status", response_model=GoogleCalendarStatusResponse)
def calendar_status(db: DbSession, current_user: CurrentUser) -> GoogleCalendarStatusResponse:
    return GoogleCalendarStatusResponse(
        configured=google_calendar.configuration_ready(),
        connected=current_user.google_calendar_credential is not None,
    )


@router.get("/google/authorize", response_model=GoogleCalendarAuthorizeResponse)
def authorize_google_calendar(current_user: CurrentUser) -> GoogleCalendarAuthorizeResponse:
    return GoogleCalendarAuthorizeResponse(
        authorization_url=google_calendar.authorization_url(current_user)
    )


@router.get("/google/callback", include_in_schema=False)
def google_calendar_callback(
    db: DbSession,
    code: str = Query(min_length=1),
    state: str = Query(min_length=1),
) -> HTMLResponse:
    google_calendar.exchange_authorization_code(db, code=code, state_value=state)
    frontend_origin = settings.GOOGLE_CALENDAR_FRONTEND_RETURN_URL.rstrip("/")
    return HTMLResponse(
        "<script>"
        f"window.opener?.postMessage({{type:'evolv.google-calendar.connected'}}, "
        f"'{frontend_origin}');"
        "window.close();"
        "</script><p>Google Calendar connected. You can close this window.</p>"
    )


@router.post("/google/meet", response_model=CreateMeetResponse)
def create_google_meet(
    payload: CreateMeetRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> CreateMeetResponse:
    return google_calendar.create_meet_event(
        db,
        current_user=current_user,
        participant_id=payload.participant_id,
        duration_minutes=payload.duration_minutes,
    )
