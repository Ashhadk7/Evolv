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
