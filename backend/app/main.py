from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel

from app.auth import get_user_id
from app.db import add_coin, get_watchlist, init_db, remove_coin
from app.prices import get_prices


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="CryptoPocket API", lifespan=lifespan)


# ── Prices ────────────────────────────────────────────────────────────────────

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


# ── Watchlist ─────────────────────────────────────────────────────────────────

class CoinBody(BaseModel):
    coin_id: str


@app.get("/api/watchlist")
async def watchlist_get(user_id: int = Depends(get_user_id)) -> dict:
    return {"coins": get_watchlist(user_id)}


@app.post("/api/watchlist")
async def watchlist_add(
    body: CoinBody,
    user_id: int = Depends(get_user_id),
) -> dict:
    if not body.coin_id.strip():
        raise HTTPException(status_code=422, detail="coin_id must not be empty")
    add_coin(user_id, body.coin_id.strip().lower())
    return {"ok": True}


@app.delete("/api/watchlist/{coin_id}")
async def watchlist_remove(
    coin_id: str,
    user_id: int = Depends(get_user_id),
) -> dict:
    remove_coin(user_id, coin_id.lower())
    return {"ok": True}
