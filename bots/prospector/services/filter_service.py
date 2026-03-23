import os
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Define o caminho do arquivo leads.json relativo a este script
DATA_DIR = Path(__file__).parent.parent / "data"
LEADS_FILE = DATA_DIR / "leads.json"

def _load_leads() -> list:
    if not LEADS_FILE.exists():
        return []
    try:
        with open(LEADS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Erro ao ler {LEADS_FILE}: {e}")
        return []

def _save_leads(leads: list):
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(LEADS_FILE, "w", encoding="utf-8") as f:
            json.dump(leads, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Erro ao salvar {LEADS_FILE}: {e}")

def filter_new_leads(scraped_leads: list) -> list:
    """
    Recebe os leads raspados e filtra os que já existem no leads.json.
    Retorna apenas os leads novos. Usa o 'place_id' ou 'name' como chave única.
    """
    logger.info("Filtrando leads já prospectados...")
    existing_leads = _load_leads()
    
    # Criamos um set de IDs ou nomes conhecidos para busca O(1)
    known_keys = set()
    for lead in existing_leads:
        key = lead.get("place_id") or lead.get("name")
        if key:
            known_keys.add(key)
            
    new_leads = []
    for lead in scraped_leads:
        key = lead.get("place_id") or lead.get("name")
        if key and key not in known_keys:
            new_leads.append(lead)
            known_keys.add(key) # Adiciona ao set para evitar duplicatas na mesma execução
            
    logger.info(f"De {len(scraped_leads)} leads buscados, {len(new_leads)} são novos.")
    return new_leads

def mark_as_sent(lead: dict):
    """
    Adiciona o lead ao leads.json após ser enviado com sucesso.
    """
    leads = _load_leads()
    leads.append(lead)
    _save_leads(leads)
    logger.debug(f"Lead '{lead.get('name')}' salvo no banco de dados local.")
