"""Service for communicating with the Omni B2B Spring Boot API."""

import logging
from typing import Any
import requests

logger = logging.getLogger("OmniBot.api")


class ApiService:
    """Handles all HTTP communication with the backend REST API."""

    def __init__(self, base_url: str, email: str, password: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def _login(self) -> None:
        """Call POST /auth/login and retrieve the JWT token."""
        try:
            resp = self.session.post(
                f"{self.base_url}/auth/login",
                json={"email": self.email, "password": self.password},
                timeout=10,
            )
            resp.raise_for_status()
            token = resp.json().get("token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                logger.info("Auto-JWT: Re-autenticado com sucesso via /auth/login")
            else:
                logger.error("Auto-JWT falhou: nenhum 'token' retornado pelo backend")
        except requests.exceptions.RequestException as e:
            logger.error("Auto-JWT falhou na requisição HTTP: %s", e)

    def _request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Internal wrapper that catches 401 and auto-refreshes JWT once."""
        if "Authorization" not in self.session.headers:
            self._login()

        resp = self.session.request(method, f"{self.base_url}{endpoint}", timeout=10, **kwargs)
        if resp.status_code == 401:
            logger.warning("Auto-JWT: Recebido 401, renovando token e tentando novamente...")
            self._login()
            resp = self.session.request(method, f"{self.base_url}{endpoint}", timeout=10, **kwargs)
        
        resp.raise_for_status()
        return resp

    # ---------- Appointments ----------
    def get_appointments(self) -> list[dict[str, Any]]:
        """GET /appointments — returns all appointments for the tenant encoded in the JWT."""
        try:
            response = self._request("GET", "/appointments")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error("Erro ao buscar agendamentos: %s", e)
            return []

    def get_appointment(self, appointment_id: str) -> dict[str, Any] | None:
        """GET /appointments/{id}."""
        try:
            response = self._request("GET", f"/appointments/{appointment_id}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error("Erro ao buscar agendamento %s: %s", appointment_id, e)
            return None

    def update_appointment_status(self, appointment_id: str, status: str) -> bool:
        """PUT /appointments/{id} — updates the status of an appointment."""
        try:
            self._request("PUT", f"/appointments/{appointment_id}", json={"status": status})
            logger.info("Agendamento %s atualizado para %s", appointment_id, status)
            return True
        except requests.exceptions.RequestException as e:
            logger.error("Erro ao atualizar agendamento %s: %s", appointment_id, e)
            return False

    def link_telegram_chat_id(self, patient_id: str, chat_id: int) -> bool:
        """PATCH /patients/{id}/telegram — links a Telegram chat_id to a patient."""
        try:
            self._request("PATCH", f"/patients/{patient_id}/telegram", json={"chatId": chat_id})
            logger.info("chat_id %d vinculado ao paciente %s", chat_id, patient_id)
            return True
        except requests.exceptions.RequestException as e:
            logger.error("Erro ao vincular chat_id %d ao paciente %s: %s", chat_id, patient_id, e)
            return False

