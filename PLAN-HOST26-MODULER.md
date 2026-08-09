# Plan høst 2026 — modul-for-modul

**Skrevet 2026-08-08.** Denne planen er *strukturell*: den sier hvordan faga skal
kunne følges undervisningsuke for undervisningsuke, og hvilke oppgavetyper som
bygges per modul. Den erstatter ikke atom-planene i `plan-dte-*.md` /
`plan-tek-1501.md` — de er fortsatt kilden for *hvilke konsepter* som finnes.
Denne sier *hvordan de pakkes*.

Se [PLANER-HOST26.md](PLANER-HOST26.md) for atom-planene, og
[CLAUDE.md](CLAUDE.md) for worktree- og ledger-reglene som gjelder alt arbeid her.

---

## 1. Faga i år

| Fag | Stp | Eksamen | Form | Modul-kilde |
|---|---|---|---|---|
| **DTE-2507** Datakommunikasjon og sikkerhet | 10 | 30.11.2026, Bodø | Skriftlig | Kurose-kapitler + Canvas |
| **DTE-2505** Operativsystemer | 5 | 02.12.2026, Narvik | Skriftlig 2t | Canvas: Modul 1a–6, obliger 1.1–5 |
| **DTE-2602** Intro ML og AI | 10 | 09.12.2026 + mappe 11.12 | Hjemme + mappe | Faseinndeling i `plan-dte-2602.md` |
| **TEK-1501** Sannsynlighet og statistikk | 5 | 14.12.2026 | Skriftlig 3t | Kristensen & Wikan (se §5) |

Rekkefølgen over er eksamensrekkefølgen. Byggerekkefølgen er en annen: vi bygger
etter *undervisningsprogresjon*, altså første moduler først i alle fire fag,
fordi det er de som er i bruk nå i august–september.

---

## 2. Kjerneprinsippet: obligen/kapittelet er bossen

For hvert fag finnes en ekstern, hard sjekkpunkt-rekke — obligfrister i DTE-2505,
Kurose-kapitler i DTE-2507, mappeleveranser i DTE-2602, kapitteløvinger i TEK-1501.
**Modulen i appen bygges bakover fra det sjekkpunktet**, ikke fra temaet.

Praktisk konsekvens: en modul er ikke ferdig når temaet er forklart. Den er ferdig
når studenten kan gjøre det sjekkpunktet krever, uten hjelp.

---

## 3. Oppgave-arkitektur — fem typer, én jobb hver

Denne rekkefølgen gjelder per konsept, i alle fire fag. Ikke bland dem; hver type
løser et problem de andre ikke løser.

| # | Type | Jobb | Når |
|---|---|---|---|
| 1 | **Anslå-så-sjekk** | Lage et hull hjernen vil fylle | FØR forklaringen |
| 2 | **Guidet simulering** (lær-modus) | Bygge mental modell, null prestasjonskrav | Under forklaringen |
| 3 | **Måloppgave med tilstandssjekk** | Kunne oppnå et mål, ikke gjenkalle en streng | Etter forklaringen |
| 4 | **Feilsøkingsoppgave** | Tvinge frem helhetsforståelse — feilen kan bo i hvilket som helst lag | Sist i modulen |
| 5 | **Recall-kort (FSRS)** | Kun det som *må* sitte i hodet | Løpende, på tvers |

### 3.1 Tilstandssjekk framfor regex — obligatorisk for nye oppgaver

`src/lib/dte2505/shellScenarios.ts` sjekker svar med regex mot kommandostrengen.
Det lærer *gjenkalling av en kommando*. Nye oppgaver skal i stedet definere et
**måltilstand-predikat** og sjekke effekten:

- Flere riktige løsninger godtas (`chmod 750` = `chmod u=rwx,g=rx,o=`).
- Feilmeldingen kan si *hva som ble galt*, ikke bare «feil».
- Flerstegs-oppgaver blir mulige — det er de som ligner obligene.

`src/components/stack/dte2505-bash-scripts/BashSandbox.tsx` har allerede et
mock-filsystem. Det utvides til en delt tilstandsmaskin (filer, eiere,
rettighetsbits, prosesser) som alle Linux-moduler kan bruke.

I statistikk-/ML-faga er analogien: sjekk **det numeriske svaret innenfor
toleranse + valgt metode**, ikke en streng. En student som velger t-test og
begrunner det riktig, men regner feil i tredje desimal, skal få vite akkurat det.

### 3.2 Integrasjonsoppgaver

3–4 per fag, plassert etter modulen som fullfører kjeden. Kjennetegn: **kan ikke
løses med én modul alene**. Dette er hovedmekanismen for «forstår helheten».

