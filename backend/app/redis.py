import time
from typing import Any
import redis.asyncio as redis

from app.config import get_settings

settings = get_settings()


class FallbackRedis:
    """In-memory Redis fallback for local testing when Redis server is offline."""
    _data: dict[str, str] = {}
    _expires: dict[str, float] = {}

    async def get(self, key: str) -> str | None:
        if key in self._expires and time.time() > self._expires[key]:
            self._data.pop(key, None)
            self._expires.pop(key, None)
            return None
        return self._data.get(key)

    async def set(self, key: str, value: Any, ex: int | None = None) -> bool:
        self._data[key] = str(value)
        if ex:
            self._expires[key] = time.time() + ex
        return True

    async def incr(self, key: str) -> int:
        val = int(self._data.get(key, 0)) + 1
        self._data[key] = str(val)
        return val

    async def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if k in self._data:
                self._data.pop(k, None)
                self._expires.pop(k, None)
                count += 1
        return count


_fallback_redis = FallbackRedis()


class SafeRedisProxy:
    """Proxy that attempts real Redis operation and falls back to in-memory on connection error."""

    def __init__(self, real_client: redis.Redis):
        self._real = real_client
        self._fallback = _fallback_redis

    async def get(self, key: str) -> str | None:
        try:
            return await self._real.get(key)
        except Exception:
            return await self._fallback.get(key)

    async def set(self, key: str, value: Any, ex: int | None = None) -> bool:
        try:
            return await self._real.set(key, value, ex=ex)
        except Exception:
            return await self._fallback.set(key, value, ex=ex)

    async def incr(self, key: str) -> int:
        try:
            return await self._real.incr(key)
        except Exception:
            return await self._fallback.incr(key)

    async def delete(self, *keys: str) -> int:
        try:
            return await self._real.delete(*keys)
        except Exception:
            return await self._fallback.delete(*keys)


redis_pool = redis.ConnectionPool.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    max_connections=50,
)


def get_redis():
    """Get a Redis client with transparent fallback."""
    return SafeRedisProxy(redis.Redis(connection_pool=redis_pool))

