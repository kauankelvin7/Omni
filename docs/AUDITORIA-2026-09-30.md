# Auditoria técnica do Omni — 30/09/2026

**Escopo:** revisão estática do repositório `kauankelvin7/Omni`, incluindo API
Spring Boot, modelos e acessos PostgreSQL, painel React, bots Python,
controles de autenticação e implantação. Versão inicial auditada:
`d2900941712a1b36f89a74cade54c7c658a066cc`.

**Critério de validação:** evidência em código + testes automatizados e
GitHub Actions. A revisão **não substitui** pentest, inspeção do banco
hospedado, acesso aos segredos/telemetria, execução real com clientes nem
verificação do deploy público. Não afirmar "seguro para produção" sem as
etapas operacionais e de migração abaixo.

## Achados com correção nesta etapa

| Prioridade | Evidência observada | Ação |
| --- | --- | --- |
| Crítica | `/master/admins/seed` era público e havia segredo de seed conhecido na documentação/configuração. | Rota removida; bootstrap apenas pelo `MasterAdminSeeder` com credenciais privadas no ambiente. |
| Crítica | `/auth/refresh` aceitava access tokens expirados sem limite de renovação. | Acesso e refresh agora são tipos distintos, assinados e com validade finita. Refresh aceita somente token válido e verifica vínculo atual do usuário à clínica. |
| Alta | `MasterJwtService` tinha fallback de chave de assinatura conhecido no próprio código. | Fallback removido; suporta `MASTER_JWT_SECRET` separada. Por compatibilidade, há fallback explícito para `JWT_SECRET` se não configurar a variável; **configure chave diferente na produção**. |
| Alta | `GET /patients` e `GET /appointments` tinham cache somente pela URL, sem separar clínicas/contas. | Cache da interface vinculado ao token atual e invalidado na troca de sessão, logout e refresh. |
| Alta | Clínicas com assinatura vencida/suspensa podiam continuar chamando endpoints operacionais. | Interceptor de status/validade após a autenticação, preservando `/subscription/me` para diagnóstico do cliente. |
| Alta | `SubscriptionJob` registrava expiração usando UUID fictício numa tabela com FK para `admins`, podendo reverter a transação. | Registro de evento sistêmico na tabela de segurança sem admin fictício. |
| Média | Rate limiter confiava no primeiro `X-Forwarded-For` fornecido pelo cliente, não abrangia registro/refresh e acumulava chaves. | Uso do endereço do request, limites por rota e expurgo periódico. Ainda é apenas proteção por instância. |
| Média | Login inválido e validação de entrada respondiam com status inconsistentes; buscas inexistentes caíam em erro genérico. | 401 para login, 400 para campos inválidos, 404 para pacientes/agendamentos ausentes, limites de cadastro/senha. |
| Média | Bot usava UTC para o "amanhã" e mantinha mapa de consultas somente em RAM, sem popular o mapa. | Fuso de clínica configurável e resolução de consulta pendente diretamente pela API, com regressões automatizadas. |
| Média | Endpoint público de saúde revelava mensagens de exceções do banco. | Retirada de detalhes internos da resposta. |

## Bloqueadores ou trabalhos que exigem outra alteração/deploy

1. **Vínculo Telegram (alto):** o link atual contém apenas UUID do paciente,
   que atua como segredo reutilizável. Requer código de vínculo aleatório,
   expiração, consumo único e migração do banco, com atualização coordenada
   de API, bot e interface. **Não disponibilizar a funcionalidade para
   pacientes externos até corrigir esse ponto.**
2. **Implantação (alto):** o `render.yaml` anterior declarava runtime Java
   e encaminhava `postgresql://...` diretamente para o campo JDBC, o que
   não é um Blueprint Java/Postgres válido sem adaptação. Conferir a
   configuração real do Render antes de sincronizar mudanças.
3. **Migrações (alto):** `ddl-auto: update` no padrão e `validate` no
   perfil de produção, mas não há migrações versionadas para todos os
   ambientes. Adotar migrações revisadas antes do próximo deploy com
   alteração de esquema.
4. **Segredos (alto):** criar `MASTER_JWT_SECRET` independente de
   `JWT_SECRET`, validar a rotação e verificar que a implantação ativa
   recebeu as novas variáveis. Não publicar valores aqui.
5. **Sessões (médio):** refresh tokens assinados agora vencem, mas não
   têm revogação individual persistente, rotação atômica ou detecção de
   reutilização após vazamento. Adotar sessões persistidas com hash do
   refresh token e revogação em logout/alteração de senha.
6. **Autorização (alto):** os endpoints de clínica ainda não têm políticas
   finas por papel (ex.: recepção vs. administração); autenticação e
   isolamento por clínica não substituem RBAC.
7. **Privacidade (médio):** PII de pacientes consta de parte dos logs e
   não foi verificada retenção/exclusão/consentimento em ambiente real.
8. **Frontend (médio):** scripts inline em `Landing`/`Register` e
   armazenamento dos tokens em API Web Storage precisam ser substituídos
   por efeitos React e por um modelo de sessão com menor exposição a XSS.
9. **Operação (médio):** usar limitação distribuída por IP/conta na borda,
   bloquear porta pública de PostgreSQL e exigir credenciais privadas
   no Docker de produção. A configuração local de desenvolvimento não
   pode ser copiada para produção.
10. **Dados (médio):** a tabela `users` permite e-mails iguais em clínicas
    distintas no SQL inicial, mas o login usa somente email e o modelo
    JPA assume unicidade global. Definir identidade global vs. tenant-scoped
    e migrar a restrição/fluxo de login coerentemente.
11. **Painel master (médio):** validar enum de planos/status e limites de
    paginação antes de aplicar atualizações ou consultas extensas.
12. **Bots (médio):** agendamento de lembretes não guarda idempotência de
    envio por consulta/dia; reinícios e execuções duplicadas podem reenviar.
    O bot de Telegram atual exige uma instância/conta de API por clínica.

## Validação desta etapa

Workflow `.github/workflows/backend-tenant-security.yml`:
- Backend Java 17, `mvn clean verify` em PostgreSQL 16.
- Frontend, `npm ci && npm run build` com validação TypeScript.
- Bots Python, `compileall` e testes regressivos via `unittest`.

Executar novamente **no SHA final do PR**, não confiar em checks verdes
de commits anteriores. Mudanças de autenticação invalidam sessões antigas
e exigem novo login. A rotina master deve ser testada com chaves
diferentes depois de configurar o ambiente.

## Restrições para publicar ou comercializar

O projeto demonstra arquitetura e decisões reais, mas não deve ser descrito
como "isolamento totalmente comprovado", "100% produção" ou "segurança LGPD
validada" sem resolver bloqueadores, aplicar migrations e testar o ambiente
hospedado com clínicas e dados fictícios separados. Use apenas massa de
dados sintética nos testes e capturas do portfólio.
