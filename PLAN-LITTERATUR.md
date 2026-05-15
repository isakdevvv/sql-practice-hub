# Plan: Litteratur- og kunnskapskilder for DTE-bachelor

Status etter bølge 1+2: 15 bøker live på `/stack/programmeringsboker`.
Denne planen dekker fire utvidelser:

1. **Bølge 3** — 5 nye bøker som fyller kjente hull (web-perf, devops, klassisk
   ML-teori, RL, dypt Python)
2. **YouTube-kanaler** — egen side med 12+ kuraterte kanaler, parret med
   eksisterende stack-emner
3. **MOOCs / online kurs** — gratis universitetskurs (Stanford/MIT/CMU)
   knyttet til hvert DTE-fag
4. **Konferanse-foredrag** — 1-times-foredrag som matcher pensum-emner

---

## Topp-prioritet (gjør først)

| # | Tillegg | Hvorfor først | Estimert arbeid |
|---|---------|---------------|-----------------|
| 1 | YouTube-kanaler-siden | Mest nyttig per time arbeid — bruker har allerede kjørt flere av disse | ~2 timer |
| 2 | Bølge 3-bøker | Naturlig forlengelse av eksisterende bok-side | ~3 timer |
| 3 | MOOCs-siden | Komplement når bok ikke holder alene | ~2-3 timer |
| 4 | Konferanse-foredrag-side | "Avansert" — gjør sist, eller skip | ~2 timer |

---

## 1. Bølge 3 — 5 nye bøker

Disse fyller hull bølge 1+2 ikke dekket. Alle 5 er hvorfor-vant fremfor
alternativer.

### A. High Performance Browser Networking (Grigorik) — gratis
- **URL:** https://hpbn.co/
- **Forfatter:** Ilya Grigorik (Google performance team-leder)
- **Tier:** 2
- **Fag:** DTE-2507 (web-perf-perspektiv), DTE-2509 (HTTP/2/3-detaljer),
  React/web-prosjekter
- **Beste konsepter:**
  - TCP/TLS-handshake-oversikt fra HTTP-perspektiv (komplement til Kurose)
  - HTTP/2 multiplexing og server push i detalj
  - QUIC og HTTP/3 — eneste boka med dyp dekning
  - WebRTC, WebSocket, Server-Sent Events sammenlignet
- **Hvorfor ikke alternativ:** Kurose dekker protokollene generelt; Grigorik
  går spesifikt på *web*-stacken og 2020-talls realitet.

### B. Site Reliability Engineering (Google) — gratis
- **URL:** https://sre.google/sre-book/table-of-contents/
- **Forfatter:** Google SRE-team (Beyer, Jones, Petoff, Murphy)
- **Tier:** 2
- **Fag:** DTE-2511, DTE-2604, bachelor-prosjekt om har devops-aspekt
- **Beste konsepter:**
  - SLI / SLO / SLA — terminologi som brukes overalt i industri
  - Error budgets — hvordan balansere stabilitet vs feature-velocity
  - Postmortem-kultur ("blameless") — psykologisk trygghet ved feil
  - Toil og automatisering — hva er verdt å automatisere?
- **Hvorfor ikke alternativ:** Pragmatic Programmer er individuell,
  Phoenix Project er roman. SRE-boka er det eneste teknisk-rigide som beskriver
  hvordan moderne firma faktisk drifter systemer.

### C. Deep Learning (Goodfellow, Bengio, Courville) — gratis
- **URL:** https://www.deeplearningbook.org/
- **Forfatter:** Ian Goodfellow + Bengio + Courville
- **Tier:** 2
- **Fag:** DTE-2502 (etter Nielsen)
- **Beste konsepter:**
  - Del 1: matematisk fundament (lineær algebra, sannsynlighet, info-teori)
  - Del 2: feedforward, regularisering, optimalisering, CNN, RNN
  - Del 3: research-frontier per 2016 (litt utdatert, men prinsippene står)
- **Hvorfor ikke alternativ:** Nielsen NNDL gir intuisjon. Goodfellow gir
  matematisk dybde. Begge er bibler — Nielsen først, Goodfellow når du
  trenger grunnlaget for masteroppgave eller forskning.

### D. Reinforcement Learning: An Introduction (Sutton & Barto) — gratis
- **URL:** http://incompleteideas.net/book/the-book-2nd.html
- **Forfatter:** Richard Sutton & Andrew Barto (RL-pionerene)
- **Tier:** 2
- **Fag:** DTE-2501 (RL-delen), enhver RL-prosjekt
- **Beste konsepter:**
  - Bellman-ligningen og dynamisk programmering bygd opp fra null
  - Policy iteration vs value iteration — endelig forklart klart
  - Q-learning, SARSA, actor-critic — alle med pseudokode
  - Multi-armed bandits som introduksjon til exploration vs exploitation
