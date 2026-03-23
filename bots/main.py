"""Omni B2B Telegram Bot — Entry point."""

import logging
import os
import sys

from dotenv import load_dotenv
from telegram.ext import ApplicationBuilder, CommandHandler, Application
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from handlers.appointment_handler import create_handlers
from services.api_service import ApiService
from services.scheduler_service import send_reminders

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("OmniBot")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")
BOT_EMAIL = os.getenv("BOT_EMAIL", "")
BOT_PASSWORD = os.getenv("BOT_PASSWORD", "")
CLINIC_NAME = os.getenv("CLINIC_NAME", "Sua Clínica")
CLINIC_ADDRESS = os.getenv("CLINIC_ADDRESS", "Endereço da Clínica")
CLINIC_PHONE = os.getenv("CLINIC_PHONE", "(00) 00000-0000")

if not TELEGRAM_TOKEN:
    logger.critical("TELEGRAM_BOT_TOKEN não configurado no .env — abortando.")
    sys.exit(1)

if not BOT_EMAIL or not BOT_PASSWORD:
    logger.warning("BOT_EMAIL ou BOT_PASSWORD ausente no .env — chamadas à API falharão.")


def main() -> None:
    """Bootstrap the Telegram bot and start polling."""
    logger.info("Iniciando Omni B2B Telegram Bot...")

    # ---- Backend API client ----
    api = ApiService(base_url=API_BASE_URL, email=BOT_EMAIL, password=BOT_PASSWORD)

    # ---- Scheduler (created here, started inside the running event loop) ----
    scheduler = AsyncIOScheduler()

    # ---- post_init / post_shutdown hooks — run inside the event loop ----
    async def on_startup(app: Application) -> None:
        async def bot_send_fn(chat_id: int, text: str) -> None:
            await app.bot.send_message(chat_id=chat_id, text=text, parse_mode="Markdown")

        scheduler.add_job(
            send_reminders,
            trigger="cron",
            hour=8,
            minute=0,
            kwargs={
                "api": api,
                "clinic_name": CLINIC_NAME,
                "clinic_address": CLINIC_ADDRESS,
                "bot_send_fn": bot_send_fn,
            },
        )
        scheduler.start()
        logger.info("Scheduler iniciado — lembretes diários às 08:00.")

    async def on_shutdown(app: Application) -> None:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler encerrado.")

    # ---- Telegram application ----
    app = (
        ApplicationBuilder()
        .token(TELEGRAM_TOKEN)
        .post_init(on_startup)
        .post_shutdown(on_shutdown)
        .build()
    )

    # ---- Register command handlers ----
    handlers = create_handlers(
        api=api,
        clinic_name=CLINIC_NAME,
        clinic_address=CLINIC_ADDRESS,
        clinic_phone=CLINIC_PHONE
    )
    for command_name, handler_fn in handlers.items():
        app.add_handler(CommandHandler(command_name, handler_fn))

    # ---- Start polling ----
    logger.info("Bot polling iniciado. Pressione Ctrl+C para parar.")
    app.run_polling()


if __name__ == "__main__":
    main()
