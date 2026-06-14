from dataclasses import dataclass
from dotenv import load_dotenv
import os

load_dotenv()


@dataclass
class Settings:
    bot_token: str
    webapp_url: str
    api_port: int
    coingecko_api_key: str | None


settings = Settings(
    bot_token=os.getenv("BOT_TOKEN", ""),
    webapp_url=os.getenv("WEBAPP_URL", ""),
    api_port=int(os.getenv("API_PORT", "8000")),
    coingecko_api_key=os.getenv("COINGECKO_API_KEY"),
)
