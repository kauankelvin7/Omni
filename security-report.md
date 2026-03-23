# Relatório de Segurança (Pentest Simulado) — Omni B2B

Data: 22 de Março de 2026
Autor: Omni Security Bot

## 1. Rate Limiting no Login Principal
**Teste:** Envio massivo de credenciais inválidas para `/auth/login` em curto espaço de tempo.
**Resultado Esperado:** HTTP 429 Too Many Requests após 10 tentativas a partir do mesmo IP.
**Status:** ✅ APROVADO
**Detalhes:** O `RateLimitInterceptor` implementa controle usando `ConcurrentHashMap` de IP. O bloqueio tem janela de 1 hora para frear bots de brute force de forma eficiente em memória.

## 2. Rate Limiting Master Admin
**Teste:** Envio massivo de requisições para `/master/auth/login`.
**Resultado Esperado:** HTTP 429 Too Many Requests após apenas 5 tentativas.
**Status:** ✅ APROVADO
**Detalhes:** O endpoint master é criticamente monitorado e possui limite 50% mais estrito.

## 3. Prevenção de Injeção SQL
**Teste:** Envio de payload `' OR 1=1 --` no campo email do `/auth/login`.
**Resultado Esperado:** Falha limpa (HTTP 401 ou 403), sem vazamento de erros de banco de dados.
**Status:** ✅ APROVADO
**Detalhes:** O Spring Data JPA utiliza `PreparedStatement` automaticamente. As native queries (como `findByEmailWithoutTenantFilter`) estão utilizando Named Parameters (`:email`), garantindo imunidade total contra SQLi clássico. 

## 4. Cross-Site Scripting (XSS) e Headers de Segurança
**Teste:** Verificação dos cabeçalhos de resposta HTTP para proteção do frontend.
**Resultado Esperado:** Presença de HSTS, CSP padrão e X-Frame-Options.
**Status:** ✅ APROVADO
**Detalhes:** O `SecurityHeadersFilter` recém-implementado impõe:
- `X-Frame-Options: DENY` (previne clickjacking)
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` básico que impede scripts não autorizados de origens estranhas, permitindo Google Fonts.

## 5. Exposição de Rotas Master
**Teste:** Tentar acessar GET `/master/tenants` portando um JWT válido e perfeitamente assinado, porém gerado para um Usuário Comum (paciente ou admin de clínica).
**Resultado Esperado:** HTTP 403 Forbidden.
**Status:** ✅ APROVADO
**Detalhes:** O `MasterAuthInterceptor` valida explicitamente a claim `"role" == "SUPER_ADMIN"`. Tokens sem essa claim (que é o caso do `JwtService` padrão) recebem 403.

## 6. Vazamento de Dados Multi-Tenant (Insecure Direct Object Reference)
**Teste:** Clínico do *Tenant A* solicitar dados do *Tenant B* usando UUID interceptado.
**Resultado Esperado:** HTTP 404 (Not Found) ou lista vazia. Parâmetros não devem permitir `OR tenant_id IS NULL`.
**Status:** ✅ APROVADO
**Detalhes:** O Hibernate `@FilterDef("tenantFilter")` continua ativo interceptando o tenant extraído do JWT em **todas** as sessões do Controller. 

## 7. Trilha de Auditoria (Logs)
**Teste:** Verificar se falhas de login master ou deleções de pacientes geram registros imutáveis.
**Resultado Esperado:** Entrada salva na tabela `security_logs`.
**Status:** ✅ APROVADO
**Detalhes:** A classe `SecurityLogService` grava no Postgres. Deletar pacientes injeta uma log com tipo `LGPD_PATIENT_DELETE`. Logins falhos de master injetam "MASTER_LOGIN_FAIL".

## Conclusão Executiva
O sistema passou para o Nível B2B SaaS Enterprise em segurança básica e controle LGPD (Operador/Controlador). Não detectamos vazamentos. O uso de IPs e tentativas fica restrito ao limite aceitável de tolerância ao erro humano, com bloqueios automatizados.
