from datetime import datetime, date, timedelta
from uuid import uuid4
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.user import User, TokenBlocklist
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    to_encode["jti"] = str(uuid4())
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=settings.jwt_expiry_hours))
    to_encode.update({"exp": expire})
    to_encode["token_type"] = "access"
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    to_encode["jti"] = str(uuid4())
    expire = datetime.utcnow() + timedelta(hours=settings.jwt_refresh_expiry_hours)
    to_encode.update({"exp": expire})
    to_encode["token_type"] = "refresh"
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except Exception:
        return None


def get_token_jti(token: str) -> str | None:
    payload = decode_access_token(token)
    if payload:
        return payload.get("jti")
    return None


def validate_password(password: str) -> bool:
    return len(password) >= 6


def update_login_streak(user: User, today: date) -> None:
    if user.last_active_date:
        last = user.last_active_date.date() if isinstance(user.last_active_date, datetime) else user.last_active_date
        if last == today:
            return
        if last == today - timedelta(days=1):
            user.streak = (user.streak or 0) + 1
        elif last < today - timedelta(days=1):
            user.streak = 1
    else:
        user.streak = 1
    user.last_active_date = datetime.utcnow()


def revoke_token(jti: str, token_type: str, user_id: int, expires_at: datetime, db: Session) -> bool:
    blocked = db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first()
    if blocked:
        return False
    entry = TokenBlocklist(
        jti=jti,
        token_type=token_type,
        user_id=user_id,
        expires_at=expires_at,
    )
    db.add(entry)
    db.commit()
    return True
