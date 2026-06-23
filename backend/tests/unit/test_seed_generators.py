from app.services.seed import (
    generate_simple_syllables,
    generate_complex_syllables,
    generate_blending_words,
    generate_words,
    generate_phrases,
    generate_sentences,
    get_modules_with_lessons,
    get_lesson_image_fields,
    CONSONANTS,
    VOWELS,
)


class TestGenerateSimpleSyllables:
    def test_returns_105_syllables(self):
        result = generate_simple_syllables()
        assert len(result) == len(CONSONANTS) * len(VOWELS)

    def test_each_has_required_keys(self):
        result = generate_simple_syllables()
        for item in result:
            assert "name" in item
            assert item["lesson_type"] == "syllable"
            assert "target" in item
            assert "sort_order" in item

    def test_first_is_BA(self):
        result = generate_simple_syllables()
        assert result[0]["target"] == "BA"


class TestGenerateComplexSyllables:
    def test_returns_multiple_syllables(self):
        result = generate_complex_syllables()
        assert len(result) > 50

    def test_includes_cvc(self):
        result = generate_complex_syllables()
        targets = [r["target"] for r in result]
        assert "AR" in targets

    def test_includes_ccv(self):
        result = generate_complex_syllables()
        targets = [r["target"] for r in result]
        assert "BRA" in targets


class TestGenerateBlendingWords:
    def test_returns_list(self):
        result = generate_blending_words()
        assert len(result) == 12

    def test_has_content_with_syllables(self):
        result = generate_blending_words()
        import json
        for item in result:
            content = json.loads(item["content"]) if isinstance(item["content"], str) else item["content"]
            assert "syllables" in content
            assert "word" in content

    def test_first_is_casa(self):
        result = generate_blending_words()
        assert result[0]["target"] == "CASA"


class TestGenerateWords:
    def test_returns_20_words(self):
        result = generate_words()
        assert len(result) == 20

    def test_all_have_lesson_type_word(self):
        result = generate_words()
        assert all(w["lesson_type"] == "word" for w in result)


class TestGeneratePhrases:
    def test_returns_8_phrases(self):
        result = generate_phrases()
        assert len(result) == 8


class TestGenerateSentences:
    def test_returns_8_sentences(self):
        result = generate_sentences()
        assert len(result) == 8


class TestGetModulesWithLessons:
    def test_returns_all_8_modules(self):
        modules = get_modules_with_lessons()
        assert len(modules) == 8

    def test_vowels_have_6_lessons(self):
        modules = get_modules_with_lessons()
        assert len(modules[0]["lessons"]) == 6

    def test_consonants_have_21_lessons(self):
        modules = get_modules_with_lessons()
        assert len(modules[1]["lessons"]) == 21


class TestGetLessonImageFields:
    def test_letter_returns_emoji(self):
        fields = get_lesson_image_fields("letter", "A")
        assert fields["image_url"] == "🐝"
        assert fields["alt_text"] == "Emoji da letra A"
        assert fields["image_active"] is True

    def test_consonant_returns_emoji(self):
        fields = get_lesson_image_fields("consonant", "P")
        assert fields["image_url"] == "🐧"
        assert fields["alt_text"] == "Emoji da letra P"

    def test_syllable_returns_emoji(self):
        fields = get_lesson_image_fields("syllable", "BA")
        assert fields["image_url"] == "🍬"
        assert fields["alt_text"] == "Emoji da sílaba BA"

    def test_word_returns_emoji(self):
        fields = get_lesson_image_fields("word", "CASA")
        assert fields["image_url"] == "🏠"

    def test_blending_returns_emoji(self):
        fields = get_lesson_image_fields("blending", "CASA")
        assert fields["image_url"] == "🏠"

    def test_phrase_returns_emoji(self):
        fields = get_lesson_image_fields("phrase", "O GATO BEBE")
        assert fields["image_url"] == "🐱"

    def test_sentence_returns_emoji(self):
        fields = get_lesson_image_fields("sentence", "O GATO BEBEU LEITE.")
        assert fields["image_url"] == "🐱"

    def test_review_has_no_image(self):
        fields = get_lesson_image_fields("review", "AEIOU")
        assert fields["image_url"] is None
        assert fields["image_active"] is True

    def test_unknown_type_has_no_image(self):
        fields = get_lesson_image_fields("unknown", "XYZ")
        assert fields["image_url"] is None
