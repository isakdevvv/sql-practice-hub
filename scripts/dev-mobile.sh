#!/usr/bin/env bash
# Run the dev stack so the phone (on the same hotspot/LAN) can reach it.
#
# Usage:
#   bun run dev:mobile                  # auto-detect LAN IP from the default route
#   HOST_IP=192.168.x.y bun run dev:mobile   # override the IP shown to you
#   PORT=5173 SERVER_PORT=3001 bun run dev:mobile   # override ports
#
# How it works:
#   - Vite binds to 0.0.0.0 so other devices on the same network can reach it.
#   - The Hono backend stays on localhost; Vite's /api proxy forwards calls.
#   - macOS firewall may block incoming on first run — accept the prompt, or:
#     System Settings → Network → Firewall → allow incoming for `node` + `bun`.

set -euo pipefail

PORT="${PORT:-5173}"
SERVER_PORT="${SERVER_PORT:-3001}"

# Find the IP on the interface that handles the default route.
# On a phone hotspot, that's the hotspot interface — same subnet as the phone.
detect_ip() {
  local iface ip
  iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}' || true)"
  if [[ -n "${iface:-}" ]]; then
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [[ -n "${ip:-}" ]]; then
      echo "$ip"
      return
    fi
  fi
  # Fallback: first non-loopback IPv4 address.
  ifconfig | awk '/inet /{print $2}' | grep -v '^127\.' | head -n1
}

HOST_IP="${HOST_IP:-$(detect_ip)}"

if [[ -z "${HOST_IP:-}" ]]; then
  echo "Could not detect a LAN IP. Are you connected to wifi/hotspot?" >&2
  echo "Set HOST_IP=... manually and re-run." >&2
  exit 1
fi

URL="http://${HOST_IP}:${PORT}"

echo
echo "=========================================================="
echo "  SQL Practice Hub — mobile dev"
echo "  Open this URL in Safari on your phone:"
echo
echo "      ${URL}"
echo
echo "  Backend (internal): http://localhost:${SERVER_PORT}"
echo "  Frontend bound on 0.0.0.0:${PORT}"
echo "=========================================================="
echo

# Print a QR code if qrencode is installed (brew install qrencode).
if command -v qrencode >/dev/null 2>&1; then
  qrencode -t ANSIUTF8 "${URL}"
  echo
fi

# Hand off to concurrently — same shape as `bun run dev`, but vite with --host.
PORT="${SERVER_PORT}" exec bunx concurrently \
  -n server,web \
  -c blue,magenta \
  "bun --watch server/index.ts" \
  "vite dev --host 0.0.0.0 --port ${PORT}"
