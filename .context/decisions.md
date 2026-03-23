# Decisões Técnicas (ADR)

---
## ADR-001: Estratégia Multi-tenant

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Precisamos isolar dados de múltiplas clínicas. As opções eram:
banco separado por tenant, schema separado, ou coluna discriminadora.

**Decisão:**
Schema compartilhado com coluna `tenant_id UUID NOT NULL` em todas
as tabelas de negócio, com índice composto (tenant_id, id).

**Justificativa:**
Menor custo operacional na fase inicial. Migrações unificadas.
RLS do PostgreSQL pode ser adicionado depois sem mudar a estrutura.

**Consequências:**
- Todo Repository filtra por tenant_id obrigatoriamente
- Criar interceptor Spring para injetar tenant_id via JWT
- Risco de vazamento entre tenants se filtro for esquecido
- Mitigar com testes de integração cobrindo isolamento

---
## ADR-002: Filtros Multi-tenant via Hibernate AOP

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Garantir que a verificação relacional do `tenant_id` sempre ocorra implicitamente nos Queries.

**Decisão:**
Anotações `@FilterDef` mapeadas na classe `BaseTenantEntity`, acionadas via Aspect-Oriented Programming (`@Aspect`) para todo o pacote Repository. Os cabeçalhos HTTP interceptados (`TenantInterceptor`) alimentam a variável `ThreadLocal`.

**Justificativa:**
Segurança aprimorada. Desenvolvedores não esquecerão de implementar manualmente o `tenant_id` quebrando a segregação caso fosse necessário fazer nas assinaturas do `JpaRepository`.

---
## ADR-003: Frontend React - Vite v5 Fallback

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Ambiente local rodando versão defasada do Node.js (18.19), causando erro fatal `EBADENGINE` com uso explícito de módulos exclusivos ao instanciar o `create-vite@latest`.

**Decisão:**
Downgrade programático com o scaffolding utilizando `create-vite@5`.

**Justificativa:**
Desobstruir de forma imperativa o deploy local sem exigir acessos superusuários na estrutura base de runtime de sistemas do Host.

---
## ADR-004: Downgrade para Java 17

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
O ambiente local do host possui apenas o OpenJDK 17 instalado, mas o projeto Maven (via `pom.xml`) exigia compilação (release) na versão 21. A compilação do backend falhou prematuramente.

**Decisão:**
Fez-se o downgrade da propriedade `<java.version>21</java.version>` para `17` no `pom.xml`, garantindo compatibilidade da aplicação Spring Boot 3 no ambiente.

**Justificativa:**
Desobstruir a inicialização do ambiente local de desenvolvimento rapidamente, sem obrigar a instalação global paralela de um novo JDK no host por ora.

---
## ADR-005: Autenticação JWT e Filtro Tenant Ignorado no Login

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Foi necessário implementar o login extraindo credenciais reais do db via `User` entity, gerar token via `HS256`, validar requisições através de um Interceptor, e auto invocar o escopo de segurança no `TenantContext`.

**Decisão:**
1. A entidade `User` possuirá a consulta `@Query nativeQuery = true` atrelada no repositório (`findByEmailWithoutTenantFilter`).
2. O serviço `JwtService` assumiu responsabilidade singular de parse e persistência dos metadados (Claims de `tenant_id` e `user_id`).
3. Foi criado o `JwtInterceptor`, o qual injeta o string parsiado em `UUID` nativamente para o Singleton/ThreadLocal de Tenant e, obrigatoriamente, faz `.clear()` na função interceptadora de fechamento.

**Justificativa:**
O `BaseTenantEntity` e seu `Filter` interceptariam globalmente a JPQL no processo de login impossibilitando a leitura inicial pois o `tenant_id` é desconhecido antes do JWT existir; nativeQuery mitiga esse side-effect perfeitamente sem violar OCP. O `clear()` protege contra memory leaks em Worker Threads no Tomcat.

---
## ADR-006: Padronização MVC para Patients e Appointments

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Foi solicitado a criação de fluxos CRUD completos e robustos sob os endpoints `/patients` e `/appointments`, todos exigindo vínculo de tenant automático via interceptor e segurança arquitetural (Controller -> Service -> Repository).

**Decisão:**
1. Manter a injeção implícita por meio de herança indireta à `BaseTenantEntity`, ativada pelo Aspect `TenantFilterAspect`.
2. Para agendamentos aninhados a pacientes, foi configurado mapeamento `@ManyToOne(optional = false)` de `Patient` referenciado dinamicamente ao criar ou listar `Appointment`.
3. Os recursos `/patients` e `/appointments` aceitam entidades puras ou simplificadas no transporte atual antes da migração total para DTOs focados para reduzir overhead inicial de serialização. DTO inline `AppointmentStatusUpdate` evitou corrupção de modelagem de requisições base.

**Justificativa:**
A padronização permite um crescimento escalável com dependências centralizadas no Spring Data JPA. A validação passo-a-passo no ambiente real provou que o escopo de injeção AOP impede vazamento de query entre Tenants.

