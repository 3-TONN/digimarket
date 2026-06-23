# 🚀 Деплой DigiMarket

Пошаговая инструкция по деплою на Netlify + Render.

## Подготовка

### 1. Создайте аккаунты

- **GitHub** — https://github.com (если нет)
- **Netlify** — https://netlify.com (войти через GitHub)
- **Render** — https://render.com (войти через GitHub)
- **Telegram** — @BotFather для получения токена

### 2. Получите токен бота

1. Откройте Telegram, найдите **@BotFather**
2. Отправьте `/newbot`
3. Придумайте имя бота: `DigiMarket Bot`
4. Придумайте username: `DigiMarketShopBot`
5. Скопируйте токен (формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 3. Узнайте свой Telegram ID

1. Откройте **@userinfobot** в Telegram
2. Отправьте любое сообщение
3. Скопируйте свой ID (число)

---

## Деплой на GitHub

### 1. Создайте репозиторий

```bash
# В папке marketplace
git init
git add .
git commit -m "Initial commit: DigiMarket"
```

### 2. Загрузите на GitHub

1. Зайдите на https://github.com/new
2. Название: `digimarket`
3. Public или Private
4. Нажмите **Create repository**
5. Выполните команды:

```bash
git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/digimarket.git
git branch -M main
git push -u origin main
```

---

## Деплой на Netlify (сайт)

### 1. Подключите репозиторий

1. Зайдите на https://app.netlify.com
2. Нажмите **Add new site** → **Import an existing project**
3. Выберите **GitHub**
4. Найдите репозиторий `digimarket`
5. Нажмите **Import site**

### 2. Настройте сборку

- **Branch:** `main`
- **Build command:** (оставьте пустым)
- **Publish directory:** `.`
- Нажмите **Deploy site**

### 3. Настройте домен (опционально)

1. В настройках сайта → **Domain management**
2. Нажмите **Add custom domain**
3. Введите ваш домен
4. Настройте DNS у вашего регистратора

### 4. Получите URL сайта

После деплоя вы получите URL вида:
```
https://digimarket-xxxx.netlify.app
```

---

## Деплой на Render (API + бот)

### 1. Создайте API сервер

1. Зайдите на https://dashboard.render.com
2. Нажмите **New** → **Web Service**
3. Подключите GitHub репозиторий `digimarket`
4. Настройки:
   - **Name:** `digimarket-api`
   - **Runtime:** `Node`
   - **Build Command:** `cd api && npm install`
   - **Start Command:** `cd api && node server.js`
   - **Plan:** `Free`
5. Добавьте переменные окружения:
   ```
   NODE_ENV = production
   API_PORT = 10000
   ALLOWED_ORIGINS = https://digimarket-xxxx.netlify.app
   ```
6. Нажмите **Create Web Service**

### 2. Создайте бота

1. Нажмите **New** → **Background Worker**
2. Подключите GitHub репозиторий `digimarket`
3. Настройки:
   - **Name:** `digimarket-bot`
   - **Runtime:** `Python`
   - **Build Command:** `cd bot && pip install -r requirements.txt`
   - **Start Command:** `cd bot && python bot.py`
   - **Plan:** `Free`
4. Добавьте переменные окружения:
   ```
   BOT_TOKEN = ваш_токен_от_BotFather
   ADMIN_IDS = ваш_telegram_id
   WEB_APP_URL = https://digimarket-xxxx.netlify.app
   API_URL = https://digimarket-api-xxxx.onrender.com
   ```
5. Нажмите **Create Background Worker**

---

## Настройка Telegram бота

### 1. Настройте Web App

1. Откройте **@BotFather** в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите **Bot Settings** → **Menu Buttons** → **Configure menu button**
5. Введите:
   - **Button text:** Открыть магазин
   - **URL:** `https://digimarket-xxxx.netlify.app/catalog.html`

### 2. Настройте команды

В @BotFather:
```
/mybots → ваш бот → Bot Commands → Edit commands
```

Вставьте:
```
start - Запустить бота
admin - Админ-панель
help - Помощь
```

---

## Проверка

### 1. Проверьте сайт

Откройте `https://digimarket-xxxx.netlify.app`

### 2. Проверьте API

Откройте `https://digimarket-api-xxxx.onrender.com/api/health`

Должно вернуть:
```json
{"status":"ok","timestamp":"2026-06-23T..."}
```

### 3. Проверьте бота

1. Откройте бота в Telegram
2. Отправьте `/start`
3. Нажмите **🛍 Каталог**

---

## Переменные окружения

### Netlify (сайт)

Переменные настраиваются через `netlify.toml` или в интерфейсе.

### Render (API)

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `NODE_ENV` | Режим | `production` |
| `API_PORT` | Порт | `10000` |
| `ALLOWED_ORIGINS` | Разрешённые домены | `https://digimarket-xxxx.netlify.app` |

### Render (бот)

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `BOT_TOKEN` | Токен бота | `123456789:ABCdef...` |
| `ADMIN_IDS` | ID админов | `123456789` |
| `WEB_APP_URL` | URL сайта | `https://digimarket-xxxx.netlify.app` |
| `API_URL` | URL API | `https://digimarket-api-xxxx.onrender.com` |

---

## Частые ошибки

### Бот не отвечает

1. Проверьте `BOT_TOKEN` в переменных окружения
2. Проверьте логи в Render → digimarket-bot → Logs
3. Убедитесь, что бот запущен (статус: Live)

### Сайт не работает

1. Проверьте логи в Netlify → Deploys → Deploy log
2. Убедитесь, что все файлы загружены в GitHub

### API не отвечает

1. Проверьте `https://digimarket-api-xxxx.onrender.com/api/health`
2. Проверьте логи в Render → digimarket-api → Logs
3. Первый запуск может занять 2-3 минуты ( free tier холодный старт)

---

## Обновление

При каждом push в GitHub автоматически:
- **Netlify** — пересобирает сайт
- **Render** — перезапускает сервисы

```bash
git add .
git commit -m "Обновление"
git push
```
