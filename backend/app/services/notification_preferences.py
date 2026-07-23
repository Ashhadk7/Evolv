from __future__ import annotations

DEFAULT_NOTIFICATION_PREFERENCES: dict[str, bool] = {
    "newMatch": True,
    "developerMatch": True,
    "applicationReceived": True,
    "applicationUpdate": True,
    "messageReceived": True,
    "connectionRequest": True,
    "connectionAccepted": True,
    "blueprintPublished": True,
    "weeklyDigest": True,
    "founderViewed": False,
    "investorView": True,
    "blueprintComment": False,
    "billingAlerts": True,
    "marketingEmails": False,
    "productUpdates": False,
    "sound": True,
}


def normalize_preferences(raw: object) -> dict[str, bool]:
    stored = raw if isinstance(raw, dict) else {}
    return {
        key: bool(stored.get(key, default))
        for key, default in DEFAULT_NOTIFICATION_PREFERENCES.items()
    }
