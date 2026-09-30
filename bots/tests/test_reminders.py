"""Regression coverage using standard-library unittest; no real Telegram/API calls."""
import asyncio
import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services.scheduler_service import filter_tomorrow_appointments, send_reminders
from handlers.appointment_handler import latest_pending_appointment
from utils.message_templates import confirmation_message


class ReminderTests(unittest.TestCase):
    def test_tomorrow_respects_clinic_timezone(self):
        tz = ZoneInfo("America/Sao_Paulo")
        tomorrow = (datetime.now(tz) + timedelta(days=1)).replace(hour=10, minute=0)
        appointment = {"id": "one", "appointmentDate": tomorrow.isoformat(), "status": "SCHEDULED"}
        self.assertEqual([appointment], filter_tomorrow_appointments([appointment], "America/Sao_Paulo"))

    def test_pending_appointment_is_resolved_from_api_not_in_memory(self):
        tz = ZoneInfo("America/Sao_Paulo")
        future = (datetime.now(tz) + timedelta(days=2)).isoformat()
        foreign = (datetime.now(tz) + timedelta(days=1)).isoformat()
        appts = [
            {"id": "wrong", "patient": {"telegramChatId": 999}, "status": "SCHEDULED", "appointmentDate": foreign},
            {"id": "confirmed", "patient": {"telegramChatId": 123}, "status": "CONFIRMED", "appointmentDate": foreign},
            {"id": "right", "patient": {"telegramChatId": 123}, "status": "SCHEDULED", "appointmentDate": future},
        ]
        self.assertEqual("right", latest_pending_appointment(appts, 123)["id"])
        self.assertIsNone(latest_pending_appointment(appts, 777))

    def test_scheduler_sends_message_to_linked_patient(self):
        tz = ZoneInfo("America/Sao_Paulo")
        tomorrow = (datetime.now(tz) + timedelta(days=1)).replace(hour=10, minute=0).isoformat()
        appointment = {"id": "abc", "patient": {"name": "Paciente", "telegramChatId": 123},
                       "appointmentDate": tomorrow, "status": "SCHEDULED"}
        class FakeApi:
            def get_appointments(self):
                return [appointment]
        messages = []
        async def collect(chat_id, message):
            messages.append((chat_id, message))
        sent = asyncio.run(send_reminders(FakeApi(), "Clínica", "Rua de exemplo", collect))
        self.assertEqual(1, sent)
        self.assertEqual(123, messages[0][0])

    def test_message_renders_real_newline_not_escaped_literal(self):
        message = confirmation_message("Paciente", "10:00", "Clínica", "Rua de exemplo")
        self.assertNotIn("\\n", message)


if __name__ == "__main__":
    unittest.main()
