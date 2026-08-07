from __future__ import annotations

import smtplib
import ssl
from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr
from html import escape
from typing import Protocol

import httpx

from app.core.config import Settings
from app.services.exceptions import EmailDeliveryError


class EmailSender(Protocol):
    def send_signup_otp(self, *, email: str, otp_code: str, expires_minutes: int) -> None: ...

    def send_password_reset_otp(
        self, *, email: str, otp_code: str, expires_minutes: int
    ) -> None: ...


@dataclass(frozen=True)
class OutboundEmail:
    to_email: str
    subject: str
    text: str
    html: str


def email_sender_from_settings(app_settings: Settings) -> EmailSender:
    if app_settings.EMAIL_PROVIDER == "brevo":
        return BrevoEmailSender(app_settings)
    return SmtpEmailSender(app_settings)


class SmtpEmailSender:
    def __init__(self, app_settings: Settings) -> None:
        self._settings = app_settings

    def send_signup_otp(self, *, email: str, otp_code: str, expires_minutes: int) -> None:
        payload = signup_otp_email(
            email=email,
            otp_code=otp_code,
            expires_minutes=expires_minutes,
        )
        message = EmailMessage()
        message["Subject"] = payload.subject
        message["From"] = formataddr(
            (self._settings.EMAIL_FROM_NAME, self._settings.EMAIL_FROM_EMAIL)
        )
        message["To"] = payload.to_email
        message.set_content(payload.text)
        message.add_alternative(payload.html, subtype="html")
        self._send(message=message)

    def send_password_reset_otp(self, *, email: str, otp_code: str, expires_minutes: int) -> None:
        payload = password_reset_otp_email(
            email=email, otp_code=otp_code, expires_minutes=expires_minutes
        )
        message = EmailMessage()
        message["Subject"] = payload.subject
        message["From"] = formataddr(
            (self._settings.EMAIL_FROM_NAME, self._settings.EMAIL_FROM_EMAIL)
        )
        message["To"] = payload.to_email
        message.set_content(payload.text)
        message.add_alternative(payload.html, subtype="html")
        self._send(message=message)

    def _send(self, *, message: EmailMessage) -> None:
        timeout = self._settings.SMTP_TIMEOUT_SECONDS
        port = self._settings.SMTP_PORT
        context = ssl.create_default_context()
        smtp_username = (self._settings.SMTP_USERNAME or "").strip()
        smtp_password = (
            self._settings.SMTP_PASSWORD.get_secret_value().strip()
            if self._settings.SMTP_PASSWORD
            else ""
        )
        if not smtp_username or not smtp_password:
            raise EmailDeliveryError("SMTP email sender is not configured.")

        try:
            if self._settings.SMTP_USE_SSL:
                with smtplib.SMTP_SSL(
                    self._settings.SMTP_HOST,
                    port,
                    timeout=timeout,
                    context=context,
                ) as server:
                    server.login(smtp_username, smtp_password)
                    server.send_message(message)
                return

            with smtplib.SMTP(self._settings.SMTP_HOST, port, timeout=timeout) as server:
                if self._settings.SMTP_USE_STARTTLS:
                    server.starttls(context=context)
                server.login(smtp_username, smtp_password)
                server.send_message(message)
        except smtplib.SMTPAuthenticationError as exc:
            raise EmailDeliveryError(
                "SMTP login failed. Check the SMTP username and app password."
            ) from exc
        except (OSError, smtplib.SMTPException) as exc:
            raise EmailDeliveryError(
                "Verification email could not be sent by the SMTP provider."
            ) from exc


