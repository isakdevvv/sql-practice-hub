#!/usr/bin/env bash
# Kjør dev-stacken når Macen selv er hotspot — for fly / no-internet-scenarier.
#
# Dekker tre tilkoblingsveier fra iPhonen:
#   1. WIFI: macOS Internet Sharing (Macen broadcaster et lokalt wifi-nett).
#   2. USB:  iPhone Lightning/USB-C med Personal Hotspot på telefonen.
#   3. LAN:  hvis du allerede er på et felles nett (default-route IP).
#
# Skriptet detekterer hvilke veier som er åpne nå og printer alle URL-er
# som faktisk fungerer. Hvis ingen er åpne, åpner det System Settings →
# Sharing og venter til en blir aktiv.
#
# Begrensning: macOS har ingen offentlig CLI for å slå på Internet Sharing.
# Du må klikke toggelen i System Settings første gang. Etter det husker
# macOS innstillingene og du kan slå den på/av fra menylinja.

set -euo pipefail

PORT="${PORT:-5173}"
SERVER_PORT="${SERVER_PORT:-3001}"

# --- detect interfaces ------------------------------------------------------

# Internet Sharing → wifi lager et bridge-interface (vanligvis bridge100).
detect_bridge_ip() {
  local iface ip
  for iface in bridge100 bridge101 bridge102; do
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [[ -n "${ip:-}" ]]; then
      echo "$ip"
      return
    fi
  done
}

# iPhone over USB: når Personal Hotspot er på og telefonen er koblet til via
# kabel, dukker den opp som "iPhone USB" i hardware-portlista.
detect_iphone_usb_ip() {
  local iface
  iface="$(networksetup -listallhardwareports 2>/dev/null \
    | awk '/iPhone/{getline; print $3; exit}')"
  [[ -z "${iface:-}" ]] && return
  ipconfig getifaddr "$iface" 2>/dev/null || true
}

# IP på interfacet som håndterer default route (vanlig wifi/ethernet).
detect_default_route_ip() {
  local iface
  iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}' || true)"
  [[ -z "${iface:-}" ]] && return
  ipconfig getifaddr "$iface" 2>/dev/null || true
}

print_paths() {
  local bridge usb route
  bridge="$(detect_bridge_ip)"
  usb="$(detect_iphone_usb_ip)"
  route="$(detect_default_route_ip)"

  echo
  echo "=========================================================="
  echo "  SQL Practice Hub — åpne én av disse i Safari på iPhone:"
  echo
  [[ -n "$bridge" ]] && echo "  Wifi (Internet Sharing):  http://$bridge:$PORT"
  [[ -n "$usb" ]]    && echo "  USB  (iPhone tethering):  http://$usb:$PORT"
  if [[ -n "$route" && "$route" != "$bridge" && "$route" != "$usb" ]]; then
    echo "  LAN  (default route):     http://$route:$PORT"
  fi
  echo "=========================================================="
  echo
}

print_setup_instructions() {
  cat <<'EOF'
Ingen åpen vei fra telefonen til Macen er detektert. Velg én:

WIFI-HOTSPOT (Internet Sharing) — anbefalt på fly:
  1. System Settings → General → Sharing åpnes nå.
  2. Klikk (i)-knappen ved siden av "Internet Sharing".
     - "Share your connection from": velg hva som helst tilgjengelig
       (Internet Sharing trenger IKKE faktisk internett — bridge fungerer
       uansett, telefonen får bare ikke nett-tilgang gjennom Macen).
     - "To computers using": huk av Wi-Fi.
     - Wi-Fi Options: sett SSID + WPA2-passord (8+ tegn).
  3. Slå på toggelen "Internet Sharing" øverst → bekreft "Start".
  4. På iPhonen: koble til den nye wifien.

USB / LIGHTNING:
  1. Plugg iPhonen i Macen.
  2. På iPhone: Settings → Personal Hotspot → toggle ON.
     NB: krever som regel aktiv mobildata.
  3. På Macen dukker "iPhone USB" opp som hardware-port.

Skriptet venter — så snart en vei er åpen, kjører dev-serveren av seg selv.
Avbryt med Ctrl+C.

EOF
}

# --- pre-flight: ensure at least one path is open ---------------------------

bridge_ip="$(detect_bridge_ip)"
usb_ip="$(detect_iphone_usb_ip)"

if [[ -z "$bridge_ip" && -z "$usb_ip" ]]; then
  print_setup_instructions

  # Åpne Sharing-pane direkte. URL-skjemaene varierer mellom macOS-versjoner —
  # prøv den nye først (Ventura+), så den gamle, så som siste utvei selve appen.
  open "x-apple.systempreferences:com.apple.Sharing-Settings.extension" 2>/dev/null \
    || open "x-apple.systempreferences:com.apple.preferences.sharing" 2>/dev/null \
    || open -b com.apple.systempreferences 2>/dev/null \
    || true

  echo "Venter på hotspot/USB..."
  while true; do
    sleep 2
    bridge_ip="$(detect_bridge_ip)"
    usb_ip="$(detect_iphone_usb_ip)"
    if [[ -n "$bridge_ip" || -n "$usb_ip" ]]; then
      echo "Detektert!"
      break
    fi
  done
fi

print_paths

# QR for den mest sannsynlige URL-en (wifi om mulig, ellers usb).
primary_ip="${bridge_ip:-$usb_ip}"
if [[ -n "$primary_ip" ]] && command -v qrencode >/dev/null 2>&1; then
  qrencode -t ANSIUTF8 "http://$primary_ip:$PORT"
  echo
fi

# --- start dev stack --------------------------------------------------------

PORT="$SERVER_PORT" exec bunx concurrently \
  -n server,web \
  -c blue,magenta \
  "bun --watch server/index.ts" \
  "vite dev --host 0.0.0.0 --port $PORT"
