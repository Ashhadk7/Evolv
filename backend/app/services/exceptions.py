from enum import StrEnum


class ErrorCode(StrEnum):
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
    DEVELOPER_PROFILE_REQUIRED = "developer_profile_required"
    ALREADY_APPLIED = "already_applied"
    ALREADY_SAVED = "already_saved"
    APPLICATION_NOT_FOUND = "application_not_found"
    SAVED_BLUEPRINT_NOT_FOUND = "saved_blueprint_not_found"
    APPLICATION_ACCESS_DENIED = "application_access_denied"
    APPLICATION_PERSISTENCE = "application_persistence"


class AppError(Exception):
    """Base class for application errors carrying a machine-readable code."""

    def __init__(self, code: ErrorCode, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class SignupError(Exception):
    pass


class AuthProviderConfigurationError(SignupError):
    pass


class AuthProviderError(SignupError):
    pass


class DuplicateEmailError(SignupError):
    pass


class InvalidCredentialsError(SignupError):
    pass


class InvalidTokenError(SignupError):
    pass


class EmailOtpError(SignupError):
    pass


class EmailDeliveryError(SignupError):
    pass


class PhoneVerificationError(SignupError):
    pass


class PhoneDeliveryError(SignupError):
    pass


class AuthUserMismatchError(SignupError):
    pass


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


class DeveloperProfileRequiredError(AppError):
    """Only users with a developer profile can apply to or save blueprints."""

    def __init__(
        self, message: str = "Only developers with a developer profile can do this."
    ) -> None:
        super().__init__(ErrorCode.DEVELOPER_PROFILE_REQUIRED, message)


class AlreadyAppliedError(AppError):
    """The developer has already applied to this blueprint."""

    def __init__(self, message: str = "You have already applied to this blueprint.") -> None:
        super().__init__(ErrorCode.ALREADY_APPLIED, message)


class AlreadySavedError(AppError):
    """The developer has already saved this blueprint."""

    def __init__(self, message: str = "You have already saved this blueprint.") -> None:
        super().__init__(ErrorCode.ALREADY_SAVED, message)


class ApplicationNotFoundError(AppError):
    """The requested application does not exist."""

    def __init__(self, message: str = "Application not found.") -> None:
        super().__init__(ErrorCode.APPLICATION_NOT_FOUND, message)


class SavedBlueprintNotFoundError(AppError):
    """The requested saved blueprint does not exist."""

    def __init__(self, message: str = "This blueprint is not in your saved list.") -> None:
        super().__init__(ErrorCode.SAVED_BLUEPRINT_NOT_FOUND, message)


class ApplicationAccessDeniedError(AppError):
    """The current user is not allowed to view or modify this application."""

    def __init__(self, message: str = "You do not have access to this application.") -> None:
        super().__init__(ErrorCode.APPLICATION_ACCESS_DENIED, message)


class ApplicationPersistenceError(AppError):
    """Application data could not be saved due to a database error."""

    def __init__(self, message: str = "Application data could not be saved.") -> None:
        super().__init__(ErrorCode.APPLICATION_PERSISTENCE, message)


class NotFoundError(Exception):
    """A requested resource could not be found."""


class ConflictError(Exception):
    """A requested create or update operation conflicts with existing state."""
