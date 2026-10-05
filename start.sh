#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
#  PolarSetu — Dev Server Startup Script
#  SIH 2026 · Problem Statement 26063 · NCPOR / MoES
# ═══════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}"
echo "  ██████╗  ██████╗ ██╗      █████╗ ██████╗ "
echo "  ██╔══██╗██╔═══██╗██║     ██╔══██╗██╔══██╗"
echo "  ██████╔╝██║   ██║██║     ███████║██████╔╝"
echo "  ██╔═══╝ ██║   ██║██║     ██╔══██║██╔══██╗"
echo "  ██║     ╚██████╔╝███████╗██║  ██║██║  ██║"
echo "  ╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${BOLD}  PolarSetu${NC} — Discover. Understand. Explore the Poles."
echo -e "  ${BLUE}NCPOR · Ministry of Earth Sciences · SIH 2026${NC}"
echo ""

# ─── Check prerequisites ───
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi

if ! command -v python3 &>/dev/null; then
  echo -e "${RED}✗ Python 3 not found. Install from https://python.org${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ Python $(python3 --version | awk '{print $2}')${NC}"

# ─── Check .env files ───
echo ""
echo -e "${YELLOW}Checking environment files...${NC}"

API_ENV="$PROJECT_DIR/apps/api/.env"
if [ ! -f "$API_ENV" ]; then
  echo -e "${YELLOW}! API .env not found. Copying from .env.example with demo values...${NC}"
  if [ -f "$PROJECT_DIR/apps/api/.env.example" ]; then
    cp "$PROJECT_DIR/apps/api/.env.example" "$API_ENV"
    echo -e "${YELLOW}! Edit apps/api/.env with your Supabase + Gemini credentials for full functionality.${NC}"
  fi
fi

# Detect if using demo SQLite or PostgreSQL
if grep -q "sqlite" "$API_ENV" 2>/dev/null || ! grep -q "DATABASE_URL" "$API_ENV" 2>/dev/null; then
  echo -e "${YELLOW}⚠ DATABASE_URL not configured — API will use SQLite demo mode${NC}"
fi

# ─── Install backend deps ───
echo ""
echo -e "${YELLOW}Setting up Python backend...${NC}"

API_DIR="$PROJECT_DIR/apps/api"
VENV_DIR="$API_DIR/.venv"

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

echo "Installing/verifying Python packages..."
"$VENV_DIR/bin/pip" install -q -r "$API_DIR/requirements.txt" 2>/dev/null || \
"$VENV_DIR/bin/pip" install -q fastapi "uvicorn[standard]" sqlalchemy psycopg2-binary \
  pydantic-settings "python-jose[cryptography]" "passlib[bcrypt]" python-multipart \
  requests beautifulsoup4 pymupdf google-generativeai aiofiles python-dotenv httpx 2>/dev/null || true

echo -e "${GREEN}✓ Python backend ready${NC}"

# ─── Install frontend deps ───
echo ""
echo -e "${YELLOW}Setting up Next.js frontend...${NC}"

WEB_DIR="$PROJECT_DIR/apps/web"
if [ ! -d "$WEB_DIR/node_modules" ]; then
  echo "Installing frontend packages (this may take a moment)..."
  cd "$WEB_DIR" && npm install --silent 2>/dev/null
fi

echo -e "${GREEN}✓ Frontend ready${NC}"

# ─── Seed DB ───
echo ""
echo -e "${YELLOW}Checking database...${NC}"
cd "$PROJECT_DIR"
"$VENV_DIR/bin/python3" scripts/seed_database.py 2>/dev/null || echo -e "${YELLOW}! Skipped seed (DB may already be seeded or connection unavailable)${NC}"
echo -e "${GREEN}✓ Database check done${NC}"

# ─── Start servers ───
echo ""
echo -e "${BOLD}Starting development servers...${NC}"
echo ""

# Start API
echo -e "${CYAN}▶ Starting FastAPI backend on http://localhost:8000${NC}"
cd "$API_DIR"
"$VENV_DIR/bin/uvicorn" main:app --host 0.0.0.0 --port 8000 --reload --log-level warning &
API_PID=$!
echo -e "${GREEN}  ✓ API server started (PID: $API_PID)${NC}"

sleep 2

# Start Web
echo -e "${CYAN}▶ Starting Next.js frontend on http://localhost:3000${NC}"
cd "$WEB_DIR"
npm run dev --silent &
WEB_PID=$!
echo -e "${GREEN}  ✓ Frontend started (PID: $WEB_PID)${NC}"

echo ""
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  🌍 PolarSetu is running!${NC}"
echo -e ""
echo -e "  Frontend:    ${CYAN}http://localhost:3000${NC}"
echo -e "  API:         ${CYAN}http://localhost:8000${NC}"
echo -e "  API Docs:    ${CYAN}http://localhost:8000/docs${NC}"
echo -e "  Admin:       ${CYAN}http://localhost:3000/admin${NC}"
echo -e ""
echo -e "  Demo login:  ${YELLOW}admin@ncpor.res.in${NC}"
echo -e "  Password:    ${YELLOW}PolarHub@2026${NC}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "Press ${BOLD}Ctrl+C${NC} to stop all servers."

# Handle shutdown
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping servers...${NC}"
  kill $API_PID 2>/dev/null || true
  kill $WEB_PID 2>/dev/null || true
  echo -e "${GREEN}Servers stopped.${NC}"
  exit 0
}
trap cleanup INT TERM

wait $API_PID $WEB_PID
