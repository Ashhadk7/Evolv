from __future__ import annotations

import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from html import escape

from app.core.config import Settings, settings
from app.services.exceptions import EmailDeliveryConfigurationError, EmailDeliveryError


class SmtpEmailSender:
    def __init__(self, app_settings: Settings = settings) -> None:
        self._settings = app_settings

    def send_signup_otp(self, *, email: str, otp_code: str, expires_minutes: int) -> None:
        smtp_host = self._required_text(self._settings.SMTP_HOST, "SMTP_HOST")
        smtp_username = self._required_text(self._settings.SMTP_USERNAME, "SMTP_USERNAME")
        smtp_password = self._required_secret("SMTP_PASSWORD")
        from_email = self._required_text(self._settings.EMAIL_FROM_EMAIL, "EMAIL_FROM_EMAIL")

        message = EmailMessage()
        message["Subject"] = f"{otp_code} is your Evolv verification code"
        message["From"] = formataddr((self._settings.EMAIL_FROM_NAME, from_email))
        message["To"] = email
        message.set_content(
            "\n".join(
                [
                    "Your Evolv verification code",
                    "",
                    f"Code: {otp_code}",
                    "",
                    f"This code expires in {expires_minutes} minutes.",
                    "If you did not sign up for Evolv, you can ignore this email.",
                ]
            )
        )
        message.add_alternative(
            self._signup_otp_html(otp_code=otp_code, expires_minutes=expires_minutes),
            subtype="html",
        )

        self._send(
            message=message,
            smtp_host=smtp_host,
            smtp_username=smtp_username,
            smtp_password=smtp_password,
        )

    def _send(
        self,
        *,
        message: EmailMessage,
        smtp_host: str,
        smtp_username: str,
        smtp_password: str,
    ) -> None:
        timeout = self._settings.SMTP_TIMEOUT_SECONDS
        port = self._settings.SMTP_PORT
        context = ssl.create_default_context()

        try:
            if self._settings.SMTP_USE_SSL:
                with smtplib.SMTP_SSL(
                    smtp_host,
                    port,
                    timeout=timeout,
                    context=context,
                ) as server:
                    server.login(smtp_username, smtp_password)
                    server.send_message(message)
                return

            with smtplib.SMTP(smtp_host, port, timeout=timeout) as server:
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

    def _required_secret(self, setting_name: str) -> str:
        value = self._settings.SMTP_PASSWORD
        if value is None or not value.get_secret_value().strip():
            raise EmailDeliveryConfigurationError(f"{setting_name} is required.")
        return value.get_secret_value()

    @staticmethod
    def _required_text(value: str | None, setting_name: str) -> str:
        if value is None or not value.strip():
            raise EmailDeliveryConfigurationError(f"{setting_name} is required.")
        return value.strip()

    @staticmethod
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
