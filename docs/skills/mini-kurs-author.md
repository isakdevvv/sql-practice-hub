---
name: mini-kurs-author
description: Bygg eller utvid mini-kurs i SQL Practice Hub — guidet sandkasse der studenten redigerer Python/Flask-filer i nettleseren og hver leksjon verifiserer at koden treffer målet. Bruk når en agent skal lage nytt mini-kurs (f.eks. "lineær regresjon fra null", "mini-NN med backprop"), legge til leksjoner i et eksisterende kurs, eller bygge ut læringsløypen for et fag. Trigger på "nytt mini-kurs", "lag kurs om <CS-tema>", "utvid <slug>-kurset", "bygg sandkasse for X".
---

# Mini-kurs-author — mal for å bygge interaktive sandkasse-kurs

Mini-kurs er guidede sandkasser. Hvert kurs er en `MiniCourse`-konstant i [`src/lib/mini-kurs/courses.ts`](../../src/lib/mini-kurs/courses.ts) som inneholder en liste `Lesson`-er. Hver leksjon har: en `narrative` som lærer ett konsept, et sett `files` med en stub studenten fyller inn, og `verifications` som automatisk avgjør om svaret er riktig. "Kjør"-knappen eksekverer Python i Pyodide eller mounterer en Flask-app via test-client.

Denne skillen beskriver mønsteret slik at nye kurs passer inn i den eksisterende læringsløypen og blir kompatible med indeks-sidens topologiske sortering.

## Hovedregler

1. **Original tekst og oppgaver.** Ikke kopier prosa, kode eller oppgaver fra Liang/AIMA/Tanenbaum/lærebøker. Skriv alt på egne ord, med egne eksempler. Bruk pensum-rekkefølgen som veiledning, ikke som tekstbank. Se [`docs/skills/source-to-course-author.md`](source-to-course-author.md) for utdypning.
2. **Pedagogikk: lær først, prøv selv.** Hver leksjon må ha en `narrative` som forklarer HVA og — viktigere — HVORFOR konseptet finnes. Studenten skal vite hvorfor de skriver koden før de ser stubben.
3. **Worktree per kurs** (per [`CLAUDE.md`](../../CLAUDE.md)). Aldri rediger `main`. Lag `feat/mini-kurs-<slug>` på en egen worktree og merg én gang når kurset er ferdig og verifisert.
4. **Bygg på eksisterende kurs.** Hvis ditt kurs har konseptuelle forutsetninger (f.eks. et "Flask-utvidelser"-kurs forutsetter `flask-fra-null`), sett `forutsetninger: ["<slug>"]`. Indeks-siden sorterer da automatisk.

## Filer som skal røres

| Fil | Hva legges til |
|---|---|
| `src/lib/mini-kurs/courses.ts` | Én ny `MiniCourse`-konstant + append til `MINI_COURSES`-listen |
| (sjelden) `src/lib/mini-kurs/types.ts` | Bare hvis du trenger nye `RunMode`- eller `VerifyCheck`-varianter |

Ingen UI-filer skal røres — `/mini-kurs/$slug` og `/mini-kurs/`-indeksen henter alt fra `MINI_COURSES` automatisk.

## MiniCourse-strukturen

```typescript
const MITT_KURS: MiniCourse = {
  id: "mitt-kurs",                // unikt
  slug: "mitt-kurs",              // URL-vennlig, brukes i forutsetninger
  title: "Bygg X fra null",       // kort, action-orientert
  blurb: "...",                   // 1-3 setninger som forklarer hva studenten bygger og hvorfor
  estimertTid: "45–60 min",       // ærlig estimat for hele kurset
  fag: ["DTE-2505", ...],         // FØRSTE element = primær-fag (brukes til gruppering på indeksen)
  color: "warning",               // "brand" | "success" | "warning" | "purple"
  forutsetninger: ["annet-kurs"], // valgfritt: slugs som bør tas først
  rekkefolge: 20,                 // anbefalt rekkefølge i fag-gruppen (lavere = tidligere)
  lessons: [...],
};
```

### Anbefalt verdier per fag-blokk

For konsistent visuell gruppering på indeks-siden:

- `rekkefolge: 10` for det første kurset i et fag
- `rekkefolge: 20, 30, ...` for påfølgende kurs
- Bruk `forutsetninger` hvis det er en HARD avhengighet (kode/konsepter brukes); bruk bare `rekkefolge` hvis det er en MYK anbefaling

Eksempler:

