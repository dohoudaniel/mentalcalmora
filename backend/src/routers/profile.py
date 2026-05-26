from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from src.auth import get_current_user
from src import db
from src.models import ProfileUpdate, ProfileOut
from src.config import get_settings
import httpx
import uuid

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileOut)
async def get_profile(user: dict = Depends(get_current_user)):
    row = await db.fetchrow(
        "SELECT * FROM profiles WHERE id = $1",
        user["id"],
    )
    if not row:
        # Auto-create profile if missing
        await db.execute(
            """
            INSERT INTO profiles (id, first_name, last_name, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
            """,
            user["id"],
            user.get("user_metadata", {}).get("first_name", ""),
            user.get("user_metadata", {}).get("last_name", ""),
        )
        row = await db.fetchrow(
            "SELECT * FROM profiles WHERE id = $1",
            user["id"],
        )
    return dict(row)


@router.patch("/me", response_model=ProfileOut)
async def update_profile(data: ProfileUpdate, user: dict = Depends(get_current_user)):
    # Build dynamic update
    updates = []
    values = []
    idx = 1

    if data.first_name is not None:
        updates.append(f"first_name = ${idx}")
        values.append(data.first_name)
        idx += 1
    if data.last_name is not None:
        updates.append(f"last_name = ${idx}")
        values.append(data.last_name)
        idx += 1
    if data.avatar_url is not None:
        updates.append(f"avatar_url = ${idx}")
        values.append(data.avatar_url)
        idx += 1

    if not updates:
        row = await db.fetchrow("SELECT * FROM profiles WHERE id = $1", user["id"])
        return dict(row)

    updates.append("updated_at = NOW()")
    values.append(user["id"])

    query = f"UPDATE profiles SET {', '.join(updates)} WHERE id = ${idx} RETURNING *"
    row = await db.fetchrow(query, *values)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(row)


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    settings = get_settings()
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    file_name = f"{user['id']}/avatar-{uuid.uuid4().hex}.{file_ext}"

    # Upload to Supabase Storage using service role
    async with httpx.AsyncClient() as client:
        upload_resp = await client.post(
            f"{settings.supabase_url}/storage/v1/object/profile-images/{file_name}",
            headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": file.content_type or "application/octet-stream",
            },
            content=content,
            timeout=30.0,
        )

    if upload_resp.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Failed to upload avatar")

    # Get public URL
    avatar_url = f"{settings.supabase_url}/storage/v1/object/public/profile-images/{file_name}"

    # Delete old avatar
    old_profile = await db.fetchrow(
        "SELECT avatar_url FROM profiles WHERE id = $1", user["id"]
    )
    if old_profile and old_profile.get("avatar_url"):
        old_path = old_profile["avatar_url"].split("/profile-images/")[-1]
        if old_path:
            async with httpx.AsyncClient() as client:
                await client.delete(
                    f"{settings.supabase_url}/storage/v1/object/profile-images/{old_path}",
                    headers={"Authorization": f"Bearer {settings.supabase_service_role_key}"},
                )

    # Update profile
    await db.execute(
        "UPDATE profiles SET avatar_url = $1, updated_at = NOW() WHERE id = $2",
        avatar_url,
        user["id"],
    )

    return {"avatar_url": avatar_url}


@router.post("/me/change-password")
async def change_password(
    new_password: str,
    user: dict = Depends(get_current_user),
):
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{settings.supabase_url}/auth/v1/user",
            json={"password": new_password},
            headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_anon_key,
                "Content-Type": "application/json",
            },
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to change password")
    return {"success": True}


@router.delete("/me")
async def delete_account(user: dict = Depends(get_current_user)):
    settings = get_settings()
    user_id = user["id"]

    # Delete user's data from all tables
    await db.execute("DELETE FROM chat_messages WHERE user_id = $1", user_id)
    await db.execute("DELETE FROM mood_entries WHERE user_id = $1", user_id)
    await db.execute("DELETE FROM profiles WHERE user_id = $1", user_id)

    # Delete auth user via admin API
    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
            headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_anon_key,
            },
        )
    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Failed to delete auth user")

    return {"success": True}
