from fastapi import APIRouter, HTTPException, Depends
from src.auth import get_current_user
from src.rate_limiter import rate_limit
from src import db
from src.models import ChatMessageCreate, ChatMessageOut, ChatbotRequest
from src.services.gemini import chat_with_calmobot
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/history", response_model=list[ChatMessageOut], dependencies=[Depends(rate_limit(60))])
async def get_chat_history(user: dict = Depends(get_current_user)):
    rows = await db.fetch(
        "SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY timestamp ASC",
        user["id"],
    )
    return [dict(r) for r in rows]


@router.post("/history", response_model=ChatMessageOut, dependencies=[Depends(rate_limit(60))])
async def save_message(data: ChatMessageCreate, user: dict = Depends(get_current_user)):
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    await db.execute(
        """
        INSERT INTO chat_messages (id, user_id, role, content, timestamp)
        VALUES ($1, $2, $3, $4, $5)
        """,
        msg_id,
        user["id"],
        data.role,
        data.content,
        now,
    )
    row = await db.fetchrow(
        "SELECT * FROM chat_messages WHERE id = $1",
        msg_id,
    )
    return dict(row)


@router.post("/calmobot", dependencies=[Depends(rate_limit(15))])
async def calmobot_chat(data: ChatbotRequest, user: dict = Depends(get_current_user)):
    try:
        response_text = await chat_with_calmobot(
            messages=data.messages,
            user_data=data.user_data,
            mood_entries=data.mood_entries,
        )
        return {"message": response_text}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
