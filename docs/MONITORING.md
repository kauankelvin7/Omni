# 📊 Guia de Monitoramento - Omni B2B

Este documento descreve as ferramentas e práticas para observar a saúde e o desempenho do sistema em produção.

## 1. Health Checks
A API disponibiliza um endpoint de saúde robusto:
- **URL:** `${API_URL}/health`
- **Frequência sugerida:** A cada 1 minuto.
- **Retorno esperado:** `200 OK` com JSON indicando `status: UP` e `database: connected`.

## 2. Logs e Rastreabilidade (MDC)
Implementamos **MDC (Mapped Diagnostic Context)** para correlacionar logs. Cada requisição possui:
- `requestId`: ID único da transação.
- `userId`: ID do usuário autenticado (se houver).
- `tenantId`: ID da clínica/inquilino (se houver).

**Formato do Log:**
`2026-03-23 11:30:00 [INFO] [reqId=abc12345] [user=user88] [tenant=clinicaA] c.o.a.s.MyService - Processando agendamento...`

## 3. Banco de Dados (HikariCP)
O pool de conexões é monitorado via logs de inicialização.
- **Pool Max:** 3 conexões (Otimizado para Render Free Tier).
- **Timeout:** 30 segundos.

## 4. Performance Frontend
- **Vercel Analytics:** Acompanhe o Web Vitals no dashboard da Vercel.
- **Cold Start:** O banner do frontend informa o usuário se o backend levar > 3s para responder (comum no Render Free).

## 5. Alertas
Recomendamos configurar alertas no **BetterStack** ou **UptimeRobot** apontando para o endpoint `/health`.
