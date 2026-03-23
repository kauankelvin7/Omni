# Deploy Omni B2B — Guia Completo

## Pré-requisitos
- Conta no GitHub com o código do Omni B2B
- Conta no Supabase (supabase.com)
- Conta no Render (render.com)
- Conta na Vercel (vercel.com)

## ETAPA 1 — Configurar o Banco (Supabase)

### 1.1 Pegar a URL de conexão
1. Acesse supabase.com → seu projeto
2. Vá em Settings → Database
3. Role até "Connection string"
4. Copie a URI que começa com postgresql://
5. Substitua [YOUR-PASSWORD] pela sua senha

### 1.2 Formato correto para o Render
Pegue a URI do Supabase:
postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres

Converta para JDBC (substitua postgresql por jdbc:postgresql):
jdbc:postgresql://db.PROJETO.supabase.co:5432/postgres

Anote também separado:
- USERNAME: postgres
- PASSWORD: sua senha do Supabase
- HOST: db.PROJETO.supabase.co

### 1.3 Gerar JWT_SECRET seguro
Execute no terminal:
openssl rand -base64 64
Copie o resultado — será o JWT_SECRET.

## ETAPA 2 — Deploy do Backend (Render)

### 2.1 Criar o Web Service
1. Acesse dashboard.render.com
2. Clique "+ New" → "Web Service"
3. Conecte o repositório omni-b2b do GitHub
4. Preencha:
   - Name: omni-backend
   - Language: Docker
   - Docker Build Context: backend/
   - Dockerfile Path: backend/Dockerfile
   - Instance Type: Free
5. Não clique Deploy ainda

### 2.2 Configurar variáveis de ambiente
Antes de fazer deploy, adicione TODAS essas variáveis:

| Variável | Valor |
|----------|-------|
| SPRING_DATASOURCE_URL | jdbc:postgresql://db.SEU_PROJETO.supabase.co:5432/postgres |
| SPRING_DATASOURCE_USERNAME | postgres |
| SPRING_DATASOURCE_PASSWORD | sua_senha_supabase |
| JWT_SECRET | resultado_do_openssl |
| MASTER_PASSWORD | sua_senha_master_forte |
| SEED_SECRET | omni-seed-2026 |
| ALLOWED_ORIGINS | https://omni-b2b.vercel.app |

6. Clique "Deploy Web Service"
7. Aguarde o build (5-10 minutos)
8. Quando aparecer "Live" copie a URL:
   https://omni-backend.onrender.com

### 2.3 Verificar se subiu
curl https://omni-backend.onrender.com/actuator/health
Deve retornar: {"status":"UP"}

### 2.4 Criar o admin master
curl -X POST https://omni-backend.onrender.com/master/admins/seed \
  -H "Content-Type: application/json" \
  -d '{
    "seed_secret": "omni-seed-2026",
    "email": "kauan@omnib2b.com",
    "password": "SUA_SENHA_MASTER",
    "name": "Kauan Kelvin"
  }'

## ETAPA 3 — Deploy do Frontend (Vercel)

### 3.1 Criar o projeto
1. Acesse vercel.com
2. Clique "Add New Project"
3. Importe o repositório omni-b2b
4. Configure:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
5. Em Environment Variables adicione:
   VITE_API_URL = https://omni-backend.onrender.com
6. Clique "Deploy"
7. Quando terminar copie a URL:
   https://omni-b2b.vercel.app

### 3.2 Atualizar CORS no Render
1. Volte no Render → omni-backend → Environment
2. Atualize ALLOWED_ORIGINS:
   https://omni-b2b.vercel.app
3. Render faz redeploy automaticamente

## ETAPA 4 — Verificação Final

### 4.1 Testar o sistema completo
1. Acesse https://omni-b2b.vercel.app
2. Deve aparecer a landing page do Omni B2B
3. Clique "Criar conta grátis"
4. Cadastre uma clínica de teste
5. Faça login
6. Acesse o dashboard

### 4.2 Testar o painel master
1. Acesse https://omni-b2b.vercel.app/master/login
2. Login: kauan@omnib2b.com
3. Senha: sua senha master
4. Deve aparecer o painel com a clínica de teste

### 4.3 Problemas comuns
- Backend demora para responder: normal no plano free
  (dorme após inatividade, acorda em ~30 segundos)
- Erro de CORS: verificar ALLOWED_ORIGINS no Render
- Erro 500: verificar logs no Render → Logs
- Banco não conecta: verificar URL do Supabase

## ETAPA 5 — Configurar o Bot (opcional por agora)

O bot Telegram não roda no Render Free (precisa
ficar ativo 24h). Opções:
- Rodar localmente no seu PC enquanto valida
- Usar Railway ($5/mês) para o bot
- Usar um VPS básico quando tiver receita

## URLs finais do sistema
- Frontend: https://omni-b2b.vercel.app
- Backend: https://omni-backend.onrender.com
- Master: https://omni-b2b.vercel.app/master/login
- GitHub: https://github.com/kauankelvin7/omni-b2b
