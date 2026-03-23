import os
import requests
import logging

logger = logging.getLogger(__name__)

# Configuração da URL da API do SerpAPI
SERPAPI_URL = "https://serpapi.com/search"

def search_clinics(specialty: str, city: str) -> list:
    """
    Busca clínicas usando a engine google_maps do SerpAPI.
    Retorna uma lista de dicionários com os dados brutos.
    """
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        logger.error("SERPAPI_KEY não configurada no .env")
        return []

    query = f"Clínica de {specialty} em {city}"
    logger.info(f"Buscando leads no SerpAPI: {query}")

    params = {
        "engine": "google_maps",
        "q": query,
        "api_key": api_key,
        "hl": "pt",
        "gl": "br"
    }

    try:
        response = requests.get(SERPAPI_URL, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # O SerpAPI retorna os locais em 'local_results'
        results = data.get("local_results", [])
        logger.info(f"Encontrados {len(results)} resultados preliminares para '{query}'.")
        
        leads = []
        for place in results:
            place_id = place.get("place_id")
            if not place_id:
                continue
                
            lead = {
                "name": place.get("title", "Não informado"),
                "address": place.get("address", "Não informado"),
                "phone": place.get("phone", "Não informado"),
                "site": place.get("website", "Não informado"),
                "email": "Verificar no site", # SerpAPI geralmente não traz e-mail direto no google maps
                "specialty": specialty,
                "city": city,
                "place_id": place_id
            }
            leads.append(lead)

        return leads

    except requests.RequestException as e:
        logger.error(f"Erro de rede ao buscar clínicas no SerpAPI: {e}")
        return []
    except Exception as e:
        logger.error(f"Erro inesperado no search_service: {e}")
        return []
