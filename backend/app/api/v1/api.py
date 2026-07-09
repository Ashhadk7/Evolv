from fastapi import APIRouter

from app.api.v1.controllers import (
    auth,
    connections,
    developer_profiles,
    domains,
    founder_profiles,
    health,
    me,
    messages,
    phone,
    skills,
    tags,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    founder_profiles.router, prefix="/founder-profile", tags=["founder-profile"]
)
api_router.include_router(
    developer_profiles.router, prefix="/developer-profile", tags=["developer-profile"]
)
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(phone.router, prefix="/phone", tags=["phone"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(domains.router, prefix="/domains", tags=["domains"])
api_router.include_router(me.router, prefix="/me", tags=["me"])
api_router.include_router(connections.router, prefix="/connections", tags=["connections"])
