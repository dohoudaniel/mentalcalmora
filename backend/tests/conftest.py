import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

# Set test environment variables BEFORE any src imports
os.environ.update({
    "DATABASE_URL": "postgresql://test:test@localhost:5432/test",
    "SUPABASE_URL": "https://test.supabase.co",
    "SUPABASE_ANON_KEY": "test-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "test-service-role-key",
    "GEMINI_API_KEY": "test-gemini-key",
    "ALLOWED_ORIGINS": "http://localhost:8080",
    "APP_ENV": "testing",
})

# Ensure src is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import after env vars are set
from src.main import app
from src.auth import get_current_user
from src.rate_limiter import get_rate_limiter
from httpx import AsyncClient, ASGITransport
import pytest

TEST_USER = {
    "id": "test-user-id",
    "email": "test@example.com",
    "user_metadata": {"first_name": "Test", "last_name": "User"},
}

# Bypass auth for all tests using dependency override
app.dependency_overrides[get_current_user] = lambda: TEST_USER


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    get_rate_limiter().reset()
    yield


@pytest.fixture
def mock_db_fetch():
    with patch("src.db.fetch", new_callable=AsyncMock) as m:
        yield m


@pytest.fixture
def mock_db_fetchrow():
    with patch("src.db.fetchrow", new_callable=AsyncMock) as m:
        yield m


@pytest.fixture
def mock_db_execute():
    with patch("src.db.execute", new_callable=AsyncMock) as m:
        yield m


@pytest.fixture
def mock_generate_insight():
    with patch("src.routers.moods.generate_insight", new_callable=AsyncMock) as m:
        m.return_value = "You seem to be doing well. Keep it up!"
        yield m


@pytest.fixture
def mock_chat_with_calmobot():
    with patch("src.routers.chat.chat_with_calmobot", new_callable=AsyncMock) as m:
        m.return_value = "Hello! I'm Calmobot, your wellness assistant."
        yield m


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
