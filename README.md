# CryptoPocket 🪙

Telegram Mini App для отслеживания крипто-цен и конвертации валют.
Открывается прямо внутри Telegram.

> Учебный/портфолио-проект. Демонстрирует работу с Telegram WebApp API,
> авторизацию через `initData`, фронтенд на React и бэкенд на FastAPI + aiogram.

## Возможности

- 📋 **Watchlist** — добавляй монеты, смотри живые цены и изменение за 24ч
- 🔄 **Конвертер** — переводи между криптой и фиатом по актуальным курсам
- 🔐 Авторизация через Telegram `initData` (валидация подписи на сервере)

## Скриншоты

<!-- Сюда добавить GIF/скриншот работающего приложения — это важно для портфолио -->

## Стек

**Frontend:** React, Vite, Telegram WebApp SDK, Tailwind CSS
**Backend:** Python, FastAPI, aiogram, SQLite
**Данные:** CoinGecko API

## Архитектура

```
Telegram ──> Mini App (React, Vercel)
                 │  initData
                 ▼
            Backend API (FastAPI, VPS)
                 │  валидация подписи
                 ├──> SQLite (watchlist)
                 └──> CoinGecko (цены)
```

## Запуск локально

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env              # заполни BOT_TOKEN
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Лицензия

MIT
