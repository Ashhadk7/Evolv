from app.schemas.auth import (
    DeveloperSignupDetails,
    FounderSignupDetails,
    SignupRequest,
    SignupRole,
)
from app.services.exceptions import SignupValidationError


def validate_signup(signup: SignupRequest) -> None:
    _validate_password_strength(signup.password.get_secret_value())

    if not signup.terms_accepted:
        raise SignupValidationError("Terms must be accepted before signup.")

    if signup.role == SignupRole.FOUNDER:
        require_founder_details(signup)
        if signup.developer_details is not None:
            raise SignupValidationError("Founder signup cannot include developer_details.")
        return

    require_developer_details(signup)
    if signup.founder_details is not None:
        raise SignupValidationError("Developer signup cannot include founder_details.")


def require_founder_details(signup: SignupRequest) -> FounderSignupDetails:
    if signup.founder_details is None:
        raise SignupValidationError("founder_details are required for founder signup.")
    return signup.founder_details


def require_developer_details(signup: SignupRequest) -> DeveloperSignupDetails:
    if signup.developer_details is None:
        raise SignupValidationError("developer_details are required for developer signup.")
    return signup.developer_details


def _validate_password_strength(password: str) -> None:
    has_lower = any(character.islower() for character in password)
    has_upper = any(character.isupper() for character in password)
    has_digit = any(character.isdigit() for character in password)

    if not (has_lower and has_upper and has_digit):
        raise SignupValidationError(
            "Password must include uppercase, lowercase, and number characters."
        )
