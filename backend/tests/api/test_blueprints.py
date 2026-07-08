"""Integration tests for the Blueprint CRUD module.

These tests run against an isolated in-memory SQLite database and stub out
Supabase Auth by overriding `get_current_user` directly, so no real network
calls or Supabase credentials are needed to run them.
"""

from __future__ import annotations

import datetime
import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_current_user
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import FounderProfile, User, UserRole


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = testing_session_local()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def founder_user(db_session: Session) -> User:
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="founder@example.com",
        role=UserRole.FOUNDER,
        first_name="Eman",
        last_name="Ali",
        terms_accepted_at=datetime.datetime.now(datetime.UTC),
    )
    db_session.add(user)
    db_session.flush()
    db_session.add(FounderProfile(user_id=user_id, primary_goal="find_developers"))
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def client(db_session: Session, founder_user: User) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    def override_get_current_user() -> User:
        return founder_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


VALID_VERSION_PAYLOAD = {
    "name": "Evolv",
    "industry": "SaaS",
    "idea_desc": "Founder-developer matching platform.",
    "viability": 80,
    "market_potential": 70,
    "funding_readiness": "High",
    "developer_demand": "Medium",
}


def test_create_blueprint_returns_current_version(client: TestClient) -> None:
    response = client.post(
        "/api/v1/blueprints",
        json={"visibility": "private", "initial_version": VALID_VERSION_PAYLOAD},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["visibility"] == "private"
    assert body["current_version"]["name"] == "Evolv"
    assert body["pending_version"] is None


def test_submit_pending_version_is_upsert_not_duplicate(client: TestClient) -> None:
    created = client.post(
        "/api/v1/blueprints",
        json={"visibility": "private", "initial_version": VALID_VERSION_PAYLOAD},
    ).json()
    blueprint_id = created["id"]

    first = client.post(
        f"/api/v1/blueprints/{blueprint_id}/versions",
        json={**VALID_VERSION_PAYLOAD, "name": "Evolv Draft 1"},
    )
    second = client.post(
        f"/api/v1/blueprints/{blueprint_id}/versions",
        json={**VALID_VERSION_PAYLOAD, "name": "Evolv Draft 2"},
    )

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["id"] == second.json()["id"], (
        "resubmitting a pending version should overwrite it, not create a second row"
    )

    versions = client.get(f"/api/v1/blueprints/{blueprint_id}/versions").json()
    pending_versions = [v for v in versions if v["state"] == "pending"]
    assert len(pending_versions) == 1
    assert pending_versions[0]["name"] == "Evolv Draft 2"


def test_promote_pending_version_replaces_current(client: TestClient) -> None:
    created = client.post(
        "/api/v1/blueprints",
        json={"visibility": "private", "initial_version": VALID_VERSION_PAYLOAD},
    ).json()
    blueprint_id = created["id"]

    client.post(
        f"/api/v1/blueprints/{blueprint_id}/versions",
        json={**VALID_VERSION_PAYLOAD, "name": "Evolv v2"},
    )

    promoted = client.post(f"/api/v1/blueprints/{blueprint_id}/versions/promote")
    assert promoted.status_code == 200
    assert promoted.json()["state"] == "current"
    assert promoted.json()["name"] == "Evolv v2"

    versions = client.get(f"/api/v1/blueprints/{blueprint_id}/versions").json()
    assert len(versions) == 1, "promoting should retire the old current version"
    assert versions[0]["state"] == "current"


def test_promote_without_pending_version_returns_409(client: TestClient) -> None:
    created = client.post(
        "/api/v1/blueprints",
        json={"visibility": "private", "initial_version": VALID_VERSION_PAYLOAD},
    ).json()
    blueprint_id = created["id"]

    response = client.post(f"/api/v1/blueprints/{blueprint_id}/versions/promote")
    assert response.status_code == 409


def test_get_nonexistent_blueprint_returns_404(client: TestClient) -> None:
    response = client.get(f"/api/v1/blueprints/{uuid.uuid4()}")
    assert response.status_code == 404


def test_delete_blueprint_removes_it(client: TestClient) -> None:
    created = client.post(
        "/api/v1/blueprints",
        json={"visibility": "private", "initial_version": VALID_VERSION_PAYLOAD},
    ).json()
    blueprint_id = created["id"]

    delete_response = client.delete(f"/api/v1/blueprints/{blueprint_id}")
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/blueprints/{blueprint_id}")
    assert get_response.status_code == 404


def test_update_visibility_to_public(client: TestClient) -> None:
    created = client.post(
        "/api/v1/blueprints",
        json={"visibility": "private", "initial_version": VALID_VERSION_PAYLOAD},
    ).json()
    blueprint_id = created["id"]

    response = client.patch(
        f"/api/v1/blueprints/{blueprint_id}",
        json={"visibility": "public"},
    )
    assert response.status_code == 200
    assert response.json()["visibility"] == "public"


def test_create_blueprint_rejects_out_of_range_scores(client: TestClient) -> None:
    response = client.post(
        "/api/v1/blueprints",
        json={
            "visibility": "private",
            "initial_version": {**VALID_VERSION_PAYLOAD, "viability": 150},
        },
    )
    assert response.status_code == 422
