// Git-drill: scenarier hvor studenten skriver kommandoer i en simulert terminal.
//
// Hvert scenario kan ha:
// - `setup`: en sekvens av kommandoer som kjøres SKJULT før studenten tar over.
// - `check(repo)`: en funksjon som inspiserer repo-tilstanden og rapporterer om
//   målet er nådd (med hva som ev. mangler).
// - `solution`: kanoniske kommandolinjer som vises etter "Vis svar".
//
// `check` skal være tolerant: vi sjekker repo-STATE (commits, refs, filer), ikke
// nøyaktig hvilke kommandoer studenten skrev. Dermed kan flere riktige
// fremgangsmåter aksepteres (f.eks. `git add . && git commit -m ...` vs
// `git add fil1 fil2 && git commit -m ...`).

import { computeStatus, currentBranch, headTree, walkHistory, type Repo } from "./engine";

export type GitTopic =
  | "grunnleggende"
  | "historikk"
  | "brancher"
  | "merge"
  | "angre";

export interface CheckResult {
  ok: boolean;
  missing?: string;
}

export interface GitScenario {
  id: string;
  topic: GitTopic;
  level: 0 | 1 | 2 | 3 | 4;
  title: string;
  prompt: string;
  /** Markdown-aktig kontekst som vises over terminalen. */
  context?: string;
  /** Kjøres skjult før studenten begynner. */
  setup: string[];
  hint: string;
  /** Kanonisk løsning (linjer). Vises ved "Vis svar". */
  solution: string[];
  explanation?: string;
  check: (repo: Repo) => CheckResult;
}

export const GIT_TOPICS: { id: GitTopic; label: string }[] = [
  { id: "grunnleggende", label: "Init / add / commit" },
  { id: "historikk", label: "Status / log / diff" },
  { id: "brancher", label: "Brancher" },
  { id: "merge", label: "Merge" },
  { id: "angre", label: "Angre / reset / restore" },
];

/* --------------------------- Helper-checks --------------------------- */

function headHasFile(repo: Repo, path: string, content?: string): boolean {
  const tree = headTree(repo);
  if (!(path in tree)) return false;
  return content === undefined ? true : tree[path] === content;
}

function commitCountOnBranch(repo: Repo, branch: string): number {
  const start = repo.refs[branch];
  if (!start) return 0;
  return walkHistory(repo, start).length;
}

function lastCommitMessageMatches(repo: Repo, branch: string, re: RegExp): boolean {
  const start = repo.refs[branch];
  if (!start) return false;
  return re.test(repo.objects[start]?.message ?? "");
}

/* --------------------------- Scenarier --------------------------- */

