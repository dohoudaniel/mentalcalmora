import pytest
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_export_user_data(client, mock_db_fetchrow, mock_db_fetch):
    mock_db_fetchrow.return_value = {
        "id": "test-user-id",
        "first_name": "Test",
        "last_name": "User",
        "avatar_url": None,
    }
    mock_db_fetch.side_effect = [
        [
            {"id": "entry-1", "user_id": "test-user-id", "mood": "Happy", "timestamp": datetime.now(timezone.utc)},
        ],
        [
            {"id": "msg-1", "user_id": "test-user-id", "role": "user", "content": "Hi", "timestamp": datetime.now(timezone.utc)},
        ],
    ]
    response = await client.get("/export")
    assert response.status_code == 200
    data = response.json()
    assert data["totalMoodEntries"] == 1
    assert data["totalChatMessages"] == 1
    assert data["profile"]["first_name"] == "Test"
