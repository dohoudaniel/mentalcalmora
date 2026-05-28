import pytest
from unittest.mock import patch, MagicMock, AsyncMock


def _mock_response(status_code: int, json_data: dict):
    """Create a mock httpx.Response with a synchronous json() method."""
    m = MagicMock()
    m.status_code = status_code
    m.json = MagicMock(return_value=json_data)
    return m


def _make_mock_client(post_side_effect=None, put_side_effect=None):
    """Create a mock httpx.AsyncClient that works with async context manager."""
    mock_client = AsyncMock()
    mock_client.post = post_side_effect or AsyncMock(return_value=_mock_response(200, {}))
    mock_client.put = put_side_effect or AsyncMock(return_value=_mock_response(200, {}))
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    return mock_client


@pytest.mark.asyncio
async def test_signup(client, mock_db_execute):
    call_count = 0

    async def _side_effect(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return _mock_response(200, {"id": "new-user-id", "email": "new@example.com"})
        return _mock_response(200, {
            "access_token": "at",
            "refresh_token": "rt",
            "user": {"id": "new-user-id", "email": "new@example.com"},
        })

    mock_client = _make_mock_client(post_side_effect=_side_effect)
    with patch("httpx.AsyncClient", return_value=mock_client):
        response = await client.post("/auth/signup", json={
            "email": "new@example.com",
            "password": "StrongPass123!",
            "first_name": "New",
            "last_name": "User",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "at"
        assert data["user"]["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_login(client):
    async def _side_effect(*args, **kwargs):
        return _mock_response(200, {
            "access_token": "at",
            "refresh_token": "rt",
            "user": {
                "id": "user-1",
                "email": "a@b.com",
                "user_metadata": {"first_name": "A", "last_name": "B"},
            },
        })

    mock_client = _make_mock_client(post_side_effect=_side_effect)
    with patch("httpx.AsyncClient", return_value=mock_client):
        response = await client.post("/auth/login", json={
            "email": "a@b.com",
            "password": "password",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "at"
        assert data["user"]["first_name"] == "A"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    async def _side_effect(*args, **kwargs):
        return _mock_response(400, {"msg": "Invalid login"})

    mock_client = _make_mock_client(post_side_effect=_side_effect)
    with patch("httpx.AsyncClient", return_value=mock_client):
        response = await client.post("/auth/login", json={
            "email": "a@b.com",
            "password": "wrong",
        })
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_me(client):
    response = await client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "test-user-id"


@pytest.mark.asyncio
async def test_logout(client):
    async def _side_effect(*args, **kwargs):
        return _mock_response(200, {})

    mock_client = _make_mock_client(post_side_effect=_side_effect)
    with patch("httpx.AsyncClient", return_value=mock_client):
        response = await client.post("/auth/logout")
        assert response.status_code == 200
        assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_forgot_password(client):
    async def _side_effect(*args, **kwargs):
        return _mock_response(200, {})

    mock_client = _make_mock_client(post_side_effect=_side_effect)
    with patch("httpx.AsyncClient", return_value=mock_client):
        response = await client.post("/auth/forgot-password?email=user@example.com")
        assert response.status_code == 200
        assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_reset_password(client):
    async def _side_effect(*args, **kwargs):
        return _mock_response(200, {})

    mock_client = _make_mock_client(put_side_effect=_side_effect)
    with patch("httpx.AsyncClient", return_value=mock_client):
        response = await client.post(
            "/auth/reset-password?token=recovery-token&new_password=NewPass123!"
        )
        assert response.status_code == 200
        assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_check_email(client):
    response = await client.post("/auth/check-email?email=test@example.com")
    assert response.status_code == 200
    assert response.json()["available"] is True
