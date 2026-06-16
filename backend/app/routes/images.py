from fastapi import APIRouter, HTTPException

from app.services.images import get_emoji_for_letter, get_word_image_query, fetch_unsplash_image, build_fallback_image_response
from app.config import settings

router = APIRouter()


@router.get("/emoji/{letter}")
def get_emoji(letter: str):
    emoji = get_emoji_for_letter(letter)
    if not emoji:
        raise HTTPException(status_code=404, detail="Letter not found")
    return {"type": "emoji", "value": emoji, "letter": letter.upper()}


@router.get("/word/{word}")
async def get_word_image(word: str):
    query = get_word_image_query(word)

    result = await fetch_unsplash_image(query, settings.unsplash_access_key)
    if result:
        result["word"] = word
        return result

    return build_fallback_image_response(word)
