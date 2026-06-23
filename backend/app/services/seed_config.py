from app.database import SessionLocal
from app.models.scoring import ScoringRule
from app.models.emoji import EmojiMapping
from app.models.achievement import AchievementDefinition


SCORING_RULES_SEED = [
    {"rule_key": "points_letter", "lesson_type": "letter", "value": "10", "description": "Pontos por completar lição de letra"},
    {"rule_key": "points_syllable", "lesson_type": "syllable", "value": "25", "description": "Pontos por completar lição de sílaba"},
    {"rule_key": "points_word", "lesson_type": "word", "value": "50", "description": "Pontos por completar lição de palavra"},
    {"rule_key": "points_blending", "lesson_type": "blending", "value": "60", "description": "Pontos por completar lição de montagem"},
    {"rule_key": "points_phrase", "lesson_type": "phrase", "value": "100", "description": "Pontos por completar lição de frase"},
    {"rule_key": "points_sentence", "lesson_type": "sentence", "value": "100", "description": "Pontos por completar lição de oração"},
    {"rule_key": "points_per_key", "lesson_type": None, "value": "10", "description": "Pontos por tecla correta"},
    {"rule_key": "timeout_letter", "lesson_type": "letter", "value": "4000", "description": "Timeout em ms para lições de letra"},
    {"rule_key": "timeout_syllable", "lesson_type": "syllable", "value": "6000", "description": "Timeout em ms para lições de sílaba"},
    {"rule_key": "timeout_word", "lesson_type": "word", "value": "8000", "description": "Timeout em ms para lições de palavra"},
    {"rule_key": "timeout_blending", "lesson_type": "blending", "value": "20000", "description": "Timeout em ms para montagem silábica"},
    {"rule_key": "timeout_phrase", "lesson_type": "phrase", "value": "20000", "description": "Timeout em ms para lições de frase"},
    {"rule_key": "timeout_sentence", "lesson_type": "sentence", "value": "20000", "description": "Timeout em ms para lições de oração"},
    {"rule_key": "tts_rate", "lesson_type": None, "value": "0.9", "description": "Taxa de fala do TTS"},
    {"rule_key": "tts_pitch", "lesson_type": None, "value": "1.0", "description": "Tom de voz do TTS"},
    {"rule_key": "xp_per_level", "lesson_type": None, "value": "500", "description": "XP necessário por nível"},
]

ACHIEVEMENTS_SEED = [
    {"achievement_type": "first_lesson", "name": "Primeira Lição!", "description": "Complete sua primeira lição", "icon": "🏆"},
    {"achievement_type": "streak_3", "name": "Dedicação", "description": "Estude por 3 dias seguidos", "icon": "🔥"},
    {"achievement_type": "streak_7", "name": "Semana Completa", "description": "Estude por 7 dias seguidos", "icon": "💪"},
    {"achievement_type": "streak_30", "name": "Mestre da Rotina", "description": "Estude por 30 dias seguidos", "icon": "👑"},
    {"achievement_type": "all_vowels", "name": "Vogais Completas", "description": "Complete todas as vogais", "icon": "🔤"},
    {"achievement_type": "all_consonants", "name": "Consoantes Completas", "description": "Complete todas as consoantes", "icon": "🔠"},
    {"achievement_type": "score_100", "name": "Nota Máxima", "description": "Tire 100 em uma lição", "icon": "💯"},
    {"achievement_type": "no_errors", "name": "Perfeição", "description": "Complete uma lição sem erros", "icon": "⭐"},
]


def seed_scoring_rules(db):
    count = 0
    for rule in SCORING_RULES_SEED:
        exists = db.query(ScoringRule).filter(ScoringRule.rule_key == rule["rule_key"]).first()
        if not exists:
            db.add(ScoringRule(**rule))
            count += 1
    db.commit()
    return count


def seed_achievement_definitions(db):
    count = 0
    for ach in ACHIEVEMENTS_SEED:
        exists = db.query(AchievementDefinition).filter(AchievementDefinition.achievement_type == ach["achievement_type"]).first()
        if not exists:
            db.add(AchievementDefinition(**ach))
            count += 1
    db.commit()
    return count


def seed_emoji_mappings_from_images(db):
    from app.services.images import EMOJI_MAP, SYLLABLE_EMOJI_MAP, WORD_EMOJI_MAP, LETTER_ASSOCIATION

    count = 0
    existing = {row.key for row in db.query(EmojiMapping).all()}

    for key, emoji in EMOJI_MAP.items():
        if key not in existing:
            db.add(EmojiMapping(mapping_type="letter", key=key, emoji=emoji, label=f"Letra {key}"))
            count += 1

    for key, emoji in SYLLABLE_EMOJI_MAP.items():
        if f"syllable:{key}" not in existing:
            entry = f"syllable:{key}"
            db.add(EmojiMapping(mapping_type="syllable", key=key, emoji=emoji, label=f"Sílaba {key}"))
            count += 1

    for key, emoji in WORD_EMOJI_MAP.items():
        entry = f"word:{key}"
        label = f"Frase: {key}" if " " in key else f"Palavra {key}"
        if entry not in existing:
            db.add(EmojiMapping(mapping_type="word", key=key, emoji=emoji, label=label))
            count += 1

    for key, word in LETTER_ASSOCIATION.items():
        entry = f"association:{key}"
        if entry not in existing:
            db.add(EmojiMapping(mapping_type="association", key=key, emoji=word, label=f"Associação {key} → {word}"))
            count += 1

    db.commit()
    return count


def seed_all(db=None):
    if db is None:
        db = SessionLocal()
    try:
        sr = seed_scoring_rules(db)
        ad = seed_achievement_definitions(db)
        em = seed_emoji_mappings_from_images(db)
        print(f"Seed concluído: {sr} scoring_rules, {ad} achievements, {em} emoji_mappings")
    finally:
        db.close()
