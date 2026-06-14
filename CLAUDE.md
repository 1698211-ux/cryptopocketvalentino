# CryptoPocket — Telegram Mini App

Учебный/портфолио-проект: Telegram Mini App с двумя функциями —
**Watchlist** (избранные монеты, живые цены, изменение за 24ч) и
**Converter** (конвертация крипта↔фиат по тем же курсам).

Цель проекта: чистый, профессионально структурированный кейс для портфолио
фрилансера. Код должен быть читаемым, с понятными коммитами и рабочим README.

---

## Архитектура

Mini App = два компонента в одном репозитории:

- **frontend/** — веб-приложение (React + Vite), встраивается в Telegram через
  `@twa-dev/sdk`. Обязан работать по HTTPS. Не хранит секретов.
- **backend/** — бот (aiogram) + API (FastAPI). Валидирует `initData`,
  хранит watchlist пользователя, проксирует запросы цен к внешнему API.

Внешние цены берём с **CoinGecko** (бесплатный тариф, без ключа на старте).
Запросы к CoinGecko делает ТОЛЬКО бэкенд, никогда фронтенд.

```
cryptopocket/
├── frontend/              # React + Vite + Telegram WebApp SDK
│   ├── src/
│   │   ├── components/
│   │   ├── lib/           # telegram sdk init, api client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/               # FastAPI + aiogram
│   ├── app/
│   │   ├── main.py        # FastAPI app, роуты
│   │   ├── bot.py         # aiogram bot, /start с WebApp-кнопкой
│   │   ├── auth.py        # валидация initData (HMAC-SHA256)
│   │   ├── prices.py      # клиент CoinGecko
│   │   ├── db.py          # SQLite
│   │   └── config.py      # чтение .env
│   ├── requirements.txt
│   └── .env.example
├── CLAUDE.md              # этот файл
├── README.md
└── .gitignore
```

---

## Стек

| Слой      | Технология                                  |
|-----------|---------------------------------------------|
| Frontend  | React 18, Vite, @twa-dev/sdk, Tailwind CSS  |
| Backend   | Python 3.11+, FastAPI, aiogram 3.x, httpx   |
| Хранение  | SQLite (через стандартный sqlite3)          |
| Цены      | CoinGecko public API                        |
| Деплой    | Frontend → Vercel, Backend → VPS + systemd  |

---

## Безопасность (не нарушать)

- `initData` ВСЕГДА валидируется на бэкенде HMAC-SHA256 по токену бота.
  Доверять данным пользователя с фронта без проверки подписи — запрещено.
- Секреты (`BOT_TOKEN` и пр.) только в `.env`, никогда в коде и не в git.
- `.env` в `.gitignore`. В репозитории лежит только `.env.example`.
- Фронтенд не содержит токенов и не ходит во внешние API напрямую.

---

## Команды

Backend (из папки backend/):
```
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload   # API на localhost:8000
```

Frontend (из папки frontend/):
```
npm install
npm run dev                     # dev-сервер Vite
npm run build                   # прод-сборка в dist/
```

---

## Конвенции

- Коммиты маленькие, по одной фиче. Сообщения в стиле:
  `feat: add watchlist endpoint`, `fix: validate initData hash`.
- Backend: type hints везде, функции делают одну вещь.
- Frontend: компоненты в PascalCase, хуки в `src/lib/`.
- Перед крупным этапом — сначала план (plan mode), потом код.
- Не добавлять зависимости без необходимости.

---

## Этапы (текущий статус отмечай галочкой)

- [x] 0. Каркас репозитория, git init
- [x] 1. Backend: FastAPI + эндпоинт цен (CoinGecko)
- [x] 2. Bot: aiogram, /start с WebApp-кнопкой
- [x] 3. Валидация initData + SQLite watchlist
- [x] 4. Frontend: оболочка, Telegram SDK, вкладки
- [ ] 5. Фича Watchlist
- [ ] 6. Фича Converter
- [ ] 7. Деплой (Vercel + VPS + BotFather)
- [ ] 8. README со скриншотом, полировка

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
