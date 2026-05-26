from fastapi import APIRouter, Depends
from src.auth import get_current_user
from src.rate_limiter import rate_limit
from src import db
from datetime import datetime, timezone

router = APIRouter(prefix="/export", tags=["export"])


@router.get("", dependencies=[Depends(rate_limit(5))])
async def export_user_data(user: dict = Depends(get_current_user)):
    user_id = user["id"]

    profile = await db.fetchrow("SELECT * FROM profiles WHERE id = $1", user_id)
    mood_entries = await db.fetch(
        "SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY timestamp DESC",
        user_id,
    )
    chat_messages = await db.fetch(
        "SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY timestamp DESC",
        user_id,
    )

    return {
        "exportDate": datetime.now(timezone.utc).isoformat(),
        "profile": dict(profile) if profile else None,
        "moodEntries": [dict(r) for r in mood_entries],
        "chatMessages": [dict(r) for r in chat_messages],
        "totalMoodEntries": len(mood_entries),
        "totalChatMessages": len(chat_messages),
    }
