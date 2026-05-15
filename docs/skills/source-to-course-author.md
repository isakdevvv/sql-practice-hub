---
name: source-to-course-author
description: Bruk når en agent skal gjøre bøker, PDF-er, pensumlister eller kapittelnotater om til originalt kursmateriale for SQL Practice Hub uten å kopiere tekst, kode, figurer eller oppgaver. Passer for arbeid med filer i Books/, nye læringskapitler, øvingssett, visuelle forklaringer og agentplaner for større kursløp.
---

# Source-To-Course Author

Denne skillen styrer arbeid der en kilde som en bok eller PDF brukes til å lage originalt kursmateriale. Den supplerer `docs/skills/chapter-author.md`, som beskriver den konkrete appstrukturen.

## Første Regel

Bruk kilder som fagkart, ikke som tekstbank.

- Ikke kopier prosa, kode, tabeller, figurer eller oppgaver.
- Ikke tett parafraser avsnitt.
- Ikke gjenskap bokfigurer med små kosmetiske endringer.
- Ikke behold kildens navn, tall, datasett eller scenario hvis de er særpregede.
- Skriv egen forklaring, egne eksempler, egne visualer og egne oppgaver.

## Standard Workflow

1. Les `CLAUDE.md`. Bruk egen git worktree, ikke main.
2. Les `docs/skills/chapter-author.md` for appens kapittelkonvensjoner.
3. Inspiser eksisterende innhold før du skriver:
   - `src/lib/learn/pythonChapters.tsx`
   - `src/components/learn/python-figures/PythonFigures.tsx`
   - `src/lib/learn/dragExercises.ts`
4. Lag et kort chapter brief:
   - målgruppe
   - forkunnskaper
   - læringsmål
   - nøkkelbegreper
   - hvilke oppgavetyper som trengs
5. Lag original disposisjon fra fagstoffet.
6. Velg egne scenarioer, tall og data.
7. Skriv kapitteltekst, figurer og oppgaver.
8. Kjør typecheck og topic/ID-sjekk.
9. Gjør copyright-pass før levering.

## Kildearbeid

Start med metadata og innholdsfortegnelse når det er nok. Les bare de delene du trenger for faglig orientering. Ikke trekk lange utdrag inn i arbeidsfilene.

Tillatt bruk:

- begrepsliste
- tema- og rekkefølgeoversikt
- generell algoritmekunnskap
- bibliografisk peker for videre lesing

Ikke tillatt bruk:

- bokas setninger
- bokas kodelistinger
- bokas oppgaver
- bokas figuroppsett
- bokas konkrete eksempeldata

## Leveransekrav

Et ferdig kapittel bør ha:

- 4-8 korte seksjoner
- minst ett originalt visual
- 1-3 kodeeksempler der det passer
- 3-8 oppgaver
- 5-8 huskepunkter
- tydelig sammenheng mellom teori og praksis

Oppgaver bør dekke flere former:

- `quiz` for begreper og fallgruver
- `match` for term -> definisjon
- `order` for algoritmesteg
- `fill` for små kode- eller tabellmønstre

## Visualer

Lag figurer fra konseptet, ikke fra kildens side.

- Bruk inline SVG for appkapitler.
- Bruk egne labels, noder, tall og datasett.
- Bruk eksisterende tokens: `--brand`, `--success`, `--warning`, `--muted`, `--destructive`.
- Gi figuren en kort caption.
- Sørg for unik marker-ID i SVG.

## QA

Før final:

- `bunx tsc --noEmit` er kjørt, eller forklar hvorfor ikke.
- Topic-streng i kapittel og oppgaver matcher eksakt.
- Oppgave-ID-er er unike.
- Ingen kildeformuleringer eller rekonstruerte figurer er igjen.
- Kapittelet kan forstås uten boka.
- Endringslisten nevner filer og formål.
