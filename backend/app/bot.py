import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from app.config import settings

logging.basicConfig(level=logging.INFO)

bot = Bot(token=settings.bot_token)
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: Message) -> None:
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть CryptoPocket",
                    web_app=WebAppInfo(url=settings.webapp_url),
                )
            ]
        ]
    )
    await message.answer(
        "Привет! Нажми кнопку ниже, чтобы открыть CryptoPocket.",
        reply_markup=keyboard,
    )


if __name__ == "__main__":
    asyncio.run(dp.start_polling(bot))
