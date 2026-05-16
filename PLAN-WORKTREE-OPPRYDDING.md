# Plan: rydde alle worktrees inn til main uten å miste arbeid

**Snapshot tatt 2026-05-16.** `main` flytter seg mens jeg jobber (andre agenter er aktive), så verifiser tallene med `git worktree list` og `git status` per worktree før du følger noe steg.

**Oppdatering 2026-05-16, andre pre-flight:** Andre agenter har i mellomtiden merget `feat/py-id-diagrams`, `feat/vis-csma` og `feat/vis-arp` til main. `feat/vis-cmem` som var tom har plutselig 3 uncommittede filer — en agent har begynt å jobbe der. **Alle andre Claude-sesjoner må stoppes før denne planen utføres.** Gjenstående: katalog-forside, vis-cpu, vis-logreg, vis-cmem (nå aktiv), smart-tab, books-learning-tools (tom).

## Sammendrag — hva som faktisk finnes per worktree

| Branch | Ahead | Behind | Uncommittet | Konklusjon |
|---|---|---|---|---|
| `feat/smart-tab` | 1 | 347 | 0 | **Reelt arbeid i commit** (SqlEditor + PythonEditor smart-Tab). Filene er ikke rørt i main siden — trygg rebase. |
| `feat/vis-arp` | 0 | 14 | 3 | Ny `ArpVisualizer.tsx` + endret `ArpDetektivPage.tsx`. routeTree.gen.ts er støy. |
| `feat/vis-cpu` | 0 | 14 | 3 | Ny `CpuVisualizer.tsx` + endret `Trinn4CpuPage.tsx`. |
| `feat/vis-csma` | 0 | 14 | 3 | Ny `CsmaVisualizer.tsx` + endret `ApProgresjonPage.tsx`. |
| `feat/vis-logreg` | 0 | 14 | 2 | Ny `LogRegVisualizer.tsx` + endret `LogistiskRegresjonPage.tsx`. |
| `feat/py-id-diagrams` | 0 | 14 | 3 | Endret `PythonFigures.tsx` + `pythonChapters.tsx`. |
| `feat/katalog-forside` | 0 | 14 | 2 | Endret `stack.$slug.tsx` + ny `userSubjects.ts`. |
| `feat/vis-cmem` | 0 | ? | 0 | **Tom.** Slett uten merge. |
| `feat/books-learning-tools` | 0 | 67 | 0 | **Tom.** Slett uten merge. |

> Tidligere `feat/vis-backprop` (ny `BackpropVisualizer.tsx`) forsvant under datainnsamling — sannsynligvis merget av annen sesjon. **Sjekk om backprop-arbeidet faktisk er i main før noe slettes.**

## Generelt prinsipp

Hver worktree er isolert — vi mister ingenting så lenge vi committer før vi rører noe. Risikoen er at en agent (eller du) trykker en destruktiv kommando på en worktree som har uncommittet arbeid. Forsikringen er enkel:

1. **Commit alt uncommittet først.** Selv en throwaway WIP-commit. Det gjør alle senere operasjoner reversible via `git reflog`.
2. **Rebase på origin/main per worktree før merge.** Aldri merge en branch som er 14+ commits bak — det blåser opp diffen og inviterer feil-løsning.
3. **Én branch om gangen, hele kjeden i én sekvens** (commit → rebase → merge → push → slett). Ikke parallelliser opprydningen — det er nettopp det som har ødelagt repoet før.

## Per-worktree-prosedyre (mal)

```bash
WT=../sql-practice-hub-<navn>
BR=feat/<navn>

# 1. Inn i worktreet og se nøyaktig hva som ligger der.
cd "$WT"
git status
git diff --stat

# 2. Commit alt uncommittet — også routeTree.gen.ts (regenereres uansett).
#    Hvis filen ser ufullstendig/halvferdig ut, STOPP og spør brukeren.
git add -A
git commit -m "feat(<scope>): <kort beskrivelse av visualizer/endring>"

# 3. Hent siste main og rebase.
git fetch origin
git rebase origin/main
# Ved konflikt: les filen, behold begge sider for append-only-lister, regenerer
# routeTree.gen.ts (slett, kjør `bun run dev` kort, ctrl-C, commit).

# 4. Verifiser at det fortsatt bygger.
bun install   # bare hvis package.json/bun.lockb endret seg
bunx tsc --noEmit
# Hvis stack-komponent: kjør `bun run dev` og åpne ruten i nettleseren én gang.

# 5. Merge inn til main.
cd /Users/isak/sql-practice-hub
git fetch origin
git checkout main
git pull --ff-only origin main      # MÅ være fast-forward; ellers stopp
git merge --no-ff "$BR" -m "Merge $BR: <kort beskrivelse>"
git push origin main

# 6. Rydd.
git worktree remove "$WT"
git branch -d "$BR"
```

