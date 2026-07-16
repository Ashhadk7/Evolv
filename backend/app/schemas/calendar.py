from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class GoogleCalendarStatusResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    configured: bool
    connected: bool


class GoogleCalendarAuthorizeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    authorization_url: str


class CreateMeetRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participant_id: UUID
    duration_minutes: int = Field(default=30, ge=15, le=180)


class CreateMeetResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    meet_url: str
    event_url: str
