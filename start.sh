#!/usr/bin/env bash
# SQL Sandbox — start-skript for macOS / Linux / WSL
# Installerer Bun ved behov, henter avhengigheter, og starter API + web.

set -euo pipefail
cd "$(dirname "$0")"

API_PORT="${API_PORT:-3001}"
WEB_PORT="${WEB_PORT:-5173}"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
info() { printf "  → %s\n" "$*"; }
warn() { printf "\033[33m  ! %s\033[0m\n" "$*"; }

# Auto-oppdatering: hent siste versjon fra GitHub før start.
# Hopper over hvis git mangler, hvis det ikke er et git-repo, eller hvis
# brukeren har lokale endringer (vi vil ikke skygge over noens jobb).
if [[ "${SKIP_UPDATE:-}" != "1" ]] && command -v git >/dev/null 2>&1 && [[ -d .git ]]; then
  bold "==> Sjekker etter oppdateringer"
  if ! git diff --quiet HEAD 2>/dev/null || [[ -n "$(git status --porcelain --untracked-files=no 2>/dev/null)" ]]; then
    warn "Du har lokale endringer — hopper over auto-oppdatering."
  else
    if git fetch --quiet origin 2>/dev/null; then
      LOCAL=$(git rev-parse @ 2>/dev/null || echo "")
      REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
      if [[ -n "$REMOTE" && "$LOCAL" != "$REMOTE" ]]; then
        info "Ny versjon tilgjengelig — oppdaterer…"
        if git pull --ff-only --quiet 2>/dev/null; then
          info "Oppdatert til $(git rev-parse --short HEAD)"
        else
          warn "Kunne ikke fast-forwarde. Kjør 'git pull' manuelt for å løse."
        fi
      else
        info "Allerede oppdatert ($(git rev-parse --short HEAD))."
      fi
    else
      warn "Ingen nettverk — bruker eksisterende versjon."
    fi
  fi
fi

bold "==> Sjekker Bun"
if ! command -v bun >/dev/null 2>&1; then
  info "Bun er ikke installert — installerer fra bun.sh"
  if ! command -v curl >/dev/null 2>&1; then
    echo "Mangler 'curl'. Installer det og prøv igjen, eller installer Bun manuelt fra https://bun.sh."
    exit 1
  fi
  curl -fsSL https://bun.sh/install | bash
  # shellcheck disable=SC1090
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi
info "Bun: $(bun --version)"

bold "==> Installerer avhengigheter"
bun install

cleanup() {
  echo
  bold "==> Stopper servere"
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null || true
  [[ -n "${WEB_PID:-}" ]] && kill "$WEB_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

bold "==> Starter API-server på http://localhost:${API_PORT}"
PORT="$API_PORT" bun server/index.ts &
API_PID=$!

bold "==> Starter web-server på http://localhost:${WEB_PORT}"
bun run dev:web --port "$WEB_PORT" &
WEB_PID=$!

echo
bold "Klar! Åpne i nettleseren:"
info "Web:  http://localhost:${WEB_PORT}"
info "API:  http://localhost:${API_PORT}/api/health"
echo "Trykk Ctrl-C for å stoppe."
wait
