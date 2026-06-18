#!/bin/bash
# ============================================================
# Script para Parar Toda a Aplicacao (Homologacao + Producao)
# Uso: chmod +x stop_app.sh && ./stop_app.sh
# ============================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem cor

# Caminho do projeto (pasta onde estao os docker-compose)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Parando Aplicacao — Financeiro App      ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

cd "$PROJECT_DIR" || { echo -e "${RED}Erro: pasta do projeto nao encontrada em $PROJECT_DIR${NC}"; exit 1; }

# ── Parar Homologacao ─────────────────────────────────────
echo -e "${YELLOW}[1/2] Parando Homologacao (porta 3001)...${NC}"
if docker compose -p homolog -f docker-compose.homolog.yml ps --quiet 2>/dev/null | grep -q .; then
    docker compose -p homolog -f docker-compose.homolog.yml down --remove-orphans
    echo -e "${GREEN}      Homologacao parada com sucesso.${NC}"
else
    echo -e "      Homologacao ja estava parada."
fi

echo ""

# ── Parar Producao ────────────────────────────────────────
echo -e "${YELLOW}[2/2] Parando Producao (porta 3002)...${NC}"
if docker compose -p prod -f docker-compose.prod.yml ps --quiet 2>/dev/null | grep -q .; then
    docker compose -p prod -f docker-compose.prod.yml down --remove-orphans
    echo -e "${GREEN}      Producao parada com sucesso.${NC}"
else
    echo -e "      Producao ja estava parada."
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Verificando containers ativos:${NC}"
echo -e "${BLUE}============================================${NC}"

# Lista containers relacionados ao projeto
RUNNING=$(docker ps --filter "name=homolog" --filter "name=prod" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null)

if [ -z "$RUNNING" ]; then
    echo -e "${GREEN}Nenhum container do projeto em execucao. Tudo parado!${NC}"
else
    echo -e "${RED}Atencao: ainda ha containers rodando:${NC}"
    echo "$RUNNING"
fi

echo ""
echo -e "${BLUE}Todos os containers (incluindo parados):${NC}"
docker ps -a --filter "name=homolog" --filter "name=prod" \
    --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null

echo ""
echo -e "${GREEN}Concluido! Use ./start_app.sh (ou start_homolog.sh / start_prod.sh) para subir novamente.${NC}"
echo ""
