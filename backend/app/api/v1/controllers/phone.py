from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.repositories import users as users_repository
from app.schemas.phone import PhoneStatusResponse, PhoneVerifyRequest, PhoneVerifyResponse
from app.services.exceptions import AuthProviderConfigurationError, PhoneVerificationError
from app.services.firebase_auth import verify_phone_id_token

router = APIRouter()


@router.get("/status", response_model=PhoneStatusResponse)
def get_phone_status(current_user: CurrentUser) -> PhoneStatusResponse:
    return PhoneStatusResponse(
        phone=current_user.phone,
        phone_verified=current_user.phone_verified,
    )


@router.post("/verify", response_model=PhoneVerifyResponse)
def verify_phone(
    payload: PhoneVerifyRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> PhoneVerifyResponse:
    try:
        phone_number = verify_phone_id_token(payload.firebase_id_token)
    except PhoneVerificationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except AuthProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Auth is not configured.",
        ) from exc

    users_repository.set_verified_phone(db, current_user.id, phone_number)
    db.commit()

    return PhoneVerifyResponse(
        phone=phone_number,
        phone_verified=True,
        message="Phone number verified successfully.",
    )
