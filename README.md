# Kodeverkstedet

> Studentlaget øvingsverktøy for IT-fagene i bachelorløpet.
> Ikke et offisielt kursmateriale, men ment som forberedelse til eksamen.

En praktisk læringsapp som kjører i nettleseren: SQL med ekte SQLite (WebAssembly),
Python i Pyodide, interaktive simulatorer, mini-kurs, flashcards, oppgaver med
hint og fasit, og søk overalt.

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

- **henter siste versjon fra GitHub** (`git pull`) hvis du allerede har klonet,
- installerer [Bun](https://bun.sh) hvis det mangler,
- henter alle avhengigheter (`bun install`),
- starter API-serveren (port `3001`) **og** webserveren (port `5173`) samtidig.

Når du ser `Local: http://localhost:5173/` i terminalen, åpne den URL-en i nettleseren — du kan bruke alle funksjoner (oppgaver, eksamen-modus, søk, ER-tegner, Python-konsoll, kurs, …).

Stopp med `Ctrl + C`.

### 3. Få oppdateringer

Du trenger ikke gjøre noe spesielt — **bare kjør `./start.sh` (eller `start.cmd`) hver gang.**
Skriptet ser etter ny versjon på GitHub og oppdaterer automatisk før appen starter.
Ingen endringer for deg = ingen oppdatering.

Vil du hoppe over auto-oppdatering (f.eks. uten nett):

```bash
SKIP_UPDATE=1 ./start.sh        # macOS/Linux
set SKIP_UPDATE=1 && start.cmd  # Windows
```

Eller manuelt:

```bash
git pull
```

---

### Manuell installasjon (uten skript)

Krever [Bun](https://bun.sh) ≥ 1.0.

```bash
git pull            # hent siste versjon
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
