from fastapi import APIRouter, Depends
from src.auth import get_current_user
from src.rate_limiter import rate_limit
from src import db
from src.models import RecommendationOut
from typing import Literal

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=list[RecommendationOut], dependencies=[Depends(rate_limit(60))])
async def list_recommendations(
    sentiment: Literal["POSITIVE", "NEGATIVE", "NEUTRAL", "ANY"] = "ANY",
    user: dict = Depends(get_current_user),
):
    if sentiment == "ANY":
        rows = await db.fetch("SELECT * FROM recommendations")
    else:
        rows = await db.fetch(
            "SELECT * FROM recommendations WHERE sentiment_target = $1",
            sentiment,
        )
    return [dict(r) for r in rows]
