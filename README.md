# SQL Sandbox

En SQL-praksis-app som kjører i nettleseren — ekte SQLite (WebAssembly), realistiske datasett, oppgaver med hint og fasit, søk overalt, og en **Eksamen-modus** som pre-fyller fasit i editoren.

## Last ned og kjør på din egen PC

### 1. Klon repoet

```bash
git clone https://github.com/isakdevvv/sql-practice-hub.git
cd sql-practice-hub
```

### 2. Installer + start

**macOS / Linux:**

```bash
./start.sh
```

**Windows:**

```cmd
start.cmd
```

Skriptet:
- installerer [Bun](https://bun.sh) hvis det mangler,
- henter alle avhengigheter (`bun install`),
- starter API-serveren (port `3001`) **og** webserveren (port `5173`) samtidig.

Når du ser `Local: http://localhost:5173/` i terminalen, åpne den URL-en i nettleseren — du kan bruke alle funksjoner (oppgaver, eksamen-modus, søk, ER-tegner, Python-konsoll, kurs, …).

Stopp med `Ctrl + C`.

---

### Manuell installasjon (uten skript)

Krever [Bun](https://bun.sh) ≥ 1.0.

```bash
bun install
bun run dev
```

## Funksjoner

- **Practice** — over 300 oppgaver fordelt på 6 nivåer og 90+ temaer, med hint, fasit-diff og forklaring.
- **Eksamen-modus** — slå på fra startsiden. Fasit pre-fylles i SQL-editoren for hver oppgave, så du kan slå opp svaret direkte under eksamen.
- **Globalt søk** — alltid synlig i headeren. Trykk `/` eller `⌘K` (`Ctrl+K`) for å søke etter side, tema eller oppgave fra hvor som helst.
- **Kurs** — strukturert læringssti fra nivå 0.
- **ER-tegner** — visuelt skjemaverktøy.
- **Python- og API-konsoll** — Pyodide kjører Python i nettleseren, Flask-mini-app inkludert.
- **Stack-arkitektur** — interaktive forklaringer av HTTP, sessions, app-factory osv.

## Krav

- [Bun](https://bun.sh) ≥ 1.0 (`start.sh`/`start.cmd` installerer den ved behov på Unix).
- Git.
- En moderne nettleser (Chromium/Firefox/Safari).

Ingen database eller server-oppsett kreves — alt kjører lokalt.

## Lisens

Se repo for detaljer.
