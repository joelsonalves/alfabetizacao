from app.services.images import (
    get_emoji_for_letter,
    get_word_image_query,
    get_emoji_for_word,
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


class TestGetEmojiForWord:
    def test_known_word(self):
        assert get_emoji_for_word("CASA") == "🏠"

    def test_lowercase_word(self):
        assert get_emoji_for_word("bola") == "⚽"

    def test_word_with_dot(self):
        assert get_emoji_for_word("o gato bebeu leite.") == "🐱"

    def test_unknown_word(self):
        assert get_emoji_for_word("xyzzy") is None


class TestBuildFallbackImageResponse:
    def test_returns_emoji_for_known_word(self):
        result = build_fallback_image_response("casa")
        assert result["type"] == "emoji"
        assert result["value"] == "🏠"
        assert result["word"] == "casa"
        assert "message" not in result

    def test_returns_fallback_for_unknown_word(self):
        result = build_fallback_image_response("xyzzy")
        assert result["type"] == "emoji"
        assert result["word"] == "xyzzy"
        assert "message" in result
