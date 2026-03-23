# Registro de4. **Planos NONE/NONE no Master**: Falta de lógica de criação de assinatura no registro e DTO incompleto. Resolvido com `TenantSubscription` automática e `COALESCE` no SQL do Master.

# Registro de Erros e Soluções

> Preencher quando um bug for resolvido. Nunca deletar entradas antigas.

---
## Template

**Data:** AAAA-MM-DD
**Contexto:** onde ocorreu
**Sintoma:** o que foi observado
**Causa raiz:** o que causou
**Solução:** o que foi feito
**Como evitar:** regra para não repetir

---
*(Nenhum erro registrado antes destas sessões - Arquivamento Histórico)*

---
## Erro 001: Vite EBADENGINE no Node.js v18

**Data:** 2026-03-22
**Contexto:** Gerando o projeto React via `npx create-vite@latest`.
**Sintoma:** Falha sintática apontando exclusão do módulo utilitário `node:util styleText`.
**Causa raiz:** CLI moderna do Vite 9 demanda o Runtime Node.js rodando `>= 20.19.0`. O node na máquina encontrava-se na versão 18.
**Solução:** Abortado a tentativa explícita do `@latest` sendo acionado um *scaffold* fallback no branch 5 (`create-vite@5`).
**Como evitar:** Checar sempre os requerimentos dos CLIs antes da compilação e versionar preferencialmente o npm script gerador.

---
## Erro 002: Corrupção DOM (pom.xml) no Maven Compile

**Data:** 2026-03-22
**Contexto:** Inserindo a biblioteca dependente do AOP no `pom.xml` via shell manipulation bash usando `sed`.
**Sintoma:** Compilação do Maven colapsada por XML sintaticamente malformado e Missing Version declaration.
**Causa raiz:** Modificação ingênua via parse strings afetando subníveis repetidos do `<scope>test` dentro do ecossistema e herança do *parent* limitando instâncias omitidas de dependência.
**Solução:** Restruturado absolutamente o container `<dependencies>` inteiro via API interna nativa baseada em linhas de controle confiáveis do Agente. `<version>${project.parent.version}</version>` referenciado implicitamente no artefato final.
**Como evitar:** Nunca executar mutações sed ou expressões shell complexas dentro das arvores do documento sem o auxílio estrito do AST ou dom parsers em XMLs suscetíveis.

---
## Erro 003: Falha na Execução do Docker (Ausência de binário e Sudo)

**Data:** 2026-03-22
**Contexto:** Tentando obedecer instrução de validar o ambiente subindo o banco usando `docker compose up -d`.
**Sintoma:** Não encontrado binário docker. Ao tentar instalar via `sudo apt`, a elevação aguardou a digitação interativa de senha.
**Causa raiz:** O Host/S.O não possui a camada do Docker instalada e a automação do agente carece das credenciais para `sudo`.
**Solução:** Solução delegada ao usuário final (`BlockedOnUser`, intervenção mandatória requerida).
**Como evitar:** Pré-instalar ferramentas container engines primárias nos setups virtuais para validação.

---
## Erro 004: Permissão Negada no Socket do Docker (docker.sock)

**Data:** 2026-03-22
**Contexto:** Retomando passo 1 para subir o banco de dados via `docker compose up -d` após instalação manual.
**Sintoma:** Retorno fatal de `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock`. A verificação escalada (`sudo`) requisitou senha.
**Causa raiz:** O usuário host (`kauan`) não logou com grupo em `/var/run/docker.sock`, inviabilizando que nossa automação acione a engine.
**Solução:** Acionado via novo grupo na mesma sessão com `sg docker -c "docker compose up -d"`.
**Como evitar:** Adicionar nativamente ao mapeamento de infraestrutura a inclusão mandante do host nos grupos seguros de runtime.

---
## Erro 005: Símbolo não encontrado (TenantContext) no BaseTenantEntity

