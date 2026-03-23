import os
import requests
import logging

logger = logging.getLogger(__name__)

def send_lead(lead: dict) -> bool:
    """
    Envia o lead formatado para o Telegram informando os dados da clínica.
    """
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_PROSPECT_CHAT_ID")
    
    if not bot_token or not chat_id:
        logger.error("TELEGRAM_BOT_TOKEN ou TELEGRAM_PROSPECT_CHAT_ID ausentes no .env")
        return False
        
    import html
    
    def safe_html(text):
        return html.escape(str(text)) if text else ""
        
    text = (
        f"🎯 <b>Novo Lead Prospectado!</b>\n\n"
        f"🏥 <b>Clínica:</b> {safe_html(lead.get('name'))}\n"
        f"📍 <b>Cidade:</b> {safe_html(lead.get('city'))}\n"
        f"📞 <b>Telefone:</b> {safe_html(lead.get('phone'))}\n"
        f"📧 <b>Email:</b> {safe_html(lead.get('email'))}\n"
        f"🌐 <b>Site:</b> {safe_html(lead.get('site'))}\n"
        f"➡️ <b>Especialidade:</b> {safe_html(lead.get('specialty'))}\n"
        f"\n📍 <b>Endereço:</b> {safe_html(lead.get('address'))}"
    )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logger.info(f"Lead enviado para o Telegram com sucesso: {lead.get('name')}")
        return True
    except requests.RequestException as e:
        logger.error(f"Erro ao enviar lead para o Telegram: {e}")
        return False
