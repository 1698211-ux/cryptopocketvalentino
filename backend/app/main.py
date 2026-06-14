from fastapi import FastAPI, Query
from app.prices import get_prices

app = FastAPI(title="CryptoPocket API")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/api/prices")
async def prices(
    ids: str = Query(..., description="Comma-separated coin IDs, e.g. bitcoin,ethereum"),
    vs_currency: str = Query("usd", description="Target currency, e.g. usd, eur"),
) -> dict:
    coin_ids = [c.strip() for c in ids.split(",") if c.strip()]
    return await get_prices(coin_ids, vs_currency)
