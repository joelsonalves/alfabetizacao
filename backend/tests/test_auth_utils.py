import pytest

from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


def test_hash_and_verify_password():
    hashed = hash_password("minha-senha-segura")
    assert hashed != "minha-senha-segura"
    assert verify_password("minha-senha-segura", hashed) is True
    assert verify_password("senha-errada", hashed) is False


def test_create_access_token_without_sub():
    token = create_access_token({"email": "teste@teste.com"})
    assert token is not None
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["email"] == "teste@teste.com"
    assert payload["token_type"] == "access"
    assert "jti" in payload


def test_decode_expired_token_returns_none():
    from datetime import datetime, timedelta
    from jose import jwt
    from app.config import settings

    expired_token = jwt.encode(
        {
            "sub": "1",
            "exp": datetime.utcnow() - timedelta(hours=1),
            "jti": "test-jti",
        },
        settings.secret_key,
        algorithm="HS256",
    )

    result = decode_access_token(expired_token)
    assert result is None
