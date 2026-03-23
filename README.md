# Omni B2B

![Produção Backend (Render)](https://img.shields.io/badge/Render%20Free%20API-Online-brightgreen?style=flat&logo=render)
![Produção Frontend (Vercel)](https://img.shields.io/badge/Vercel%20SPA-Online-black?style=flat&logo=vercel)
![Status Base de Dados](https://img.shields.io/badge/Supabase%20PostgreSQL-Sa--East--1-3ecf8e?style=flat&logo=supabase)
![Arquitetura](https://img.shields.io/badge/Architecture-Multi--Tenant-blueviolet?style=flat)

> Sistema de gestão e automação para clínicas.
> Reduz faltas de pacientes com confirmações automáticas via Telegram e painel administrativo completo.

**Desenvolvido por Kauan Kelvin**

---

### 📖 Documentação de Produção
- [🚀 Guia de Operação (PRODUCTION.md)](./docs/PRODUCTION.md)
- [📊 Guia de Monitoramento (MONITORING.md)](./docs/MONITORING.md)
- [📜 Changelog](./CHANGELOG.md)

---

## Funcionalidades

- Painel completo de gestão de pacientes e agendamentos
- Bot Telegram de confirmação automática 24h antes
- Lembretes personalizados com dados da clínica
- Sistema multi-tenant (múltiplas clínicas isoladas)
- Bot de prospecção autônoma de novos clientes
- Autenticação JWT com refresh automático
- Landing page profissional com planos de assinatura
- Design system inspirado no Linear

## Stack

| Camada   | Tecnologia                   |
| -------- | ---------------------------- |
| Backend  | Java 17 + Spring Boot 3     |
| Frontend | React 18 + TypeScript strict |
| Bots     | Python 3.12                  |
| Banco    | PostgreSQL 16                |
| Infra    | Docker + Docker Compose      |

## Pré-requisitos

- Docker e Docker Compose instalados
- Java 17 ou superior
- Node.js 18 ou superior
- Python 3.12 ou superior

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/kauankelvin/omni-b2b
cd omni-b2b
```

### 2. Configure as variáveis de ambiente

```bash
cp bots/.env.example bots/.env
cp bots/prospector/.env.example bots/prospector/.env
cp frontend/.env.example frontend/.env
# Preencha os tokens necessários em cada .env
```

### 3. Suba o banco de dados

```bash
docker compose up -d
```

### 4. Rode o backend

```bash
cd backend
./mvnw spring-boot:run
```

### 5. Rode o frontend

```bash
cd frontend
npm install && npm run dev
```

### 6. Rode o bot de confirmação

```bash
cd bots
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

### 7. Rode o bot prospector (opcional)

```bash
cd bots/prospector
source ../venv/bin/activate
python3 main.py
```

### Atalho: rodar tudo com um comando

```bash
chmod +x start.sh && ./start.sh
```

### 8. Acesse

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8080
- **Credenciais padrão:** admin@clinicateste.com / admin123

## Estrutura do projeto

```
omni/
├── .context/          # Memória persistente dos agentes IA
├── backend/           # API REST Spring Boot
│   └── src/main/java/com/omnib2b/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       └── domain/
├── frontend/          # Dashboard React + Landing Page
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── styles/
├── bots/              # Bot de confirmação Telegram
│   ├── handlers/
│   ├── services/
│   └── utils/
├── bots/prospector/   # Bot de prospecção autônoma
├── docker/            # Scripts SQL e configurações
├── logs/              # Logs de execução
├── start.sh           # Inicia todo o sistema
├── stop.sh            # Para todo o sistema
└── docker-compose.yml
```

## Variáveis de ambiente

### bots/.env

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_CHAT_ID=
TELEGRAM_ADMIN_CHAT_ID=
CLINIC_NAME=
CLINIC_ADDRESS=
CLINIC_PHONE=
API_BASE_URL=http://localhost:8080
API_EMAIL=admin@clinicateste.com
API_PASSWORD=admin123
```

### bots/prospector/.env

```
SERPAPI_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_PROSPECT_CHAT_ID=
```

### frontend/.env

```
VITE_API_URL=http://localhost:8080
```

## Licença

MIT License — veja o arquivo [LICENSE](./LICENSE)

---

© 2026 Kauan Kelvin
