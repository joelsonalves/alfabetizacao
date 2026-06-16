from datetime import datetime

from app.utils.datetime import datetime_to_iso


class TestDatetimeToIso:
    def test_none_returns_none(self):
        assert datetime_to_iso(None) is None

    def test_datetime_converts_to_iso(self):
        dt = datetime(2024, 1, 15, 10, 30, 0)
        assert datetime_to_iso(dt) == "2024-01-15T10:30:00"

    def test_datetime_with_tz(self):
        dt = datetime(2024, 6, 1, 0, 0, 0)
        assert datetime_to_iso(dt) == "2024-06-01T00:00:00"
