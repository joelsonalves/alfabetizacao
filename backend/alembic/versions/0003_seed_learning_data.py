"""seed_learning_data

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-13
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Module 1: Vogais
    conn.execute(
        sa.text("""
            INSERT INTO learning_modules (name, module_type, description, sort_order)
            VALUES ('Vogais', 'vowel', 'Aprenda as vogais: A, E, I, O, U', 1)
        """)
    )
    conn.execute(
        sa.text("""
            INSERT INTO lessons (module_id, name, lesson_type, target, sort_order)
            VALUES
            ((SELECT id FROM learning_modules WHERE name = 'Vogais'), 'Vogal A', 'letter', 'A', 1),
            ((SELECT id FROM learning_modules WHERE name = 'Vogais'), 'Vogal E', 'letter', 'E', 2),
            ((SELECT id FROM learning_modules WHERE name = 'Vogais'), 'Vogal I', 'letter', 'I', 3),
            ((SELECT id FROM learning_modules WHERE name = 'Vogais'), 'Vogal O', 'letter', 'O', 4),
            ((SELECT id FROM learning_modules WHERE name = 'Vogais'), 'Vogal U', 'letter', 'U', 5),
            ((SELECT id FROM learning_modules WHERE name = 'Vogais'), 'Revisão de Vogais', 'review', 'AEIOU', 6)
        """)
    )

    # Module 2: Consoantes
    conn.execute(
        sa.text("""
            INSERT INTO learning_modules (name, module_type, description, sort_order)
            VALUES ('Consoantes', 'consonant', 'Aprenda as consoantes com imagens divertidas', 2)
        """)
    )
    conn.execute(
        sa.text("""
            INSERT INTO lessons (module_id, name, lesson_type, target, sort_order)
            VALUES
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante B', 'letter', 'B', 1),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante C', 'letter', 'C', 2),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante D', 'letter', 'D', 3),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante F', 'letter', 'F', 4),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante G', 'letter', 'G', 5),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante H', 'letter', 'H', 6),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante J', 'letter', 'J', 7),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante K', 'letter', 'K', 8),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante L', 'letter', 'L', 9),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante M', 'letter', 'M', 10),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante N', 'letter', 'N', 11),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante P', 'letter', 'P', 12),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante Q', 'letter', 'Q', 13),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante R', 'letter', 'R', 14),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante S', 'letter', 'S', 15),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante T', 'letter', 'T', 16),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante V', 'letter', 'V', 17),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante W', 'letter', 'W', 18),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante X', 'letter', 'X', 19),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante Y', 'letter', 'Y', 20),
            ((SELECT id FROM learning_modules WHERE name = 'Consoantes'), 'Consoante Z', 'letter', 'Z', 21)
        """)
    )

    # Module 3: Sílabas Simples
    conn.execute(
        sa.text("""
            INSERT INTO learning_modules (name, module_type, description, sort_order)
            VALUES ('Sílabas Simples', 'simple_syllable', 'Junte consoantes e vogais para formar sílabas', 3)
        """)
    )

    simple_syllables = []
    consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"]
    vowels = ["A", "E", "I", "O", "U"]
    order = 1
    for c in consonants:
        for v in vowels:
            simple_syllables.append((f"Sílaba {c}{v}", "syllable", f"{c}{v}", order))
            order += 1

    for name, lesson_type, target, sort_order in simple_syllables:
        conn.execute(
            sa.text(
                "INSERT INTO lessons (module_id, name, lesson_type, target, sort_order) "
                "VALUES ((SELECT id FROM learning_modules WHERE name = 'Sílabas Simples'), :name, :lesson_type, :target, :sort_order)"
            ),
            {"name": name, "lesson_type": lesson_type, "target": target, "sort_order": sort_order}
        )

    # Module 4: Sílabas Complexas
    conn.execute(
        sa.text("""
            INSERT INTO learning_modules (name, module_type, description, sort_order)
            VALUES ('Sílabas Complexas', 'complex_syllable', 'Aprenda sílabas com encontros consonantais', 4)
        """)
    )

    complex_pairs = [
        "BR", "CR", "DR", "FR", "GR", "PR", "TR", "VR",
        "BL", "CL", "FL", "GL", "PL", "TL",
    ]
    complex_syllables = []
    order = 1
    for pair in complex_pairs:
        for v in vowels:
            complex_syllables.append((f"Sílaba {pair}{v}", "syllable", f"{pair}{v}", order))
            order += 1

    cvc_syllables_data = [
        ("Sílaba AR", "AR"), ("Sílaba ER", "ER"), ("Sílaba IR", "IR"),
        ("Sílaba OR", "OR"), ("Sílaba UR", "UR"), ("Sílaba AL", "AL"),
        ("Sílaba EL", "EL"), ("Sílaba IL", "IL"), ("Sílaba OL", "OL"),
        ("Sílaba UL", "UL"), ("Sílaba AN", "AN"), ("Sílaba EN", "EN"),
        ("Sílaba IN", "IN"), ("Sílaba ON", "ON"), ("Sílaba UN", "UN"),
    ]
    for name, target in cvc_syllables_data:
        complex_syllables.append((name, "syllable", target, order))
        order += 1

    for name, lesson_type, target, sort_order in complex_syllables:
        conn.execute(
            sa.text(
                "INSERT INTO lessons (module_id, name, lesson_type, target, sort_order) "
                "VALUES ((SELECT id FROM learning_modules WHERE name = 'Sílabas Complexas'), :name, :lesson_type, :target, :sort_order)"
            ),
            {"name": name, "lesson_type": lesson_type, "target": target, "sort_order": sort_order}
        )

    # Module 5: Palavras
    conn.execute(
        sa.text("""
            INSERT INTO learning_modules (name, module_type, description, sort_order)
            VALUES ('Palavras', 'word', 'Forme palavras completas com 2 a 3 sílabas', 5)
        """)
    )

    words = [
        "CASA", "BOLA", "GATO", "DADO", "FOCA", "BALA", "SOL", "MAR",
        "RATO", "SAPO", "BRASIL", "PRATO", "FLOR", "TRATOR",
        "CACHORRO", "ELEFANTE", "ABACAXI", "BORBOLETA", "GIRASSOL", "CHOCOLATE",
    ]
    for i, word in enumerate(words, 1):
        conn.execute(
            sa.text(
                "INSERT INTO lessons (module_id, name, lesson_type, target, sort_order) "
                "VALUES ((SELECT id FROM learning_modules WHERE name = 'Palavras'), :name, :lesson_type, :target, :sort_order)"
            ),
            {"name": f"Palavra {word}", "lesson_type": "word", "target": word, "sort_order": i}
        )

    # Module 6: Frases
    conn.execute(
        sa.text("""
            INSERT INTO learning_modules (name, module_type, description, sort_order)
            VALUES ('Frases', 'phrase', 'Monte frases curtas e complete seu pensamento', 6)
        """)
    )

    phrases = [
        "O GATO BEBE", "A BOLA ROLA", "O SOL BRILHA", "A CASA É GRANDE",
        "O RATO COMEU O QUEIJO", "A FLOR É LINDA", "MEU GATO É PRETO", "A BORBOLETA VOOU",
    ]
    for i, phrase in enumerate(phrases, 1):
        conn.execute(
            sa.text(
                "INSERT INTO lessons (module_id, name, lesson_type, target, sort_order) "
                "VALUES ((SELECT id FROM learning_modules WHERE name = 'Frases'), :name, :lesson_type, :target, :sort_order)"
            ),
            {"name": f"Frases: {phrase}", "lesson_type": "phrase", "target": phrase, "sort_order": i}
        )

    # Module 7: Orações
    conn.execute(
        sa.text("""
            INSERT INTO learning_modules (name, module_type, description, sort_order)
            VALUES ('Orações', 'sentence', 'Escreva orações completas e leia com fluência', 7)
        """)
    )

    sentences = [
        "O GATO BEBEU LEITE.",
        "A CASA TEM UMA PORTA VERMELHA.",
        "O MENINO JOGA A BOLA NO QUINTAL.",
        "AS FLORES DO JARDIM SÃO COLORIDAS.",
        "O CACHORRO CORRE ATRÁS DO GATO.",
        "A BORBOLETA POUSOU NA FLOR AMARELA.",
        "O SOL SE PÔS E A LUA BRILHOU.",
        "PEDRO E MARIA FORAM À ESCOLA JUNTOS.",
    ]
    for i, sentence in enumerate(sentences, 1):
        conn.execute(
            sa.text(
                "INSERT INTO lessons (module_id, name, lesson_type, target, sort_order) "
                "VALUES ((SELECT id FROM learning_modules WHERE name = 'Orações'), :name, :lesson_type, :target, :sort_order)"
            ),
            {"name": f"Oração {i}", "lesson_type": "sentence", "target": sentence, "sort_order": i}
        )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM lessons WHERE module_id IN (SELECT id FROM learning_modules)"))
    conn.execute(sa.text("DELETE FROM learning_modules"))
