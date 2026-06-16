import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import FeatureFlag
from app.schemas.feature_flag import FeatureFlagResponse, FeatureFlagUpdate
from app.routes.auth import require_admin

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/feature-flags", response_model=list[FeatureFlagResponse])
def list_feature_flags(_admin=Depends(require_admin), db: Session = Depends(get_db)):
    flags = db.query(FeatureFlag).order_by(FeatureFlag.key).all()
    return [FeatureFlagResponse.model_validate(f) for f in flags]


@router.patch("/feature-flags/{key}", response_model=FeatureFlagResponse)
def update_feature_flag(key: str, data: FeatureFlagUpdate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    flag = db.query(FeatureFlag).filter(FeatureFlag.key == key).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    if data.active is not None:
        flag.active = data.active
    if data.behavior_on_inactive is not None:
        flag.behavior_on_inactive = data.behavior_on_inactive
    if data.description is not None:
        flag.description = data.description
    db.commit()
    db.refresh(flag)
    return FeatureFlagResponse.model_validate(flag)
