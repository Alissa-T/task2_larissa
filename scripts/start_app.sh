#!/bin/bash
# ============================================================
# Script de Inicialização da Aplicação via PM2
# Uso: chmod +x start_app.sh && ./start_app.sh
# ============================================================

echo "🚀 Iniciando a aplicação Financeira..."

# Verifica se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ Erro: PM2 não está instalado. Execute o setup_vm.sh primeiro ou instale via: npm install -g pm2"
    exit 1
fi

# Garante que estamos na pasta correta (onde o script está)
cd "$(dirname "$0")"

# Tenta reiniciar se já existir, senão inicia do zero
if pm2 list | grep -q "financeiro-app"; then
    echo "♻️  Reiniciando processo existente..."
    pm2 restart financeiro-app
else
    echo "✨ Iniciando novo processo..."
    pm2 start server.js --name "financeiro-app"
fi

# Salva a lista de processos para persistência no reboot da VM
pm2 save

echo "✅ Aplicação pronta!"
echo "--------------------------------------------"
pm2 status financeiro-app
