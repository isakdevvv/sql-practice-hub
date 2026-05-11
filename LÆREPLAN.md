# Læreplan — første-prinsipper for dataingeniør

Plan for å gjøre denne plattformen til et komplett verktøy for
dataingeniør-studenter, basert på hvordan MIT 6.*, Stanford CS, CMU 15.* og
ETH bygger opp en CS-bachelor fra hardware til software.

## Filosofi: første prinsipper

Hver fase svarer på ett konkret spørsmål. Vi tar aldri i bruk en abstraksjon vi
ikke først har åpnet opp minst én gang.

## 17 faser

| # | Fase | Hvorfor her | Universitets-analog |
|---|------|-------------|---------------------|
| 0 | **Math foundations** (diskret, prob/stat, lin.alg) | Prerekvisitt for ML og algoritmer | MIT 6.042 · Stanford CS 109 · CMU 15-251 |
| 1 | **Hardware** (transistor → CPU → assembly → C) | Bygg datamaskinen før du programmerer den | MIT 6.004 · CMU 15-213 |
| 2 | **Algoritmer & datastrukturer** (Big-O, sortering, trær, grafer, DP) | Språket alt annet bruker | MIT 6.006 · Stanford CS 161 |
| 2.5 | **Funksjonell programmering + typesystemer** | Modent programmerings-tankesett | CMU 15-150 · ETH FP |
| 3 | **Operativsystemer** | Første abstraksjon over hardware | MIT 6.S081 · CMU 15-410 |
| 4 | **Datakommunikasjon & sikkerhet** | OS for flere maskiner | MIT 6.829 · CMU 15-441 |
| 5 | **Databaser** (modell, SQL, ACID, indekser) | Persistent state — varigste abstraksjon i CS | MIT 6.830 · CMU 15-445 |
| 6 | **Web** (HTTP, full-stack, moderne JS/TS/React) | Der alt møtes | Stanford CS 142 |
| 7 | **Klassisk AI** (søk, CSP, logikk, Bayes) | R&N-grunnlag | MIT 6.034 |
| 8 | **Maskinlæring** | Funksjonstilnærming fra data | MIT 6.036 · Stanford CS 229 |
| 9 | **Deep learning** | Backprop, CNN, optimering | Stanford CS 231N |
| 10 | **Systemutvikling** | Smidig, Scrum, brukerhistorier, UML | MIT 6.170 |
| 11 | **API-prosjekt produksjon** | Arkitektur, testing, CI/CD | Industri |
| 11.5 | **DevOps & verktøy** (git-dyp, Docker, Linux-CLI) | Det som faktisk får kode i drift | Industri |
| 12 | **Spesialisering: Mobil/Kotlin** | Spor | Stanford CS 193A |
| 13 | **Spesialisering: Enterprise/.NET** | Spor | Microsoft-stack |
| 14 | **Eksamens-drill** | Spaced repetition på tvers av faser | — |

## Audit av nåværende dekning (12.5.2026)

- 645 drag-oppgaver, ~80 stack-trinn, ~70 ready
- **Sterk:** Phase 2-13 (mainstream pensum)
- **Hull:** Phase 0 (math) mangler helt · Phase 1 (hardware) er stubs ·
  Algoritmer dypere (trær/grafer/hashing/DP) mangler egne kurssider · DB
  avansert (transaksjoner/indekser/query-planner) tynt · Moderne web (JS/TS/
  React) mangler · Funksjonell prog mangler · DevOps overflatisk

## 8 agenter parallelt — målsetning ~300 nye oppgaver, ~25 nye sider

| Agent | Fase | Leveranse |
|-------|------|-----------|
| A | 1: Hardware | Fullføre trinn-1→10 fra stub til ready + ~50 oppgaver (transistor, NAND, CPU, assembly, C, bytes, syscalls) |
| B | 0: Math foundations | 3 nye kurssider (diskret matte, sannsynlighet+statistikk, linær algebra) + ~40 oppgaver |
| C | 2: Algoritmer dypere | 4 nye sider (trær, grafer, hashing, DP) + ~40 oppgaver |
| D | 5: DB-avansert | 3 nye sider (transaksjoner, indekser, query-optimisering) + ~30 oppgaver |
| E | 2.5: Funksjonell + typer | 2 nye sider (funksjonell prog, typesystemer) + ~25 oppgaver |
| F | 6: Moderne web | 4 nye sider (JavaScript, TypeScript, React, moderne CSS) + ~40 oppgaver |
| G | 11.5: DevOps & verktøy | 3 nye sider (git-dyp, Docker, Linux-CLI advanced) + ~30 oppgaver |
| H | 14: Eksamens-drill | Cross-phase drill-oppgaver + ~40 oppgaver |

## Etter agentene

1. Oppdater `curriculum.ts` med nye slugs/faser (0, 2.5, 11.5)
2. Bygg `/stack/laereplan` som visuell oversikt
3. Verifiser: hver fase har ≥30 oppgaver
4. Browser-test, merge til main

## Forventet sluttresultat

- ~950 drag-oppgaver (opp fra 645)
- ~105 stack-sider (opp fra 80)
- 17 faser dekket, transistor → deploy
- Sammenliknbar med MIT/Stanford/CMU-bachelor
- Med Pyodide + sql.js: hele løypa i nettleseren

— sparet 2026-05-12
