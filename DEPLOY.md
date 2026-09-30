# Guia de Deploy — Omni B2B

Este guia detalha o processo de implantação em produção do Omni B2B utilizando Docker Compose (para VPS padrão) ou Render (para PaaS).

## Opção 1: Deploy com Docker Compose (VPS / AWS EC2 / DigitalOcean)

Ideal para servidores independentes e controle total do ambiente.

### 1. Preparação do Servidor

Conecte-se à sua VPS via SSH e instale os pré-requisitos:
```bash
# Atualize os pacotes
sudo apt update && sudo apt upgrade -y

# Instale o Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y
```

### 2. Clonagem e Configuração

```bash
git clone https://github.com/seu-usuario/omni-b2b.git
cd omni-b2b

# Copie o env de produção e edite com valores fortes
cp .env.example .env
nano .env
```
Certifique-se de configurar variáveis geradas com segurança (`JWT_SECRET`, `SEED_SECRET`).

### 3. Subir a Aplicação

```bash
# Baixe imagens e inicie os containers em background
docker compose -f docker-compose.prod.yml up -d --build
```
A partir desse momento, o Postgres, Backend e Frontend estarão rodando. Nginx já responde na porta 80. Recomendamos configurar um proxy reverso SSL (como Traefik ou Nginx-Proxy-Manager) para habilitar HTTPS.

---

## Opção 2: Deploy no Render.com (PaaS Automático)

Ideal para escala automática (Serverless/PaaS) e deploys sem toque (Continuous Deployment).

1. Crie uma conta em [Render.com](https://render.com).
2. Conecte seu repositório GitHub.
3. Clique em **New** > **Blueprint**.
4. Selecione o repositório atual do Omni B2B.
5. O Render detectará automaticamente o arquivo `render.yaml` na raiz do projeto e criará 3 serviços:
   - **omni-postgres**: Banco de dados gerenciado.
   - **omni-backend**: API Spring Boot em Java.
   - **omni-frontend**: SPA React servida via roteamento de arquivos estáticos.

_Nota: No Render, não é necessário gerenciar portas ou SSL; ambos são providos automaticamente._

---

## Configurando o primeiro administrador master

A criação de administradores por endpoint público foi removida por segurança.
Configure `MASTER_EMAIL` e `MASTER_PASSWORD` como variáveis privadas **antes**
do primeiro início do backend. O `MasterAdminSeeder` cria somente a conta
configurada caso ela ainda não exista.

Configure também `JWT_SECRET` e `MASTER_JWT_SECRET` com chaves aleatórias
**diferentes**, geradas separadamente (ex.: `openssl rand -hex 32`).
Remover `MASTER_PASSWORD` após o primeiro bootstrap é permitido somente se
a configuração Spring do ambiente aceitar variável vazia e não depender dela
para iniciar. Não exponha um endpoint HTTP de seed.

Em novas implantações, consulte também
[`docs/AUDITORIA-2026-09-30.md`](docs/AUDITORIA-2026-09-30.md)
para limitações verificadas e etapas pendentes de infraestrutura.
