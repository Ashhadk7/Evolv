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


class AuthUserMismatchError(SignupError):
    """The Supabase Auth user does not match the application user."""


class ProfilePersistenceError(SignupError):
    """The auth user was created, but application profile data could not be saved."""
