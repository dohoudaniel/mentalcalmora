import pytest
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_get_profile(client, mock_db_fetchrow):
    mock_db_fetchrow.return_value = {
        "id": "test-user-id",
        "first_name": "Test",
        "last_name": "User",
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_login": None,
    }
    response = await client.get("/profile/me")
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Test"
    assert data["last_name"] == "User"


@pytest.mark.asyncio
async def test_update_profile(client, mock_db_fetchrow):
    mock_db_fetchrow.return_value = {
        "id": "test-user-id",
        "first_name": "Updated",
        "last_name": "Name",
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_login": None,
    }
    response = await client.patch("/profile/me", json={"first_name": "Updated", "last_name": "Name"})
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Updated"


@pytest.mark.asyncio
async def test_upload_avatar(client):
    mock_client = AsyncMock()
    mock_client.post.return_value.status_code = 200
    mock_client.delete.return_value.status_code = 204
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("src.routers.profile.httpx.AsyncClient", return_value=mock_client), \
         patch("src.db.fetchrow", new_callable=AsyncMock) as mock_fetchrow, \
         patch("src.db.execute", new_callable=AsyncMock) as mock_execute:
        mock_fetchrow.return_value = {"avatar_url": None}

        response = await client.post(
            "/profile/me/avatar",
            files={"file": ("test.png", b"fake-image-data", "image/png")},
        )
        assert response.status_code == 200
        data = response.json()
        assert "avatar_url" in data


@pytest.mark.asyncio
async def test_change_password(client):
    with patch("httpx.AsyncClient.put", new_callable=AsyncMock) as mock_put:
        mock_put.return_value.status_code = 200
        response = await client.post("/profile/me/change-password?new_password=NewPass123!")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


@pytest.mark.asyncio
async def test_delete_account(client):
    mock_client = AsyncMock()
    mock_client.delete.return_value.status_code = 204
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("src.routers.profile.httpx.AsyncClient", return_value=mock_client), \
         patch("src.db.execute", new_callable=AsyncMock) as mock_execute:
        response = await client.delete("/profile/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
