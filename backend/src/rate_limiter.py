import time
from collections import defaultdict
from fastapi import Request, HTTPException, Depends


class MemoryRateLimiter:
    """Simple in-memory sliding-window rate limiter.
    For production, replace with Redis-backed limiter.
    """

    def __init__(self):
        self._requests: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str, limit: int, window_seconds: int) -> None:
        now = time.time()
        window = self._requests[key]
        # Remove expired entries
        self._requests[key] = [t for t in window if now - t < window_seconds]
        if len(self._requests[key]) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
            )
        self._requests[key].append(now)

    def reset(self) -> None:
        self._requests.clear()


_limiter = MemoryRateLimiter()


def get_rate_limiter() -> MemoryRateLimiter:
    return _limiter


def rate_limit(limit: int, window_seconds: int = 60):
    """FastAPI dependency factory for rate limiting by client IP."""
    async def _check(request: Request) -> None:
        key = request.client.host if request.client else "unknown"
        _limiter.check(key, limit, window_seconds)
    return _check
