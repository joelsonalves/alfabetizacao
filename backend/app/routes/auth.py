import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, TokenBlocklist, FeatureFlag
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse, RefreshRequest, LogoutResponse
from app.services.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_access_token, validate_password, update_login_streak, revoke_token
from app.services.cleanup import clean_expired_blocklist_sync
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


def get_current_user(authorization: str = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization:
        logger.warning("401: missing Authorization header")
        raise HTTPException(status_code=401, detail="Not authenticated")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        logger.warning("401: invalid auth scheme: %s", scheme)
        raise HTTPException(status_code=401, detail="Invalid auth scheme")
    payload = decode_access_token(token)
    if payload is None:
        logger.warning("401: token decode failed (expired or malformed)")
        raise HTTPException(status_code=401, detail="Invalid token")
    jti = payload.get("jti")
    if jti:
        blocked = db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first()
        if blocked:
            logger.warning("401: token revoked (jti=%s)", jti)
            raise HTTPException(status_code=401, detail="Token revoked")
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if user is None:
        logger.warning("401: user not found for sub=%s", payload.get("sub"))
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        logger.warning("403: user %s is not admin", user.id)
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if not validate_password(data.password):
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.id, "email": user.email, "is_admin": user.is_admin}, expires_delta=timedelta(hours=settings.jwt_expiry_hours))
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email, "is_admin": user.is_admin})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    clean_expired_blocklist_sync(db)
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    today = datetime.utcnow().date()
    update_login_streak(user, today)
    db.commit()

    access_token = create_access_token({"sub": user.id, "email": user.email, "is_admin": user.is_admin}, expires_delta=timedelta(hours=settings.jwt_expiry_hours))
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email, "is_admin": user.is_admin})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserResponse.model_validate(user))


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    clean_expired_blocklist_sync(db)
    payload = decode_access_token(data.refresh_token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if payload.get("token_type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    jti = payload.get("jti")
    if jti:
        if not revoke_token(
            jti=jti,
            token_type="refresh",
            user_id=int(payload["sub"]),
            expires_at=datetime.fromtimestamp(payload["exp"]),
            db=db,
        ):
            raise HTTPException(status_code=401, detail="Refresh token revoked")
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    new_access = create_access_token({"sub": user.id, "email": user.email, "is_admin": user.is_admin}, expires_delta=timedelta(hours=settings.jwt_expiry_hours))
    new_refresh = create_refresh_token({"sub": user.id, "email": user.email, "is_admin": user.is_admin})
    return TokenResponse(access_token=new_access, refresh_token=new_refresh, user=UserResponse.model_validate(user))


@router.post("/logout", response_model=LogoutResponse)
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    clean_expired_blocklist_sync(db)
    payload = decode_access_token(data.refresh_token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    jti = payload.get("jti")
    if jti:
        revoke_token(
            jti=jti,
            token_type="refresh",
            user_id=int(payload["sub"]),
            expires_at=datetime.fromtimestamp(payload["exp"]),
            db=db,
        )
    return LogoutResponse()


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
