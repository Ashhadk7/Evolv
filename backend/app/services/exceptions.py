from enum import StrEnum


class ErrorCode(StrEnum):
    AUTH_CONFIGURATION = "auth_configuration"
    AUTH_PROVIDER = "auth_provider"
    AUTH_USER_MISMATCH = "auth_user_mismatch"
    DUPLICATE_EMAIL = "duplicate_email"
    EMAIL_DELIVERY = "email_delivery"
    INVALID_CREDENTIALS = "invalid_credentials"
    INVALID_OTP = "invalid_otp"
    INVALID_TOKEN = "invalid_token"
    PENDING_SIGNUP_EXPIRED = "pending_signup_expired"
    PENDING_SIGNUP_NOT_FOUND = "pending_signup_not_found"
    PROFILE_PERSISTENCE = "profile_persistence"


class AppError(Exception):
    def __init__(self, code: ErrorCode, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
