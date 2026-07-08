class SignupError(Exception):
    """Base exception for signup failures."""


class AuthProviderConfigurationError(SignupError):
    """Supabase Auth is not configured correctly."""


class AuthProviderError(SignupError):
    """Supabase Auth rejected or failed the request."""


class DuplicateEmailError(SignupError):
    """The email already exists in application data."""


class InvalidCredentialsError(SignupError):
    """The submitted email or password is incorrect."""


class InvalidTokenError(SignupError):
    """The submitted access token is invalid or expired."""


class AuthUserMismatchError(SignupError):
    """The Supabase Auth user does not match the application user."""


class ProfilePersistenceError(SignupError):
    """The auth user was created, but application profile data could not be saved."""


class BlueprintError(Exception):
    """Base exception for blueprint failures."""


class BlueprintNotFoundError(BlueprintError):
    """The requested blueprint (or version) does not exist."""


class BlueprintAccessDeniedError(BlueprintError):
    """The current user is not allowed to view or modify this blueprint."""


class FounderProfileRequiredError(BlueprintError):
    """Only users with a founder profile can own blueprints."""


class BlueprintVersionNotFoundError(BlueprintError):
    """The requested blueprint version does not exist."""


class BlueprintPersistenceError(BlueprintError):
    """Blueprint data could not be saved due to a database error."""
