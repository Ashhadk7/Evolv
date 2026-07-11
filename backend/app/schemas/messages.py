from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.messaging import ConnectionStatus
from app.schemas.auth import SignupRole


class MessageParticipant(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    role: SignupRole
    first_name: str
    last_name: str
    avatar_url: str | None = None
    profile_title: str | None = None
    profile_complete: bool
    phone_verified: bool


class MessageParticipantLookupResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participant: MessageParticipant


class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    conversation_id: UUID
    sender_id: UUID
    recipient_id: UUID
    body: str
    read_at: datetime | None = None
    created_at: datetime


class ConversationSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    status: ConnectionStatus
    participant: MessageParticipant
    last_message: MessageResponse | None
    unread_count: int
    created_at: datetime
    updated_at: datetime


class ConversationListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[ConversationSummary]


class InboxResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversations: list[ConversationSummary]
    requests: list[ConversationSummary]
    pending: list[ConversationSummary]


class PresenceResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    online_user_ids: list[UUID]


class MessageListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversation: ConversationSummary
    items: list[MessageResponse]


class SendMessageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recipient_id: UUID
    body: str = Field(min_length=1, max_length=4000)

    @field_validator("body")
    @classmethod
    def strip_body(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Message cannot be blank.")
        return stripped


class RequestActionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversation: ConversationSummary
    message: str


class MarkReadResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversation_id: UUID
    marked_read: int
