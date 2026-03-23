"""Templates de mensagens enviadas pelo bot Telegram."""


def confirmation_message(patient_name: str, appointment_time: str, clinic_name: str, clinic_address: str) -> str:
    """Mensagem de confirmação enviada 24h antes da consulta com tom amigável."""
    return (
        f"Olá {patient_name}, tudo bem? 😊\n\n"
        f"Passando para lembrar que temos um horário reservado para você amanhã!\\n\n"
        f"📅 *Data:* Amanhã\n"
        f"🕒 *Horário:* {appointment_time}\n"
        f"🏥 *Local:* {clinic_name}\n"
        f"📍 *Endereço:* {clinic_address}\n\n"
        f"Poderia nos confirmar se conseguirá comparecer?\n"
        f"Use /confirmar para garantir sua vaga ou /cancelar se precisar desmarcar."
    )


def confirmed_message(clinic_address: str) -> str:
    return (
        "✅ *Excelente! Sua consulta está confirmada.*\n\n"
        "Ficamos muito felizes em atendê-lo(a). Nos vemos amanhã!\n"
        f"📍 *Lembrete do endereço:* {clinic_address}"
    )


def cancelled_message(clinic_name: str, clinic_phone: str) -> str:
    return (
        "Tudo bem, entendemos perfeitamente. 😊\n\n"
        "Sua consulta foi cancelada com sucesso. Se quiser reagendar para uma data mais conveniente, "
        f"estamos à disposição no telefone {clinic_phone} ou diretamente na {clinic_name}.\n\n"
        "Tenha um ótimo dia!"
    )


def reschedule_message(clinic_name: str, clinic_phone: str) -> str:
    return (
        f"📅 Para escolher um novo horário na *{clinic_name}*, você pode:\n\n"
        f"1. Ligar ou enviar WhatsApp para {clinic_phone}\n"
        f"2. Acessar nosso sistema de agendamento online.\n\n"
        "Estamos ansiosos para vê-lo(a) em breve!"
    )


def clinic_cancellation_notice(patient_name: str, appointment_time: str) -> str:
    """Notificação técnica para a clínica."""
    return (
        f"⚠️ Notificação: O paciente {patient_name} cancelou a consulta de "
        f"{appointment_time}. O horário já está disponível para novos agendamentos."
    )
