from fastapi import APIRouter, HTTPException, Depends
from src.auth import get_current_user
from src import db
from src.models import MoodEntryCreate, MoodEntryOut
from src.services.sentiment import analyze_sentiment
from src.services.gemini import generate_insight
import uuid
from datetime import datetime

router = APIRouter(prefix="/moods", tags=["moods"])


@router.get("", response_model=list[MoodEntryOut])
async def list_moods(user: dict = Depends(get_current_user)):
    rows = await db.fetch(
        "SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY timestamp DESC",
        user["id"],
    )
    return [dict(r) for r in rows]


@router.post("", response_model=MoodEntryOut)
async def create_mood(data: MoodEntryCreate, user: dict = Depends(get_current_user)):
    text = data.description or data.mood
    sentiment_result = analyze_sentiment(text)

    entry_id = str(uuid.uuid4())
    now = datetime.utcnow()

    await db.execute(
        """
        INSERT INTO mood_entries (id, user_id, mood, description, text, sentiment, score, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
        entry_id,
        user["id"],
        data.mood,
        data.description,
        text,
        sentiment_result["sentiment"],
        sentiment_result["score"],
        now,
    )

    # Fire-and-forget insight generation (do not await to keep response fast)
    # In production, use a background task queue like Celery or RQ
    # For now, we'll generate synchronously but wrapped in try/except so it doesn't fail the request
    try:
        insight = await generate_insight(
            data.mood, text, sentiment_result["sentiment"], sentiment_result["score"]
        )
        await db.execute(
            "UPDATE mood_entries SET insights = $1 WHERE id = $2",
            insight,
            entry_id,
        )
    except Exception:
        pass  # Insights are optional; fail silently

    row = await db.fetchrow(
        "SELECT * FROM mood_entries WHERE id = $1",
        entry_id,
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create mood entry")
    return dict(row)


@router.get("/{entry_id}", response_model=MoodEntryOut)
async def get_mood(entry_id: str, user: dict = Depends(get_current_user)):
    row = await db.fetchrow(
        "SELECT * FROM mood_entries WHERE id = $1 AND user_id = $2",
        entry_id,
        user["id"],
    )
    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")
    return dict(row)


@router.post("/{entry_id}/insights")
async def generate_mood_insights(entry_id: str, user: dict = Depends(get_current_user)):
    row = await db.fetchrow(
        "SELECT * FROM mood_entries WHERE id = $1 AND user_id = $2",
        entry_id,
        user["id"],
    )
    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")

    if row.get("insights"):
        return {"insights": row["insights"]}

    try:
        insight = await generate_insight(
            row["mood"], row["text"], row["sentiment"], float(row["score"])
        )
        await db.execute(
            "UPDATE mood_entries SET insights = $1 WHERE id = $2",
            insight,
            entry_id,
        )
        return {"insights": insight}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Insight generation failed: {exc}")
