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


class SkillNotFoundError(Exception):
    """The requested skill, tag, or domain does not exist."""


class SkillConflictError(Exception):
    """A duplicate skill, tag, or domain name already exists."""
