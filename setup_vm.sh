#!/bin/bash
# ============================================================
# Script de configuração da VM — Sistema Financeiro
# Compatível com Ubuntu 20.04 / 22.04 / 24.04
# Uso: chmod +x setup_vm.sh && sudo ./setup_vm.sh
# ============================================================

set -e

echo "============================================"
echo "  Configuração da VM — Sistema Financeiro"
echo "============================================"
echo ""

# --- 1. Atualizar sistema ---
echo "[1/7] Atualizando o sistema..."
apt update -y && apt upgrade -y
echo "✅ Sistema atualizado."
echo ""

# --- 2. Instalar dependências básicas ---
echo "[2/7] Instalando dependências básicas..."
apt install -y curl wget git ufw
echo "✅ Dependências básicas instaladas."
echo ""

# --- 3. Instalar Node.js 20 LTS ---
echo "[3/7] Instalando Node.js 20 LTS..."
if command -v node &> /dev/null; then
    echo "   Node.js já instalado: $(node --version)"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "   Node.js instalado: $(node --version)"
    echo "   npm instalado: $(npm --version)"
fi
echo "✅ Node.js configurado."
echo ""

# --- 4. Instalar PM2 (gerenciador de processos) ---
echo "[4/7] Instalando PM2..."
if command -v pm2 &> /dev/null; then
    echo "   PM2 já instalado."
else
    npm install -g pm2
fi
echo "✅ PM2 configurado."
echo ""

# --- 5. Instalar e configurar PostgreSQL ---
echo "[5/7] Instalando PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "   PostgreSQL já instalado."
else
    apt install -y postgresql postgresql-contrib
fi
systemctl start postgresql
systemctl enable postgresql

# Configurar senha do usuario postgres
echo "   Configurando senha do PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || true
echo "✅ PostgreSQL configurado. Senha do user postgres: postgres"
echo ""

# --- 6. Clonar e configurar a aplicação ---
echo "[6/7] Configurando a aplicação..."

APP_DIR="/home/$(logname 2>/dev/null || echo $SUDO_USER)/financeiro-app"

# Perguntar URL do repositório se o diretório não existir
if [ ! -d "$APP_DIR" ]; then
    echo ""
    read -p "   URL do repositório Git (ou Enter para pular): " REPO_URL

    if [ -n "$REPO_URL" ]; then
        git clone "$REPO_URL" "$APP_DIR"
        echo "   Repositório clonado em: $APP_DIR"
    else
        echo "   ⚠️  Repositório não informado. Copie os arquivos manualmente para: $APP_DIR"
        echo "   Depois execute novamente este script."
        mkdir -p "$APP_DIR"
    fi
fi

if [ -f "$APP_DIR/package.json" ]; then
    cd "$APP_DIR"

    # Instalar dependências do Node
    echo "   Instalando dependências do projeto..."
    npm install

    # Criar arquivo .env se não existir
    if [ ! -f ".env" ]; then
        echo "   Criando arquivo .env..."
        cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=financeiro_db
SESSION_SECRET=financeiro_secret_key_2024
PORT=3000

EOF
    fi

    # Popular banco de dados
    echo "   Populando banco de dados..."
    npm run seed

    echo "✅ Aplicação configurada."
else
    echo "   ⚠️  package.json não encontrado em $APP_DIR."
    echo "   Copie os arquivos do projeto e execute novamente."
fi
echo ""

# --- 7. Configurar firewall e iniciar aplicação ---
echo "[7/7] Configurando firewall e iniciando aplicação..."

# Abrir portas necessárias
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # Aplicação
ufw allow 80/tcp    # HTTP (opcional, para proxy)
ufw --force enable

# Iniciar aplicação com PM2
if [ -f "$APP_DIR/server.js" ]; then
    cd "$APP_DIR"
    pm2 delete financeiro-app 2>/dev/null || true
    pm2 start server.js --name financeiro-app
    pm2 save
    pm2 startup systemd -u "$(logname 2>/dev/null || echo $SUDO_USER)" --hp "/home/$(logname 2>/dev/null || echo $SUDO_USER)" 2>/dev/null || true
    echo "✅ Aplicação iniciada com PM2."
fi
echo ""

# --- Resumo ---
IP=$(hostname -I | awk '{print $1}')
echo "============================================"
echo "  ✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "============================================"
echo ""
echo "  📌 Resumo:"
echo "  ─────────────────────────────────"
echo "  Node.js:     $(node --version 2>/dev/null || echo 'não instalado')"
echo "  npm:         $(npm --version 2>/dev/null || echo 'não instalado')"
echo "  PostgreSQL:  $(psql --version 2>/dev/null | head -1 || echo 'não instalado')"
echo "  PM2:         $(pm2 --version 2>/dev/null || echo 'não instalado')"
echo ""
echo "  🌐 URL de acesso: http://177.44.248.108:3000"
echo "  👤 Login: admin"
echo "  🔑 Senha: admin123"
echo ""
echo "  📁 Diretório: $APP_DIR"
echo ""
echo "  Comandos úteis:"
echo "    pm2 status              — ver status"
echo "    pm2 logs financeiro-app — ver logs"
echo "    pm2 restart financeiro-app — reiniciar"
echo "============================================"
