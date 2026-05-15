# Books -> Original Course Material Roadmap

Dette dokumentet er en arbeidsplan for å gjøre PDF-ene i `Books/` om til originalt kursmateriale i appen. Det er ikke en plan for å kopiere bøker. Bøkene brukes som pensumkart: tema, rekkefølge og faglig dybde. All tekst, kode, figurer og oppgaver skal skrives fra bunnen av.

## Bøker I `Books/`

Lokale PDF-er observert:

- `s.pdf`: metadata viser *Code: The Hidden Language of Computer Hardware and Software* av Charles Petzold.
- `Operating Systems - Three Easy Pieces.pdf`: OSTEP, operativsystemer.
- `Martin-Kleppmann---Designing-Data-Intensive-Applications_-O'Reilly-Media-(2017).pdf`: distribuerte dataintensive systemer.
- `Artificial Intelligence - A Modern Approach (3rd Edition).pdf`: AIMA, klassisk AI.
- `Aurelien-Geron-Hands-On-Machine-Learning...2019.pdf`: praktisk maskinlaering.

## Overordnet Prioritering

1. Algoritmer/data structures fra Liang-løpet som allerede matcher `pythonChapters.tsx`.
2. Operativsystemer fra OSTEP for DTE-2505-stoff.
3. Nettverk/distribuerte systemer fra DDIA for DTE-2507/DTE-260x-lignende stoff.
4. Maskinlaering fra Geron for DTE-2501/DTE-2602.
5. AI fra AIMA etter at ML-basisen sitter.
6. Petzold/Code som bakgrunnsmodul for datamaskinforståelse, binærrepresentasjon, logiske porter og maskinvare.

## Kursmateriale-Mal Per Kapittel

Hvert kapittel bør ha:

- `chapter brief`: målgruppe, forkunnskaper, læringsmål, fagord, forventet tid.
- Teoridel i egne ord, med 4-8 tydelige seksjoner.
- Minst ett originalt visual.
- 1-3 korte kodeeksempler hvis temaet er programmerbart.
- 3-8 oppgaver: quiz, match, order, fill eller praktisk koding.
- "Huskepunkter" med 5-8 punkter.
- En liten "når bruker jeg dette?"-del.
- Eventuell referansepeker til bok for videre lesing, uten sitat.

## Trygg Kildebruk

Tillatt:

- Bruke innholdsfortegnelse og overskrifter som indikasjon på faglig rekkefølge.
- Notere begreper som må forklares.
- Lage egne eksempler for samme generelle konsept.
- Verifisere at algoritmer/metoder er faglig korrekte.
- Referere kort til boknavn/kapittel som videre lesing.

Ikke tillatt:

- Kopiere prosa, kode, tabeller, figurer eller oppgaver.
- Tett parafrasere avsnitt.
- Gjenskape bokfigurer med små kosmetiske endringer.
- Bruke samme byer, tall, datasett, klasseeksempler eller oppgavehistorie når det tydelig kommer fra boka.
- Lime inn lange utdrag i markdown-filer.

## Agent-Arbeidsflyt

1. Les repoets `CLAUDE.md` og bruk egen git worktree.
2. Inspiser eksisterende appstruktur:
   - `src/lib/learn/pythonChapters.tsx`
   - `src/components/learn/python-figures/PythonFigures.tsx`
   - `src/lib/learn/dragExercises.ts`
   - `docs/skills/chapter-author.md`
3. Lag et kort kapittelbrief før du skriver.
4. Skriv original disposisjon.
5. Lag originale scenarioer og tall.
6. Implementer tekst, figurer og oppgaver.
7. Kjør `bunx tsc --noEmit`.
8. Sjekk topic-strenger og unike ID-er.
9. Gjør copyright-pass: fjern alt som ligner kildeformuleringer eller kildefigurer.
10. Lever med endringsliste og verifikasjon.

## Anbefalt Agentoppdeling For Store Bøker

Bruk parallelle agenter til analyse, men begrens samtidig skriving:

- Explorer 1: lag kapittelkart og prioriteringsliste.
- Explorer 2: finn eksisterende appinnhold som overlapper.
- Explorer 3: foreslå visualer og interaktive øvinger.
- Worker 1: skriv kapitteltekst i `pythonChapters.tsx`.
- Worker 2: lag figurer i `PythonFigures.tsx`.
- Worker 3: lag oppgaver i `dragExercises.ts`.
- Integrator: resolve merges, kjør typecheck og sjekk progresjonsflyt.

Hvis flere workers må endre samme append-only fil, gi dem separate ID-prefikser og la integrator samle.

## Visual-Retningslinjer

For denne appen:

- Foretrekk inline SVG i `PythonFigures.tsx`.
- Bruk eksisterende design tokens: `--brand`, `--success`, `--warning`, `--muted`, `--destructive`.
- Bruk korte captions.
- Ikke kopier layouten til bokfigurer.
- Bruk egne navn, noder, tall og situasjoner.
- For algoritmer: visualiser invarianten eller steget som studenten skal forstå.

Forslag per bok:

- Petzold/Code: bits, brytere, AND/OR/NOT, addere, ASCII, minne som celler.
- OSTEP: prosess-state, scheduler queue, virtual memory page table, file-system inode.
- DDIA: replication lag, partitioning, log, index, transaction isolation timeline.
- Geron: train/test split, gradient descent, overfitting, confusion matrix, pipeline.
- AIMA: search frontier, minimax tree, Bayesian network, Markov decision process.

## QA-Sjekkliste

- Kapittel kan leses uten boka.
- Ingen tekst eller oppgaver er kopiert.
- Eksempler er originale og relevante.
- Topic matcher drag-oppgavene eksakt.
- Alle IDs er unike.
- Figurer bygger og bruker unike marker-ID-er.
- TypeScript kompilerer.
- Oppgaver har forklarende rationale/explanation.
- Det er nok praksis til at studenten kan starte fra null.
