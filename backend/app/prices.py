import httpx
from fastapi import HTTPException

COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"


async def get_prices(coin_ids: list[str], vs_currency: str = "usd") -> dict:
    params = {
        "ids": ",".join(coin_ids),
        "vs_currencies": vs_currency,
        "include_24hr_change": "true",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.get(COINGECKO_URL, params=params)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"CoinGecko error: {e.response.status_code}")
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="CoinGecko unreachable")
    return response.json()