- **Hvorfor ikke alternativ:** AIMA dekker RL i ett kapittel. Sutton & Barto
  er hele boka, og forfatterne *fant opp* mange algoritmer.

### E. Fluent Python (Luciano Ramalho) — andre utgave 2022
- **URL:** https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/
- **Forfatter:** Luciano Ramalho
- **Tier:** 3 (kun hvis du ofte skriver Python)
- **Fag:** DTE-2501/2602/2502/2509 — hvor Python er hovedspråk
- **Beste konsepter:**
  - Data model — `__dunder__`-metoder forklart fra grunnen
  - Generators og iterators — hvorfor `yield` er kraftig
  - Decorators-kapittelet er beste forklaring som finnes
  - asyncio og concurrency — pre-3.12-greia, men prinsippene står
- **Hvorfor ikke alternativ:** Géron lærer ML-Python, Fluent Python lærer
  Python *qua* Python. Ingen overlapp.

### Implementering: utvid `books.ts` fra 15 → 20

```ts
// Legg til 5 nye Book-objekter i BOOKS-arrayet
// Oppdater LESEORDEN_FOR_BACHELOR med 5 nye stop-points
// Oppdater Page-tittel: "20 bøker en data-ingeniør faktisk trenger"
// Oppdater fag-tabellen med 2-3 nye rader (web-perf, SRE, RL)
```

---

## 2. YouTube-kanaler-side

**Slug:** `/stack/youtube-kanaler`
**Tittel:** "12 YouTube-kanaler som faktisk lærer deg noe"

### Datamodell

```ts
interface Channel {
  id: string;
  navn: string;
  forfatter: string;        // hvem driver kanalen
  url: string;
  blurb: string;             // én setning
  bestVideo: { tittel: string; url: string; varighet: string };
  fag: string[];             // DTE-XXXX
  tier: 1 | 2 | 3;
  hvorforHer: string;        // hvorfor akkurat denne fremfor 1000 andre
}
```

### De 12 kanalene (utkast)

**Tier 1 — må kjenne til:**

1. **3Blue1Brown** (Grant Sanderson)
   - Beste video: "But what is a neural network?" (~19 min)
   - Fag: TEK-1501 (matte), DTE-2502 (deep learning), DTE-2602 (ML)
   - Hvorfor: De beste matematiske animasjonene som finnes på nett.

2. **Computerphile**
   - Beste video: "Public Key Cryptography" med Mike Pound (~7 min)
   - Fag: alle CS-emner
   - Hvorfor: Kort, presist, av faktiske akademikere fra Nottingham.

3. **Two Minute Papers** (Károly Zsolnai-Fehér)
   - Beste video: "What a difference a few weeks make!" (NeRF/grafikk)
   - Fag: DTE-2501, DTE-2502
   - Hvorfor: Holder deg oppdatert på AI-frontier uten doom-scrolling.

4. **Sebastian Lague**
   - Beste video: "Coding Adventure: Solar System" (~25 min)
   - Fag: programmering-prosjekter generelt
   - Hvorfor: Visuelle prosjekter som lærer simulering, grafikk, AI.

**Tier 2 — sterkt anbefalt:**

5. **Ben Eater** — bygger 8-bit datamaskin på breadboard (parallelt med Petzold)
6. **NeetCode** — algoritmeintervjuer med klare forklaringer
7. **Andrej Karpathy** — bygger nevrale nett fra null i Jupyter
8. **The Coding Train** (Daniel Shiffman) — kreativ koding, P5.js, ML-intro
9. **CS Dojo / Fireship** — moderne web og system-tutorials

**Tier 3 — situasjonelt:**

10. **MIT OpenCourseWare** — fulle forelesninger
11. **Stanford Online** — fulle forelesninger
12. **Strange Loop / GOTO** konferanse-foredrag

### Implementering

- Ny fil: `src/components/stack/youtube-kanaler/channels.ts`
- Ny fil: `src/components/stack/youtube-kanaler/YouTubeKanalerPage.tsx`
- Hvert kort: kanal-logo (emoji eller hentet ikon), beste-video-embed, fag-tags
- Registrér i `src/lib/stack/content/index.ts` + `curriculum.ts` (i web-blokken)
- **Estimert kode:** ~400-600 LOC

---

## 3. MOOCs / online universitetskurs

**Slug:** `/stack/mooc-bibliotek`
**Tittel:** "Gratis universitetskurs som matcher DTE-pensumet"

### Datamodell

