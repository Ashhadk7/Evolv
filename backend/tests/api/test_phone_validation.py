import pytest
from pydantic import ValidationError

from app.schemas.phone import PhoneVerifyRequest


def test_phone_verify_requires_firebase_id_token() -> None:
    with pytest.raises(ValidationError):
        PhoneVerifyRequest(firebase_id_token="")
