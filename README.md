# Omni B2B

![Backend](https://img.shields.io/badge/Backend-Java%2017%20%2B%20Spring%20Boot-6DB33F?style=flat&logo=springboot)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=flat&logo=react)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?style=flat&logo=postgresql)
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

## Isolamento entre clínicas

O backend obtém o `tenant_id` exclusivamente de um **JWT assinado e validado** nas rotas de clínica. O cabeçalho enviado pelo navegador `X-Tenant-ID` não controla o contexto. Leituras e exclusões de pacientes/agendamentos usam filtros explícitos por `tenant_id`, e operações de criação atribuem o ID do contexto autenticado, ignorando valores vindos no corpo da requisição.

O PostgreSQL local usa `omni_db` (mesmo nome do Docker Compose e da configuração Spring). O `JWT_SECRET` é obrigatório: não há mais uma chave pública de fallback. Esses controles não substituem uma auditoria de produção e testes de integração completos.

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
git clone https://github.com/kauankelvin7/Omni.git
cd Omni
```

### 2. Configure as variáveis de ambiente

```bash
cp backend/.env.example backend/.env
cp bots/.env.example bots/.env
cp bots/prospector/.env.example bots/prospector/.env
cp frontend/.env.example frontend/.env
# Gere duas chaves DIFERENTES (openssl rand -hex 32) e configure
# JWT_SECRET e MASTER_JWT_SECRET em backend/.env.
# Defina também MASTER_EMAIL/MASTER_PASSWORD apenas para o bootstrap master,
# BOT_EMAIL/BOT_PASSWORD para a instância do bot e outros tokens necessários.
# Não reutilize segredos de desenvolvimento em produção.
```

### 3. Suba o banco de dados

```bash
docker compose up -d
```

### 4. Rode o backend

```bash
cd backend
set -a; source .env; set +a
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
- **Primeiro acesso:** crie uma clínica em `/register` e faça login com as credenciais cadastradas. Não existe uma senha padrão da clínica.

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

## Segurança e limites conhecidos

- Após a atualização dos tokens JWT, as sessões anteriores precisam fazer login novamente.
- Tokens de refresh têm validade finita, mas a revogação individual/rotação persistente
  ainda requer armazenamento de sessões no servidor.
- O rate limiter atual usa memória de cada instância; configure proteção adicional
  no proxy/CDN antes de abrir o serviço publicamente.
- O bot Telegram ainda é configurado por instância de clínica: não misture credenciais
  de diferentes clínicas no mesmo processo.
- Nunca use valores de exemplo como senhas, chaves ou variáveis de produção.

Consulte [auditoria técnica](docs/AUDITORIA-2026-09-30.md) antes de um deploy real.
