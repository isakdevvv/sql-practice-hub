# Plattform-audit — DTE-bachelor lærings-platform

**Dato:** 2026-05-16
**Metode:** Egen shell-survey + 3 parallelle audit-agenter (fag-dekning, pedagogikk, IA/discovery).

---

## TL;DR — øverste 10 prioriteringer

| # | Tiltak | Type | Hvorfor | Estimat |
|---|--------|------|---------|---------|
| 1 | **Mobil-meny i header** | IA-fix | 4 hovedhubs forsvinner helt på mobil (`hidden md:flex`) | 1-2 t |
| 2 | **Vis Spor + Mini-kurs på forsiden** | IA-fix | Bygd mye, oppdages av ingen | 1-2 t |
| 3 | **Utvid FSRS til drag/JOIN/SQL** | Pedagogisk | Allerede generisk i `fsrs.ts`. Største løft per investert tid. | 1-2 d |
| 4 | **DTE-2505 fagdekning** | Innhold | Filsystem + virtualisering + IPC mangler helt (6/10 i fagaudit) | 4-6 t |
| 5 | **"Predict & Trace"-modus** | Pedagogisk | Bloom Analyze er 3/10 — fyller hullet med eksisterende runners | 3-5 d |
| 6 | **Løsnings-sammenligning etter solve** | Pedagogisk | Bloom Evaluate er 1/10. Krever bare `solutions[]` på Problem-typen | 2-3 d |
| 7 | **Slå sammen `/eksamen` og `/exam`** | IA-fix | Duplikat-CTA på forsiden, bruker gjetter | 30 min |
| 8 | **Cross-link `/python` ↔ `/python_/kap`** | IA-fix | To Python-univers, null link | 30 min |
| 9 | **Onboarding: 3-veis "start her"-velger** | IA-fix | 40+ valg uten hierarki for ny bruker | 3-5 t |
| 10 | **Filtypen `tek1-` kategori i sidebar** | Mindre fix | TEK-1501 sider er ikke gruppert under egen kategori i `/lar` | 1-2 t |

---

## 1. Tall-oversikt

| Innholdstype | Antall |
|--------------|--------|
| Stack-sider | **191** |
| Python-oppgaver | **266** (14 filer) |
| SQL-problemer | **320** |
| Drag-oppgaver | **1375** |
| Flashcards | **648** |
| Læringsspor (`/spor`) | **5** |
| Mini-kurs (`/mini-kurs`) | **1** |
| Routes totalt | **40** |
| Routes synlige fra header | **4** (Lær/Øv/Eksamen/Du) |

**Observasjon:** Massiv innholdsmasse (~2800 lærings-objekter) men kun 4 navigasjonspunkter på toppnivå. Problemet er IKKE for lite innhold — problemet er at brukeren ikke finner det.

---

## 2. Fag-dekning HØST 2026 (5 fag)

### Ranking (best → dårligst)

| Plass | Fag | Score | Stack-sider | Python-oppg | Interaktive komp | Hovedmangel |
|-------|-----|-------|-------------|-------------|------------------|-------------|
| 🥇 | **DTE-2507** Datakomm | **10/10** | 33 | 20 | 30 | (kun småting: IPv6, samlet exam-prep-side) |
| 🥈 | **DTE-2501** AI Methods | **9/10** | 14 | 29 | 4 | Live-plot for k-Means/PCA, GA-evolusjons-sim |
| 🥈 | **TEK-1501** Statistikk | **9/10** | 14 | 24 | 0 dedikerte | Distribusjons-plotter, p-verdi-kalkulator, dedikert χ²-side |
| 4 | **DTE-2602** ML intro | **8/10** | 14 | 45 | 13 | **Lineær regr. mangler egen side**, ingen feature-eng-side, ingen interaktiv ROC |
| 🔴 | **DTE-2505** OS | **6/10** | 10 | 17 | 9 | **Filsystem mangler helt** · virtualisering · IPC-drill · ingen drag-quiz |

**Kritisk:** DTE-2505 har det eneste reelle pensum-hullet, ikke bare et formidlings-hull.

### DTE-2505 — anbefalte tillegg (mål: 8/10)

1. Stack-side: **Filsystem og inodes** (ext4, FAT, journaling)
2. Stack-side: **Virtualisering vs containere** (KVM, Docker, hva er forskjell)
3. Stack-side: **IPC i dybden** (pipes, shared memory, semaforer som dedikert side, ikke samlet i konkurrens)
4. Drag-oppgaver for DTE-2505 (0 i dag — kun stack + Python)
5. Mini-kurs: "Bygg en mini-shell" eller "Lag en page-table-simulator"

