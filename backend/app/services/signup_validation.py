from app.schemas.auth import SignupRequest
from app.services.exceptions import SignupValidationError


def validate_signup(signup: SignupRequest) -> None:
    _validate_password_strength(signup.password.get_secret_value())

    if not signup.terms_accepted:
        raise SignupValidationError("Terms must be accepted before signup.")


def _validate_password_strength(password: str) -> None:
    has_lower = any(character.islower() for character in password)
    has_upper = any(character.isupper() for character in password)
    has_digit = any(character.isdigit() for character in password)

    if not (has_lower and has_upper and has_digit):
        raise SignupValidationError(
            "Password must include uppercase, lowercase, and number characters."
        )