---
## ADR-007: Isolamento de Data-Fetching no Frontend

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Necessidade de integração limpa dos endpoints `/auth/login`, `/patients` e `/appointments` recém criados no back-end com a aplicação React, evitando acoplamento entre Views e requisições HTTP e centralizando injeção do JWT.

**Decisão:**
1. Instância singular do `Axios` baseada em `http://localhost:8080` com dois níveis de Interceptors: um para injetar o header (`Authorization: Bearer <token>`) e um global para resposta (captação de erro HTTP 401 forçando redirecionamento de tela e *purge* no localStorage).
2. Divisão estrita em camadas: `services/auth.ts`, `services/patient.ts` consumindo dados com `Promise` totalmente tipados (sem `any`), impedindo que o componente gerencie *Axios* ou *fetch* puramente.

**Justificativa:**
Manutenção do ecossistema escalável no front-end, maximizando reuso de código e garantindo solidez nos mapeamentos assíncronos.

---
## ADR-008: Arquitetura Modular do Bot Telegram

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Necessidade de implementar um bot Telegram para confirmação de consultas que se integra ao backend via JWT, envia lembretes 24h antes e permite `/confirmar`, `/cancelar` e `/reagendar`.

**Decisão:**
1. Estrutura modular: `handlers/` (comandos Telegram), `services/` (API client e scheduler), `utils/` (templates de mensagem).
2. `ApiService` centraliza toda comunicação HTTP com o backend Spring Boot, autenticando via JWT fixo no `.env` (service account).
3. `APScheduler` (cron job às 08:00) filtra agendamentos de amanhã com status `SCHEDULED` e dispara lembretes.
4. Mapeamento `chat_id → appointment_id` em memória (`dict`) como MVP, prevendo migração para Redis/DB.
5. Nenhuma credencial hardcodada — tudo via `python-dotenv` e `.env`.

**Justificativa:**
Separação de responsabilidades garante testabilidade e manutenção. O scheduler assíncrono não bloqueia o polling do Telegram. O padrão factory em `create_handlers()` permite injeção de dependências sem acoplamento.

---
## ADR-009: Adoção do Design System da "Linear" no Frontend

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Foi requisitada a alteração visual da aplicação para emular a interface premium com dark theme agressivo da Linear, usando o HTML da landing page como base.

**Decisão:**
1. Adoção estrita de Variáveis Nativas do CSS escopadas no arquivo `/frontend/src/styles/design-system.css` contendo `--linear-bg-*`, cores semânticas e espaçamentos, permitindo theming local otimizado.
2. Todas as estilizações de botões (`.btn`) e containers (`.glass-card`, `.nav-link`, inputs) tiveram sua opacidade, coloração hexadecimal neutra profunda e tracking repassados para estarem integradas ao CSS original.
3. Importação do `@font-face` *Inter* como baseline universal.

**Justificativa:**
Uma base CSS forte, aliada às variáveis organizadas sob prefixos identificáveis e classes globais flexíveis (BEM-like), constrói um código livre de lixo semântico, mais legível que Utility Frameworks massivos para uma prova de conceito focada.

---
## ADR-010: Vinculação Telegram ↔ Patient via Deep Link

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Para o scheduler enviar lembretes via Telegram, o bot precisa saber o `chat_id` de cada paciente. A pergunta era: como mapear paciente → `chat_id` sem intervenção manual?

**Decisão:**
1. Adicionada coluna `telegram_chat_id BIGINT` na tabela `patients` (migration SQL `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
2. Novo endpoint `PATCH /patients/{id}/telegram` com body `{"chatId": <long>}` — protegido pelo `JwtInterceptor`.
3. O `/start` do bot suporta deep link: quando a clínica envia ao paciente o link `t.me/SeuBot?start=<patient_uuid>`, o bot chama automaticamente `PATCH /patients/{uuid}/telegram` com o `chat_id` do Telegram.
4. O scheduler usa `patient.telegramChatId` para chamar `bot.send_message(chat_id=..., text=...)`.

**Justificativa:**
Deep links do Telegram são a forma padrão de onboarding sem atrito — o paciente clica no link enviado pela clínica e já fica vinculado. Isso elimina a necessidade de uma tela de "conectar conta" no frontend.

---
## ADR-011: Bot Prospector Autônomo

**Data:** 2026-03-22
**Status:** Aceito

**Contexto:**
Necessidade de prospecção ativa de novas clínicas para o SaaS, automatizando a busca no Google Maps e o envio de leads qualificados diretamente para o Telegram do time comercial.

**Decisão:**
1. Criado script Python `bots/prospector/main.py` gerenciado pelo `APScheduler` para rodar diáriamente.
2. Integração com Google Places API (Text Search) em `search_service.py` para varrer cidades satélites de Brasília buscando por nichos (Odontologia, Psicologia, Estética).
3. Filtro local via arquivo de texto `data/leads.json` em `filter_service.py` para garantir que um lead nunca seja enviado em duplicidade.
4. Envio de notificação formatada via Telegram API (`telegram_service.py`).

**Justificativa:**
Automatiza o topo do funil de prospecção com baixíssimo custo. A mesma arquitetura modular do bot de confirmação foi utilizada, facilitando a manutenção e permitindo a troca flexível do provedor de busca ou do destino no futuro.