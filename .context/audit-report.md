# Relatório de Auditoria — Omni B2B
Data: 2026-03-22

## 🔴 Críticos encontrados e corrigidos
- **Cadastro de Clínicas Quebrado**: O sistema tentava criar usuários antes de salvar a clínica (Tenant), violando restrições de chave estrangeira.
  - **Correção**: Criada entidade `Tenant`, `TenantRepository` e atualizado `TenantService` para persistir o Tenant primeiro.
- **Entidades Faltantes**: `Tenant.java` e `TenantRepository.java` não existiam no backend.
  - **Correção**: Implementados no pacote `com.omnib2b.api.core`.

## 🟡 Altos encontrados e corrigidos  
- **Scripts não portáteis**: `start.sh` continha caminhos absolutos fixos do usuário `kauan`.
  - **Correção**: Refatorado para usar `OMNI_DIR="$(cd "$(dirname "$0")" && pwd)"`.
- **Dependências de Monitoramento**: `/actuator/health` mencionado na auditoria não funcionava por falta da dependência.
  - **Correção**: Adicionado `spring-boot-starter-actuator` ao `pom.xml`.

## 🟠 Médios encontrados e corrigidos
- **Bloqueio de Rotas Públicas**: `JwtInterceptor` estava bloqueando `/actuator/**` e as páginas de erro `/error`.
  - **Correção**: Adicionadas exceções no `WebMvcConfig.java`.
- **Seed Master Protegido**: O endpoint de setup inicial do master estava atrás de autenticação.
  - **Correção**: Liberado no `WebMvcConfig` para permitir o primeiro acesso.

## ✅ Validações que passaram
- [x] Backend compila sem erros (`mvnw compile`).
- [x] Frontend type-check limpo (`tsc --noEmit`).
- [x] Registro de nova clínica (`POST /tenants/register`) → **200 OK**.
- [x] Login com novas credenciais → **JWT retornado**.
- [x] Health Check (`/actuator/health`) → **200 UP**.
- [x] Seed Master automático e manual → **Sucesso**.

## ⚠️ Pendências que ficaram para próxima sessão
- Configurar níveis de log específicos no `application.yml` para produção.
- Revisar permissões granulares de CORS para o domínio final de produção.
