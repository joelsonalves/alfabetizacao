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

WORD_EMOJI_MAP = {
    # words
    "casa": "🏠", "bola": "⚽", "gato": "🐱", "dado": "🎲",
    "foca": "🦭", "bala": "🍬", "sol": "☀️", "mar": "🌊",
    "rato": "🐭", "sapo": "🐸", "pato": "🦆",
    "brasil": "🇧🇷", "prato": "🍽️", "flor": "🌸", "trator": "🚜",
    "cachorro": "🐕", "elefante": "🐘", "abacaxi": "🍍",
    "borboleta": "🦋", "girassol": "🌻", "chocolate": "🍫",
    "janela": "🪟", "cavalo": "🐴",
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
