from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, phone, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(phone.router, prefix="/phone", tags=["phone"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
