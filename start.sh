#!/bin/bash
# ============================================================================
# Chatterbox TTS Turbo Server - Linux/macOS Launcher
# ============================================================================
# Usage:
#   ./start.sh            # Install deps (if needed) and start
#   PORT=5432 ./start.sh  # Override port
#   API_TARGET=http://localhost:4324 ./start.sh
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

cd "$(dirname "$0")" || exit 1

echo ""
echo "============================================================"
echo "   Chatterbox TTS Turbo Server - Launcher"
echo "============================================================"
echo ""

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Node.js is not installed.${NC}"
  echo "Please install Node.js 18+ (20+ recommended)."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}[ERROR] Node.js version too old: v$NODE_VERSION${NC}"
  echo "Please upgrade to Node.js 18+ (20+ recommended)."
  exit 1
fi

echo -e "${GREEN}[OK]${NC} Node.js v$NODE_VERSION"

echo ""
echo "Checking dependencies..."

if [ ! -d "node_modules" ]; then
  echo -e "${CYAN}Installing dependencies...${NC}"
  npm install
else
  echo -e "${GREEN}[OK]${NC} node_modules present"
fi

echo ""
echo "============================================================"
echo "Starting server..."
echo "============================================================"
echo "PORT=${PORT:-5432}"
echo "API_TARGET=${API_TARGET:-http://192.168.1.3:4324}"
echo ""

npm start
