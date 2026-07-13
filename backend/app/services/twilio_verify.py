from __future__ import annotations

import logging
import re

import httpx

from app.core.config import Settings
from app.services.exceptions import (
    AuthProviderConfigurationError,
    PhoneDeliveryError,
    PhoneVerificationError,
)

logger = logging.getLogger(__name__)

E164_PHONE_PATTERN = re.compile(r"^\+[1-9]\d{6,14}$")
VERIFY_BASE_URL = "https://verify.twilio.com/v2"


def normalize_phone_number(phone: str) -> str:
    compact = re.sub(r"[\s().-]", "", phone.strip())
    if compact.startswith("00"):
        compact = f"+{compact[2:]}"

    if not compact.startswith("+"):
        raise PhoneVerificationError("Include a country code, for example +923001234567.")

    if not E164_PHONE_PATTERN.fullmatch(compact):
        raise PhoneVerificationError("Enter a valid phone number with country code.")

    return compact


class TwilioVerifyClient:
    def __init__(self, settings: Settings) -> None:
        self._account_sid = (settings.TWILIO_ACCOUNT_SID or "").strip()
        self._auth_token = (
            settings.TWILIO_AUTH_TOKEN.get_secret_value().strip()
            if settings.TWILIO_AUTH_TOKEN is not None
            else ""
        )
        self._service_sid = (settings.TWILIO_VERIFY_SERVICE_SID or "").strip()
        self._channel = settings.TWILIO_VERIFY_CHANNEL.strip() or "sms"
        self._timeout = settings.TWILIO_TIMEOUT_SECONDS

    def send_verification(self, phone: str) -> None:
        self._post(
            f"/Services/{self._service_sid}/Verifications",
            data={"To": phone, "Channel": self._channel},
            failure_message="Could not send the phone verification code. Please try again.",
        )

    def check_verification(self, phone: str, code: str) -> bool:
        data = self._post(
            f"/Services/{self._service_sid}/VerificationCheck",
            data={"To": phone, "Code": code},
            failure_message="Could not verify the phone code. Please try again.",
            not_found_message=(
                "No active verification code was found. Send a new OTP and verify it within "
                "10 minutes."
            ),
        )
        return data.get("status") == "approved"

    def _post(
        self,
        path: str,
        *,
        data: dict[str, str],
        failure_message: str,
        not_found_message: str | None = None,
    ) -> dict[str, object]:
        self._ensure_configured()
        url = f"{VERIFY_BASE_URL}{path}"

        try:
            response = httpx.post(
                url,
                data=data,
                auth=(self._account_sid, self._auth_token),
                timeout=self._timeout,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = _extract_twilio_error(exc.response)
            logger.warning(
                "Twilio Verify request failed with status %s: %s",
                exc.response.status_code,
                detail,
            )
            if exc.response.status_code == 404 and not_found_message is not None:
                raise PhoneVerificationError(not_found_message) from exc
            if exc.response.status_code == 400:
                raise PhoneVerificationError(detail or failure_message) from exc
            raise PhoneDeliveryError(detail or failure_message) from exc
        except httpx.HTTPError as exc:
            logger.warning("Twilio Verify request failed: %s", exc)
            raise PhoneDeliveryError(failure_message) from exc

        return response.json()

    def _ensure_configured(self) -> None:
        if (
            _is_placeholder(self._account_sid)
            or _is_placeholder(self._auth_token)
            or _is_placeholder(self._service_sid)
        ):
            raise AuthProviderConfigurationError("Twilio Verify is not configured.")


def _is_placeholder(value: str) -> bool:
    return not value or value.startswith("YOUR_")


def _extract_twilio_error(response: httpx.Response) -> str:
    try:
        data = response.json()
    except ValueError:
        return ""
    if not isinstance(data, dict):
        return ""
    message = data.get("message")
    if isinstance(message, str) and message.strip():
        return message.strip()
    return ""