export const GIT_SCENARIOS: GitScenario[] = [
  /* =========================================================
   * GRUNNLEGGENDE
   * ========================================================= */
  {
    id: "g-init",
    topic: "grunnleggende",
    level: 0,
    title: "Initialiser et nytt repo",
    prompt:
      "Du har en tom mappe og vil begynne å spore filer med git. Initialiser et nytt git-repo.",
    setup: [],
    hint: "Kommandoen er én av de aller første du lærer.",
    solution: ["git init"],
    explanation:
      "git init oppretter en .git-mappe med all repo-state. HEAD peker på den aktive grenen (main).",
    check: (repo) =>
      repo.initialized
        ? { ok: true }
        : { ok: false, missing: "Repo er ikke initialisert ennå." },
  },

  {
    id: "g-first-commit",
    topic: "grunnleggende",
    level: 0,
    title: "Lag første commit",
    prompt:
      "Filene README.md og app.py ligger ukommitert i workdir. Stage begge og commit med meldingen \"Første commit\".",
    setup: [
      "git init",
      'echo "# Mitt prosjekt" > README.md',
      'echo "print(\\"Hei\\")" > app.py',
    ],
    hint: "Du må stage (git add) før du committer. Du kan bruke `git add .` for å ta alt.",
    solution: ['git add .', 'git commit -m "Første commit"'],
    explanation:
      "git add flytter filer fra workdir til index (staging). git commit tar et øyeblikksbilde av indexen og lager en commit.",
    check: (repo) => {
      const branch = currentBranch(repo);
      if (!branch) return { ok: false, missing: "Ingen aktiv branch." };
      if (commitCountOnBranch(repo, branch) < 1)
        return { ok: false, missing: "Ingen commit enda." };
      if (!headHasFile(repo, "README.md"))
        return { ok: false, missing: "README.md er ikke med i siste commit." };
      if (!headHasFile(repo, "app.py"))
        return { ok: false, missing: "app.py er ikke med i siste commit." };
      return { ok: true };
    },
  },

  {
    id: "g-stage-some",
    topic: "grunnleggende",
    level: 1,
    title: "Stage kun ÉN av to filer",
    prompt:
      "Du har endret notes.txt og app.py, men vil bare committe app.py nå. Stage og commit app.py med meldingen \"Refaktorer app.py\".",
    setup: [
      "git init",
      'echo "v1" > app.py',
      'echo "v1" > notes.txt',
      "git add .",
      'git commit -m "Init"',
      'echo "v2 — refaktorert" > app.py',
      'echo "noen notater" >> notes.txt',
    ],
    hint: "git add tar pathspecs — gi konkret filnavn i stedet for `.`.",
    solution: ["git add app.py", 'git commit -m "Refaktorer app.py"'],
    explanation:
      "Selektiv staging er en av Gits styrker — du kan dele en arbeidsdag i flere logiske commits.",
    check: (repo) => {
      const branch = currentBranch(repo);
      if (!branch) return { ok: false, missing: "Ingen aktiv branch." };
      if (commitCountOnBranch(repo, branch) !== 2)
        return { ok: false, missing: "Forventer nøyaktig 2 commits totalt." };
      if (!headHasFile(repo, "app.py", "v2 — refaktorert"))
        return { ok: false, missing: "app.py er ikke oppdatert i siste commit." };
      // notes.txt skal IKKE være endret i siste commit
      const head = headTree(repo);
      if (head["notes.txt"] !== "v1")
        return {
          ok: false,
          missing: "notes.txt er endret i siste commit — den skulle bare gjelde app.py.",
        };
      // Workdir for notes.txt skal fortsatt være endret (ucommittet)
      if (repo.workdir["notes.txt"] === "v1")
        return {
          ok: false,
          missing: "Endringene i notes.txt skal fortsatt være ukommitert.",
        };
      return { ok: true };
    },
  },

  {
    id: "g-empty-msg",
    topic: "grunnleggende",
    level: 1,
    title: "Commit med beskrivende melding",
    prompt:
      "Filen index.html er staget. Commit den med meldingen \"Legg til forside\".",
    setup: [
      "git init",
      'echo "<h1>Hjem</h1>" > index.html',
      "git add index.html",
    ],
    hint: "git commit krever en melding via -m \"...\".",
    solution: ['git commit -m "Legg til forside"'],
    check: (repo) => {
      const branch = currentBranch(repo);
      if (!branch) return { ok: false, missing: "Ingen branch." };
      if (commitCountOnBranch(repo, branch) < 1)
        return { ok: false, missing: "Ingen commit." };
      if (!lastCommitMessageMatches(repo, branch, /forside/i))
        return {
          ok: false,
          missing: "Commit-meldingen bør nevne «forside».",
        };
      return { ok: true };
    },
  },

  /* =========================================================
   * HISTORIKK
   * ========================================================= */
  {
    id: "h-status",
    topic: "historikk",
    level: 0,
    title: "Sjekk tilstanden",
    prompt:
      "Du vil vite hvilke filer som er endret, staget og untracked. Vis statusen.",
    setup: [
      "git init",
      'echo "v1" > a.txt',
      "git add a.txt",
      'git commit -m "Init"',
      'echo "v2" > a.txt',
      'echo "ny" > b.txt',
    ],
    hint: "Hver utvikler kjører denne kommandoen mange ganger om dagen.",
    solution: ["git status"],
    explanation:
      "git status forteller deg hva som er klart for commit, hva som er endret men ikke staget, og hva som er helt usett.",
    check: (repo) => {
      // For dette scenariet er det nok at studenten kjørte status — vi sjekker
      // via repo-state at de IKKE har endret state utilsiktet.
      const s = computeStatus(repo);
      if (s.untracked.includes("b.txt") && s.unstaged.length > 0) return { ok: true };
      return { ok: false, missing: "Workdir-state ser feil ut — har du gjort noe annet enn å lese status?" };
    },
  },

  {
    id: "h-log-oneline",
    topic: "historikk",
    level: 1,
    title: "Vis historikken kompakt",
    prompt:
      "Vis commit-historikken i kompakt én-linjes format (én commit per linje).",
    setup: [
      "git init",
      'echo "a" > a.txt',
      "git add a.txt",
      'git commit -m "Add a"',
      'echo "b" > b.txt',
      "git add b.txt",
      'git commit -m "Add b"',
      'echo "c" > c.txt',
      "git add c.txt",
      'git commit -m "Add c"',
    ],
    hint: "log har et flagg som komprimerer hver commit til én linje.",
    solution: ["git log --oneline"],
    explanation:
      "git log --oneline gir [hash] [melding] per commit. Bra for raskt overblikk.",
    check: (repo) => {
      const branch = currentBranch(repo);
      if (!branch) return { ok: false, missing: "Ingen branch." };
      if (commitCountOnBranch(repo, branch) !== 3)
        return { ok: false, missing: "Historikken skal ha 3 commits." };
      return { ok: true };
    },
  },

  {
    id: "h-diff",
    topic: "historikk",
    level: 1,
    title: "Se hva du har endret",
    prompt:
      "Du har endret app.py, men ikke staget enda. Vis diffen mellom workdir og index.",
    setup: [
      "git init",
      'echo "print(1)" > app.py',
      "git add app.py",
      'git commit -m "v1"',
      'echo "print(2)" > app.py',
    ],
    hint: "git diff (uten argument) sammenligner workdir mot index.",
    solution: ["git diff"],
    check: (repo) => {
      // Repo-state skal være uendret etter ren diff
      if (repo.workdir["app.py"] === "print(2)" && repo.index["app.py"] === "print(1)")
        return { ok: true };
      return { ok: false, missing: "Workdir og index ser ut til å være feil — kjørte du diff?" };
    },
  },

  /* =========================================================
   * BRANCHER
   * ========================================================= */
  {
    id: "b-create",
    topic: "brancher",
    level: 1,
    title: "Opprett en feature-branch",
    prompt:
      "Du står på main med én commit. Opprett en ny branch som heter feature/login og bytt til den.",
    setup: [
      "git init",
      'echo "init" > README.md',
      "git add README.md",
      'git commit -m "Init"',
    ],
    hint: "Du kan kombinere opprette + bytte med ett flagg, eller bruke 2 kommandoer.",
    solution: ["git checkout -b feature/login"],
    explanation:
      "git checkout -b <navn> er en snarvei for `git branch <navn>` + `git checkout <navn>`. Moderne alternativ: `git switch -c <navn>`.",
    check: (repo) => {
      if (!("feature/login" in repo.refs))
        return { ok: false, missing: "Branch feature/login finnes ikke." };
      if (currentBranch(repo) !== "feature/login")
        return { ok: false, missing: "HEAD peker ikke på feature/login." };
      return { ok: true };
    },
  },

  {
    id: "b-switch",
    topic: "brancher",
    level: 1,
    title: "Bytt tilbake til main",
    prompt: "Du er på feature/api. Bytt tilbake til main.",
    setup: [
      "git init",
      'echo "x" > README.md',
      "git add README.md",
      'git commit -m "Init"',
      "git checkout -b feature/api",
    ],
    hint: "git switch <branch> eller git checkout <branch>.",
    solution: ["git switch main"],
    check: (repo) =>
      currentBranch(repo) === "main"
        ? { ok: true }
        : { ok: false, missing: "Du er ikke på main." },
  },

  {
    id: "b-commit-on-feature",
    topic: "brancher",
    level: 2,
    title: "Lag en commit på feature-branch",
    prompt:
      "Du er på main. Lag en branch som heter docs, bytt til den, opprett filen CHANGELOG.md med innholdet \"v0.1\" og commit den med meldingen \"Add changelog\".",
    setup: [
      "git init",
      'echo "init" > README.md',
      "git add README.md",
      'git commit -m "Init"',
    ],
    hint: "Kjør checkout -b for å lage branchen, så echo > fil, git add, git commit.",
    solution: [
      "git checkout -b docs",
      'echo "v0.1" > CHANGELOG.md',
      "git add CHANGELOG.md",
      'git commit -m "Add changelog"',
    ],
    check: (repo) => {
      if (!("docs" in repo.refs)) return { ok: false, missing: "Branchen docs mangler." };
      const docsHead = repo.refs["docs"];
      const tree = repo.objects[docsHead]?.tree ?? {};
      if (tree["CHANGELOG.md"] !== "v0.1")
        return { ok: false, missing: "CHANGELOG.md er ikke committet på docs med innholdet 'v0.1'." };
      // main skal IKKE ha CHANGELOG.md
      const main = repo.refs["main"];
      const mainTree = repo.objects[main]?.tree ?? {};
      if ("CHANGELOG.md" in mainTree)
        return { ok: false, missing: "main har CHANGELOG.md — den skal kun finnes på docs." };
      return { ok: true };
    },
  },

  {
    id: "b-list",
    topic: "brancher",
    level: 0,
    title: "Vis alle lokale brancher",
    prompt: "Hvilke brancher har du lokalt?",
    setup: [
      "git init",
      'echo "x" > a.txt',
      "git add a.txt",
      'git commit -m "Init"',
      "git branch dev",
      "git branch staging",
    ],
    hint: "Bare `git branch` uten argumenter lister.",
    solution: ["git branch"],
    check: (repo) => (Object.keys(repo.refs).length >= 3 ? { ok: true } : { ok: false }),
  },

  {
    id: "b-delete",
    topic: "brancher",
    level: 2,
    title: "Slett en utdatert branch",
    prompt:
      "Branchen old-experiment er allerede mergeholdt og kan slettes. Du står på main. Slett den.",
    setup: [
      "git init",
      'echo "x" > a.txt',
      "git add a.txt",
      'git commit -m "Init"',
      "git branch old-experiment",
    ],
    hint: "git branch -d <navn> sletter en mergeholdt branch.",
    solution: ["git branch -d old-experiment"],
    check: (repo) =>
      "old-experiment" in repo.refs
        ? { ok: false, missing: "old-experiment finnes fortsatt." }
        : { ok: true },
  },

  /* =========================================================
   * MERGE
   * ========================================================= */
  {
    id: "m-fast-forward",
    topic: "merge",
    level: 2,
    title: "Fast-forward merge",
    prompt:
      "Du er på main. Branchen feature/hello har én ny commit som main ikke har. Merge feature/hello inn i main.",
    setup: [
      "git init",
      'echo "v1" > app.py',
      "git add app.py",
      'git commit -m "Init"',
      "git checkout -b feature/hello",
      'echo "hello" > hello.txt',
      "git add hello.txt",
      'git commit -m "Add hello.txt"',
      "git checkout main",
    ],
    hint: "git merge <branch> — fordi main ikke har egne commits siden split, blir det fast-forward.",
    solution: ["git merge feature/hello"],
    explanation:
      "Fast-forward = main hadde ingen egne commits etter at feature/hello ble laget. Git flytter bare main-pekeren frem.",
    check: (repo) => {
      if (currentBranch(repo) !== "main") return { ok: false, missing: "Du må stå på main." };
      const main = repo.refs["main"];
      const feat = repo.refs["feature/hello"];
      if (main !== feat)
        return { ok: false, missing: "main peker ikke på samme commit som feature/hello." };
      return { ok: true };
    },
  },

  {
    id: "m-three-way",
    topic: "merge",
    level: 3,
    title: "3-veis merge (ingen konflikt)",
    prompt:
      "Både main og feature/auth har commits etter sin felles forfar. Merge feature/auth inn i main. Det skal IKKE bli konflikt fordi de rører ulike filer.",
    setup: [
      "git init",
      'echo "v1" > README.md',
      "git add README.md",
      'git commit -m "Init"',
      "git checkout -b feature/auth",
      'echo "auth-kode" > auth.py',
      "git add auth.py",
      'git commit -m "Add auth"',
      "git checkout main",
      'echo "v2" > README.md',
      "git add README.md",
      'git commit -m "Update README"',
    ],
    hint: "git merge feature/auth — fordi de har rørt ulike filer, ordner Git det automatisk.",
    solution: ["git merge feature/auth"],
    explanation:
      "Når begge greinene har commits etter felles forfar, lager git en merge-commit med to parents.",
    check: (repo) => {
      const main = repo.refs["main"];
      const commit = repo.objects[main];
      if (!commit) return { ok: false, missing: "Mangler main-commit." };
      if (commit.parents.length !== 2)
        return { ok: false, missing: "Siste commit på main har ikke 2 parents — er det en merge-commit?" };
      if (!("auth.py" in commit.tree))
        return { ok: false, missing: "auth.py er ikke med etter merge." };
      if (commit.tree["README.md"] !== "v2")
        return { ok: false, missing: "README.md har ikke main sin v2-tekst." };
      return { ok: true };
    },
  },

  /* =========================================================
   * ANGRE
   * ========================================================= */
  {
    id: "a-unstage",
    topic: "angre",
    level: 1,
    title: "Fjern fil fra staging",
    prompt:
      "Du staget hemmelig.env ved en feil. Filen skal IKKE være med i commit-en, men du vil beholde innholdet i workdir.",
    setup: [
      "git init",
      'echo "init" > README.md',
      "git add README.md",
      'git commit -m "Init"',
      'echo "API_KEY=abc123" > hemmelig.env',
      "git add hemmelig.env",
    ],
    hint: "git restore --staged <fil>  eller den gamle: git reset HEAD <fil>.",
    solution: ["git restore --staged hemmelig.env"],
    explanation:
      "--staged fjerner fra index men beholder workdir. Brukes når du skal angre en feil-add før commit.",
    check: (repo) => {
      if ("hemmelig.env" in repo.index)
        return { ok: false, missing: "hemmelig.env er fortsatt i index." };
      if (!("hemmelig.env" in repo.workdir))
        return { ok: false, missing: "hemmelig.env skulle ligge igjen i workdir." };
      return { ok: true };
    },
  },

  {
    id: "a-discard",
    topic: "angre",
    level: 2,
    title: "Forkast lokale endringer",
    prompt:
      "Du har rotet til app.py og vil tilbake til siste committet versjon. Forkast endringene.",
    setup: [
      "git init",
      'echo "print(\\"hei\\")" > app.py',
      "git add app.py",
      'git commit -m "v1"',
      'echo "rotete kode som ikke virker" > app.py',
    ],
    hint: "git restore <fil> — eller den gamle: git checkout -- <fil>.",
    solution: ["git restore app.py"],
    check: (repo) =>
      repo.workdir["app.py"] === 'print("hei")'
        ? { ok: true }
        : { ok: false, missing: "app.py i workdir er ikke tilbakestilt." },
  },

  {
    id: "a-reset-hard",
    topic: "angre",
    level: 3,
    title: "Kast siste commit (hard reset)",
    prompt:
      "Du committet \"WIP\" ved en feil og vil flytte branchen tilbake ett steg, og forkaste alle endringene helt. Filen tilbake.txt skal forsvinne fra både index, workdir og history.",
    setup: [
      "git init",
      'echo "v1" > app.py',
      "git add app.py",
      'git commit -m "Init"',
      'echo "uferdig" > tilbake.txt',
      "git add tilbake.txt",
      'git commit -m "WIP"',
    ],
    hint: "git reset --hard HEAD~1 flytter HEAD ett steg tilbake og blanker workdir+index.",
    solution: ["git reset --hard HEAD~1"],
    explanation:
      "--hard er destruktivt — endringene som ikke er pushet eller stashet, forsvinner. Bruk det forsiktig.",
    check: (repo) => {
      const branch = currentBranch(repo);
      if (!branch) return { ok: false, missing: "Ingen branch." };
      if (commitCountOnBranch(repo, branch) !== 1)
        return { ok: false, missing: "Forventer kun 1 commit igjen." };
      if ("tilbake.txt" in repo.workdir)
        return { ok: false, missing: "tilbake.txt ligger fortsatt i workdir." };
      return { ok: true };
    },
  },

  {
    id: "a-reset-soft",
    topic: "angre",
    level: 4,
    title: "Behold endringene, men angre commit-en (soft reset)",
    prompt:
      "Du committet for tidlig. Du vil angre selve commit-en, men BEHOLDE endringene staget slik at du kan justere meldingen og committe på nytt.",
    setup: [
      "git init",
      'echo "v1" > app.py',
      "git add app.py",
      'git commit -m "Init"',
      'echo "v2" > app.py',
      "git add app.py",
      'git commit -m "feil melding"',
    ],
    hint: "git reset --soft HEAD~1 flytter HEAD tilbake men rører verken index eller workdir.",
    solution: ["git reset --soft HEAD~1"],
    explanation:
      "--soft brukes ofte sammen med en ny `git commit -m \"...\"` for å erstatte siste commit-melding (uten å bruke --amend).",
    check: (repo) => {
      const branch = currentBranch(repo);
      if (!branch) return { ok: false, missing: "Ingen branch." };
      if (commitCountOnBranch(repo, branch) !== 1)
        return { ok: false, missing: "Branchen skulle ha 1 commit igjen." };
      if (repo.index["app.py"] !== "v2")
        return { ok: false, missing: "Endringene i app.py skal fortsatt være staget." };
      return { ok: true };
    },
  },

  {
    id: "a-revert-via-checkout",
    topic: "angre",
    level: 3,
    title: "Gå tilbake til en eldre commit (detached HEAD)",
    prompt:
      "Du vil se hvordan koden så ut i den første commit-en. Hoppe tilbake til den uten å flytte main-pekeren. Bruk `git log --oneline` for å finne hash-en, så `git checkout <hash>`.",
    setup: [
      "git init",
      'echo "v1" > app.py',
      "git add app.py",
      'git commit -m "Init"',
      'echo "v2" > app.py',
      "git add app.py",
      'git commit -m "Update"',
    ],
    hint: "Hashen finner du med `git log --oneline`. Studenter må kunne kopiere/skrive første 4–7 tegn av hash-en.",
    solution: ["git log --oneline", "git checkout <hash-til-init>"],
    explanation:
      "Detached HEAD betyr at HEAD peker direkte på en commit, ikke en branch. Du kan se på koden, men nye commits her «flyter» fritt.",
    check: (repo) => {
      if (repo.HEAD?.kind !== "detached")
        return { ok: false, missing: "HEAD er ikke detached." };
      const c = repo.objects[repo.HEAD.hash];
      if (!c) return { ok: false, missing: "Ugyldig HEAD-hash." };
      if (c.tree["app.py"] !== "v1")
        return { ok: false, missing: "Du står ikke på første commit (v1)." };
      return { ok: true };
    },
  },
];

/* --------------------------- Util til UI --------------------------- */

export function scenarioById(id: string): GitScenario | undefined {
  return GIT_SCENARIOS.find((s) => s.id === id);
}

export function topicLabel(id: GitTopic): string {
  return GIT_TOPICS.find((t) => t.id === id)?.label ?? id;
}

