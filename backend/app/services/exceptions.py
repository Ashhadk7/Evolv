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


class AuthUserMismatchError(SignupError):
    pass


class ProfilePersistenceError(SignupError):
    pass


class NotFoundError(Exception):
    pass


class ConflictError(Exception):
    pass
