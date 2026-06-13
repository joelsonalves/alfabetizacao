from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx

from app.database import get_db
from app.config import settings

router = APIRouter()

EMOJI_MAP = {
    "A": "🍎", "B": "🏀", "C": "🐱", "D": "🎲", "E": "⭐",
    "F": "🔥", "G": "🎸", "H": "🏠", "I": "🍦", "J": "🤹",
    "K": "🥝", "L": "🍋", "M": "🌙", "N": "🔵", "O": "👁️",
    "P": "🐧", "Q": "🧀", "R": "🌈", "S": "☀️", "T": "🎵",
    "U": "☂️", "V": "🎻", "W": "🐺", "X": "❌", "Y": "🪀", "Z": "🦓",
}

WORD_IMAGE_QUERIES = {
    "casa": "house", "bola": "ball", "gato": "cat", "dado": "dice",
    "foca": "seal", "bala": "candy", "bebe": "baby", "bicho": "bug",
    "burro": "donkey", "braco": "arm", "creme": "cream", "gato bebe": "cat drinking",
    "o gato bebe": "cat drinking milk",
}


@router.get("/emoji/{letter}")
def get_emoji(letter: str):
    letter = letter.upper()
    if letter in EMOJI_MAP:
        return {"type": "emoji", "value": EMOJI_MAP[letter], "letter": letter}
    raise HTTPException(status_code=404, detail="Letter not found")


@router.get("/word/{word}")
async def get_word_image(word: str):
    word_lower = word.lower()
    query = WORD_IMAGE_QUERIES.get(word_lower, word_lower)

    if settings.unsplash_access_key:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.unsplash.com/photos/random",
                    params={"query": query, "count": 1, "orientation": "landscape"},
                    headers={"Authorization": f"Client-ID {settings.unsplash_access_key}"},
                    timeout=10,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if data:
                        return {
                            "type": "unsplash",
                            "url": data[0]["urls"]["regular"],
                            "alt": data[0]["alt_description"] or query,
                            "word": word,
                        }
        except Exception:
            pass

    return {
        "type": "emoji",
        "value": "🖼️",
        "word": word,
        "message": "Unsplash API key not configured or request failed",
    }
