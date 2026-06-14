import hashlib
import hmac
import os
import time
from urllib.parse import parse_qsl, unquote

from fastapi import Depends, HTTPException, Header

from app.config import settings

# When true, an empty X-Init-Data header returns user_id=0 instead of failing.
# Set ALLOW_EMPTY_INIT_DATA=true in .env for local development only.
_DEV_ALLOW_EMPTY = os.getenv("ALLOW_EMPTY_INIT_DATA", "false").lower() == "true"

MAX_AGE_SECONDS = 3600  # reject initData older than 1 hour


def validate_init_data(init_data: str) -> int:
    """Validate Telegram initData and return user_id.

    Raises HTTPException 401 on any validation failure.
    """
    try:
        params = dict(parse_qsl(init_data, strict_parsing=True))
    except ValueError:
        raise HTTPException(status_code=401, detail="Malformed initData")

    received_hash = params.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="Missing hash")

    # Check auth_date freshness
    auth_date_raw = params.get("auth_date")
    if auth_date_raw is None:
        raise HTTPException(status_code=401, detail="Missing auth_date")
    try:
        auth_date = int(auth_date_raw)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid auth_date")
    if time.time() - auth_date > MAX_AGE_SECONDS:
        raise HTTPException(status_code=401, detail="initData expired")

    # Build data-check string: sorted key=value pairs joined by \n
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(params.items())
    )

    secret_key = hmac.new(
        key=b"WebAppData",
        msg=settings.bot_token.encode(),
        digestmod=hashlib.sha256,
    ).digest()

    expected_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise HTTPException(status_code=401, detail="Invalid hash")

    try:
        import json
        user = json.loads(unquote(params["user"]))
        return int(user["id"])
    except (KeyError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Missing user in initData")


def get_user_id(x_init_data: str = Header("", alias="X-Init-Data")) -> int:
    if not x_init_data and _DEV_ALLOW_EMPTY:
        return 0
    return validate_init_data(x_init_data)
