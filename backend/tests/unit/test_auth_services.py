from app.services.auth import validate_password


class TestValidatePassword:
    def test_valid_password(self):
        assert validate_password("abc123") is True

    def test_too_short_password(self):
        assert validate_password("abc12") is False

    def test_empty_password(self):
        assert validate_password("") is False
