from fastapi import APIRouter, HTTPException, Depends
from src.rate_limiter import rate_limit
from src.config import get_settings
from src.auth import get_current_user
from src import db
from src.models import SignupRequest, LoginRequest
import httpx

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", dependencies=[Depends(rate_limit(5))])
async def signup(data: SignupRequest):
    settings = get_settings()

    # 1. Create user via Supabase Admin API
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.supabase_url}/auth/v1/admin/users",
            json={
                "email": data.email,
                "password": data.password,
                "user_metadata": {
                    "first_name": data.first_name,
                    "last_name": data.last_name,
                },
                "email_confirm": True,
            },
            headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_anon_key,
            },
        )

    if resp.status_code >= 400:
        error = resp.json().get("msg", "Signup failed")
        raise HTTPException(status_code=400, detail=error)

    user = resp.json()

    # 2. Create profile in local DB
    await db.execute(
        """
        INSERT INTO profiles (id, first_name, last_name, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
        """,
        user["id"],
        data.first_name,
        data.last_name,
    )

    # 3. Log in to get tokens
    async with httpx.AsyncClient() as client:
        login_resp = await client.post(
            f"{settings.supabase_url}/auth/v1/token?grant_type=password",
            json={"email": data.email, "password": data.password},
            headers={"apikey": settings.supabase_anon_key},
        )

    tokens = login_resp.json()
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "user": {
            "id": user["id"],
            "email": data.email,
            "first_name": data.first_name,
            "last_name": data.last_name,
        },
    }


@router.post("/login", dependencies=[Depends(rate_limit(5))])
async def login(data: LoginRequest):
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.supabase_url}/auth/v1/token?grant_type=password",
            json={"email": data.email, "password": data.password},
            headers={"apikey": settings.supabase_anon_key},
        )

    if resp.status_code >= 400:
        error = resp.json().get("msg", "Invalid credentials")
        raise HTTPException(status_code=401, detail=error)

    tokens = resp.json()
    user = tokens.get("user", {})
    meta = user.get("user_metadata", {})

    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "first_name": meta.get("first_name", ""),
            "last_name": meta.get("last_name", ""),
        },
    }


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{settings.supabase_url}/auth/v1/logout",
            headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_anon_key,
            },
        )
    return {"success": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@router.post("/forgot-password", dependencies=[Depends(rate_limit(3))])
async def forgot_password(email: str):
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.supabase_url}/auth/v1/recover",
            json={
                "email": email,
                "gotrue_meta_security": {},
            },
            headers={
                "apikey": settings.supabase_anon_key,
                "Content-Type": "application/json",
            },
        )
    # Always return generic success to avoid user enumeration
    return {"success": True}


@router.post("/reset-password", dependencies=[Depends(rate_limit(5))])
async def reset_password(token: str, new_password: str):
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{settings.supabase_url}/auth/v1/user",
            json={"password": new_password},
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.supabase_anon_key,
                "Content-Type": "application/json",
            },
        )
    if resp.status_code >= 400:
        error = resp.json().get("msg", "Password reset failed")
        raise HTTPException(status_code=400, detail=error)
    return {"success": True}


@router.post("/check-email", dependencies=[Depends(rate_limit(5))])
async def check_email_exists(email: str):
    # Intentionally do not expose user enumeration.
    return {"available": True}
