# Planer høst 2026 — atom-dekomposisjon per fag

Generert 2026-05-15 av 5 parallelle Plan-agenter (én per fag, read-only).
Hver plan dekomponerer pensum i pedagogiske *atomer* — minste irreduserbare konsepter,
i avhengighets-ordnet rekkefølge, med status mot eksisterende repo-innhold.

## Filer

- [plan-dte-2505.md](plan-dte-2505.md) — Operativsystemer (5 stp, eksamen 02.12.2026) — ~38 atomer
- [plan-dte-2507.md](plan-dte-2507.md) — Datakommunikasjon og sikkerhet (10 stp, eksamen 30.11.2026) — ~60 atomer
- [plan-dte-2501.md](plan-dte-2501.md) — AI Methods and Applications (10 stp, hjemme + mappe) — ~90 atomer
- [plan-dte-2602.md](plan-dte-2602.md) — Intro ML og AI (10 stp, eksamen 09.12.2026 + mappe 16.12) — 53 atomer
- [plan-tek-1501.md](plan-tek-1501.md) — Sannsynlighet og statistikk for ingeniører (5 stp, eksamen 14.12.2026) — ~45 atomer

## Format per atom

```
**ID — Konseptnavn (kort, norsk)**
- Hva er det egentlig? (én setning — det irreduserbare)
- Forutsetter: (andre atomer som må komme før)
- Demo-idé: (interaktiv — det studenten manipulerer FØR regelen formuleres)
- Drill-idé: (flashcard eller problem som tvinger gjenkalling)
- Status: dekket / delvis / mangler (med filsti)
```

## Hva neste fase ser ut som

Disse planene er **input til demo-bygger- og drill-bygger-agentene**. Per atom, per fag:

1. **Atom merket `mangler`** → demo-bygger lager interaktiv komponent + drill-bygger lager kort/problem.
2. **Atom merket `delvis`** → drill-bygger lager retrieval-øvelser (komponenten finnes).
3. **Atom merket `dekket`** → ingen ny kode; brukes i atom-spor-UI eller progresjons-sjekk.

Hver fase kjøres i egen worktree per fag, med streng fil-eierskap:
- Demo-bygger eier `src/components/<fag>/<atom>.tsx`.
- Drill-bygger eier `src/lib/<fag>/flashcards.ts`, `drag.ts`, `problems.ts` (separate filer per fag).
- Aldri to agenter på samme fil samtidig.