```typescript
// Hard: utleieapp bygger på flask-fra-null
{ slug: "utleieapp-fra-null", forutsetninger: ["flask-fra-null"], rekkefolge: 20 }

// Myk: prosess-scheduler er anbefalt etter mini-shell, men ikke koblet i kode
{ slug: "prosess-scheduler", rekkefolge: 20 }   // ingen forutsetninger
```

### Color-konvensjon

Velg color slik at kurs innen samme fag har lignende farger der det er meningsfullt:

| Color | Brukes typisk for |
|---|---|
| `brand` | Grunnkurs, intro-nivå |
| `success` | Nettverk (DTE-2507) |
| `warning` | OS/lavnivå (DTE-2505) |
| `purple` | AI/avansert (DTE-2501, DTE-2502) |

Du står fritt — dette er bare en heuristikk.

## Leksjons-strukturen

Hver `Lesson` har samme rytme:

```typescript
{
  id: "01-hvor-mange-leksjoner",    // "01-", "02-", ... for stabil sortering
  title: "1. Kort sitt-emne",        // tall foran tittelen er fin pedagogisk markør
  narrative: "...",                  // markdown, 100-300 ord, forklarer HVA + HVORFOR
  files: { "navn.py": "..." },       // stub-filene studenten ser
  defaultFile: "navn.py",            // fila som er åpen ved start
  editable: ["navn.py"],             // hvilke filer kan studenten endre
  run: { kind: "python-script", entry: "navn.py" },
  verifications: [                   // hvert kriterium vises som ✓/✗ for studenten
    { label: "...", check: { kind: "output-contains", needle: "OK   <test-navn>" } },
  ],
  hint: "...",                       // valgfritt: fasit hvis bruker står fast
}
```

## Verification-mønsteret

**Bruk `OK   <test-navn>`-stringer** — alle eksisterende kurs følger dette mønsteret. I leksjonens test-kode (nederst i `files`-fila):

```python
def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")

sjekk(min_funksjon(5), 10, "dobling fungerer")
sjekk(min_funksjon(-3), -6, "negativ input dobles korrekt")
```

Verifications:

```typescript
verifications: [
  { label: "Funksjonen dobler positive tall",
    check: { kind: "output-contains", needle: "OK   dobling fungerer" } },
  { label: "Funksjonen håndterer negative tall",
    check: { kind: "output-contains", needle: "OK   negativ input dobles korrekt" } },
],
```

**MERK:** Det er tre mellomrom mellom `OK` og test-navnet (`f"OK   {navn}"`). Hold formatet konsistent.

### Tilgjengelige verification-typer

```typescript
type VerifyCheck =
  | { kind: "output-contains"; needle: string }                              // for python-script
  | { kind: "response-contains"; requestIdx: number; needle: string }        // for flask-test-client
  | { kind: "response-status"; requestIdx: number; status: number };         // for flask-test-client
```

Trenger du noe annet (regex-match, structural assertions)? Utvid `VerifyCheck` i `types.ts` og oppdater `runner.ts`. Ikke gjør dette uten god grunn — `output-contains` med tydelige `OK <name>`-stringer dekker 95% av tilfellene.

## Runners

```typescript
// 1. Vanlig Python-script (pyodide), capture stdout
{ kind: "python-script", entry: "main.py" }

// 2. Flask-app via test-client (mysql.connector shimmet til SQLite)
{ kind: "flask-test-client",
  entry: "run.py",
  requests: [{ method: "GET", path: "/login/ola", followRedirects: true }]
}

// 3. HTML preview i iframe
{ kind: "html-preview", entry: "index.html" }
```

For Flask-kurs: `WTF_CSRF_ENABLED = False` i test-konfig så test-client kan POSTe uten å hente CSRF-token først.

## Pedagogiske retningslinjer

### Narrative — en typisk struktur

1. **Hva**: «Et CSP har tre deler: variabler, domener, constraints.»
2. **Hvorfor**: «Samme algoritme løser Sudoku, N-queens og kart-fargelegging — derfor er CSP en universal-formulering.»
3. **Hvordan i denne leksjonen**: «Vi modellerer constraints som `(var1, var2, fn)`-trippel.»
4. **Din oppgave**: konkret, én funksjon å implementere.

Hold leksjonen til ÉN ny idé. Hvis du har to ideer, lag to leksjoner.

### Filer

- Hold filene **selv-stående** — hver leksjon kan kjøres alene. Re-inkluder kode fra forrige leksjon som ferdig-utfylt så studenten kan stoppe og fortsette.
- Marker tydelig hvor studenten skal skrive: `# === DIN OPPGAVE ===` blokker.
- Test-koden går nederst i samme fil, etter studentens implementasjon.

