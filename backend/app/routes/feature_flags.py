import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import FeatureFlag
from app.schemas.feature_flag import FeatureFlagResponse
from app.routes.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=list[FeatureFlagResponse])
def list_feature_flags(_user=Depends(get_current_user), db: Session = Depends(get_db)):
    flags = db.query(FeatureFlag).order_by(FeatureFlag.key).all()
    return [FeatureFlagResponse.model_validate(f) for f in flags]
