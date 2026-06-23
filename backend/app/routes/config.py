import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.scoring import ScoringRule
from app.models.emoji import EmojiMapping
from app.models.achievement import AchievementDefinition
from app.schemas.config import (
    ScoringRuleResponse, ScoringRuleUpdate,
    EmojiMappingResponse, EmojiMappingCreate, EmojiMappingUpdate,
    AchievementDefinitionResponse, AchievementDefinitionCreate, AchievementDefinitionUpdate,
)
from app.routes.auth import require_admin
from app.services.cache import cache

logger = logging.getLogger(__name__)

router = APIRouter()


# === Scoring Rules ===

@router.get("/scoring-rules", response_model=list[ScoringRuleResponse])
def list_scoring_rules(lesson_type: str | None = None, db: Session = Depends(get_db)):
    cached = cache.get_json("scoring:all")
    if cached is not None:
        rules = [ScoringRuleResponse(**item) for item in cached]
        if lesson_type:
            rules = [
                r for r in rules
                if r.active and (r.lesson_type == lesson_type or r.lesson_type is None)
            ]
        return rules
    q = db.query(ScoringRule).filter(ScoringRule.active == True)
    if lesson_type:
        q = q.filter((ScoringRule.lesson_type == lesson_type) | (ScoringRule.lesson_type.is_(None)))
    rules = q.all()
    cache.set("scoring:all", [ScoringRuleResponse.model_validate(r).model_dump() for r in rules], ttl=settings.redis_ttl_config)
    return rules


@router.get("/admin/scoring-rules", response_model=list[ScoringRuleResponse])
def admin_list_scoring_rules(_admin=Depends(require_admin), db: Session = Depends(get_db)):
    cached = cache.get_json("scoring:admin_all")
    if cached is not None:
        return [ScoringRuleResponse(**item) for item in cached]
    rules = db.query(ScoringRule).order_by(ScoringRule.rule_key).all()
    cache.set("scoring:admin_all", [ScoringRuleResponse.model_validate(r).model_dump() for r in rules], ttl=settings.redis_ttl_config)
    return rules


@router.put("/admin/scoring-rules/{rule_key}", response_model=ScoringRuleResponse)
def update_scoring_rule(rule_key: str, data: ScoringRuleUpdate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    rule = db.query(ScoringRule).filter(ScoringRule.rule_key == rule_key).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Scoring rule not found")
    rule.value = data.value
    db.commit()
    db.refresh(rule)
    cache.delete("scoring:all", "scoring:admin_all")
    return rule


# === Emoji Mappings ===

@router.get("/admin/emoji-mappings", response_model=list[EmojiMappingResponse])
def admin_list_emoji_mappings(mapping_type: str | None = Query(None), _admin=Depends(require_admin), db: Session = Depends(get_db)):
    cache_key = f"emoji:mappings:{mapping_type or 'all'}"
    cached = cache.get_json(cache_key)
    if cached is not None:
        return [EmojiMappingResponse(**item) for item in cached]
    q = db.query(EmojiMapping)
    if mapping_type:
        q = q.filter(EmojiMapping.mapping_type == mapping_type)
    mappings = q.order_by(EmojiMapping.mapping_type, EmojiMapping.key).all()
    cache.set(cache_key, [EmojiMappingResponse.model_validate(m).model_dump() for m in mappings], ttl=settings.redis_ttl_config)
    return mappings


@router.post("/admin/emoji-mappings", response_model=EmojiMappingResponse, status_code=201)
def create_emoji_mapping(data: EmojiMappingCreate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    existing = db.query(EmojiMapping).filter(
        EmojiMapping.mapping_type == data.mapping_type,
        EmojiMapping.key == data.key,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Mapping already exists")
    mapping = EmojiMapping(**data.model_dump())
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    cache.delete_pattern("emoji:mappings:*")
    return mapping


@router.put("/admin/emoji-mappings/{mapping_id}", response_model=EmojiMappingResponse)
def update_emoji_mapping(mapping_id: int, data: EmojiMappingUpdate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    mapping = db.query(EmojiMapping).filter(EmojiMapping.id == mapping_id).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Emoji mapping not found")
    mapping.emoji = data.emoji
    if data.label is not None:
        mapping.label = data.label
    db.commit()
    db.refresh(mapping)
    cache.delete_pattern("emoji:mappings:*")
    return mapping


@router.delete("/admin/emoji-mappings/{mapping_id}", status_code=204)
def delete_emoji_mapping(mapping_id: int, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    mapping = db.query(EmojiMapping).filter(EmojiMapping.id == mapping_id).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Emoji mapping not found")
    db.delete(mapping)
    db.commit()
    cache.delete_pattern("emoji:mappings:*")


# === Achievement Definitions ===

@router.get("/admin/achievements", response_model=list[AchievementDefinitionResponse])
def admin_list_achievements(_admin=Depends(require_admin), db: Session = Depends(get_db)):
    cached = cache.get_json("achievements:all")
    if cached is not None:
        return [AchievementDefinitionResponse(**item) for item in cached]
    achievements = db.query(AchievementDefinition).order_by(AchievementDefinition.achievement_type).all()
    cache.set("achievements:all", [AchievementDefinitionResponse.model_validate(a).model_dump() for a in achievements], ttl=settings.redis_ttl_config)
    return achievements


@router.post("/admin/achievements", response_model=AchievementDefinitionResponse, status_code=201)
def create_achievement(data: AchievementDefinitionCreate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    existing = db.query(AchievementDefinition).filter(AchievementDefinition.achievement_type == data.achievement_type).first()
    if existing:
        raise HTTPException(status_code=409, detail="Achievement type already exists")
    ach = AchievementDefinition(**data.model_dump())
    db.add(ach)
    db.commit()
    db.refresh(ach)
    cache.delete("achievements:all")
    return ach


@router.put("/admin/achievements/{achievement_type}", response_model=AchievementDefinitionResponse)
def update_achievement(achievement_type: str, data: AchievementDefinitionUpdate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    ach = db.query(AchievementDefinition).filter(AchievementDefinition.achievement_type == achievement_type).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement definition not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ach, key, value)
    db.commit()
    db.refresh(ach)
    cache.delete("achievements:all")
    return ach


@router.delete("/admin/achievements/{achievement_type}", status_code=204)
def delete_achievement(achievement_type: str, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    ach = db.query(AchievementDefinition).filter(AchievementDefinition.achievement_type == achievement_type).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement definition not found")
    db.delete(ach)
    db.commit()
    cache.delete("achievements:all")
