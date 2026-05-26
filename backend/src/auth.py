import httpx
from fastapi import Header, HTTPException, Depends
from src.config import get_settings


async def get_current_user(authorization: str = Header(...)) -> dict:
    """Verify the Supabase JWT and return the user."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    settings = get_settings()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.supabase_anon_key,
                },
                timeout=10.0,
            )
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth service unavailable")

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if response.status_code >= 500:
        raise HTTPException(status_code=503, detail="Auth service error")
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Authentication failed")

    user = response.json()
    if not user or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid user data")

    return user


async def get_current_user_optional(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


CurrentUser = Depends(get_current_user)
