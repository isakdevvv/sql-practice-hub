#!/usr/bin/env bash
# Build & run the SQL practice hub locally.
#
# Notes on this project's build:
#   - `bun run build` produces a Cloudflare Worker bundle (dist/server/index.js + dist/client).
#     That bundle is for deploying via wrangler — it is NOT a Node-runnable preview
#     (TanStack Start's vite preview expects dist/server/server.js, which the CF preset
#     does not emit). So `vite preview` will not work here.
#   - The SQL API is a separate Bun + Hono process (server/index.ts). In dev, vite proxies
#     /api to it; in production it would be a separate service.
#
# This script:
#   1. installs deps
#   2. runs the problem-suite tests
#   3. type-checks via `vite build` (so build errors surface)
#   4. starts the API server (port 3001) and the vite dev server (port 8080) concurrently
#   5. stops both on Ctrl-C
set -euo pipefail

cd "$(dirname "$0")"

API_PORT="${API_PORT:-3001}"
WEB_PORT="${WEB_PORT:-8080}"

echo "==> Installing dependencies"
bun install

echo "==> Running problem tests"
bun run test-problems.ts

echo "==> Building (verifies the production bundle compiles)"
bun run build

cleanup() {
  echo
  echo "==> Stopping servers"
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null || true
  [[ -n "${WEB_PID:-}" ]] && kill "$WEB_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting API server on http://localhost:${API_PORT}"
PORT="$API_PORT" bun server/index.ts &
API_PID=$!

echo "==> Starting web dev server on http://localhost:${WEB_PORT}"
bun run dev:web --port "$WEB_PORT" &
WEB_PID=$!

echo
echo "App is running:"
echo "  Web:  http://localhost:${WEB_PORT}"
echo "  API:  http://localhost:${API_PORT}/api/health"
echo "Press Ctrl-C to stop."
wait
