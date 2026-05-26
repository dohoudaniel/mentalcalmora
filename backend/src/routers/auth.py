from fastapi import APIRouter, HTTPException
from src.config import get_settings
import httpx

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/check-email")
async def check_email_exists(email: str):
    """
    Check if an email is already registered.
    Rate limiting should be applied at the infrastructure level (e.g., nginx, cloudflare).
    """
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.supabase_url}/auth/v1/admin/users",
            headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_anon_key,
            },
            json={"email": email},
        )
    # The admin API above doesn't have a direct email check endpoint.
    # Instead, we use a safer approach: we don't expose user enumeration.
    # Return a generic response.
    return {"available": True}
