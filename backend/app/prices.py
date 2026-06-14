import asyncio
import time
import httpx
from fastapi import HTTPException

COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
_CACHE_TTL = 60  # seconds

# { cache_key: (timestamp, data) }
_cache: dict[str, tuple[float, dict]] = {}


def _cache_key(coin_ids: list[str], vs_currency: str) -> str:
    return f"{','.join(sorted(coin_ids))}:{vs_currency}"


async def get_prices(coin_ids: list[str], vs_currency: str = "usd") -> dict:
    key = _cache_key(coin_ids, vs_currency)
    now = time.monotonic()
    if key in _cache:
        ts, data = _cache[key]
        if now - ts < _CACHE_TTL:
            return data

    params = {
        "ids": ",".join(coin_ids),
        "vs_currencies": vs_currency,
        "include_24hr_change": "true",
    }

    last_exc: Exception | None = None
    async with httpx.AsyncClient(timeout=10) as client:
        for attempt in range(3):
            if attempt > 0:
                await asyncio.sleep(attempt * 1.5)
            try:
                response = await client.get(COINGECKO_URL, params=params)
                if response.status_code in (429, 502, 503, 504):
                    last_exc = httpx.HTTPStatusError(
                        f"status {response.status_code}",
                        request=response.request,
                        response=response,
                    )
                    continue
                response.raise_for_status()
                data = response.json()
                _cache[key] = (now, data)
                return data
            except httpx.HTTPStatusError as e:
                last_exc = e
                if e.response.status_code not in (429, 502, 503, 504):
                    raise HTTPException(status_code=502, detail=f"CoinGecko error: {e.response.status_code}")
            except httpx.RequestError as e:
                last_exc = e

    status = getattr(getattr(last_exc, "response", None), "status_code", None)
    detail = f"CoinGecko error: {status}" if status else "CoinGecko unreachable"
    raise HTTPException(status_code=502, detail=detail)
