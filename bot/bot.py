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
    keyboard = [
        [InlineKeyboardButton("🛍 Каталог", web_app=WebAppInfo(url=f"{WEB_APP_URL}/catalog.html"))],
        [
            InlineKeyboardButton("🔥 Хиты", web_app=WebAppInfo(url=f"{WEB_APP_URL}/catalog.html")),
            InlineKeyboardButton("🆕 Новинки", web_app=WebAppInfo(url=f"{WEB_APP_URL}/catalog.html"))
        ],
        [
            InlineKeyboardButton("👤 Профиль", callback_data="profile"),
            InlineKeyboardButton("❤️ Избранное", callback_data="favorites")
        ],
        [InlineKeyboardButton("💡 Помощь", callback_data="help")]
    ]
    return InlineKeyboardMarkup(keyboard)


def get_admin_keyboard():
    keyboard = [
        [InlineKeyboardButton("📊 Статистика", callback_data="admin_stats")],
        [InlineKeyboardButton("📢 Рассылка", callback_data="admin_broadcast")],
        [InlineKeyboardButton("🛍 Товары", callback_data="admin_products")],
        [InlineKeyboardButton("👥 Пользователи", callback_data="admin_users")],
        [InlineKeyboardButton("⚙️ Админка", web_app=WebAppInfo(url=f"{WEB_APP_URL}/admin.html"))]
    ]
    return InlineKeyboardMarkup(keyboard)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    track_user(update)
    user = update.effective_user

    welcome_text = (
        f"👋 Привет, {user.first_name}!\n\n"
        "Я — DigiMarket бот 🛒\n\n"
        "Здесь ты можешь покупать и продавать цифровые товары:\n"
        "• Шаблоны\n"
        "• Стикеры\n"
        "• Пресеты\n"
        "• Боты\n\n"
        "Оплата через Telegram Stars ⭐"
    )

    if is_admin(user.id):
        welcome_text += "\n\n🔑 Вы администратор. /admin — панель управления."

    await update.message.reply_text(welcome_text, reply_markup=get_main_keyboard())


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

    stats_text = (
        "📊 Статистика DigiMarket\n\n"
        f"👥 Всего пользователей: {len(users)}\n"
        f"📈 Сегодня активных: {today_users}\n"
        f"💰 Продаж: 0\n"
        f"💵 Доход: ⭐ 0"
    )

    keyboard = [[InlineKeyboardButton("🔄 Обновить", callback_data="admin_stats")],
                [InlineKeyboardButton("◀️ Назад", callback_data="admin_back")]]
    await query.edit_message_text(stats_text, reply_markup=InlineKeyboardMarkup(keyboard))


async def admin_broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not is_admin(query.from_user.id):
        await query.edit_message_text("⛔ Нет доступа.")
        return

    users = load_json(USERS_FILE, {})
    context.user_data['broadcast_mode'] = True

    await query.edit_message_text(
        f"📢 Рассылка\n\n"
        f"👥 Получателей: {len(users)}\n\n"
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

    users_text = (
        f"👥 Пользователи ({len(users)})\n\n"
        f"{user_list}"
    )

    keyboard = [[InlineKeyboardButton("◀️ Назад", callback_data="admin_back")]]
    await query.edit_message_text(users_text, reply_markup=InlineKeyboardMarkup(keyboard))


async def admin_products(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not is_admin(query.from_user.id):
        await query.edit_message_text("⛔ Нет доступа.")
        return

    products_text = (
        "🛍 Товары\n\n"
        "Управление товарами через админку."
    )

    keyboard = [
        [InlineKeyboardButton("⚙️ Открыть админку", web_app=WebAppInfo(url=f"{WEB_APP_URL}/admin.html"))],
        [InlineKeyboardButton("◀️ Назад", callback_data="admin_back")]
    ]
    await query.edit_message_text(products_text, reply_markup=InlineKeyboardMarkup(keyboard))


async def admin_back(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(
        "🔑 Админ-панель\n\nВыберите действие:",
        reply_markup=get_admin_keyboard()
    )


async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user = query.from_user
    users = load_json(USERS_FILE, {})
    user_data = users.get(str(user.id), {})

    profile_text = (
        f"👤 Профиль\n\n"
        f"Имя: {user.first_name}\n"
        f"Username: @{user.username or 'нет'}\n"
        f"ID: {user.id}\n"
        f"Регистрация: {user_data.get('first_seen', 'N/A')[:10]}\n\n"
        f"⭐ Баланс: 0 Stars\n"
        f"🛍 Покупок: 0\n"
        f"💰 Продаж: 0"
    )

    keyboard = [[InlineKeyboardButton("◀️ Назад", callback_data="back_main")]]
    await query.edit_message_text(profile_text, reply_markup=InlineKeyboardMarkup(keyboard))


async def favorites(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    fav_text = (
        "❤️ Избранное\n\n"
        "Пока пусто.\n"
        "Откройте каталог и нажмите ❤️ на товар."
    )

    keyboard = [
        [InlineKeyboardButton("🛍 Каталог", web_app=WebAppInfo(url=f"{WEB_APP_URL}/catalog.html"))],
        [InlineKeyboardButton("◀️ Назад", callback_data="back_main")]
    ]
    await query.edit_message_text(fav_text, reply_markup=InlineKeyboardMarkup(keyboard))


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    help_text = (
        "💡 Помощь\n\n"
        "🛒 Каталог — просмотр товаров\n"
        "👤 Профиль — ваша информация\n"
        "❤️ Избранное — сохранённые товары\n\n"
        "Для покупки откройте каталог.\n"
        "Оплата через Telegram Stars ⭐\n\n"
        "По вопросам: @DigiMarketSupport"
    )

    keyboard = [[InlineKeyboardButton("◀️ Назад", callback_data="back_main")]]
    await query.edit_message_text(help_text, reply_markup=InlineKeyboardMarkup(keyboard))


async def back_main(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(
        "🛒 DigiMarket\n\nВыберите действие:",
        reply_markup=get_main_keyboard()
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
        BotCommand("help", "Помощь"),
    ])


def main():
    application = Application.builder().token(BOT_TOKEN).post_init(post_init).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admin", admin))
    application.add_handler(CommandHandler("help", lambda u, c: help_command(u, c)))
    application.add_handler(CommandHandler("cancel", start))

    application.add_handler(CallbackQueryHandler(admin_stats, pattern="^admin_stats$"))
    application.add_handler(CallbackQueryHandler(admin_broadcast, pattern="^admin_broadcast$"))
    application.add_handler(CallbackQueryHandler(admin_users, pattern="^admin_users$"))
    application.add_handler(CallbackQueryHandler(admin_products, pattern="^admin_products$"))
    application.add_handler(CallbackQueryHandler(admin_back, pattern="^admin_back$"))
    application.add_handler(CallbackQueryHandler(profile, pattern="^profile$"))
    application.add_handler(CallbackQueryHandler(favorites, pattern="^favorites$"))
    application.add_handler(CallbackQueryHandler(help_command, pattern="^help$"))
    application.add_handler(CallbackQueryHandler(back_main, pattern="^back_main$"))

    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Bot started!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
