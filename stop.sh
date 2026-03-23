#!/bin/bash
OMNI_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "🛑 Encerrando processos Omni B2B em $OMNI_DIR..."

# 1. Matar Backend (Spring Boot / Maven)
PID_BACKEND=$(lsof -t -i:8080)
if [ ! -z "$PID_BACKEND" ]; then
    kill -9 $PID_BACKEND
    echo "✅ Backend (8080) encerrado."
else
    echo "ℹ️ Backend não estava rodando na porta 8080."
fi

# 2. Matar Frontend (Vite / Node)
PID_FRONTEND=$(lsof -t -i:5173)
if [ ! -z "$PID_FRONTEND" ]; then
    kill -9 $PID_FRONTEND
    echo "✅ Frontend (5173) encerrado."
else
    echo "ℹ️ Frontend não estava rodando na porta 5173."
fi

# 3. Matar Bots Python
PID_BOT=$(pgrep -f "python3 main.py")
if [ ! -z "$PID_BOT" ]; then
    kill -9 $PID_BOT
    echo "✅ Bot Python encerrado."
else
    echo "ℹ️ Bot Python não estava rodando."
fi

# 4. Parar Banco de Dados (Docker)
cd "$OMNI_DIR"
docker compose stop
echo "✅ Banco de dados parado (Docker)."

echo ""
echo "✨ Omni B2B parado com sucesso."