**Stopp og spør hvis:**
- `git pull --ff-only` feiler (main divergerer — en annen sesjon har pushet uventet)
- en uncommittet fil ser ufullstendig ut (åpne den, vurder om den faktisk implementerer noe brukbart)
- `bunx tsc --noEmit` produserer nye feil etter rebase
- en visualizer-rute ikke laster i nettleseren

## Spesielle filer — håndteringsregler

- **`src/routeTree.gen.ts`**: auto-generert (`/* eslint-disable */ // @ts-nocheck` øverst). Ved konflikt: slett filen, kjør `bun run dev` til TanStack Router regenererer den (få sekunder), ctrl-C, commit. Aldri merge denne manuelt — det er bortkastet og feilutsatt.
- **`src/lib/problems/data.ts` / `datasets.ts` / `flashcards.ts` / `dragExercises.ts`**: append-only. Ingen av de aktive worktreene rører disse i denne batchen — bra. Men hvis du oppdager at en gjør det, behold *begge* sett av tillegg ved konflikt og kjør `bun -e "import('./src/lib/problems/data.ts').then(m => console.log(m.PROBLEMS.length))"` etterpå for å verifisere telling.
- **`bun.lockb` / `package.json`**: bare `feat/smart-tab` har røring her (den er 347 commits bak — sannsynligvis støy som rebases bort). Ved konflikt: ta `origin/main`-versjonen og kjør `bun install` for å regenerere lockb.
- **`AUDIT-PLATTFORM.md`, `LÆREPLAN.md`, `PLAN-*.md`**: dukker opp i smart-tab's diff fordi branchen er gammel. Ved rebase forsvinner disse av seg selv. Hvis noen vises som konflikt, ta `origin/main`-versjonen (smart-tab eier ikke disse).

## Rekkefølge

Begynn med det enkleste, jobb deg opp til det vanskeligste. Det gir tidlig signal hvis verktøyet/rebase-flyten din selv har et problem.

1. **`feat/vis-cmem`** — tom. Slett: `git worktree remove ../sql-practice-hub-vis-cmem && git branch -d feat/vis-cmem`. Verifiser først at `git log feat/vis-cmem ^main` er tom.
2. **`feat/books-learning-tools`** — tom. Samme prosedyre. Den ligger under `.claude/worktrees/` — `git worktree remove .claude/worktrees/books-learning-tools`.
3. **`feat/vis-arp`** (commit + rebase + merge — kanonisk eksempel; ny isolert komponent + Page-tweak).
4. **`feat/vis-cpu`** (samme mønster).
5. **`feat/vis-csma`** (samme mønster).
6. **`feat/vis-logreg`** (samme mønster).
7. **`feat/py-id-diagrams`** (endrer eksisterende filer, ingen ny fil — litt mer review-vekt).
8. **`feat/katalog-forside`** (ny `userSubjects.ts` + ruten `stack.$slug.tsx` — kan røre routing-konfigurasjon, vurder ekstra røyk-test i nettleseren).
9. **`feat/smart-tab`** (1 commit, men 347 behind — rebasen er det mest sannsynlige stedet noe går skeivt). Filene den endret (`SqlEditor.tsx`, `PythonEditor.tsx`) er **ikke rørt i main siden 72c0e31**, så rebase skal bli ren — men forvent at smart-tabs gamle filer (`AUDIT-PLATTFORM.md`, planer osv.) ikke matcher dagens main. Ved rebase-konflikt på de filene: alltid ta `origin/main`-versjonen.

## Etter at alt er merget

1. `git worktree list` skal vise bare `/Users/isak/sql-practice-hub` (main).
2. `git branch` skal ikke ha noen `feat/*`-brancher igjen lokalt.
3. Slett alle `.claude/agents/*.md`-stubs som ikke lenger har en pågående branch — eller marker dem `Status: merget` hvis du vil ha en kort log.
4. Kjør `bun run dev` og klikk gjennom de nye visualizer-rutene én siste gang for å verifisere at de funker i et merget bilde.
5. Commit eventuell `src/routeTree.gen.ts`-regenerering som "chore: regenerate routeTree etter worktree-konsolidering".

## Hvis noe går galt — recovery

CLAUDE.md har allerede prosedyren for å hente tilbake innhold fra dangling git-blobs (`git fsck --lost-found`). Den fungerer fordi Claude Code rører git-internals nok til å etterlate orphaned blobs. Hvis du oppdager at en fil har blitt overskrevet under opprydningen, **stopp umiddelbart**, ikke gjør flere commits (det kan trimme blobsene), og bruk fsck-prosedyren før du fortsetter.
