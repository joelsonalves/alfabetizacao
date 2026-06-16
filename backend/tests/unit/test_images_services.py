from app.services.images import (
    get_emoji_for_letter,
    get_word_image_query,
    build_fallback_image_response,
)


class TestGetEmojiForLetter:
    def test_known_letter(self):
        assert get_emoji_for_letter("a") == "🐝"

    def test_uppercase_letter(self):
        assert get_emoji_for_letter("Z") == "🦓"

    def test_unknown_letter(self):
        assert get_emoji_for_letter("1") is None


class TestGetWordImageQuery:
    def test_known_word(self):
        assert get_word_image_query("casa") == "house"

    def test_unknown_word_falls_back(self):
        assert get_word_image_query("xyzzy") == "xyzzy"


class TestBuildFallbackImageResponse:
    def test_returns_fallback_dict(self):
        result = build_fallback_image_response("casa")
        assert result["type"] == "emoji"
        assert result["word"] == "casa"
        assert "message" in result