Eksempler:
- DTE-2505: «Skriptet kjører i terminalen, men ikke fra cron.» → PATH + miljø + prosessarv (modul 3+4+5)
- DTE-2507: «Siden laster i nettleseren, men curl feiler med sertifikatfeil.» → DNS + TCP + TLS-kjede
- TEK-1501: «Er denne forskjellen ekte?» → deskriptiv + fordeling + test + p-verdi-tolkning

### 3.3 Go-deep-laget

Repoet har mye stoff som går utover pensum (OSTEP-paging, lagringsfysikk,
Kurose-dybde, bootstrap). Det skal **ikke** blandes inn i moduloppgavene — da
drukner sjekkpunktet. Legges som eksplisitt merket «Dypere enn pensum»-panel
nederst i modulen, med én linje om hvorfor det er verdt tiden.

### 3.4 Ikke la modul 1 råtne

`src/lib/learn/fsrs.ts` finnes. Alle modulers recall-kort kobles til **én** kø,
ikke per-modul-lister. Ellers står man 14.12 og har glemt august.

---

## 4. Modul-strukturen per fag

### 4.1 DTE-2505 Operativsystemer — Canvas-modulene er fasit

Verifisert mot Canvas 2026-08-08. **Obligfristene er reelle og skal inn i appen.**

| Modul | Tema | Oblig | Frist | Dekning i dag |
|---|---|---|---|---|
| 1a | Linux og OS (kun teori, Gorman kap. 1) | — | — | ✅ `os-grunnlag`, `dte2505-os-typologi`, `os-historikk` |
| 1b | Installasjon, programmer, oppdateringer | 1.1 + 1.2 | 28.08 | ⚠️ Forkurs F01–F03 + `linux-bruk` §5. **Mangler:** andre kilder (PPA, snap, `.deb`, repo-nøkler) |
| 2 | Kommandobasert, hjelpesystemer, dokumentasjon | 2 | 11.09 | ❌ **hull** — `man`/`info`/`apropos`/`whatis`/`--help` finnes bare spredt |
| 3 | Prosesser (Gorman kap. 2) | 3 | 02.10 | ✅ sterkt — signaler, thread-state, kontekstbytte, IPC, scheduling |
| 4 | Filsystem og skallet (redirection) | 4 | 23.10 | ✅ `dte2505-filsystem`, `linux-bruk`, `shell-scripting` |
| 5 | Tilgangsrettigheter og skallprogram | 5 | 06.11 | ✅ sterkt — `brukere-rettigheter`, `spesialbits`, `rwx-kalkulator`, `bash-scripts` |
| 6 | Diverse: vi(m), X, SSH | — | — | ❌ **hull** — ingen vim-, X- eller SSH-modul |

Merk: `Oblig 1.3 gis ikke i år` (bekreftet i Canvas).

**Feil som skal rettes:** `ObligerHub.tsx` bruker nummereringen «1 Installasjon,
2 Filsystem-navigasjon, 3 apt, 4 rettigheter, 5 bash». Den stemmer ikke med Canvas
og har ingen frister. Skal rettes til tabellen over.

**Prioritet nå:** modul-rammen + modul 2 som pilot for de fem oppgavetypene
(rent hull, liten, frist 11.09).

### 4.2 DTE-2507 Datakommunikasjon og sikkerhet

Bygger på lagene i [plan-dte-2507.md](plan-dte-2507.md) (Lag 0–8, ~60 atomer).
Modulinndelingen følger Kurose top-down: skjelett → applikasjon → transport →
nettverk → lenke → sikkerhet. **Canvas-modulene for 2507 er ikke lest ennå** —
må verifiseres på samme måte som 2505 før vi låser rekkefølgen.

Første moduler (bygges nå): Lag 0 (konseptuelt skjelett — protokollstakk,
innkapsling, adresser på hvert lag) og Lag 4/1 avhengig av hvilken vei emnet
underviser. **Åpent punkt — se §6.**

### 4.3 DTE-2602 Intro ML og AI

Faser 1–7 i [plan-dte-2602.md](plan-dte-2602.md). Eksamen er hjemme + mappe, så
sjekkpunktet er mappeleveransen, ikke en skriftlig prøve. Det endrer oppgavetypene:
tyngden skal ligge på type 3 (måloppgave) og type 4 (feilsøking av en pipeline),
mindre på type 5 (recall).

Første moduler: Fase 1 (hva er ML) og Fase 2 (data og features).

### 4.4 TEK-1501 Sannsynlighet og statistikk

Sporene A–F i [plan-tek-1501.md](plan-tek-1501.md). Se §5 for boka.

Første moduler: Spor A (data/deskriptiv — stort sett dekket, trenger
oppgavetypene) og Spor B (sannsynlighet — kombinatorikk, betinget, Bayes).

---

## 5. Læreboka i TEK-1501