class BrevoEmailSender:
    def __init__(self, app_settings: Settings) -> None:
        self._settings = app_settings

    def send_signup_otp(self, *, email: str, otp_code: str, expires_minutes: int) -> None:
        self._send(
            payload=signup_otp_email(
                email=email,
                otp_code=otp_code,
                expires_minutes=expires_minutes,
            )
        )

    def send_password_reset_otp(self, *, email: str, otp_code: str, expires_minutes: int) -> None:
        self._send(
            payload=password_reset_otp_email(
                email=email, otp_code=otp_code, expires_minutes=expires_minutes
            )
        )

    def _send(self, *, payload: OutboundEmail) -> None:
        api_key = (
            self._settings.BREVO_API_KEY.get_secret_value().strip()
            if self._settings.BREVO_API_KEY
            else ""
        )
        if not api_key:
            raise EmailDeliveryError("Brevo email sender is not configured.")

        url = f"{self._settings.BREVO_API_BASE_URL.rstrip('/')}/smtp/email"
        request_payload = {
            "sender": {
                "name": self._settings.EMAIL_FROM_NAME,
                "email": self._settings.EMAIL_FROM_EMAIL,
            },
            "to": [{"email": payload.to_email}],
            "subject": payload.subject,
            "textContent": payload.text,
            "htmlContent": payload.html,
        }

        try:
            with httpx.Client(timeout=self._settings.BREVO_TIMEOUT_SECONDS) as client:
                response = client.post(
                    url,
                    headers={
                        "accept": "application/json",
                        "api-key": api_key,
                        "content-type": "application/json",
                    },
                    json=request_payload,
                )
        except httpx.HTTPError as exc:
            raise EmailDeliveryError(
                "Verification email could not be sent by Brevo."
            ) from exc

        if response.status_code >= 400:
            detail = _brevo_error_detail(response)
            raise EmailDeliveryError(
                f"Brevo rejected the verification email request: {detail}"
            )


def signup_otp_email(*, email: str, otp_code: str, expires_minutes: int) -> OutboundEmail:
    return OutboundEmail(
        to_email=email,
        subject=f"{otp_code} is your Evolv verification code",
        text="\n".join(
            [
                "Your Evolv verification code",
                "",
                f"Code: {otp_code}",
                "",
                f"This code expires in {expires_minutes} minutes.",
                "If you did not sign up for Evolv, you can ignore this email.",
            ]
        ),
        html=_signup_otp_html(otp_code=otp_code, expires_minutes=expires_minutes),
    )


def password_reset_otp_email(*, email: str, otp_code: str, expires_minutes: int) -> OutboundEmail:
    return OutboundEmail(
        to_email=email,
        subject=f"{otp_code} is your Evolv password reset code",
        text="\n".join(
            [
                "Your Evolv password reset code",
                "",
                f"Code: {otp_code}",
                "",
                f"This code expires in {expires_minutes} minutes.",
                "If you did not request a password reset, you can ignore this email.",
            ]
        ),
        html=_password_reset_otp_html(otp_code=otp_code, expires_minutes=expires_minutes),
    )


def _signup_otp_html(*, otp_code: str, expires_minutes: int) -> str:
    escaped_otp = escape(otp_code)
    return f"""\
<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <h2>Your Evolv verification code</h2>
    <p>Use this 6-digit code to verify your email and finish signing up.</p>
    <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">{escaped_otp}</p>
    <p>This code expires in {expires_minutes} minutes.</p>
    <p>If you did not sign up for Evolv, you can ignore this email.</p>
  </body>
</html>
"""


def _password_reset_otp_html(*, otp_code: str, expires_minutes: int) -> str:
    escaped_otp = escape(otp_code)
    return f"""\
<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <h2>Reset your Evolv password</h2>
    <p>Use this 6-digit code to reset your password.</p>
    <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">{escaped_otp}</p>
    <p>This code expires in {expires_minutes} minutes.</p>
    <p>If you did not request a password reset, you can ignore this email.</p>
  </body>
</html>
"""


def _brevo_error_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text or f"HTTP {response.status_code}"

    if isinstance(payload, dict):
        message = payload.get("message") or payload.get("error") or payload.get("code")
        if message:
            return str(message)
    return f"HTTP {response.status_code}"
