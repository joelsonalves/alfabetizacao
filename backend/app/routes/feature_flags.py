import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import FeatureFlag
from app.schemas.feature_flag import FeatureFlagResponse
from app.routes.auth import get_current_user
from app.services.cache import cache

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=list[FeatureFlagResponse])
def list_feature_flags(_user=Depends(get_current_user), db: Session = Depends(get_db)):
    cached = cache.get_json("feature_flags:all")
    if cached is not None:
        return [FeatureFlagResponse(**item) for item in cached]
    flags = db.query(FeatureFlag).order_by(FeatureFlag.key).all()
    cache.set("feature_flags:all", [FeatureFlagResponse.model_validate(f).model_dump() for f in flags], ttl=settings.redis_ttl_config)
    return [FeatureFlagResponse.model_validate(f) for f in flags]
