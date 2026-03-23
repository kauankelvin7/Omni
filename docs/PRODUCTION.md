# 🚀 Guia de Operação em Produção (Omni B2B)

Este documento foi criado durante a Auditoria de Produção (Março 2026) e detalha a infraestrutura, componentes críticos, alertas e procedimentos operacionais do Omni B2B no ambiente de produção.

---

## 🏗️ 1. Infraestrutura e Hospedagem

O Omni B2B opera em uma arquitetura distribuída, utilizando serviços gerenciados para garantir escalabilidade e foco no código. É uma aplicação Multi-Tenant.

*   **Frontend (SPA React/Vite):** [Vercel](https://vercel.com/)
    *   **URL:** `https://omni-b2b.vercel.app` (Temporária até apontamento de domínio próprio)
    *   **Deploy:** Automático via integração com GitHub (`main` branch -> Vercel Production).
    *   **Roteamento:** Configurado nativamente via `vercel.json` na raiz do frontend com fallback para `index.html` (resolve Erro 404 em rotas diretas do React Router).

*   **Backend (Spring Boot 3 / Java 17):** [Render](https://render.com/) (Web Service - Plano Free/Hobby)
    *   **URL:** `https://omni-backend-7vgd.onrender.com`
    *   **Deploy:** Via Docker gerenciado pelo Render usando o `Dockerfile` na pasta `/backend`. A build roda online.
    *   **Cold Start:** No plano gratuito do Render, o serviço hiberna após inatividade. O servidor demorará de 30 a 60 segundos no primeiro request da manhã para "acordar". Há banners de aviso configurados no frontend (`Landing.tsx` e `Register.tsx`) e um endpoint primário `/health` para keep-alive.
    *   **Logs:** Visíveis nativamente no painel do Render. Adicionalmente, logs formatados com MDC (requestId, tenantId) estão disponíveis via endpoint master.
    *   **Otimização JVM:** O Dockerfile injeta a flag `-XX:MaxRAMPercentage=75.0` para previnir OOM (Out Of Memory) nos containers limitados do Render (512MB RAM).

*   **Banco de Dados (PostgreSQL 15):** [Supabase](https://supabase.com/) (Região: São Paulo - `sa-east-1` pooler)
    *   **Pooler Url:** Configurado via Connection Pool (PGBouncer gerenciado pelo Supabase - Porta 6543) ao invés da conexão direta padrão (Porta 5432). Isso é essencial para ambientes Serverless/Web Services como o Render para previnir estouro de conexões (Too many clients).
    *   **Esquema:** Multi-Tenant via discriminador de coluna (`tenant_id`). Usamos Hibernate `@FilterDef` para isolamento de tenants a nível de DAO (sem RLS do Supabase, o isolamento é no código Java).

*   **Worker/Bots (Python / Telegram):** Servidor Python separado (APScheduler/Telethon).
    *   *(Nota: Bots também devem rodar preferencialmente em background workers no Render ou Railway, não em WebServices comuns devido aos limites de timeout).*

---

## 🔒 2. Gestão de Variáveis de Ambiente e Segredos

### Backend (Render Environment)
Nunca comite senhas ou JWT Secrets para o GitHub. Estas variáveis residem na tab "Environment" do serviço Render:

*   `SPRING_PROFILES_ACTIVE=prod` (Força a carga de `application-prod.yml`)
*   `DATABASE_URL=jdbc:postgresql://<SUPABASE_HOST>:6543/postgres...`
*   `DATABASE_USER=postgres.[project_id]`
*   `DATABASE_PASSWORD=<senha-forte>`
*   `JWT_SECRET=<chave-base64-de-pelo-menos-256-bits>` (Trocar periodicamente)
*   `SEED_SECRET=<chave-para-seed-master>`
*   `MASTER_EMAIL=admin@omni.com.br`
*   `MASTER_PASSWORD=<senha-forte-para-acesso-master>` (Recomendado Bcrypt salt antes)
*   `ALLOWED_ORIGINS=https://omni-b2b.vercel.app` (Crucial para CORS seguro)

### Frontend (Vercel Environment)
*   `VITE_API_URL=https://omni-backend-7vgd.onrender.com`

---

## 🛡️ 3. Segurança e Performance

*   **Taxa Limite (Rate Limiting):** Aplicada via Interceptor (`RateLimitInterceptor.java`) configurado com Bucket4j. Atualmente afeta primariamente rotas `/login` e de tokens para previnir brute-force.
*   **Security Headers:** A aplicação inclui nativamente (Spring Security / `SecurityHeadersFilter.java`) cabeçalhos XSS Protection, HSTS, Content-Security-Policy e Frame-Options (DENY para prevenção contra UI redress/Clickjacking).
*   **Compressão GZIP:** Habilitado nativamente no application.yml do Spring Boot (min 2KB) cobrindo JSON, reduzindo payload na rede e tempo de transferência do Render para a Vercel.
*   **Conexões BD (HikariCP):** O tamanho máximo do pool (`maximum-pool-size`) deve estar ajustado em torno de 10 conexões por instância do backend no plano Free, considerando o gargalo primário no Render, não no Supabase. O Keep-Alive mínimo é de 30000ms.

---

## 📟 4. Alertas Naturais e Comportamentos Esperados (Playbook)

### 4.1. "Erro de Conexão com Servidor" no Login/Registro do Frontend
Se ocorrer logo pela manhã ou após longo período de ociosidade, trata-se de **Cold Start** do Render Web Service.
*   **O que o usuário vê:** Um banner azul rotativo ou erro dizendo "A requisição no servidor falhou/Servidor está acordando".
*   **Ação Mínima:** Aguardar 60 segundos. O Frontend tenta reconexões limitadas ou pede pra tentar de novo.
*   **Ação Proativa Mestra:** Insira a URL do backend (`https://omni-backend-7vgd.onrender.com/health`) em um serviço de pings automáticos como UptimeRobot, a cada 14 minutos. (Vide `MONITORING.md` para instrução detalhada).

### 4.2. Erro "Too many connections / FATAL: Sorry, too many clients already" no Supabase
*   **Causa provável:** Sua aplicação (backend) não está usando a Connection String correta baseada no IPv4/IPv6 do Pooler na aba Database Settings -> Connection Pool no Supabase.
*   **Ação:** Verifique a variável `DATABASE_URL` no Render. Assegure-se de usar a porta 6543 se o Supabase Pooler estiver ativo em Transaction Mode, ou reinicie os dynos no painel da Render para liquidar conexões órfãs.

### 4.3. React Router Retornando 404 ao recarregar (Refresh) a página
*   **Situação:** Local host (vite/npm run dev) funciona, mas acessando `omni-b2b.vercel.app/dashboard` direto pelo link na URL (e não por um botão) redireciona ao erro Not Found (404) nativo da Vercel.
*   **Ação:** Certifique-se de que o `vercel.json` existente na branch principal contém o rewrite. (Isso já foi corrigido pela Auditoria de Março, mas sempre confirme ao criar novos apps React/Vite deployados cruamente).

---

## 🛠️ 5. Ferramentas Master Dashboard

O Omni B2B conta com um painel Administrativo Global (Master Dashboard) cujo login requer o `MASTER_EMAIL` e `MASTER_PASSWORD`. Suas rotas englobam:

*   `/master/logs`: Verifica streams/logs de acesso (integrados via MDC, loggers padrão retornam logs das últimas 2h, desde que retidos em memória/arquivo temporário ou injetando em API externa caso aplicável).
*   `/master/tenants`: Listagem, suspensão e exclusão de clínicas, gestão de limites de pacientes, billing e assinaturas.
*   `/master/revenue`: Painel financeiro global da SAAS (assinaturas e ARR).

---

Este manual é vivo. Ao alterar provedores de infraestrutura (Ex: Migração do Render para AWS EC2/Digital Ocean ou adicionando Redis para Cache em Produção), documente os novos procedimentos aqui de imediato.
