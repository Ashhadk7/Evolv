from typing import Literal

from pydantic import BaseModel, ConfigDict


class HealthCheck(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["ok"]
    service: str
    environment: str
