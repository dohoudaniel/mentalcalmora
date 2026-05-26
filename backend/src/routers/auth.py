from fastapi import APIRouter, Depends
from src.rate_limiter import rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/check-email", dependencies=[Depends(rate_limit(5))])
async def check_email_exists(email: str):
    # Intentionally do not expose user enumeration.
    # Return a generic response regardless of email existence.
    return {"available": True}
