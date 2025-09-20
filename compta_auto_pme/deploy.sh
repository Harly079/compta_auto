#!/usr/bin/env bash
set -e
echo "🚀 Déploiement Compta-Auto PME (Docker)..."
if ! command -v docker &>/dev/null; then
  echo "❌ Docker non trouvé. Installe Docker puis relance."; exit 1;
fi
cp -n .env.example .env || true
node -v || true
npm i -g pnpm || true
node scripts/generate_demo_data.mjs
docker compose up -d --build
echo "✅ API: http://localhost:8080/health"
echo "👉 Tests: bash scripts/smoke_tests.sh"
