from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, TokenBlocklist
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse, RefreshRequest, LogoutResponse
from app.services.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_access_token
from app.services.cleanup import clean_expired_blocklist_sync

router = APIRouter()


def get_current_user(authorization: str = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid auth scheme")
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    jti = payload.get("jti")
    if jti:
        blocked = db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first()
        if blocked:
            raise HTTPException(status_code=401, detail="Token revoked")
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.id, "email": user.email}, expires_delta=timedelta(minutes=15))
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    clean_expired_blocklist_sync(db)
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    today = datetime.utcnow().date()
    if user.last_active_date:
        last = user.last_active_date.date()
        if last == today - timedelta(days=1):
            user.streak += 1
        elif last < today - timedelta(days=1):
            user.streak = 1
    else:
        user.streak = 1

    user.last_active_date = datetime.utcnow()
    db.commit()

    access_token = create_access_token({"sub": user.id, "email": user.email}, expires_delta=timedelta(minutes=15))
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email})
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
        blocked = db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first()
        if blocked:
            raise HTTPException(status_code=401, detail="Refresh token revoked")
        blocked_entry = TokenBlocklist(
            jti=jti,
            token_type="refresh",
            user_id=int(payload["sub"]),
            expires_at=datetime.fromtimestamp(payload["exp"]),
        )
        db.add(blocked_entry)
        db.commit()
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    new_access = create_access_token({"sub": user.id, "email": user.email}, expires_delta=timedelta(minutes=15))
    new_refresh = create_refresh_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=new_access, refresh_token=new_refresh, user=UserResponse.model_validate(user))


@router.post("/logout", response_model=LogoutResponse)
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    clean_expired_blocklist_sync(db)
    payload = decode_access_token(data.refresh_token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    jti = payload.get("jti")
    if jti:
        blocked = db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first()
        if not blocked:
            entry = TokenBlocklist(
                jti=jti,
                token_type="refresh",
                user_id=int(payload["sub"]),
                expires_at=datetime.fromtimestamp(payload["exp"]),
            )
            db.add(entry)
            db.commit()
    return LogoutResponse()


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
