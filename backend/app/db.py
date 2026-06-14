import sqlite3
from contextlib import contextmanager

from app.config import settings


@contextmanager
def _conn():
    con = sqlite3.connect(settings.db_path)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def init_db() -> None:
    with _conn() as con:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS watchlist (
                user_id  INTEGER NOT NULL,
                coin_id  TEXT    NOT NULL,
                PRIMARY KEY (user_id, coin_id)
            )
            """
        )


def get_watchlist(user_id: int) -> list[str]:
    with _conn() as con:
        rows = con.execute(
            "SELECT coin_id FROM watchlist WHERE user_id = ?", (user_id,)
        ).fetchall()
    return [row["coin_id"] for row in rows]


def add_coin(user_id: int, coin_id: str) -> None:
    with _conn() as con:
        con.execute(
            "INSERT OR IGNORE INTO watchlist (user_id, coin_id) VALUES (?, ?)",
            (user_id, coin_id),
        )


def remove_coin(user_id: int, coin_id: str) -> None:
    with _conn() as con:
        con.execute(
            "DELETE FROM watchlist WHERE user_id = ? AND coin_id = ?",
            (user_id, coin_id),
        )
