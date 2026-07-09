from enum import Enum


class ErrorCode(str, Enum):
    AUTH_CONFIGURATION = "auth_configuration"
    AUTH_PROVIDER = "auth_provider"
    AUTH_USER_MISMATCH = "auth_user_mismatch"
    DUPLICATE_EMAIL = "duplicate_email"
    EMAIL_DELIVERY = "email_delivery"
    EMAIL_NOT_VERIFIED = "email_not_verified"
    INVALID_CREDENTIALS = "invalid_credentials"
    INVALID_OTP = "invalid_otp"
    INVALID_TOKEN = "invalid_token"
    PROFILE_PERSISTENCE = "profile_persistence"
    SIGNUP_EXPIRED = "signup_expired"
    SIGNUP_NOT_FOUND = "signup_not_found"
    BLUEPRINT_NOT_FOUND = "blueprint_not_found"
    BLUEPRINT_ACCESS_DENIED = "blueprint_access_denied"
    BLUEPRINT_PERSISTENCE = "blueprint_persistence"
    BLUEPRINT_VERSION_NOT_FOUND = "blueprint_version_not_found"
    FOUNDER_PROFILE_REQUIRED = "founder_profile_required"
    NO_PENDING_VERSION = "no_pending_version"


class AppError(Exception):
    """Compatibility base error used by the API error handlers."""

    def __init__(self, code: ErrorCode, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


class SignupError(Exception):
    """Base exception for signup and auth failures."""


class AuthProviderConfigurationError(SignupError):
    """External auth provider settings are not configured correctly."""


class AuthProviderError(SignupError):
    """Supabase Auth rejected or failed the request."""


class DuplicateEmailError(SignupError):
    """The email already exists in application data."""


class InvalidCredentialsError(SignupError):
    """The submitted email or password is incorrect."""


class InvalidTokenError(SignupError):
    """The submitted access token is invalid or expired."""


class EmailOtpError(SignupError):
    """Email OTP generation or verification failed."""


class EmailDeliveryError(SignupError):
    """The verification email could not be sent."""


class PhoneVerificationError(SignupError):
    """The Firebase phone ID token is invalid, expired, or missing a phone number."""


class AuthUserMismatchError(SignupError):
    """The Supabase Auth user does not match the application user."""


class ProfilePersistenceError(SignupError):
    """The auth user was created, but application profile data could not be saved."""


class BlueprintNotFoundError(AppError):
    """The requested blueprint (or version) does not exist."""

    def __init__(self, message: str = "Blueprint not found.") -> None:
        super().__init__(ErrorCode.BLUEPRINT_NOT_FOUND, message)


class BlueprintAccessDeniedError(AppError):
    """The current user is not allowed to view or modify this blueprint."""

    def __init__(self, message: str = "You do not have access to this blueprint.") -> None:
        super().__init__(ErrorCode.BLUEPRINT_ACCESS_DENIED, message)


class FounderProfileRequiredError(AppError):
    """Only users with a founder profile can own blueprints."""

    def __init__(
        self, message: str = "Only founders with a founder profile can own blueprints."
    ) -> None:
        super().__init__(ErrorCode.FOUNDER_PROFILE_REQUIRED, message)


class BlueprintVersionNotFoundError(AppError):
    """The requested blueprint version does not exist."""

    def __init__(self, message: str = "Blueprint version not found.") -> None:
        super().__init__(ErrorCode.BLUEPRINT_VERSION_NOT_FOUND, message)


class BlueprintPersistenceError(AppError):
    """Blueprint data could not be saved due to a database error."""

    def __init__(self, message: str = "Blueprint data could not be saved.") -> None:
        super().__init__(ErrorCode.BLUEPRINT_PERSISTENCE, message)


class NoPendingVersionError(AppError):
    """There is no pending version available to promote to current."""

    def __init__(self, message: str = "There is no pending version to promote.") -> None:
        super().__init__(ErrorCode.NO_PENDING_VERSION, message)
