"""Seed the database with learning modules and lessons."""
from app.database import SessionLocal
from app.models.module import LearningModule, Lesson

LEVELS = [
    {
        "name": "Vogais",
        "module_type": "vowel",
        "description": "Aprenda as vogais: A, E, I, O, U",
        "sort_order": 1,
        "lessons": [
            {"name": "Vogal A", "lesson_type": "letter", "target": "A", "sort_order": 1},
            {"name": "Vogal E", "lesson_type": "letter", "target": "E", "sort_order": 2},
            {"name": "Vogal I", "lesson_type": "letter", "target": "I", "sort_order": 3},
            {"name": "Vogal O", "lesson_type": "letter", "target": "O", "sort_order": 4},
            {"name": "Vogal U", "lesson_type": "letter", "target": "U", "sort_order": 5},
            {"name": "Revisão de Vogais", "lesson_type": "review", "target": "AEIOU", "sort_order": 6},
        ],
    },
    {
        "name": "Consoantes",
        "module_type": "consonant",
        "description": "Aprenda as consoantes com imagens divertidas",
        "sort_order": 2,
        "lessons": [
            {"name": "Consoante B", "lesson_type": "letter", "target": "B", "sort_order": 1},
            {"name": "Consoante C", "lesson_type": "letter", "target": "C", "sort_order": 2},
            {"name": "Consoante D", "lesson_type": "letter", "target": "D", "sort_order": 3},
            {"name": "Consoante F", "lesson_type": "letter", "target": "F", "sort_order": 4},
            {"name": "Consoante G", "lesson_type": "letter", "target": "G", "sort_order": 5},
            {"name": "Consoante H", "lesson_type": "letter", "target": "H", "sort_order": 6},
            {"name": "Consoante J", "lesson_type": "letter", "target": "J", "sort_order": 7},
            {"name": "Consoante K", "lesson_type": "letter", "target": "K", "sort_order": 8},
            {"name": "Consoante L", "lesson_type": "letter", "target": "L", "sort_order": 9},
            {"name": "Consoante M", "lesson_type": "letter", "target": "M", "sort_order": 10},
            {"name": "Consoante N", "lesson_type": "letter", "target": "N", "sort_order": 11},
            {"name": "Consoante P", "lesson_type": "letter", "target": "P", "sort_order": 12},
            {"name": "Consoante Q", "lesson_type": "letter", "target": "Q", "sort_order": 13},
            {"name": "Consoante R", "lesson_type": "letter", "target": "R", "sort_order": 14},
            {"name": "Consoante S", "lesson_type": "letter", "target": "S", "sort_order": 15},
            {"name": "Consoante T", "lesson_type": "letter", "target": "T", "sort_order": 16},
            {"name": "Consoante V", "lesson_type": "letter", "target": "V", "sort_order": 17},
            {"name": "Consoante W", "lesson_type": "letter", "target": "W", "sort_order": 18},
            {"name": "Consoante X", "lesson_type": "letter", "target": "X", "sort_order": 19},
            {"name": "Consoante Y", "lesson_type": "letter", "target": "Y", "sort_order": 20},
            {"name": "Consoante Z", "lesson_type": "letter", "target": "Z", "sort_order": 21},
        ],
    },
    {
        "name": "Sílabas Simples",
        "module_type": "simple_syllable",
        "description": "Junte consoantes e vogais para formar sílabas",
        "sort_order": 3,
        "lessons": [],
    },
    {
        "name": "Sílabas Complexas",
        "module_type": "complex_syllable",
        "description": "Aprenda sílabas com encontros consonantais",
        "sort_order": 4,
        "lessons": [],
    },
    {
        "name": "Palavras",
        "module_type": "word",
        "description": "Forme palavras completas com 2 a 3 sílabas",
        "sort_order": 5,
        "lessons": [],
    },
    {
        "name": "Frases",
        "module_type": "phrase",
        "description": "Monte frases curtas e complete seu pensamento",
        "sort_order": 6,
        "lessons": [],
    },
    {
        "name": "Orações",
        "module_type": "sentence",
        "description": "Escreva orações completas e leia com fluência",
        "sort_order": 7,
        "lessons": [],
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(LearningModule).count()
        if existing > 0:
            print("Database already seeded. Skipping.")
            return

        consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"]
        vowels = ["A", "E", "I", "O", "U"]

        # Level 3: Simple syllables (CV)
        simple_syllables = []
        for c in consonants:
            for v in vowels:
                simple_syllables.append({
                    "name": f"Sílaba {c}{v}",
                    "lesson_type": "syllable",
                    "target": f"{c}{v}",
                    "sort_order": len(simple_syllables) + 1,
                })
        LEVELS[2]["lessons"] = simple_syllables

        # Level 4: Complex syllables
        complex_pairs = [
            "BR", "CR", "DR", "FR", "GR", "PR", "TR", "VR",
            "BL", "CL", "FL", "GL", "PL", "TL",
        ]
        complex_syllables = []
        for pair in complex_pairs:
            for v in vowels:
                complex_syllables.append({
                    "name": f"Sílaba {pair}{v}",
                    "lesson_type": "syllable",
                    "target": f"{pair}{v}",
                    "sort_order": len(complex_syllables) + 1,
                })
        # CVC syllables
        cvc_syllables = [
            {"name": "Sílaba AR", "lesson_type": "syllable", "target": "AR"},
            {"name": "Sílaba ER", "lesson_type": "syllable", "target": "ER"},
            {"name": "Sílaba IR", "lesson_type": "syllable", "target": "IR"},
            {"name": "Sílaba OR", "lesson_type": "syllable", "target": "OR"},
            {"name": "Sílaba UR", "lesson_type": "syllable", "target": "UR"},
            {"name": "Sílaba AL", "lesson_type": "syllable", "target": "AL"},
            {"name": "Sílaba EL", "lesson_type": "syllable", "target": "EL"},
            {"name": "Sílaba IL", "lesson_type": "syllable", "target": "IL"},
            {"name": "Sílaba OL", "lesson_type": "syllable", "target": "OL"},
            {"name": "Sílaba UL", "lesson_type": "syllable", "target": "UL"},
            {"name": "Sílaba AN", "lesson_type": "syllable", "target": "AN"},
            {"name": "Sílaba EN", "lesson_type": "syllable", "target": "EN"},
            {"name": "Sílaba IN", "lesson_type": "syllable", "target": "IN"},
            {"name": "Sílaba ON", "lesson_type": "syllable", "target": "ON"},
            {"name": "Sílaba UN", "lesson_type": "syllable", "target": "UN"},
        ]
        for i, s in enumerate(cvc_syllables):
            s["sort_order"] = len(complex_syllables) + i + 1
        complex_syllables.extend(cvc_syllables)
        LEVELS[3]["lessons"] = complex_syllables

        # Level 5: Words
        words = [
            {"name": "Palavra CASA", "lesson_type": "word", "target": "CASA"},
            {"name": "Palavra BOLA", "lesson_type": "word", "target": "BOLA"},
            {"name": "Palavra GATO", "lesson_type": "word", "target": "GATO"},
            {"name": "Palavra DADO", "lesson_type": "word", "target": "DADO"},
            {"name": "Palavra FOCA", "lesson_type": "word", "target": "FOCA"},
            {"name": "Palavra BALA", "lesson_type": "word", "target": "BALA"},
            {"name": "Palavra SOL", "lesson_type": "word", "target": "SOL"},
            {"name": "Palavra MAR", "lesson_type": "word", "target": "MAR"},
            {"name": "Palavra RATO", "lesson_type": "word", "target": "RATO"},
            {"name": "Palavra SAPO", "lesson_type": "word", "target": "SAPO"},
            {"name": "Palavra BRASIL", "lesson_type": "word", "target": "BRASIL"},
            {"name": "Palavra PRATO", "lesson_type": "word", "target": "PRATO"},
            {"name": "Palavra FLOR", "lesson_type": "word", "target": "FLOR"},
            {"name": "Palavra TRATOR", "lesson_type": "word", "target": "TRATOR"},
            {"name": "Palavra CACHORRO", "lesson_type": "word", "target": "CACHORRO"},
            {"name": "Palavra ELEFANTE", "lesson_type": "word", "target": "ELEFANTE"},
            {"name": "Palavra ABACAXI", "lesson_type": "word", "target": "ABACAXI"},
            {"name": "Palavra BORBOLETA", "lesson_type": "word", "target": "BORBOLETA"},
            {"name": "Palavra GIRASSOL", "lesson_type": "word", "target": "GIRASSOL"},
            {"name": "Palavra CHOCOLATE", "lesson_type": "word", "target": "CHOCOLATE"},
        ]
        for i, w in enumerate(words):
            w["sort_order"] = i + 1
        LEVELS[4]["lessons"] = words

        # Level 6: Phrases
        phrases = [
            {"name": "Frases: O GATO BEBE", "lesson_type": "phrase", "target": "O GATO BEBE"},
            {"name": "Frases: A BOLA ROLA", "lesson_type": "phrase", "target": "A BOLA ROLA"},
            {"name": "Frases: O SOL BRILHA", "lesson_type": "phrase", "target": "O SOL BRILHA"},
            {"name": "Frases: A CASA É GRANDE", "lesson_type": "phrase", "target": "A CASA É GRANDE"},
            {"name": "Frases: O RATO COMEU O QUEIJO", "lesson_type": "phrase", "target": "O RATO COMEU O QUEIJO"},
            {"name": "Frases: A FLOR É LINDA", "lesson_type": "phrase", "target": "A FLOR É LINDA"},
            {"name": "Frases: MEU GATO É PRETO", "lesson_type": "phrase", "target": "MEU GATO É PRETO"},
            {"name": "Frases: A BORBOLETA VOOU", "lesson_type": "phrase", "target": "A BORBOLETA VOOU"},
        ]
        for i, p in enumerate(phrases):
            p["sort_order"] = i + 1
        LEVELS[5]["lessons"] = phrases

        # Level 7: Sentences
        sentences = [
            {"name": "Oração 1", "lesson_type": "sentence", "target": "O GATO BEBEU LEITE."},
            {"name": "Oração 2", "lesson_type": "sentence", "target": "A CASA TEM UMA PORTA VERMELHA."},
            {"name": "Oração 3", "lesson_type": "sentence", "target": "O MENINO JOGA A BOLA NO QUINTAL."},
            {"name": "Oração 4", "lesson_type": "sentence", "target": "AS FLORES DO JARDIM SÃO COLORIDAS."},
            {"name": "Oração 5", "lesson_type": "sentence", "target": "O CACHORRO CORRE ATRÁS DO GATO."},
            {"name": "Oração 6", "lesson_type": "sentence", "target": "A BORBOLETA POUSOU NA FLOR AMARELA."},
            {"name": "Oração 7", "lesson_type": "sentence", "target": "O SOL SE PÔS E A LUA BRILHOU."},
            {"name": "Oração 8", "lesson_type": "sentence", "target": "PEDRO E MARIA FORAM À ESCOLA JUNTOS."},
        ]
        for i, s in enumerate(sentences):
            s["sort_order"] = i + 1
        LEVELS[6]["lessons"] = sentences

        for level_data in LEVELS:
            lessons = level_data.pop("lessons")
            module = LearningModule(**level_data)
            db.add(module)
            db.flush()

            for lesson_data in lessons:
                lesson = Lesson(module_id=module.id, **lesson_data)
                db.add(lesson)

        db.commit()
        print(f"Seed complete: {len(LEVELS)} modules with lessons created.")

    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
