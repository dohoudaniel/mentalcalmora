import pytest
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_mood_creation_rate_limit(client, mock_db_fetchrow, mock_db_execute, mock_generate_insight):
    mock_db_fetchrow.return_value = {
        "id": "entry-new",
        "user_id": "test-user-id",
        "mood": "Calm",
        "description": "Relaxing",
        "text": "Calm Relaxing",
        "sentiment": "POSITIVE",
        "score": 0.7,
        "timestamp": datetime.now(timezone.utc),
        "insights": None,
    }
    # Exceed 10/minute limit
    for i in range(11):
        response = await client.post("/moods", json={"mood": "Calm", "description": f"test {i}"})

    assert response.status_code == 429
    data = response.json()
    assert "Rate limit exceeded" in data["detail"]
