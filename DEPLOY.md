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

## Criando Tabela Master e Primeiro Administrador

No primeiro deploy em produção, é necessário garantir a existência da tabela `admins` (a migration cuida disso) e injetar o master admin original. O sistema possui um endpoint seguro de "seed".

1. Encontre a URL base da sua API em produção (ex: `https://api.omni.sua-empresa.com`).
2. Obtenha o `SEED_SECRET` que você configurou no ambiente de produção.
3. Dispare uma requisição POST para o "seed":

```bash
curl -X POST https://api.omni.sua-empresa.com/master/admins/seed \
  -H "Content-Type: application/json" \
  -d '{
    "seed_secret": "SEGREDO_DEFINIDO_NO_ENV_PROD",
    "email": "SEU_LOGIN@MASTER.COM",
    "password": "SUA_SENHA_FORTE_AQUI",
    "name": "Kauan Kelvin"
  }'
```
Após isso, remova momentaneamente a variável ou mude o `SEED_SECRET` para garantir que o endpoint fique inútil no futuro. Acesse o painel pelo frontend `/master/login`.
