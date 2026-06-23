import httpx


EMOJI_MAP = {
    "A": "🐝", "B": "🏀", "C": "🐶", "D": "🎲", "E": "⭐",
    "F": "🔥", "G": "🐱", "H": "🏥", "I": "🦎", "J": "🐊",
    "K": "🥝", "L": "🍋", "M": "🍎", "N": "🎵", "O": "👁️",
    "P": "🐧", "Q": "🧀", "R": "🐀", "S": "☀️", "T": "🐢",
    "U": "🦄", "V": "🐄", "W": "🐺", "X": "❌", "Y": "🪀", "Z": "🦓",
}

WORD_IMAGE_QUERIES = {
    "casa": "house", "bola": "ball", "gato": "cat", "dado": "dice",
    "foca": "seal", "bala": "candy", "bebe": "baby", "bicho": "bug",
    "burro": "donkey", "braco": "arm", "creme": "cream", "gato bebe": "cat drinking",
    "o gato bebe": "cat drinking milk",
}

SYLLABLE_EMOJI_MAP = {
    # B
    "BA": "🍬", "BE": "👶", "BI": "🚲", "BO": "⚽", "BU": "🐴",
    # C
    "CA": "🏠", "CE": "🌤️", "CI": "🎬", "CO": "🐍", "CU": "🧊",
    # D
    "DA": "🎲", "DE": "🦷", "DI": "💰", "DO": "🍩", "DU": "🚿",
    # F
    "FA": "🔪", "FE": "🌾", "FI": "🎀", "FO": "🦭", "FU": "💨",
    # G
    "GA": "🐱", "GE": "🧊", "GI": "🦒", "GO": "🐬", "GU": "☂️",
    # H
    "HA": "🍔", "HE": "🚁", "HI": "🦛", "HO": "👨",
    # J
    "JA": "🪟", "JO": "📰", "JU": "🥋",
    # L
    "LA": "🍊", "LE": "🦁", "LI": "📖", "LO": "🐺", "LU": "💡",
    # M
    "MA": "🤚", "ME": "🪑", "MI": "🌽", "MO": "🏍️", "MU": "🎵",
    # N
    "NA": "🚢", "NE": "❄️", "NI": "🪺", "NO": "🌙", "NU": "☁️",
    # P
    "PA": "🦆", "PE": "🐟", "PI": "🍦", "PO": "🚪", "PU": "🦘",
    # Q
    "QU": "🧀",
    # R
    "RA": "🐭", "RE": "⌚", "RI": "🌊", "RO": "🌹", "RU": "🏙️",
    # S
    "SA": "🐸", "SE": "📮", "SI": "🔔", "SO": "☀️", "SU": "😱",
    # T
    "TA": "🚕", "TE": "📺", "TI": "🐯", "TO": "🍅", "TU": "🦈",
    # V
    "VA": "🐄", "VE": "🕯️", "VI": "🎸", "VO": "👵",
    # Z
    "ZA": "🥁", "ZE": "🦓",
    # complex syllables
    "BRA": "💪", "CRE": "🧴", "CRU": "✝️",
    "DRA": "🐉",
    "FRA": "🍗", "FRI": "🥶", "FRU": "🍎",
    "GRA": "🌿",
    "PRA": "🍽️", "PRE": "🎁", "PRI": "🤴",
    "TRA": "🚜", "TRE": "🚂", "TRI": "🛴",
    "BLO": "🧱",
    "CLA": "🎼", "CLI": "🌡️",
    "FLA": "🪈", "FLO": "🌸",
    "GLO": "🌍",
    "PLA": "🌱", "PLU": "🪶",
    # CVC
    "AR": "🎯", "ER": "🌿", "IR": "🌈", "OR": "🏅", "UR": "🐻",
    "AL": "🧄", "EL": "🐘", "IL": "🏝️", "OL": "👁️",
    "AN": "💍", "EN": "✉️", "IN": "🐛", "ON": "🐆", "UN": "🦄",
}

WORD_EMOJI_MAP = {
    # words
    "casa": "🏠", "bola": "⚽", "gato": "🐱", "dado": "🎲",
    "foca": "🦭", "bala": "🍬", "sol": "☀️", "mar": "🌊",
    "rato": "🐭", "sapo": "🐸", "pato": "🦆",
    "brasil": "🇧🇷", "prato": "🍽️", "flor": "🌸", "trator": "🚜",
    "cachorro": "🐕", "elefante": "🐘", "abacaxi": "🍍",
    "borboleta": "🦋", "girassol": "🌻", "chocolate": "🍫",
    "janela": "🪟", "cavalo": "🐴", "pássaro": "🐦",
    # extra image query words
    "bebe": "👶", "bicho": "🐛", "burro": "🐴", "braco": "💪", "creme": "🧴",
    # phrases
    "o gato bebe": "🐱", "a bola rola": "⚽", "o sol brilha": "☀️",
    "a casa é grande": "🏠", "o rato comeu o queijo": "🐭",
    "a flor é linda": "🌸", "meu gato é preto": "🐱", "a borboleta voou": "🦋",
    # sentences
    "o gato bebeu leite": "🐱", "a casa tem uma porta vermelha": "🏠",
    "o menino joga a bola no quintal": "⚽",
    "as flores do jardim são coloridas": "🌸",
    "o cachorro corre atrás do gato": "🐕",
    "a borboleta pousou na flor amarela": "🦋",
    "o sol se pôs e a lua brilhou": "🌅",
    "pedro e maria foram à escola juntos": "🏫",
}


def get_emoji_for_letter(letter: str) -> str | None:
    return EMOJI_MAP.get(letter.upper())


def get_word_image_query(word: str) -> str:
    return WORD_IMAGE_QUERIES.get(word.lower(), word.lower())


def get_emoji_for_word(word: str) -> str | None:
    return WORD_EMOJI_MAP.get(word.lower().rstrip("."))


def get_emoji_for_syllable(syllable: str) -> str | None:
    key = syllable.upper()
    if key in SYLLABLE_EMOJI_MAP:
        return SYLLABLE_EMOJI_MAP[key]
    return get_emoji_for_letter(key[0])


def get_emoji_for_text(text: str) -> str | None:
    cleaned = text.lower().strip().rstrip(".!?,")
    emoji = get_emoji_for_word(cleaned)
    if emoji:
        return emoji
    words = cleaned.split()
    for word in words:
        if word.lower() in ("o", "a", "os", "as", "um", "uma", "de", "da", "do", "em", "no", "na"):
            continue
        emoji = get_emoji_for_word(word)
        if emoji:
            return emoji
        if len(word) >= 2:
            emoji = get_emoji_for_syllable(word[:2].upper())
            if emoji:
                return emoji
    if len(words):
        emoji = get_emoji_for_syllable(words[0][:2].upper())
        if emoji:
            return emoji
    return None


def build_fallback_image_response(word: str) -> dict:
    emoji = get_emoji_for_word(word)
    if emoji:
        return {
            "type": "emoji",
            "value": emoji,
            "word": word,
        }
    return {
        "type": "emoji",
        "value": "🖼️",
        "word": word,
        "message": "Nenhuma imagem disponível",
    }


async def fetch_unsplash_image(query: str, access_key: str) -> dict | None:
    if not access_key:
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.unsplash.com/photos/random",
                params={"query": query, "count": 1, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {access_key}"},
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                if data:
                    return {
                        "type": "unsplash",
                        "url": data[0]["urls"]["regular"],
                        "alt": data[0]["alt_description"] or query,
                    }
    except Exception:
        pass
    return None