**Data:** 2026-03-22
**Contexto:** Compilando o projeto Backend (`./mvnw spring-boot:run`) após realizar o downgrade do Java.
**Sintoma:** O compilador falhou sinalizando `[49,29] cannot find symbol: variable TenantContext`.
**Causa raiz:** Ausência estrita do import do pacote `com.omnib2b.api.core.tenant.TenantContext` na classe `BaseTenantEntity.java`.
**Solução:** Adicionado o statement de import correspondente no cabeçalho do arquivo `BaseTenantEntity.java`.
**Como evitar:** Monitorar integridade relacional ao se gerar os componentes core com interceptadores assíncronos não resolvidos intrinsecamente pelo framework.

---
## Erro 006: Prefixo BCrypt incompatível ($2b$ vs $2a$)

**Data:** 2026-03-22
**Contexto:** Criação do usuário admin de teste para validar o endpoint `POST /auth/login`.
**Sintoma:** `401 Unauthorized` retornado mesmo com email e senha corretos.
**Causa raiz:** Python `bcrypt` gera hash com prefixo `$2b$`, mas a biblioteca jBcrypt do Java espera `$2a$`. O `BCrypt.checkpw()` falha silenciosamente na comparação.
**Solução:** Gerado o hash com Python e substituído `$2b$` por `$2a$` antes de inserir no banco via SQL. Token JWT gerado com sucesso após a correção.
**Como evitar:** Ao inserir usuários de teste via script Python, sempre substituir o prefixo: `hash.replace('$2b$', '$2a$')`. Em produção, usar o próprio endpoint de cadastro (Spring) que usará jBcrypt diretamente, garantindo compatibilidade.

---
## Erro 007: RuntimeError — no running event loop (APScheduler + python-telegram-bot)

**Data:** 2026-03-22
**Contexto:** Inicialização do bot Telegram em `main.py`, linha `scheduler.start()`.
**Sintoma:** `RuntimeError: no running event loop` ao tentar iniciar o `AsyncIOScheduler` antes de `app.run_polling()`.
**Causa raiz:** `AsyncIOScheduler` do APScheduler exige que já exista um event loop asyncio em execução no momento do `.start()`. O `app.run_polling()` do python-telegram-bot **cria e gerencia** o event loop internamente — qualquer chamada assíncrona antes dele falha.
**Solução:** Mover o `scheduler.start()` para dentro do hook `post_init` da `Application` (e `scheduler.shutdown()` para `post_shutdown`). Esses callbacks são chamados pelo próprio `run_polling()` dentro do event loop já ativo:
```python
async def on_startup(app: Application) -> None:
    scheduler.start()

app = ApplicationBuilder().token(TOKEN).post_init(on_startup).post_shutdown(on_shutdown).build()
```
**Como evitar:** Com python-telegram-bot v20+, toda lógica assíncrona de inicialização deve usar `post_init`. Nunca chamar `.start()` de schedulers asyncio fora do event loop gerenciado pelo framework.

---
## Erro 008: Deep link não salva chat_id — processos stale com código/JWT desatualizados

**Data:** 2026-03-22
**Contexto:** `/start <patient_uuid>` recebido pelo bot mas `telegram_chat_id` não era salvo no banco via `PATCH /patients/{id}/telegram`.

**Sintoma:**
- `trigger_reminders.py` reporta "não tem telegram_chat_id — lembrete ignorado"
- Bot responde ao `/start` genérico mas ignora o `patient_id` do deep link

**Causa raiz (2 problemas simultâneos):**
1. **Bot process stale**: O processo `python3 main.py` foi iniciado antes das modificações ao `/start` handler. O código em execução era o antigo (sem extração de `context.args`) — o Python não faz hot-reload automático.
2. **JWT expirado em memória**: O `ApiService` é instanciado uma vez com o token de `.env` no momento do `start`. Mesmo após atualizar o `.env`, o processo em memória ainda usa o JWT antigo (expirado), causando `401 Unauthorized` silencioso na chamada `PATCH`.
3. **Spring Boot stale**: O endpoint `PATCH /patients/{id}/telegram` foi adicionado após o último `./mvnw spring-boot:run` — o servidor em execução não conhece o novo endpoint (400/404).

**Solução:**
1. Reiniciar o Spring Boot para carregar o novo controller
2. Reiniciar o bot para carregar o novo handler e o JWT atualizado do `.env`

