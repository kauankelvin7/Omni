"""Telegram command handlers for appointment confirmation workflow."""

import logging
from telegram import Update
from telegram.ext import ContextTypes

from services.api_service import ApiService
from utils.message_templates import (
    confirmed_message,
    cancelled_message,
    reschedule_message,
    clinic_cancellation_notice,
)

logger = logging.getLogger("OmniBot.handlers")

# In-memory mapping: telegram chat_id -> latest appointment_id
# In production, this would be a database or Redis cache
_user_appointment_map: dict[int, str] = {}


def set_user_appointment(chat_id: int, appointment_id: str) -> None:
    """Register the appointment currently being confirmed by a user."""
    _user_appointment_map[chat_id] = appointment_id


def get_user_appointment(chat_id: int) -> str | None:
    """Get the appointment ID associated with a chat_id."""
    return _user_appointment_map.get(chat_id)


def create_handlers(api: ApiService, clinic_name: str, clinic_address: str, clinic_phone: str):
    """Factory that returns handler functions with injected dependencies."""

    async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle /start command.

        Supports deep linking: /start <patient_uuid>
        """
        try:
            if update.effective_chat is None:
                return
            chat_id = update.effective_chat.id
            raw_args = context.args
            patient_id = None

            if raw_args and len(raw_args) >= 1:
                patient_id = raw_args[0]
            elif update.message and update.message.text:
                parts = update.message.text.split()
                if len(parts) > 1:
                    patient_id = parts[1]

            if patient_id:
                logger.info("Deep link detectado — vinculando patient_id=%s a chat_id=%d", patient_id, chat_id)
                success = api.link_telegram_chat_id(patient_id, chat_id)
                if success:
                    await update.effective_chat.send_message(
                        f"✅ *Olá! Sua conta na {clinic_name} foi vinculada com sucesso.*\n\n"
                        "A partir de agora, você receberá lembretes das suas consultas "
                        "e poderá confirmá-las ou cancelá-las diretamente por aqui.\n\n"
                        "Desejamos um excelente tratamento! 😊"
                    )
                    return
                else:
                    await update.effective_chat.send_message(
                        "⚠️ *Ops! Não conseguimos vincular sua conta.*\n\n"
                        "Houve um problema com o link de acesso. Por favor, tente clicar "
                        "novamente no link enviado pela clínica ou entre em contato conosco."
                    )
                    return

            # Generic /start without patient ID
            await update.effective_chat.send_message(
                f"👋 *Olá! Bem-vindo ao canal oficial da {clinic_name}.*\n\n"
                "Este é o nosso assistente virtual para lembretes de consultas. "
                "Para começar a receber notificações, você precisa clicar no link "
                "enviado pela nossa equipe via SMS ou WhatsApp.\n\n"
                "Assim que tivermos um agendamento para você, avisaremos por aqui! 😊"
            )
        except Exception as e:
            logger.error("Erro no /start: %s", e, exc_info=True)

    async def confirm_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle /confirmar command."""
        try:
            if update.effective_chat is None:
                return
            chat_id = update.effective_chat.id
            appointment_id = get_user_appointment(chat_id)

            if not appointment_id:
                await update.effective_chat.send_message(
                    "Não encontrei nenhuma consulta pendente para confirmação no momento. 🤷‍♂️"
                )
                return

            success = api.update_appointment_status(appointment_id, "CONFIRMED")
            if success:
                await update.effective_chat.send_message(confirmed_message(clinic_address))
            else:
                await update.effective_chat.send_message(
                    "Desculpe, tive um problema técnico ao confirmar sua consulta. "
                    f"Poderia tentar novamente mais tarde ou ligar para {clinic_phone}?"
                )
        except Exception as e:
            logger.error("Erro no /confirmar: %s", e)

    async def cancel_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle /cancelar command."""
        try:
            if update.effective_chat is None:
                return
            chat_id = update.effective_chat.id
            appointment_id = get_user_appointment(chat_id)

            if not appointment_id:
                await update.effective_chat.send_message(
                    "Não encontrei nenhuma consulta pendente para cancelamento. 🤷‍♂️"
                )
                return

            success = api.update_appointment_status(appointment_id, "CANCELLED")
            if success:
                try:
                    import os
                    admin_chat_id = os.environ.get("TELEGRAM_ADMIN_CHAT_ID")
                    if admin_chat_id:
                        apt = api.get_appointment(appointment_id)
                        if apt:
                            patient_name = apt.get("patient", {}).get("name", "Paciente")
                            raw_dt = apt.get("appointmentDate", "")
                            if "T" in raw_dt:
                                d, t = raw_dt.split("T")
                                dt_parts = d.split("-")
                                if len(dt_parts) == 3:
                                    d = f"{dt_parts[2]}/{dt_parts[1]}/{dt_parts[0]}"
                                t = t[:5]
                                dt_str = f"{d} às {t}"
                            else:
                                dt_str = raw_dt
                            msg = f"⚠️ *ATENÇÃO: Cancelamento*\n\nO paciente *{patient_name}* cancelou a consulta de {dt_str}."
                            await context.bot.send_message(chat_id=admin_chat_id, text=msg, parse_mode="Markdown")
                except Exception as ex:
                    logger.error("Erro ao notificar admin sobre cancelamento: %s", ex)

                await update.effective_chat.send_message(cancelled_message(clinic_name, clinic_phone))
            else:
                await update.effective_chat.send_message(
                    "Não consegui processar o cancelamento pelo bot. "
                    f"Por favor, entre em contato direto conosco em {clinic_phone} para avisar."
                )
        except Exception as e:
            logger.error("Erro no /cancelar: %s", e)

    async def reschedule_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle /reagendar command."""
        try:
            if update.effective_chat is None:
                return
            await update.effective_chat.send_message(reschedule_message(clinic_name, clinic_phone))
        except Exception as e:
            logger.error("Erro no /reagendar: %s", e)

    async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle /status command."""
        try:
            if update.effective_chat is None:
                return
            chat_id = update.effective_chat.id
            apts = api.get_appointments()
            
            user_apts = [
                a for a in apts 
                if a.get("patient", {}).get("telegramChatId") == chat_id
                and a.get("status") in ["SCHEDULED", "CONFIRMED"]
            ]
            
            if not user_apts:
                await update.effective_chat.send_message("Você não possui consultas futuras agendadas. 📅\nPara novos agendamentos, entre em contato com a clínica.")
                return
            
            user_apts.sort(key=lambda x: x.get("appointmentDate", ""))
            
            msg = "📅 *Suas próximas consultas:*\n\n"
            for a in user_apts:
                raw_dt = a.get("appointmentDate", "")
                dt_str = raw_dt
                if "T" in raw_dt:
                    d, t = raw_dt.split("T")
                    dp = d.split("-")
                    if len(dp) == 3:
                        d = f"{dp[2]}/{dp[1]}/{dp[0]}"
                    t = t[:5]
                    dt_str = f"{d} às {t}"
                
                status_pt = {"SCHEDULED": "Agendada", "CONFIRMED": "Confirmada"}.get(a.get("status"), a.get("status"))
                icon = "🗓️" if a.get("status") == "SCHEDULED" else "✅"
                msg += f"{icon} *{dt_str}* - {status_pt}\n"
                
            await update.effective_chat.send_message(msg, parse_mode="Markdown")
        except Exception as e:
            logger.error("Erro no /status: %s", e)

    return {
        "start": start_command,
        "confirmar": confirm_command,
        "cancelar": cancel_command,
        "reagendar": reschedule_command,
        "status": status_command,
    }
