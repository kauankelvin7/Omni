"""Scheduler that checks for appointments happening the next day and sends reminders."""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from services.api_service import ApiService
from utils.message_templates import confirmation_message

logger = logging.getLogger("OmniBot.scheduler")


def filter_tomorrow_appointments(
    appointments: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Filter appointments scheduled for tomorrow that are still SCHEDULED."""
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).date()
    results: list[dict[str, Any]] = []

    for apt in appointments:
        try:
            date_str = apt.get("appointmentDate", "")
            if not date_str:
                continue
            apt_date = datetime.fromisoformat(date_str.replace("Z", "+00:00")).date()
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
) -> int:
    """
    Fetch tomorrow's appointments and send Telegram reminders.

    Returns the number of messages sent.
    """
    appointments = api.get_appointments()
    tomorrow_apts = filter_tomorrow_appointments(appointments)

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
            apt_time = datetime.fromisoformat(
                date_str.replace("Z", "+00:00")
            ).strftime("%H:%M")

            msg = confirmation_message(patient_name, apt_time, clinic_name, clinic_address)

            if telegram_chat_id and bot_send_fn:
                await bot_send_fn(telegram_chat_id, msg)
                logger.info(
                    "Lembrete enviado para %s (chat_id=%d, apt %s)",
                    patient_name, telegram_chat_id, apt.get("id"),
                )
                sent += 1
            else:
                logger.warning(
                    "Paciente %s (apt %s) não tem telegram_chat_id — lembrete ignorado.",
                    patient_name, apt.get("id"),
                )
        except Exception as e:
            logger.error("Erro ao processar lembrete para apt %s: %s", apt.get("id"), e)

    logger.info("Total de lembretes enviados: %d", sent)
    return sent
