import pytest
from pydantic import ValidationError

from app.schemas.auth import SignupRequest


def test_signup_requires_terms() -> None:
    with pytest.raises(ValidationError):
        SignupRequest(
            role="founder",
            email="founder@example.com",
            password="StrongPass123",
            first_name="Eman",
            last_name="Butt",
            terms_accepted=False,
        )


def test_signup_rejects_weak_password() -> None:
    with pytest.raises(ValidationError):
        SignupRequest(
            role="developer",
            email="dev@example.com",
            password="password",
            first_name="Ashhad",
            last_name="Khan",
            terms_accepted=True,
        )
