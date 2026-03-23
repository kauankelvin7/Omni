#!/bin/bash
set -e

# Get absolute path to the directory where the script is located
OMNI_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OMNI_DIR/logs"

echo "🚀 Iniciando Omni B2B em $OMNI_DIR..."

# 1. Banco de Dados e Ambiente
cd "$OMNI_DIR"
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Variáveis de ambiente carregadas da raiz"
fi
docker compose up -d
echo "✅ Banco de dados iniciado (Docker)"

# 2. Backend (Porta 8080)
echo "⏳ Iniciando Backend..."
cd "$OMNI_DIR/backend"
if [ -f .env ]; then
    set -a; source .env; set +a
    echo "✅ Variáveis de ambiente carregadas do backend"
fi
./mvnw spring-boot:run > "$OMNI_DIR/logs/backend.log" 2>&1 &
echo "✅ Backend em execução (veja logs/backend.log)"

# 3. Frontend (Porta 5173)
echo "⏳ Iniciando Frontend..."
cd "$OMNI_DIR/frontend"
npm run dev -- --host > "$OMNI_DIR/logs/frontend.log" 2>&1 &
echo "✅ Frontend em execução (veja logs/frontend.log)"

# 4. Bots
echo "⏳ Iniciando Bots Python..."
cd "$OMNI_DIR/bots"
if [ -d "venv" ]; then
    source venv/bin/activate
    python3 main.py > "$OMNI_DIR/logs/bot.log" 2>&1 &
    echo "✅ Bots em execução (veja logs/bot.log)"
else
    echo "⚠️ venv não encontrado em bots/. Pulando inicialização do bot."
fi

echo ""
echo "🎉 Omni B2B rodando!"
echo "   ➜ Frontend: http://localhost:5173"
echo "   ➜ Backend API: http://localhost:8080"
echo "   ➜ Master Panel: http://localhost:5173/master/login"
echo ""
echo "Utilize './stop.sh' para encerrar todos os processos."
