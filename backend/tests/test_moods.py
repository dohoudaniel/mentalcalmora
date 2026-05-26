import pytest
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_list_moods(client, mock_db_fetch):
    mock_db_fetch.return_value = [
        {
            "id": "entry-1",
            "user_id": "test-user-id",
            "mood": "Happy",
            "description": "Great day",
            "text": "Happy Great day",
            "sentiment": "POSITIVE",
            "score": 0.8,
            "timestamp": datetime.now(timezone.utc),
            "insights": None,
        }
    ]
    response = await client.get("/moods")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["mood"] == "Happy"


@pytest.mark.asyncio
async def test_create_mood(client, mock_db_fetchrow, mock_db_execute, mock_generate_insight):
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
    response = await client.post("/moods", json={"mood": "Calm", "description": "Relaxing"})
    assert response.status_code == 200
    data = response.json()
    assert data["mood"] == "Calm"
    assert data["sentiment"] == "POSITIVE"


@pytest.mark.asyncio
async def test_get_mood(client, mock_db_fetchrow):
    mock_db_fetchrow.return_value = {
        "id": "entry-1",
        "user_id": "test-user-id",
        "mood": "Happy",
        "description": "Great day",
        "text": "Happy Great day",
        "sentiment": "POSITIVE",
        "score": 0.8,
        "timestamp": datetime.now(timezone.utc),
        "insights": None,
    }
    response = await client.get("/moods/entry-1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "entry-1"


@pytest.mark.asyncio
async def test_get_mood_not_found(client, mock_db_fetchrow):
    mock_db_fetchrow.return_value = None
    response = await client.get("/moods/nonexistent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_generate_insights(client, mock_db_fetchrow, mock_db_execute, mock_generate_insight):
    mock_db_fetchrow.return_value = {
        "id": "entry-1",
        "user_id": "test-user-id",
        "mood": "Happy",
        "text": "Happy day",
        "sentiment": "POSITIVE",
        "score": 0.8,
        "insights": None,
    }
    response = await client.post("/moods/entry-1/insights")
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert data["insights"] == "You seem to be doing well. Keep it up!"
