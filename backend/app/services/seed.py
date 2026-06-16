import json

CONSONANTS = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"]
VOWELS = ["A", "E", "I", "O", "U"]

COMPLEX_PAIRS = [
    "BR", "CR", "DR", "FR", "GR", "PR", "TR", "VR",
    "BL", "CL", "FL", "GL", "PL", "TL",
]

CVC_SYLLABLES_DATA = [
    ("AR",), ("ER",), ("IR",), ("OR",), ("UR",),
    ("AL",), ("EL",), ("IL",), ("OL",), ("UL",),
    ("AN",), ("EN",), ("IN",), ("ON",), ("UN",),
]

BLENDING_WORDS_DATA = [
    ("CASA", ["CA", "SA"]),
    ("BOLA", ["BO", "LA"]),
    ("GATO", ["GA", "TO"]),
    ("DADO", ["DA", "DO"]),
    ("RATO", ["RA", "TO"]),
    ("SAPO", ["SA", "PO"]),
    ("PATO", ["PA", "TO"]),
    ("FOCA", ["FO", "CA"]),
    ("BALA", ["BA", "LA"]),
    ("PRATO", ["PRA", "TO"]),
    ("JANELA", ["JA", "NE", "LA"]),
    ("CAVALO", ["CA", "VA", "LO"]),
]

WORDS_DATA = [
    "CASA", "BOLA", "GATO", "DADO", "FOCA", "BALA",
    "SOL", "MAR", "RATO", "SAPO",
    "BRASIL", "PRATO", "FLOR", "TRATOR",
    "CACHORRO", "ELEFANTE", "ABACAXI", "BORBOLETA", "GIRASSOL", "CHOCOLATE",
]

PHRASES_DATA = [
    "O GATO BEBE", "A BOLA ROLA", "O SOL BRILHA",
    "A CASA É GRANDE", "O RATO COMEU O QUEIJO",
    "A FLOR É LINDA", "MEU GATO É PRETO", "A BORBOLETA VOOU",
]

SENTENCES_DATA = [
    "O GATO BEBEU LEITE.",
    "A CASA TEM UMA PORTA VERMELHA.",
    "O MENINO JOGA A BOLA NO QUINTAL.",
    "AS FLORES DO JARDIM SÃO COLORIDAS.",
    "O CACHORRO CORRE ATRÁS DO GATO.",
    "A BORBOLETA POUSOU NA FLOR AMARELA.",
    "O SOL SE PÔS E A LUA BRILHOU.",
    "PEDRO E MARIA FORAM À ESCOLA JUNTOS.",
]

MODULES_DATA = [
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
            {"name": f"Consoante {c}", "lesson_type": "letter", "target": c, "sort_order": i + 1}
            for i, c in enumerate(CONSONANTS)
        ],
    },
    {
        "name": "Sílabas Simples",
        "module_type": "simple_syllable",
        "description": "Junte consoantes e vogais para formar sílabas",
        "sort_order": 3,
    },
    {
        "name": "Sílabas Complexas",
        "module_type": "complex_syllable",
        "description": "Aprenda sílabas com encontros consonantais",
        "sort_order": 4,
    },
    {
        "name": "Montagem Silábica",
        "module_type": "blending",
        "description": "Junte sílabas para formar palavras completas",
        "sort_order": 5,
    },
    {
        "name": "Palavras",
        "module_type": "word",
        "description": "Forme palavras completas com 2 a 3 sílabas",
        "sort_order": 6,
    },
    {
        "name": "Frases",
        "module_type": "phrase",
        "description": "Monte frases curtas e complete seu pensamento",
        "sort_order": 7,
    },
    {
        "name": "Orações",
        "module_type": "sentence",
        "description": "Escreva orações completas e leia com fluência",
        "sort_order": 8,
    },
]


def generate_simple_syllables() -> list[dict]:
    result = []
    for c in CONSONANTS:
        for v in VOWELS:
            result.append({
                "name": f"Sílaba {c}{v}",
                "lesson_type": "syllable",
                "target": f"{c}{v}",
                "sort_order": len(result) + 1,
            })
    return result


def generate_complex_syllables() -> list[dict]:
    result = []
    for pair in COMPLEX_PAIRS:
        for v in VOWELS:
            result.append({
                "name": f"Sílaba {pair}{v}",
                "lesson_type": "syllable",
                "target": f"{pair}{v}",
                "sort_order": len(result) + 1,
            })
    for i, (syl,) in enumerate(CVC_SYLLABLES_DATA):
        result.append({
            "name": f"Sílaba {syl}",
            "lesson_type": "syllable",
            "target": syl,
            "sort_order": len(result) + 1,
        })
    return result


def generate_blending_words() -> list[dict]:
    result = []
    for i, (word, syllables) in enumerate(BLENDING_WORDS_DATA):
        content = json.dumps({"syllables": syllables, "word": word})
        result.append({
            "name": f"Montar {word}",
            "lesson_type": "blending",
            "target": word,
            "content": content,
            "sort_order": i + 1,
        })
    return result


def generate_words() -> list[dict]:
    return [
        {"name": f"Palavra {w}", "lesson_type": "word", "target": w, "sort_order": i + 1}
        for i, w in enumerate(WORDS_DATA)
    ]


def generate_phrases() -> list[dict]:
    return [
        {"name": f"Frases: {p}", "lesson_type": "phrase", "target": p, "sort_order": i + 1}
        for i, p in enumerate(PHRASES_DATA)
    ]


def generate_sentences() -> list[dict]:
    return [
        {"name": f"Oração {i + 1}", "lesson_type": "sentence", "target": s, "sort_order": i + 1}
        for i, s in enumerate(SENTENCES_DATA)
    ]


def get_modules_with_lessons() -> list[dict]:
    modules = [dict(m) for m in MODULES_DATA]
    modules[2]["lessons"] = generate_simple_syllables()
    modules[3]["lessons"] = generate_complex_syllables()
    modules[4]["lessons"] = generate_blending_words()
    modules[5]["lessons"] = generate_words()
    modules[6]["lessons"] = generate_phrases()
    modules[7]["lessons"] = generate_sentences()
    return modules
