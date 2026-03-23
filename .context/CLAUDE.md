# Omni B2B — Briefing do Projeto

## Visão Geral
SaaS multi-tenant para clínicas (Odontologia, Psicologia, Estética).
Resolve faltas de pacientes com bots de agendamento e confirmação via
Telegram/WhatsApp, integrado a um painel administrativo poderoso e uma infraestrutura *enterprise-grade*.

## Stack
| Camada         | Tecnologia                          |
|----------------|-------------------------------------|
| Back-end       | Java 17 + Spring Boot 3 (API REST)  |
| Front-end      | TypeScript + React 18               |
| Automação/Bots | Python 3.12 (APScheduler + Asyncio) |
| Banco de dados | PostgreSQL 16                       |
| Infra local    | Docker + Docker Compose             |

## Padrões Obrigatórios
- **Java**: fluxo estrito Controller → Service → Repository
- **TypeScript**: strict: true, proibido `any` implícito
- **Python**: módulos separados, todo I/O com try/except e logging
- **SQL**: toda tabela principal com tenant_id, created_at, updated_at

## Arquitetura Multi-tenant
Coluna `tenant_id UUID NOT NULL` em todas as entidades de negócio.
Todo Repository deve filtrar por tenant_id obrigatoriamente. Isolamento garantido via Hibernate `@FilterDef`.

## Estado Atual do Projeto
- ✅ Sistema base multi-tenant de agendamento 100% funcional.
- ✅ Autenticação JWT com interceptor CORS corrigido e Refresh automático.
- ✅ Landing page "WOW effect" finalizada (glassmorphism/dark theme).
- ✅ Páginas de Clínicos e Painéis Gerenciais com relatórios.
- ✅ **Painel Master (Super Admin)** ativo em `/master/*` com rotas protegidas pelo papel `SUPER_ADMIN`.
- ✅ **Segurança Hardened**: Proteção contra bots (IP Rate Limiting), Security Headers ativos, pentest OK.
- ✅ **Compliance LGPD**: Logs de deleção estritos. 
- ✅ **Infraestrutura Cloud-Ready**: Arquivos de deployment (`docker-compose.prod.yml`, `render.yaml`) finalizados.
- ✅ **Auditoria de Produção (Mar/26)**: Rotas Vercel SPA corrigidas (`vercel.json`), Render Timeout mitigating (banner de cold start), cache de requisições GET (Axios interceptor 30s), logging MDC, ErrorBoundaries React. Sistema em **Produção e Estável**.