**Como evitar:**
- Ao editar handlers/services do bot, sempre reiniciar o processo
- Implementar renovação automática de JWT (refresh via `/auth/login` com credenciais no `.env`)
- Em produção, usar process manager (systemd/supervisor) que reinicia automaticamente após código atualizado

---
## Erro 009: CORS Policy bloqueando o Frontend

**Data:** 2026-03-22
**Contexto:** Telas do React (localhost:5173) fazendo chamadas para a API Spring Boot (localhost:8080)
**Sintoma:** Erro no browser: `No 'Access-Control-Allow-Origin' header is present on the requested resource`. Todas as chamadas de API bloqueadas pelo navegador na preflight OPTIONS.

**Causa raiz:**
1. O Spring Boot não tinha configuração de CORS. Por padrão, ele rejeita requests cross-origin.
2. Mesmo após adicionar a configuração de CORS, o `JwtInterceptor` barrava a requisição preflight (método `OPTIONS`), pois browsers não enviam o header `Authorization: Bearer` em requisições `OPTIONS`, causando um erro 401 Unauthorized antes do filtro do CORS resolver com 200 OK.

**Solução:**
1. Adicionado override `addCorsMappings` em `WebMvcConfig.java`:
```java
registry.addMapping("/**")
        .allowedOrigins("http://localhost:5173")
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("Authorization", "Content-Type")
        .allowCredentials(true)
        .maxAge(3600);
```
2. Modificado o `JwtInterceptor.java` para deixar o preflight passar direto sem validação de token:
```java
if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
    return true;
}
```
Confirmado via `curl` (método OPTIONS) que a API agora retorna erro 200 para a pré-validação do navegador com o header `Access-Control-Allow-Origin: http://localhost:5173`.

**Como evitar:**
- Configurar CORS como parte do setup inicial do `WebMvcConfig`.
- Sempre garantir que *interceptors* de autenticação e filtros customizados ignorem o método HTTP `OPTIONS`, delegando ele para o gerenciador nativo de CORS do framework.

---
## Erro 010: Troca de Provider do Prospector (Google Places para SerpAPI)

**Data:** 2026-03-22
**Contexto:** Refatoração do bot prospector autônomo em `bots/prospector/services/search_service.py`.
**Sintoma:** Solicitado a alteração da integração para buscar dados mais centralizados e simples.
**Causa raiz:** O Google Places API exige múltiplas requisições (Text Search em lote + Place Details individuais) para obter dados complementares vitais de lead, como telefone e website, aumentando significativamente a lógica, latência e o limite de requisições.
**Solução:** A integração oficial do Google Places foi removida a favor do agregador SerpAPI usando a `engine: google_maps`. O script agora extrai `title`, `phone`, `website`, `address` e `place_id` diretamente dos `local_results` em uma única cota unificada. A variável local de ambiente foi consolidada para `SERPAPI_KEY`.
**Como evitar:** Durante o arquitetamento de crawlers e aquisição de massas de dados vitrines, avaliar aggregators eficientes antes de acoplar soluções oficiais mais burocráticas se houver prioridade para velocidade de deploy de scripts e redução da carga de rede.

---
## Erro 011: HTTP 400 Bad Request no Telegram (Parse Mode Markdown)

**Data:** 2026-03-22
**Contexto:** Envio de leads extraídos pelo prospector via `bot.sendMessage` (Telegram Bot API).
**Sintoma:** Crash (no log) e recusa na entrega (`400 Bad Request`) em nomes de clínicas específicos.
**Causa raiz:** O Telegram com parseamento legado `Markdown` é extramamente restritivo com caracteres não escapados presentes nos dados raspados (como underscore `_` asterisco `*` ou colchetes `[]` nos títulos de lugares extraídos do Google Maps).
**Como evitar:** Nunca utilizar a representação flexível Markdown legada em mensagens do Telegram quando os payloads conteem inputs de internet/raspagens imprevisíveis; utilizar parse de HTML que possui delimitadores fechados mais robustos.

---
## Erro 012: Login não redireciona para o Dashboard