```ts
interface MOOC {
  id: string;
  navn: string;
  universitet: string;
  forelesere: string[];
  url: string;
  estimertTid: string;
  fag: string[];             // DTE-XXXX
  bestForlesninger: string[]; // top 3 forelesninger med tidsstempler
  hvorforHer: string;
}
```

### De 8-10 MOOCsene (utkast)

| # | Kurs | Universitet | Matcher fag |
|---|------|-------------|-------------|
| 1 | **CS50** (Computer Science) | Harvard | trinn-fagene + DTE-2511 |
| 2 | **MIT 6.006 Algorithms** | MIT | DTE-2511, algoritmer |
| 3 | **MIT 6.S081 OS** | MIT | DTE-2505 |
| 4 | **Stanford CS144 Networking** | Stanford | DTE-2507 |
| 5 | **Stanford CS229 Machine Learning** (Andrew Ng) | Stanford | DTE-2602, DTE-2501 |
| 6 | **Stanford CS231n Deep Learning** | Stanford | DTE-2502 |
| 7 | **CMU 15-445 Database Systems** | CMU | DTE-2509 |
| 8 | **Berkeley CS61A** (SICP-stil) | Berkeley | DTE-2511 |
| 9 | **MIT 6.S191 Deep Learning** | MIT | DTE-2502 (kortere enn CS231n) |
| 10 | **CS50 Web Programming with Python and JS** | Harvard | DTE-2509 |

### Implementering
- Samme mønster som YouTube-siden
- ~400-500 LOC

---

## 4. Konferanse-foredrag-side (valgfri, lavere prioritet)

**Slug:** `/stack/foredrag-bibliotek`
**Tittel:** "Konferanse-foredrag som forandrer hvordan du tenker"

### Eksempel-foredrag (8-10)

| Foredrag | Foredragsholder | Konferanse | Hvorfor |
|----------|-----------------|------------|---------|
| Are We Really Engineers? | Hillel Wayne | StrangeLoop 2018 | Eksistensielt om hva ingeniør betyr |
| Wat | Gary Bernhardt | CodeMash 2012 | 4-min standup om JavaScript-spektakler |
| Simple Made Easy | Rich Hickey | StrangeLoop 2011 | Klassiker om "simple ≠ easy" |
| The Mess We're In | Joe Armstrong | StrangeLoop 2014 | Erlangs far reflekterer over softwarens rot |
| Inventing on Principle | Bret Victor | CUSEC 2012 | Direkte manipulasjon, fremtidsvisjon |
| Stop Writing Classes | Jack Diederich | PyCon 2012 | Når trenger du IKKE en klasse? |

Disse er evergreen — 10+ år gamle og fortsatt relevante.

---

## Foreslått implementeringsrekkefølge

### Fase 1 — Hurtig start (denne uka)
- Bølge 3 bøker (5 nye) i `books.ts` — rent dataarbeid, ~3 timer
- YouTube-kanaler-siden — ny komponent, ~3 timer

Etter fase 1 har platformen 20 bøker + 12 YouTube-kanaler tilgjengelig.

### Fase 2 — Komplettering (neste uke)
- MOOCs-siden — ny komponent, ~3 timer
- Linker fra eksisterende stack-sider til relevant MOOC og YouTube-kanal
  (f.eks. fra `dte2507-day-in-the-life` til Stanford CS144 forelesning 1-3)

### Fase 3 — Frivillig
- Konferanse-foredrag-side hvis fase 1+2 brukes aktivt
- Podcasts (CoRecursive, Software Engineering Daily, Lex Fridman)
- Newsletters (Bytes, JavaScript Weekly, Python Weekly)

---

## Estimat

- **Fase 1:** ~6 timer for 1 person, ~1500 LOC ny kode + ~200 LOC oppdateringer
- **Fase 2:** ~3-5 timer, ~600 LOC
- **Fase 3:** ~3-4 timer hvis valgt

Total ny kode: ~2000-2500 LOC fordelt over 4-6 nye filer + 2-3 oppdaterte.

---

## Hva som ikke er med

Bevisst utelatt fordi det enten dekkes andre steder eller er for sjeldent:

- **Bøker om soft skills** (Mythical Man-Month, Peopleware, Soul of a New Machine)
  — interessante men ikke pensum-relatert
- **Algoritme-intervju-bøker** (Cracking the Coding Interview, Elements of
  Programming Interviews) — kun relevant rett før jobbsøk
- **AWS/Azure/GCP-bøker** — for raskt utdaterte; lær via cloud-providers
  egen dokumentasjon
- **Twitter/X-følgere** — kvalitet for variabel og kanalen kjent for å
  tappe konsentrasjon