---

## 3. IA og discovery — strukturelle problemer

### Problem A: Tre konsept-systemer uten taksonomi

Vi har bygd FIRE separate "kurs"-konsepter uten å forklare forskjellen til brukeren:

| Konsept | Hva det er | Hvor synlig |
|---------|-----------|-------------|
| `/kurs` | 6 SQL-nivåer (legacy) | Linket fra `/lar` |
| `/stack/$slug` | Per-fag-hub med teori | I header (Lær) + index |
| `/spor/$slug` | Cross-fag-stier | **Bare via søk** |
| `/mini-kurs/$slug` | Pyodide-sandkasse med leksjoner | **Bare via søk** |

**Fix:** Enten konsolidér konseptene (én taksonomi: `/kurs/<slug>` med metadata for type), eller gi hvert konsept en navngitt hub med klar forskjellsforklaring.

### Problem B: "Skjulte" routes (kun via søk eller dypt nede)

- `/spor`, `/spor/$slug` — **bygd 5 spor, oppdages av null**
- `/mini-kurs`, `/mini-kurs/$slug` — **bygd Flask-fra-null-kurs, oppdages av null**
- `/viz-lesjon`, `/viz-lesjon/$slug` — kun selv-referanse
- `/konsoll` (API-tester) — kun via søk
- `/python_/kap`, `/python_/kap/$nr`, `/python_/visualizer` — kun via `/lar`-card, IKKE fra `/python`
- `/joins`, `/er-tegner` — kun via `/ov`-hub
- `/dte2505/shell-drill`, `/dte2507/pcap` — kun fra respektiv stack-side

### Problem C: Mobil-navigasjon forsvinner helt

`SiteHeader.tsx:31`: `nav` er `hidden md:flex`. Ingen hamburger-meny. På telefon ser bruker kun logo + søk + theme/profile. **De fire hubs er borte**.

### Problem D: Duplikat-CTA på forsiden

`/eksamen` (DTE-2509-spesifikk) og `/exam` (generell) ligger begge i VERKTOY-grid — samme ord, ulike sider. Bruker gjetter random.

### Problem E: To Python-univers uten cross-link

- `/python` = Pyodide-oppgaver (266 stk)
- `/python_/kap` = 15 kapittel-forklaringer

Null link mellom dem. Student som lander på én vet ikke om den andre.

### Problem F: To søke-implementasjoner

`index.tsx:360-374` søker bare PROBLEMS+SEKTORER+topics. `SiteHeader.GlobalSearch` bruker `lib/search/index.ts` som inkluderer Stack/Huskelapp/Python. **Bruker får ulike resultater på samme query** avhengig av hvilken boks de bruker.

---

## 4. Pedagogiske blindspoter

### Bloom's-dekning — score per nivå

| Nivå | Score | Hva som finnes | Hva mangler |
|------|-------|----------------|-------------|
| **Remember** | 9/10 | 648 flashcards, FSRS-4.5 scheduler | — |
| **Understand** | 9/10 | 191 stack-sider med forklaringer | — |
| **Apply** | 9/10 | 266 Python-oppg, 320 SQL, Pyodide+SQL.js i nettleseren | — |
| **Analyze** | **3/10** | Bare ad-hoc i Big-O og subqueries | "Predict & Trace"-modus mangler globalt |
| **Evaluate** | **1/10** | (praktisk talt fraværende) | Sammenlign-løsninger-modus, kritikk-oppgaver |
| **Create** | 5/10 | Mini-kurs (1) + `/prosjekt` finnes | Få guidede prosjekter, ingen rubrikk-basert vurdering |

**Kritisk hull:** Vi trener Apply massivt, men nesten ingen ting på Analyze og Evaluate — som er det som skiller "kan syntaks" fra "skjønner systemet".

### Andre pedagogiske blindspoter

