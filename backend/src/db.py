import asyncio
import asyncpg
from src.config import get_settings

_pool: asyncpg.Pool | None = None


def _url_display(url: str) -> str:
    """Return a safe display string for a DB URL (hides password)."""
    if not url:
        return ""
    try:
        # postgresql://user:pass@host:port/db
        proto, rest = url.split("://", 1)
        auth_host = rest.split("/", 1)[0]
        if "@" in auth_host:
            user_pass, host_port = auth_host.rsplit("@", 1)
            return f"{proto}://***@{host_port}"
        return f"{proto}://{auth_host}"
    except Exception:
        return "***"


async def _can_connect(url: str, timeout: float = 2.0) -> bool:
    """Try to establish a short-lived connection to verify a DB is reachable."""
    try:
        conn = await asyncio.wait_for(
            asyncpg.connect(url, command_timeout=2),
            timeout=timeout,
        )
        await conn.close()
        return True
    except Exception:
        return False


async def resolve_database_url() -> str:
    """
    Pick the database URL to use.

    - Production: uses ``database_url`` directly.
    - Development:
        1. Try ``database_url_local`` (fast, offline).
        2. If unreachable, try ``database_url_supabase``.
        3. If neither is configured/reachable, fall back to ``database_url``.
    """
    settings = get_settings()

    if settings.app_env == "production":
        if not settings.database_url:
            raise RuntimeError("DATABASE_URL is required in production")
        return settings.database_url

    # Development: try local first
    if settings.database_url_local:
        if await _can_connect(settings.database_url_local):
            return settings.database_url_local

    # Fallback to Supabase
    if settings.database_url_supabase:
        if await _can_connect(settings.database_url_supabase):
            return settings.database_url_supabase

    # Final fallback to the legacy single URL
    if settings.database_url and await _can_connect(settings.database_url):
        return settings.database_url

    # Nothing is reachable — return the first configured one so the caller
    # gets a clean connection error rather than an empty-string error.
    return (
        settings.database_url_local
        or settings.database_url_supabase
        or settings.database_url
    )


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        dsn = await resolve_database_url()
        _pool = await asyncpg.create_pool(
            dsn=dsn,
            min_size=2,
            max_size=10,
        )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def fetch(query: str, *args) -> list[asyncpg.Record]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)


async def fetchrow(query: str, *args) -> asyncpg.Record | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)


async def execute(query: str, *args) -> str:
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)
