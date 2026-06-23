import os
import json
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup,
    WebAppInfo, BotCommand
)
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters
)

load_dotenv()

BOT_TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN')
ADMIN_IDS = [int(x) for x in os.getenv('ADMIN_IDS', '').split(',') if x]
WEB_APP_URL = os.getenv('WEB_APP_URL', 'http://localhost:3000')

DATA_DIR = Path('data')
DATA_DIR.mkdir(exist_ok=True)

USERS_FILE = DATA_DIR / 'users.json'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_json(file: Path, default=None):
    if file.exists():
        with open(file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return default if default is not None else {}


def save_json(file: Path, data):
    with open(file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


def track_user(update: Update):
    user = update.effective_user
    if user:
        users = load_json(USERS_FILE, {})
        users[str(user.id)] = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_seen': datetime.now().isoformat(),
            'first_seen': users.get(str(user.id), {}).get('first_seen', datetime.now().isoformat())
        }
        save_json(USERS_FILE, users)


def get_main_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🛍 Каталог", web_app=WebAppInfo(url=f"{WEB_APP_URL}/catalog.html"))],
        [InlineKeyboardButton("⚙️ Админ", web_app=WebAppInfo(url=f"{WEB_APP_URL}/admin.html"))]
    ])


def get_admin_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🛍 Каталог", web_app=WebAppInfo(url=f"{WEB_APP_URL}/catalog.html"))],
        [InlineKeyboardButton("📊 Статистика", callback_data="admin_stats")],
        [InlineKeyboardButton("📢 Рассылка", callback_data="admin_broadcast")],
        [InlineKeyboardButton("👥 Пользователи", callback_data="admin_users")],
        [InlineKeyboardButton("⚙️ Админка", web_app=WebAppInfo(url=f"{WEB_APP_URL}/admin.html"))]
    ])


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    track_user(update)
    user = update.effective_user

    text = (
        f"👋 Привет, {user.first_name}!\n\n"
        "🛒 DigiMarket — цифровой маркетплейс в Telegram\n\n"
        "Шаблоны, стикеры, пресеты, боты.\n"
        "Оплата через Telegram Stars ⭐"
    )

    keyboard = get_admin_keyboard() if is_admin(user.id) else get_main_keyboard()
    await update.message.reply_text(text, reply_markup=keyboard)


async def admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Нет доступа.")
        return

    await update.message.reply_text(
        "🔑 Админ-панель\n\nВыберите действие:",
        reply_markup=get_admin_keyboard()
    )


async def admin_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not is_admin(query.from_user.id):
        await query.edit_message_text("⛔ Нет доступа.")
        return

    users = load_json(USERS_FILE, {})
    today = datetime.now().strftime('%Y-%m-%d')
    today_users = sum(1 for u in users.values() if u.get('last_seen', '').startswith(today))

    text = (
        "📊 Статистика\n\n"
        f"👥 Всего: {len(users)}\n"
        f"📈 Сегодня: {today_users}\n"
        f"🛍 Товаров: 4\n"
        f"💰 Продаж: 0"
    )

    keyboard = [[InlineKeyboardButton("◀️ Назад", callback_data="admin_back")]]
    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard))


async def admin_broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not is_admin(query.from_user.id):
        await query.edit_message_text("⛔ Нет доступа.")
        return

    context.user_data['broadcast_mode'] = True
    await query.edit_message_text(
        "📢 Рассылка\n\n"
        "Отправьте сообщение для рассылки.\n"
        "/cancel — отмена"
    )


async def admin_users(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not is_admin(query.from_user.id):
        await query.edit_message_text("⛔ Нет доступа.")
        return

    users = load_json(USERS_FILE, {})
    user_list = "\n".join([
        f"• @{u.get('username', '?')} ({u['first_name']})"
        for u in list(users.values())[:10]
    ]) or "Нет пользователей"

    text = f"👥 Пользователи ({len(users)})\n\n{user_list}"
    keyboard = [[InlineKeyboardButton("◀️ Назад", callback_data="admin_back")]]
    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard))


async def admin_back(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(
        "🔑 Админ-панель\n\nВыберите действие:",
        reply_markup=get_admin_keyboard()
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.get('broadcast_mode') and is_admin(update.effective_user.id):
        users = load_json(USERS_FILE, {})
        success = 0
        for user_id in users:
            try:
                await context.bot.send_message(int(user_id), update.message.text)
                success += 1
            except Exception:
                pass
        context.user_data['broadcast_mode'] = False
        await update.message.reply_text(f"✅ Отправлено: {success}/{len(users)}")
        return

    await update.message.reply_text(
        "Используйте кнопки:",
        reply_markup=get_main_keyboard()
    )


async def post_init(application: Application):
    await application.bot.set_my_commands([
        BotCommand("start", "Запустить бота"),
        BotCommand("admin", "Админ-панель"),
    ])


def main():
    application = Application.builder().token(BOT_TOKEN).post_init(post_init).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admin", admin))
    application.add_handler(CommandHandler("cancel", start))

    application.add_handler(CallbackQueryHandler(admin_stats, pattern="^admin_stats$"))
    application.add_handler(CallbackQueryHandler(admin_broadcast, pattern="^admin_broadcast$"))
    application.add_handler(CallbackQueryHandler(admin_users, pattern="^admin_users$"))
    application.add_handler(CallbackQueryHandler(admin_back, pattern="^admin_back$"))

    application.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND, handle_message
    ))

    logger.info("Bot started!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