1. **FSRS brukes KUN på flashcards.** `fsrs.ts` er allerede generisk over `id: string`, men drag-oppgaver, JOIN-oppgaver og SQL-problems har null due-date scheduling. Bruker kan glemme komplette emner uten at systemet tilbyr re-test.
2. **Tilbakemelding er binær.** `recordAttempt` har bare `correct: boolean`. Ingen "du brukte LEFT JOIN der INNER hadde holdt", ingen common-mistake-deteksjon. Hint-systemet er statisk tekst, ikke responsivt på faktisk feil.
3. **Hint-bruk straffes ikke pedagogisk.** Bruker får full XP selv om de slo opp svaret. Ingen oppfordring til å prøve uten hint først.
4. **Ingen metakognitiv refleksjon.** Ingen confidence-rating før løsning, ingen "vurder ditt eget svar før fasit", ingen journal-felt.
5. **Fragmentert progresjon.** 4+ separate localStorage-nøkler (`sql-practice-cards-v1`, `fsrs.cards.v1`, `dragProgress`, `joinProgress`, `sql-practice-progress-v1`). Ingen samlet "hva har jeg lært på tvers av emner"-dashboard.
6. **Null sosial læring.** Ingen diskusjoner, ingen "forklar dette til en venn"-oppgaver, ingen sammenligning mot andre studenter. (For et eksamens-verktøy er dette akseptabelt; for langsiktig læring er det en mangel.)

---

## 5. Hva platformen gjør GODT (la oss ikke miste perspektivet)

- **Bredde i interaktive sandkasser:** ~82% av stack-komponenter er ekte simulatorer/kalkulatorer (rwx-kalkulator, scheduling-drill, subnet-kalkulator, RDT-FSM, gradient-descent-surface, AES-block-modes…)
- **Ekte FSRS-4.5 spaced repetition** (industri-standard, ikke leksa-inspirert) på flashcards
- **Pyodide + SQL.js i nettleseren** — null server-roundtrip, høy forsøksfrekvens
- **XP/streak/achievements + import/export-progresjon** mellom enheter
- **DTE-2507 er eksepsjonelt godt dekket** — 33 stack-sider, 30 interaktive verktøy, full Kurose-Ross-integrering
- **Komplett bok/YouTube/MOOC-bibliotek** med 20 bøker, 12 kanaler, 10 kurs — alle med inline-embed

---

## 6. 4-fase fix-plan (basert på prioriteringene)

### Fase A: Quick wins (1-2 dager total) — IA & discovery
1. Mobil-hamburger-meny i SiteHeader
2. Legg Spor + Mini-kurs i header `HUBS`
3. Vis Spor + Mini-kurs som dedikerte kort på forsiden
4. Cross-link `/python` ↔ `/python_/kap`
5. Slå sammen `/eksamen` og `/exam`
6. Konsolidér de to søke-implementasjonene

### Fase B: DTE-2505 plug-the-hole (4-6 timer)
- 3 nye stack-sider: filsystem, virtualisering, IPC i dybden
- Drag-oppgaver for DTE-2505 (mål: 30+ kort)
- Eventuelt mini-kurs: "Bygg en mini-shell" som capstone

### Fase C: Pedagogisk modnings-løft (1-2 uker)
1. **Generisk FSRS-wrapper** for alle oppgavetyper (drag, JOIN, SQL-problem)
2. **"Predict & Trace"-modus** ny route `/predict` — vis kode + datasett, bruker forutsier output før kjøring
3. **Løsnings-sammenligning** etter SQL-solve med kuratert `solutions: Solution[]`
4. Confidence-rating før løsning (metakognitiv)

### Fase D: Mindre interaktive komplement (sprintvis)
- Distribusjons-plotter for TEK-1501 (Normal/binomial/t)
- p-verdi-kalkulator
- Live k-Means/PCA-plotter for DTE-2501
- Interaktiv ROC-curve-plotter for DTE-2602
- Lineær regresjon-side med eget interaktivt regresjons-verktøy for DTE-2602
- Feature-engineering-side for DTE-2602

---

## 7. Hva som IKKE er problemer (men man kunne tro)

- **Mengden innhold er ikke problemet.** Vi har mye, og kvaliteten er gjennomgående høy.
- **Pyodide/SQL.js-runtime fungerer godt.** Performance og DX er solid.
- **Spaced repetition er teknisk sett ekstraordinær** — bare for fragmentert i bruk.
- **DTE-2507 og DTE-2501 trenger ikke mer innhold.** Allerede mer enn nok.
- **Stack-sider er pedagogisk sterke.** Komplette forklaringer + mange interaktive komponenter.

Hovedproblemet er altså **distribusjon, oppdagelse og tre kognitive nivåer (Analyze/Evaluate/Create)** — ikke at vi mangler stoff.