**Data:** 2026-03-22
**Contexto:** O usuário tenta fazer login no `/login`.
**Sintoma:** O envio do formulário autentica, mas parece que nada acontece (a página recarrega para a raiz pública e o usuário não vê o painel restrito).
**Causa raiz:** O componente `Login.tsx` utilizava um redirecionamento engessado via `navigate('/')` para indicar sucesso. Após modificar a arquitetura no `App.tsx` para abrigar a *Landing Page* pública no `/`, a raiz deixou de servir ao Dashboard, mudando-o para `/dashboard`.
**Solução:** Alterado o comando de navegação em `Login.tsx` de `navigate('/')` para `navigate('/dashboard')`.
**Como evitar:** Ao alterar a destinação principal de uma rota central (como o `/`), deve-se rastrear as chamadas de navegação programática para sincronizá-las ao novo design, evitando falhas silenciosas de UX.
---
## Erro 013: Métricas Financeiras Master Zeradas (R$ 0,00)

**Data:** 2026-03-22
**Contexto:** Painel Master > Financeiro após ativação de clínica.
**Sintoma:** MRR e Receita Total aparecem como R$ 0,00 mesmo com clínicas ativas em planos pagos (STARTER/PRO).
**Causa raiz:**
1. O campo `price` na tabela `tenant_subscriptions` não estava sendo preenchido pelo endpoint `PUT /master/tenants/{id}/plan`.
2. O cálculo de MRR no backend ignorava clínicas que não tivessem o valor de preço explicitamente setado.
3. A Receita Total no backend considerava apenas clínicas `ACTIVE`, ignorando o histórico de `CANCELLED`.
**Solução:**
1. Atualizado `MasterTenantController.java` para setar o preço automático (197, 397, 797) baseado no `plan_name` durante a atualização.
2. Corrigida lógica no `MasterRevenueController.java` para somar `ACTIVE + CANCELLED` na Receita Total e calcular a média por clínica corretamente.
3. Executado update manual no banco para corrigir registros existentes com preço zerado.
4. Formatado as datas de ISO para PT-BR no frontend `MasterRevenue.tsx`.
**Como evitar:** Sempre que houver uma transição de plano, garantir que todas as dimensões financeiras (preço, status, período) sejam persistidas em uma única transação ou operação atômica.

---

## Erro 014: Vercel 404 em Single Page Apps (Rotas do React)

**Data:** 2026-03-23
**Contexto:** SPA compilada com Vite e mandada para Vercel.
**Sintoma:** Tudo funciona via navegação por botão, mas acessar `omni-b2b.vercel.app/dashboard` direto pela URL resulta em página 404 nativa da Vercel.
**Causa raiz:** O roteamento React ocorre no client-side (`index.html`). O servidor edge Vercel procura o arquivo `/dashboard.html` e falha.
**Solução:** Foi criado `vercel.json` estrito na raiz de `/frontend` que faz um Rewrite "catch-all" redirecionando `/` e todas sub-rotas para o `/index.html`.
**Como evitar:** Todo setup standard PWA/SPA em nuvens puras sem WebServer customizado precisa declarar Rewrite Rules na hospedagem.

---

## Erro 015: Render Web Service "Cold Start" Timeouts

**Data:** 2026-03-23
**Contexto:** Login matinal / Cadastro primeira vez do dia (Render Free Tier API).
**Sintoma:** O Spinner de Loading trava, o usuário envia duas vezes o formulário. Eventualmente o Axios devolve `Network Error`.
**Causa raiz:** Após inatividade de 15m o dyno do Render colapsa/dorme. Na requisição, ele leva ~~ 45s para realizar setup completo JVM Sprint Boot e abrir conexões de DB, superando o timeout padrão do cliente/network.
**Solução:** Implementado Barramento PubSub `LoadingContext` React interceptando todos Axios requests in-flight para prender botões da UI, seguido da interceptação do timeout pra exibir Banners informativos em caso de lentidão: "Iniciando servidor na nuvem, aguarde uns segundos". Um endpoint `/health` garante que haja ping.
**Como evitar:** Em planos de hospedagem gratuita, abrace conscientemente em código a latência e forneça *visual cues/feedback loops* para evitar que o usuário acredite em quebra sistêmica.

---

*(O arquivo errors.md é vivo e todo erro severo deve ser devidamente preenchido aqui para futuras refatorações)*
