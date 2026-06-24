from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.achievement import AchievementDefinition
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.config import AchievementDefinitionPublic

router = APIRouter()


@router.get("/achievement-definitions", response_model=list[AchievementDefinitionPublic])
def list_achievement_definitions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    definitions = db.query(AchievementDefinition).filter(
        AchievementDefinition.active == True,
    ).all()
    return [AchievementDefinitionPublic.model_validate(d) for d in definitions]
