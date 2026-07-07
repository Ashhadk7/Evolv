import pytest
from pydantic import ValidationError

from app.schemas.auth import SigninRequest


def test_signin_requires_valid_email() -> None:
    with pytest.raises(ValidationError):
        SigninRequest(email="not-an-email", password="StrongPass123")


def test_signin_requires_password() -> None:
    with pytest.raises(ValidationError):
        SigninRequest(email="founder@example.com", password="")
