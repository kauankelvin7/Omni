# Agente Auditor — Omni B2B

## Identidade
Você é o auditor técnico do projeto Omni B2B.
Sua função é identificar, documentar e corrigir
problemas de forma sistemática e completa.

## Antes de agir, leia:
- .context/CLAUDE.md
- .context/errors.md
- .context/decisions.md

## Como você trabalha
1. Primeiro audita — nunca corrige sem entender
2. Documenta tudo que encontra
3. Prioriza por severidade (Crítico > Alto > Médio > Baixo)
4. Corrige na ordem de prioridade
5. Valida cada correção antes de avançar
6. Registra tudo em errors.md

## Formato de relatório obrigatório
### 🔴 Crítico — sistema não funciona
### 🟡 Alto — funciona com falhas graves
### 🟠 Médio — funciona com limitações
### 🟢 Baixo — melhorias e polish
```

---

Agora manda esse prompt no Antigravity com o agente `/auditor`:
```
Você é o agente auditor do projeto Omni B2B.

Leia obrigatoriamente:
- .context/CLAUDE.md
- .context/errors.md
- .context/progress.md

Execute uma auditoria completa do sistema.

═══════════════════════════════════════
FASE 1 — DIAGNÓSTICO DO BACKEND
═══════════════════════════════════════

1. Verificar por que o Spring Boot está falhando:
   cd backend && ./mvnw spring-boot:run 2>&1 | tail -50
   
   Identificar o erro exato e a causa raiz.

2. Verificar todos os arquivos Java criados pelo
   agente anterior que podem ter problemas:
   - MasterController.java existe?
   - MasterAuthController.java existe?
   - MasterService.java existe?
   - MasterAuthService.java existe?
   - Admin.java (entidade) existe?
   - MasterInterceptor.java existe?
   
   Para cada arquivo que existir, verificar se
   compila sem erros.

3. Verificar o application.yml:
   - JWT_SECRET está como variável de ambiente?
   - MASTER_PASSWORD está como variável de ambiente?
   - Nenhuma senha hardcodada?

4. Verificar se a migration SQL da tabela admins
   foi executada no banco:
   sg docker -c "docker exec -i omnib2b-postgres 
   psql -U omni_user -d omni_db -c '\dt'" 
   | grep admins

5. Compilar o backend e mostrar TODOS os erros:
   cd backend && ./mvnw compile 2>&1 | grep -E "ERROR|error:"

═══════════════════════════════════════
FASE 2 — DIAGNÓSTICO DO FRONTEND
═══════════════════════════════════════

6. Verificar se o frontend compila sem erros:
   cd frontend && npx tsc --noEmit 2>&1 | head -50

7. Verificar se services/master.ts existe e está correto.

8. Verificar imports quebrados nas páginas master:
   grep -r "from '../services" frontend/src/pages/master/
   Todos devem usar '../../services' (dois níveis acima).

9. Verificar se todas as páginas master existem:
   - MasterLogin.tsx
   - MasterDashboard.tsx
   - MasterTenants.tsx
   - MasterRevenue.tsx
   Se alguma não existir, criar agora.

10. Verificar App.tsx — todas as rotas /master/*
    estão definidas e protegidas corretamente?

═══════════════════════════════════════
FASE 3 — DIAGNÓSTICO DO start.sh
═══════════════════════════════════════

11. O start.sh está com caminhos relativos errados.
    Corrigir para usar caminhos absolutos baseados
    no diretório do script:

    #!/bin/bash
    OMNI_DIR="$(cd "$(dirname "$0")" && pwd)"
    
    Usar $OMNI_DIR em todos os cd do script.
    Testar após corrigir.

12. Verificar o stop.sh também e corrigir se necessário.

═══════════════════════════════════════
FASE 4 — CORREÇÕES
═══════════════════════════════════════

Após o diagnóstico completo, corrigir na ordem:

🔴 CRÍTICO primeiro:
- Backend não sobe → identificar e corrigir erro
- Imports quebrados no frontend → corrigir todos
- Migration da tabela admins → executar se não existir

🟡 ALTO depois:
- start.sh com caminhos errados → corrigir
- Páginas master faltando → criar

🟠 MÉDIO por último:
- Qualquer outro problema encontrado

═══════════════════════════════════════
FASE 5 — VALIDAÇÃO FINAL
═══════════════════════════════════════

Após todas as correções:

1. Backend compila e sobe:
   ./mvnw spring-boot:run
   curl http://localhost:8080/actuator/health
   → deve retornar {"status":"UP"}

2. Endpoint master responde:
   curl -X POST http://localhost:8080/master/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"kauan@omnib2b.com","password":"teste"}'
   → deve retornar 401 (errado) ou token (certo)
   NUNCA deve retornar 404 (rota não existe)

3. Frontend compila:
   npx tsc --noEmit → zero erros
   npm run build → sucesso

4. start.sh funciona:
   ./start.sh → sobe tudo sem erros de caminho

5. Seed do master funciona:
   curl -X POST http://localhost:8080/master/admins/seed \
     -H "Content-Type: application/json" \
     -d '{
       "seed_secret": "omni-dev-seed-secret",
       "email": "kauan@omnib2b.com",
       "password": "TesteAuditoria123",
       "name": "Kauan Kelvin"
     }'
   → deve retornar sucesso ou "admin já existe"

═══════════════════════════════════════
RELATÓRIO FINAL OBRIGATÓRIO
═══════════════════════════════════════

Ao terminar, gerar relatório em .context/audit-report.md:

# Relatório de Auditoria — Omni B2B
Data: [data atual]

## 🔴 Críticos encontrados e corrigidos
## 🟡 Altos encontrados e corrigidos  
## 🟠 Médios encontrados e corrigidos
## ✅ Validações que passaram
## ⚠️ Pendências que ficaram para próxima sessão

Atualizar errors.md e progress.md ao terminar.