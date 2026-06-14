from datetime import datetime, timedelta
from uuid import uuid4
from jose import jwt
from passlib.context import CryptContext
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