### Hint

Skriv `hint` som komplett løsning (fasit). UI-en viser det bare hvis studenten ber om det. Gjør det utviklerselvfølgelig — hvis fasit-koden ikke ville lære studenten konseptet, omformuler leksjonen.

## Workflow

Hold deg til CLAUDE.md-regelen om worktrees:

```bash
cd /Users/isak/sql-practice-hub
git fetch origin
git worktree add ../sql-practice-hub-mini-kurs-<slug> -b feat/mini-kurs-<slug> origin/main

# Opprett agent-ledger
cat > /Users/isak/sql-practice-hub/.claude/agents/mini-kurs-<slug>.md <<EOF
# feat/mini-kurs-<slug>
...
EOF

cd ../sql-practice-hub-mini-kurs-<slug>
bun install
# Rediger src/lib/mini-kurs/courses.ts

# Verifiser at fila parser
bun -e "import('./src/lib/mini-kurs/courses.ts').then(m => console.log(m.MINI_COURSES.length))"

# Sanity-kjør hint-løsningen for minst den mest komplekse leksjonen
python3 -c "<kopiér hint-koden hit og verifiser>"

# Bygg
bun run build

# Commit, merge, push
git add src/lib/mini-kurs/courses.ts
git commit -m "feat(mini-kurs): <kursnavn> for <fag>

<6 leksjoner, kort beskrivelse>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"

cd /Users/isak/sql-practice-hub
git checkout main && git pull --ff-only origin main
git merge --no-ff feat/mini-kurs-<slug> -m "Merge feat/mini-kurs-<slug>: <kursnavn>"
git push origin main

# Rydd opp
git worktree remove /Users/isak/sql-practice-hub-mini-kurs-<slug>
git branch -d feat/mini-kurs-<slug>
rm /Users/isak/sql-practice-hub/.claude/agents/mini-kurs-<slug>.md
```

## Sjekkliste før du committer

- [ ] Hvert leksjon har `narrative` med «hvorfor», ikke bare «hva»
- [ ] Studenten skriver KODE i hver leksjon — ikke bare leser
- [ ] Verifications bruker `OK   <test-navn>`-mønsteret (tre mellomrom)
- [ ] Hint-løsningen faktisk får alle verifications til å passere (kjør den)
- [ ] `forutsetninger` og `rekkefolge` er satt riktig
- [ ] Første element i `fag` matcher en fag-kode (DTE-2501, DTE-2505, ...) for at indeksen skal gruppere riktig
- [ ] Build er grønn (`bun run build`)
- [ ] Agent-ledger-fila er oppdatert til `Status: klar-for-merge`

## Antimønstre å unngå

- **«Demo-kurs»** der studenten bare ser og leser uten å skrive kode. Da er det en visualisering, ikke et mini-kurs — bruk `stack`-systemet i stedet.
- **Multi-konsept-leksjoner.** Hvis en leksjon krever at studenten lærer to nye ting samtidig, splitt den.
- **Avhengighet av eksterne pakker** som ikke er pre-installert i Pyodide (numpy/sklearn/pandas FINNES; tensorflow/pytorch finnes IKKE).
- **For lange filer.** Hvis studenten må scrolle gjennom 200 linjer for å finne `=== DIN OPPGAVE ===`, omarbeid leksjonen.
- **Verifications som ikke skiller riktig fra galt.** Hvis stub-koden også får testen til å passere, omformuler — testen må feile på stuben og passere med fasiten.

## Eksisterende kurs som referanse

| Slug | Fag | Stil | Bra å studere fordi |
|---|---|---|---|
| `flask-fra-null` | DTE-2509 | Flask test-client | Enkel flask-test-client-bruk; verifications på status + response-contains |
| `utleieapp-fra-null` | DTE-2509 | Flask test-client, blueprints | Multi-fil-prosjekt, mysql.connector-shim, application factory |
| `bygg-mini-shell` | DTE-2505 | python-script | Klassisk «bygg det fra null»-mønster med 4 leksjoner |
| `tcp-state-machine` | DTE-2507 | python-script | Enkel modellering av en tilstandsmaskin via if-grener |
| `csp-sudoku` | DTE-2501 | python-script | Algoritmer + applikasjoner; samme solver løser tre problemer |
| `dns-resolver` | DTE-2507 | python-script, prereq-eksempel | `forutsetninger: ["tcp-state-machine"]` — godt prereq-eksempel |
| `prosess-scheduler` | DTE-2505 | python-script | Sammenligning av algoritmer på samme workload |

Når du er i tvil, kopier strukturen fra det kurset som ligner mest.
