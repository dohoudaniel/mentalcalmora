import pytest


@pytest.mark.asyncio
async def test_list_recommendations_any(client, mock_db_fetch):
    mock_db_fetch.return_value = [
        {"id": 1, "title": "Walk", "description": "Take a walk", "type": "exercise", "sentiment_target": "POSITIVE"},
    ]
    response = await client.get("/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Walk"


@pytest.mark.asyncio
async def test_list_recommendations_by_sentiment(client, mock_db_fetch):
    mock_db_fetch.return_value = [
        {"id": 2, "title": "Meditate", "description": "Breathe deeply", "type": "mindfulness", "sentiment_target": "NEGATIVE"},
    ]
    response = await client.get("/recommendations?sentiment=NEGATIVE")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "mindfulness"
