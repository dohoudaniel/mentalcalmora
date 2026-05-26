import pytest
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_get_chat_history(client, mock_db_fetch):
    mock_db_fetch.return_value = [
        {
            "id": "msg-1",
            "user_id": "test-user-id",
            "role": "user",
            "content": "Hello",
            "timestamp": datetime.now(timezone.utc),
        },
        {
            "id": "msg-2",
            "user_id": "test-user-id",
            "role": "assistant",
            "content": "Hi there!",
            "timestamp": datetime.now(timezone.utc),
        },
    ]
    response = await client.get("/chat/history")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["role"] == "user"


@pytest.mark.asyncio
async def test_save_message(client, mock_db_fetchrow, mock_db_execute):
    mock_db_fetchrow.return_value = {
        "id": "msg-new",
        "user_id": "test-user-id",
        "role": "user",
        "content": "Test message",
        "timestamp": datetime.now(timezone.utc),
    }
    response = await client.post("/chat/history", json={"role": "user", "content": "Test message"})
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Test message"


@pytest.mark.asyncio
async def test_calmobot_chat(client, mock_chat_with_calmobot):
    response = await client.post("/chat/calmobot", json={
        "messages": [{"role": "user", "content": "Hello"}],
        "user_data": {"firstName": "Test"},
        "mood_entries": [],
    })
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Hello! I'm Calmobot, your wellness assistant."


@pytest.mark.asyncio
async def test_calmobot_chat_invalid_body(client):
    response = await client.post("/chat/calmobot", json={"messages": "not-an-array"})
    assert response.status_code == 422
