# 🚀 Быстрый деплой DigiMarket

## Шаг 1: GitHub ✅ ГОТОВ

Репозиторий создан: https://github.com/3-TONN/digimarket

---

## Шаг 2: Telegram бот

1. Откройте Telegram, найдите **@BotFather**
2. Отправьте `/newbot`
3. Имя: `DigiMarket Bot`
4. Username: `DigiMarketShopBot` (или другой уникальный)
5. Скопируйте токен

---

## Шаг 3: Netlify (сайт)

1. Перейдите: https://app.netlify.com
2. Нажмите **Add new site** → **Import an existing project**
3. Выберите **GitHub**
4. Найдите репозиторий **digimarket**
5. Настройки:
   - **Branch:** `master`
   - **Build command:** (оставьте пустым)
   - **Publish directory:** `.`
6. Нажмите **Deploy site**
7. Дождитесь деплоя (1-2 минуты)
8. Скопируйте URL (вида `https://digimarket-xxxx.netlify.app`)

---

## Шаг 4: Render (API сервер)

1. Перейдите: https://dashboard.render.com
2. Нажмите **New** → **Web Service**
3. Подключите GitHub → выберите **digimarket**
4. Настройки:
   - **Name:** `digimarket-api`
   - **Runtime:** `Node`
   - **Build Command:** `cd api && npm install`
   - **Start Command:** `cd api && node server.js`
   - **Plan:** `Free`
5. Добавьте переменные окружения (Environment Variables):
   ```
   NODE_ENV = production
   API_PORT = 10000
   ALLOWED_ORIGINS = https://ваш-сайт.netlify.app
   ```
6. Нажмите **Create Web Service**
7. Дождитесь деплоя (2-3 минуты)
8. Скопируйте URL (вида `https://digimarket-api-xxxx.onrender.com`)

---

## Шаг 5: Render (бот)

1. В Render нажмите **New** → **Background Worker**
2. Подключите GitHub → выберите **digimarket**
3. Настройки:
   - **Name:** `digimarket-bot`
   - **Runtime:** `Python 3`
   - **Build Command:** `cd bot && pip install -r requirements.txt`
   - **Start Command:** `cd bot && python bot.py`
   - **Plan:** `Free`
4. Добавьте переменные окружения:
   ```
   BOT_TOKEN = ваш_токен_от_BotFather
   ADMIN_IDS = ваш_telegram_id
   WEB_APP_URL = https://ваш-сайт.netlify.app
   API_URL = https://digimarket-api-xxxx.onrender.com
   ```
5. Нажмите **Create Background Worker**
6. Дождитесь деплоя (2-3 минуты)

---

## Шаг 6: Настройка бота в Telegram

1. Откройте **@BotFather** в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите **Bot Settings** → **Menu Buttons** → **Configure menu button**
5. Введите:
   - **Button text:** Открыть магазин
   - **URL:** `https://ваш-сайт.netlify.app/catalog.html`
6. Сохраните

---

## Шаг 7: Проверка

1. **Сайт:** откройте `https://ваш-сайт.netlify.app`
2. **API:** откройте `https://digimarket-api-xxxx.onrender.com/api/health`
3. **Бот:** откройте бота в Telegram → `/start`

---

## Примечания

- **Render free tier** — сервисы засыпают через 15 минут неактивности, первый запрос может занять 30-50 секунд
- **Netlify** — бесплатный, быстрый CDN
- **Хранение данных** — JSON файлы (для продакшена лучше использовать PostgreSQL)

---

## Если что-то не работает

1. Проверьте логи в Render → Logs
2. Убедитесь, что все переменные окружения установлены
3. Проверьте, что бот отвечает на `/start`
