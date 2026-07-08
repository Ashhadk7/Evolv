import pytest
from pydantic import ValidationError

from app.schemas.auth import SignupVerifyEmailRequest


def test_signup_email_verification_requires_six_digit_otp() -> None:
    with pytest.raises(ValidationError):
        SignupVerifyEmailRequest(email="founder@example.com", otp="12345")

    with pytest.raises(ValidationError):
        SignupVerifyEmailRequest(email="founder@example.com", otp="abcdef")
