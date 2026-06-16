from pydantic import BaseModel


class FeatureFlagResponse(BaseModel):
    key: str
    active: bool
    behavior_on_inactive: str | None = "hide"
    description: str | None = None

    class Config:
        from_attributes = True


class FeatureFlagUpdate(BaseModel):
    active: bool | None = None
    behavior_on_inactive: str | None = None
    description: str | None = None
