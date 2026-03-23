# Changelog Geral - Omni B2B

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0-prod] - 2026-03-23
### Adicionado
- **[Auditoria de Produção]** Configurações extensivas de Resiliência para Render (Free Tier) e Vercel.
- **Backend:** `HealthController` (`/health`) introduzido para monitoramento do Render/Supabase (Ping/Keep-Alive).
- **Backend:** `GlobalExceptionHandler` robusto criado para formatar erros nativos do Spring, impedindo vazamento de Stack Traces para o Frontend.
- **Backend:** Padrão estruturado de logs via MDC (`userId`, `tenantId`, `requestId`) injetado no `JwtInterceptor`.
- **Backend:** Suporte a compressão HTTP GZIP habilitado nativamente no `application.yml` cobrindo JSON/XML.
- **Frontend:** Implementado `vercel.json` no root para SPA routing rewrite (corrigindo Erro 404 em reloads).
- **Frontend:** Componente genérico customizável de `ErrorBoundary` injetado na raiz do App para capturar erros críticos de UI.
- **Frontend:** `LoadingContext` para gerenciamento global de requisições de API via um barramento de eventos pub/sub leve (`loadingBus`), bloqueando inputs da UI automaticamente.
- **Documentação:** Criação do guia definitivo de deploy `docs/PRODUCTION.md`.
- **UX:** Banners de "Cold Start" nas páginas `/landing` e `/register` que alertam ativamente clientes sobre o servidor ligando caso recebam erro de Network.
- **UX:** Redirecionamento Inteligente Pós-Login usando `sessionStorage`.

### Modificado
- **Backend:** Configurado Pool HikariCP explícito nos ambientes de produção.
- **Backend:** O `Dockerfile` passou a injetar variáveis na JVM (`-XX:MaxRAMPercentage=75.0` e `UseContainerSupport`) para previnir limites OutOfMemory.
- **Frontend:** Envelopamento completo de todas as páginas com `React.lazy` e `Suspense` em `App.tsx` (Lazy Loading de rotas), poupando carga inicial massiva.
- **Frontend:** Interceptor do Axios (`api.ts`) completamente re-escrito para mapear dinâmicamente as respostas de erro do Backend (401, 403, 400, 409) para mensagens contextuais legíveis, interceptar timeouts (30s) e expor eventos `api-offline`.
- **Frontend:** Interceptor Axios com cache de requisições idempotentes GET em memória (Ex: `/patients`, `/appointments`) durando 30s para otimização, e auto-invalidação durante requisições de mutação POST/PUT/DELETE.
- **Frontend:** Formulário de Cadastro (`Register.tsx`) agora puxa os erros explicitos formatados pelo Backend em caso de tentativa repetida/email em uso.

---

## [1.0.0] - 2026-03-01
### Adicionado
- **Lançamento Oficial MVP.** Multi-tenant Base, Roles, Funcionalidades Core.
- **Bot:** Agendador via Telegram integrado.
- **Painel:** Gerenciamento master de clínicas.

---