**Bok:** *Sannsynlighetsregning og statistikk for høyere utdanning*
— Ørjan Kristensen og Arild Wikan, Fagbokforlaget. 2. utgave 2019
(ISBN 978-82-450-2654-2). Det finnes også et separat **Ressurshefte**
(ISBN 978-82-450-3268-0) med oppgaver — verdt å skaffe, det er en direkte kilde
til oppgavetype 3.

**Hva forlaget oppgir om innholdet:** boka gir en bred innføring i teorien for
diskrete og kontinuerlige sannsynlighetsfordelinger, og viser hvordan dette brukes
i blant annet hypotesetesting og beregning av konfidensintervall. Omfanget er
med vilje noe større enn det som er pensum i de fleste studieprogram — altså
inneholder den mer enn TEK-1501 krever, og vi må velge ut.

**Status: PDF-en er ikke på maskinen.** Jeg søkte gjennom hele hjemmeområdet
(`Books/`, `Downloads/`, Spotlight på tittel og forfatter) — den finnes ikke her.
`Books/s.pdf` er Petzolds *Code*, ikke statistikkboka. Detaljert
innholdsfortegnelse ligger heller ikke åpent ute hos forlaget eller bokhandlerne.

**Konsekvens:** TEK-1501-modulene bygges foreløpig på atom-planen i
`plan-tek-1501.md`, som følger standard progresjon for norske
ingeniør-statistikkurs (data → sannsynlighet → fordelinger → inferens →
regresjon). Det er trygt nok til å bygge de første modulene — deskriptiv
statistikk og sannsynlighetsregning ser like ut i alle slike bøker.

**Å gjøre:** legg PDF-en i `Books/`. Da kan vi
1. mappe kapittel-for-kapittel i stedet for spor-for-spor,
2. bruke bokas notasjon og symbolvalg konsekvent (viktig gitt
   scaffolding-regelen om at ingen symboler brukes før de er introdusert),
3. hente ut kapitteloppgavene som fasit-sjekk for oppgavetype 3.

Til det er på plass er kapittelmappingen i TEK-1501 **provisorisk** og skal
merkes som det i appen.

---

## 6. Åpne spørsmål

1. **DTE-2507s Canvas-moduler er ikke lest.** Vi vet lagene fra Kurose, ikke
   emnets faktiske modulrekkefølge eller innleveringsfrister. Trenger samme
   gjennomgang som 2505 fikk.
2. **DTE-2602s mappekrav** er ikke spesifisert i planene — hva mappa faktisk skal
   inneholde styrer hvilke oppgaver som er verdt å bygge.
3. **TEK-1501-boka** — se §5.
4. **To ferdige brancher ligger umerget:** `feat/linux-drill` (10 topics, bl.a.
   nett/SSH og pakker) og `feat/linux-cli-adv-viz`. Begge dekker deler av
   DTE-2505-hullene. Bør merges før vi bygger oppå.

---

## 7. Byggerekkefølge

**Bølge 1:** modul-rammer + første moduler. **Én agent om gangen** — køen under
kjøres sekvensielt, ikke parallelt. Neste agent starter først når forrige har
rapportert.

| # | Fag | Leveranse | Eier | Status |
|---|---|---|---|---|
| A | DTE-2505 | Modul-for-modul-visning, Canvas-korrekte obliger + frister | `dte-2505/`, `dte2505-obliger/` | ✅ ferdig, `feat/dte2505-moduler` (umerget) |
| B | DTE-2505 | Modul 2 (hjelpesystemer) som pilot for de fem oppgavetypene | `dte2505-hjelpesystemer/` (ny) | ✅ ferdig, `feat/dte2505-hjelpesystemer` (umerget) |
| C | TEK-1501 | Modul-ramme + Spor A/B med oppgavetypene | `tek-1501/`, `tek1-modul*/` (ny) | ⏸️ delvis — oppgave-arkitekturen committet (`4f55688`), modul 1 ucommittet |
| D | DTE-2602 | Modul-ramme + Fase 1–2 med oppgavetypene | `dte-2602/`, `dte2602-modul*/` (ny) | ⏸️ påbegynt, ingenting committet |

**Bølge 2 (senere):** tilstandsbasert mock-shell, modul 1b + 6 i DTE-2505,
DTE-2507 etter Canvas-gjennomgang, integrasjonsoppgaver, felles FSRS-kø.

Regel som gjelder alle: hver agent har egen worktree og egen ledger-fil under
`.claude/agents/`. Delte registre (`src/lib/stack/content/index.ts`,
`curriculum.ts`, `src/lib/subjects/catalog.ts`) røres med **minst mulig diff** —
kun de linjene som er nødvendige — fordi de er de eneste reelle konfliktpunktene.
