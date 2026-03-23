import os
import sys
import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from dotenv import load_dotenv

from services.search_service import search_clinics
from services.filter_service import filter_new_leads, mark_as_sent
from services.telegram_service import send_lead

# Configurações de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("prospector.log", encoding="utf-8")
    ]
)
logger = logging.getLogger(__name__)

# Configuração de escopo de busca
SPECIALTIES = ["Odontologia", "Psicologia", "Estética"]
CITIES = ["Brasília", "Águas Claras", "Taguatinga", "Goiânia", "Anápolis"]

def prospect_job():
    """
    Job principal que orquestra a prospecção:
    1. Varre cidades e especialidades
    2. Busca no Maps
    3. Filtra duplicados (já enviados)
    4. Envia para o Telegram
    5. Salva os novos contatos
    """
    logger.info("=== Iniciando Rotina de Prospecção Automática ===")
    
    total_leads_enviados = 0
    
    for city in CITIES:
        for specialty in SPECIALTIES:
            # 1. Busca clínicas
            raw_leads = search_clinics(specialty, city)
            if not raw_leads:
                continue
                
            # 2. Filtra as que já prospectamos
            new_leads = filter_new_leads(raw_leads)
            
            # Limita a enviar no máximo 3 por tipo para não floodar o Telegram a cada dia
            leads_to_send = new_leads[:3]
            
            # 3. Envia para o telegram e marca como salvo
            for lead in leads_to_send:
                if send_lead(lead):
                    mark_as_sent(lead)
                    total_leads_enviados += 1
                    
    logger.info(f"=== Rotina Finalizada. {total_leads_enviados} novos leads enviados ===")

def main():
    load_dotenv()
    
    # Verifica se as variáveis de ambiente necessárias estão configuradas
    required_vars = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_PROSPECT_CHAT_ID", "SERPAPI_KEY"]
    for var in required_vars:
        if not os.getenv(var):
            logger.warning(f"Atenção: A variável {var} não está definida no arquivo .env.")

    # Inicia o agendador
    scheduler = BlockingScheduler()
    
    # Adicionando o job para rodar 1 vez por dia (exemplo: 09:00 da manhã)
    scheduler.add_job(prospect_job, 'cron', hour=9, minute=0, timezone="America/Sao_Paulo")
    
    logger.info("Bot de prospecção iniciado. Aguardando execução diária (09:00 BRT).")
    logger.info("Rodando primeira execução manual agora...")
    
    # Roda a primeira vez na hora que abre o script para testes (opcional, pode ser removido)
    try:
        prospect_job()
    except Exception as e:
        logger.error(f"Erro na execução manual inicial: {e}")
        
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot de prospecção encerrado com sucesso.")

if __name__ == "__main__":
    main()
