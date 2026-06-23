from pydantic import BaseModel


class ScoringRuleResponse(BaseModel):
    id: int
    rule_key: str
    lesson_type: str | None = None
    value: str
    description: str | None = None
    active: bool = True

    class Config:
        from_attributes = True


class ScoringRuleUpdate(BaseModel):
    value: str


class EmojiMappingResponse(BaseModel):
    id: int
    mapping_type: str
    key: str
    emoji: str
    label: str | None = None

    class Config:
        from_attributes = True


class EmojiMappingCreate(BaseModel):
    mapping_type: str
    key: str
    emoji: str
    label: str | None = None


class EmojiMappingUpdate(BaseModel):
    emoji: str
    label: str | None = None


class AchievementDefinitionResponse(BaseModel):
    id: int
    achievement_type: str
    name: str
    description: str | None = None
    icon: str | None = None
    criteria: str | None = None
    active: bool = True

    class Config:
        from_attributes = True


class AchievementDefinitionCreate(BaseModel):
    achievement_type: str
    name: str
    description: str | None = None
    icon: str | None = None
    criteria: str | None = None
    active: bool = True


class AchievementDefinitionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None
    criteria: str | None = None
    active: bool | None = None
