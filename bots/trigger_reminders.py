"""Manual trigger for send_reminders — run from inside the bots/ directory with venv active."""
import asyncio
import os
from dotenv import load_dotenv
from services.api_service import ApiService
from services.scheduler_service import send_reminders

load_dotenv()

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")
BOT_EMAIL = os.getenv("BOT_EMAIL", "")
BOT_PASSWORD = os.getenv("BOT_PASSWORD", "")
CLINIC_NAME = os.getenv("CLINIC_NAME", "Sua Clínica")

api = ApiService(base_url=API_BASE_URL, email=BOT_EMAIL, password=BOT_PASSWORD)


async def main():
    # bot_send_fn that just prints instead of really sending — for dry-run
    async def bot_send_fn(chat_id: int, text: str) -> None:
        print(f"\n✅ [DRY-RUN] Mensagem para chat_id={chat_id}:\n{text}\n")

    count = await send_reminders(
        api=api,
        clinic_name=CLINIC_NAME,
        bot_send_fn=bot_send_fn,
    )
    print(f"\nTotal lembretes processados: {count}")


asyncio.run(main())
