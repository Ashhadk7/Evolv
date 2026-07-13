from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.repositories import users as users_repository
from app.core.config import settings
from app.schemas.phone import (
    PhoneSendOtpRequest,
    PhoneSendOtpResponse,
    PhoneStatusResponse,
    PhoneVerifyRequest,
    PhoneVerifyResponse,
)
from app.services.exceptions import (
    AuthProviderConfigurationError,
    PhoneDeliveryError,
    PhoneVerificationError,
)
from app.services.twilio_verify import TwilioVerifyClient, normalize_phone_number

router = APIRouter()


@router.get("/status", response_model=PhoneStatusResponse)
def get_phone_status(current_user: CurrentUser) -> PhoneStatusResponse:
    return PhoneStatusResponse(
        phone=current_user.phone,
        phone_verified=current_user.phone_verified,
    )


@router.post("/send-otp", response_model=PhoneSendOtpResponse)
def send_phone_otp(
    payload: PhoneSendOtpRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> PhoneSendOtpResponse:
    try:
        phone_number = normalize_phone_number(payload.phone)
        TwilioVerifyClient(settings).send_verification(phone_number)
    except PhoneVerificationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except AuthProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Twilio Verify is not configured.",
        ) from exc
    except PhoneDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    current_user.phone = phone_number
    current_user.phone_verified = False
    db.commit()
    db.refresh(current_user)

    return PhoneSendOtpResponse(
        phone=current_user.phone or phone_number,
        phone_verified=current_user.phone_verified,
        message="Verification code sent.",
    )


@router.post("/verify", response_model=PhoneVerifyResponse)
def verify_phone(
    payload: PhoneVerifyRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> PhoneVerifyResponse:
    try:
        phone_number = normalize_phone_number(payload.phone)
        if _normalized_current_phone(current_user.phone) != phone_number:
            raise PhoneVerificationError("Send a code to this phone number first.")
        verified = TwilioVerifyClient(settings).check_verification(phone_number, payload.otp)
    except PhoneVerificationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except AuthProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Twilio Verify is not configured.",
        ) from exc
    except PhoneDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    users_repository.set_verified_phone(db, current_user.id, phone_number)
    db.commit()

    return PhoneVerifyResponse(
        phone=phone_number,
        phone_verified=True,
        message="Phone number verified successfully.",
    )


def _normalized_current_phone(phone: str | None) -> str | None:
    if not phone:
        return None
    try:
        return normalize_phone_number(phone)
    except PhoneVerificationError:
        return None
