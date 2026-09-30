"""Scheduler that checks for appointments happening the next day and sends reminders."""

import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Any

from services.api_service import ApiService
from utils.message_templates import confirmation_message

logger = logging.getLogger("OmniBot.scheduler")


def filter_tomorrow_appointments(
    appointments: list[dict[str, Any]],
    timezone_name: str = "America/Sao_Paulo",
) -> list[dict[str, Any]]:
    """Filter appointments scheduled for tomorrow that are still SCHEDULED."""
    clinic_tz = ZoneInfo(timezone_name)
    tomorrow = (datetime.now(clinic_tz) + timedelta(days=1)).date()
    results: list[dict[str, Any]] = []

    for apt in appointments:
        try:
            date_str = apt.get("appointmentDate", "")
            if not date_str:
                continue
            date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            # Naive local times are interpreted in the clinic's configured timezone.
            if date.tzinfo is None:
                date = date.replace(tzinfo=clinic_tz)
            apt_date = date.astimezone(clinic_tz).date()
            if apt_date == tomorrow and apt.get("status", "") == "SCHEDULED":
                results.append(apt)
        except (ValueError, TypeError) as e:
            logger.warning("Data inválida no agendamento %s: %s", apt.get("id"), e)

    return results


async def send_reminders(
    api: ApiService,
    clinic_name: str,
    clinic_address: str,
    bot_send_fn: Any,
    timezone_name: str = "America/Sao_Paulo",
) -> int:
    """
    Fetch tomorrow's appointments and send Telegram reminders.

    Returns the number of messages sent.
    """
    appointments = api.get_appointments()
    tomorrow_apts = filter_tomorrow_appointments(appointments, timezone_name=timezone_name)

    if not tomorrow_apts:
        logger.info("Nenhum agendamento para amanhã encontrado.")
        return 0

    sent = 0
    for apt in tomorrow_apts:
        try:
            patient = apt.get("patient", {})
            patient_name = patient.get("name", "Paciente")
            telegram_chat_id = patient.get("telegramChatId")
            date_str = apt.get("appointmentDate", "")
            clinic_tz = ZoneInfo(timezone_name)
            date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            if date.tzinfo is None:
                date = date.replace(tzinfo=clinic_tz)
            apt_time = date.astimezone(clinic_tz).strftime("%H:%M")

            msg = confirmation_message(patient_name, apt_time, clinic_name, clinic_address)

            if telegram_chat_id and bot_send_fn:
                await bot_send_fn(telegram_chat_id, msg)
                logger.info("Lembrete entregue para agendamento %s", apt.get("id"))
                sent += 1
            else:
                logger.warning(
                    "Agendamento %s não tem canal Telegram vinculado — lembrete ignorado.",
                    apt.get("id"),
                )
        except Exception as e:
            logger.error("Erro ao processar lembrete para apt %s: %s", apt.get("id"), e)

    logger.info("Total de lembretes enviados: %d", sent)
    return sent
