---
name: chapter-author
description: Bygg eller utvid lærings-kapitler i SQL Sandbox-appen i samme stil som de eksisterende `pythonChapters.tsx`-oppføringene. Bruk når en agent skal legge til et nytt kapittel, utvide et eksisterende kapittel, eller speile pensum fra en lærebok som DTE-2511/Liang. Trigger på "legg til kapittel", "skriv kap X", "lag side om <CS-tema>", "speil pensum", o.l.
---

# Chapter-author — mal for å bygge læringskapitler

Appen har et veletablert mønster for kapittelsider: én entry per kapittel i `src/lib/learn/pythonChapters.tsx`, originale SVG-figurer i `src/components/learn/python-figures/PythonFigures.tsx`, og originale drag-/quiz-oppgaver i `src/lib/learn/dragExercises.ts`. Denne skillen beskriver hvordan agenter holder seg konsistent med det mønsteret.

## Hard regel: kun originalt innhold

Lærebøker, kurs-slides og lignende pensumkilder er opphavsrettsbeskyttet. Når et kapittel skal "speile" Liang eller en annen bok:

- **Ikke kopier** prosa, kodelistinger, figurer eller øvingsoppgaver — heller ikke med småjusteringer.
- **Bruk lærebokens valg av tema og rekkefølge** som veiledning (Hashing før Grafer før Vektede grafer er en pedagogisk skala, ikke en proprietær oppskrift).
- **Skriv all forklaring i egne ord**, med egne eksempler. Liang bruker Königsberg/Seattle-byer; bruk *andre* konkrete eksempler (T-bane-stasjoner, kabelkost mellom rom, sosial-graf, …).
- **Skriv egne quiz-spørsmål** med egne tall og egne grafer — ikke gjenoppfør oppgavene fra boka.
- Det er greit å referere ("se Liang kap. 22.7 for utvidet eksempel") som peker; ikke som erstatning for innhold.

Filheaderen i `PythonFigures.tsx` slår dette eksplisitt fast — videreført det stempel.

## Filer å røre

| Fil | Hva legges til |
|---|---|
| `src/lib/learn/pythonChapters.tsx` | Én ny `PythonChapter`-entry i `PYTHON_CHAPTERS`-arrayet |
| `src/components/learn/python-figures/PythonFigures.tsx` | Én eller flere navngitte `FC`-eksporter med inline SVG |
| `src/lib/learn/dragExercises.ts` | 3–8 drag/quiz/order/match-oppgaver med `topic: "Python kap. N"` |

Topic-strengen `"Python kap. N"` er det som binder kapittelet til oppgavene. Hold den eksakt — alle drag-oppgaver for kapittelet bruker samme streng.

## Mal for en kapittel-entry

```tsx
{
  nr: 27,                                    // neste ledige nummer
  topic: "Python kap. 27",                   // bindeleddet til drag-oppgaver
  title: "Korte navn på temaet",
  summary: "Én linje — vises på indeks-siden.",
  readMinutes: 10,                           // grovt estimat
  body: (
    <>
      <P>Innledning: hva er problemet, hvorfor bryr vi oss?</P>
      <H2>Første konsept</H2>
      <P>Forklaring …</P>
      <F.NavnPåFigur />                      // import * as F i toppen av filen
      <Code>{`# eksempelkode\ndef foo(): ...`}</Code>
      <H2>Neste konsept</H2>
      …
      <KeyPoints
        items={[
          "Punkt 1 — kort, presist.",
          "Punkt 2 …",
          "5–7 punkter passer; mer enn 10 mister lesren.",
        ]}
      />
    </>
  ),
},
```

Bygge-blokkene `P`, `H2`, `Code`, `KeyPoints` er definert øverst i filen. Ikke lag nye — bruk dem som de er for å beholde visuell konsistens.

## Figur-konvensjoner

- Inline SVG med `viewBox` typisk `0 0 360 H` (`H` er 130–240, juster etter høyden trengt).
- `stroke={STROKE}` (currentColor) for streker — figurene følger temabryteren.
- Fyll: bruk `color-mix(in oklch, var(--brand) 22%, transparent)` o.l. for nodebokser. Eksisterende figurer er fasiten for fargevalg (`--brand`, `--success`, `--warning`, `--muted`).
- Tekst: `className="text-[10px] fill-current font-mono"` eller liknende. Ingen separat fill-attributt — la temaet styre.
- Avslutt med `<Caption>…</Caption>` (`figcaption`) — kort forklaring under figuren.
- Pile-markører defineres lokalt med `<defs><marker id="arr-xxx" …>`. Hold ID-en unik per figur så de ikke kolliderer.

Eksisterende figurer (`LinkedListSingly`, `BSTStructure`, `DFSWalk`, …) er gode startmaler — kopier strukturen, bytt innhold.

## Drag-oppgave-konvensjoner

Fire typer eksisterer: `match`, `order`, `quiz`, `fill`. Bruk det som passer:

- **quiz**: spørsmål med 3–4 svaralternativer, hver med `correct: true|false` og `rationale`.
- **order**: liste-items som skal sorteres. Brukes for algoritme-steg, prosedyrer.
- **match**: par av (left, right) — termer til definisjoner, algoritme til strategi.
- **fill**: drop tokens inn i SQL/HTML/kode-template. Mest brukt for SQL-kapitler.

ID-er følger formen `d-py<N>-<kind>-<kort-id>` (f.eks. `d-py24-quiz-bitwise-mod`). Unik på tvers av hele filen.

Hver oppgave bør ha `explanation` som dukker opp etter fasit — bruk det til å understreke konsept eller knytte til praksis.

## Sjekkliste før agenten leverer

- [ ] Kapittelet kompilerer (`bunx tsc --noEmit` viser ingen nye feil i de berørte filene).
- [ ] Topic-strengen er identisk i `pythonChapters.tsx` og i alle drag-oppgavene.
- [ ] Minst én figur — selv små temaer fortjener et visuelt forankringspunkt.
- [ ] 3 til 8 drag-oppgaver. Færre er for tynt; flere blir slitsomt å gå gjennom.
- [ ] All prosa, alle kodeeksempler, alle figurer og alle oppgaver er forfattet for denne appen — ingen klippet fra lærebok, kursnotater, slides, eller AI-svar som siterer slike kilder.
- [ ] Hvis vi refererer til Liang/lærebok: kort peker i prosa ("se Liang kap. 22.7 for ekstra graf-eksempel"), ikke utfyllende sitat.
- [ ] Bruk worktree-flyten i `CLAUDE.md` — *aldri* skriv direkte til main.

## Eksempler å lese for stil

- Kortere kapittel: kap. 22 (Lenkede lister) — 2 figurer, 2 kodeblokker, ~50 linjer i `pythonChapters.tsx`.
- Lengre kapittel: kap. 26 (Vektede grafer) — 3 figurer, 2 algoritmer side om side, sammenligningsboks.
- Drag-bredde: kap. 23-blokken i `dragExercises.ts` har quiz + order + match — bra mønster for nye kapitler.

## Hva agenten *ikke* skal gjøre

- Ikke lag en separat fil per kapittel — alt skal inn i de tre nevnte filene for å holde indeksen og søket konsistent.
- Ikke endre `findChapter` eller andre exports i `pythonChapters.tsx` — bare legg til en entry.
- Ikke importer eksterne ikon-pakker for figurer; inline SVG er regelen.
- Ikke skriv kommentarer i koden som forklarer hva koden gjør, med mindre det er noe ikke-åpenbart. Kapittel-prosaen tar den jobben.
