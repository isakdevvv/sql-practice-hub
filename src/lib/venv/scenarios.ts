// Venv-drill: scenarier hvor studenten skriver venv/pip-kommandoer i en
// simulert terminal. Hvert scenario har:
// - `setup`: skjult kommando-sekvens som kjøres før studenten tar over.
// - `check(repo)`: inspiserer state, rapporterer om målet er nådd.
// - `solution`: kanoniske kommandoer (vises på "Vis svar").
// - `explanation`: hvorfor dette er viktig / hva det lærer.

import {
  activeEnv,
  canonicalPackageName,
  fileExists,
  parseRequirements,
  readFile,
  type VenvRepo,
} from "./engine";

export type VenvTopic =
  | "venv"
  | "pip"
  | "requirements"
  | "feilsoking";

export interface CheckResult {
  ok: boolean;
  missing?: string;
}

export interface VenvScenario {
  id: string;
  topic: VenvTopic;
  level: 0 | 1 | 2 | 3;
  title: string;
  prompt: string;
  context?: string;
  setup: string[];
  hint: string;
  solution: string[];
  explanation?: string;
  check: (repo: VenvRepo) => CheckResult;
}

export const VENV_TOPICS: { id: VenvTopic; label: string }[] = [
  { id: "venv", label: "Lag og aktiver venv" },
  { id: "pip", label: "pip install / list" },
  { id: "requirements", label: "requirements.txt" },
  { id: "feilsoking", label: "Feilsøking" },
];

export function topicLabel(t: VenvTopic): string {
  return VENV_TOPICS.find((x) => x.id === t)?.label ?? t;
}

/* --------------------------- Helpers --------------------------- */

function pkgInstalled(repo: VenvRepo, pkg: string): boolean {
  return canonicalPackageName(pkg) in activeEnv(repo).packages;
}

function venvHasPkg(repo: VenvRepo, venv: string, pkg: string): boolean {
  return repo.venvs[venv] ? canonicalPackageName(pkg) in repo.venvs[venv].packages : false;
}

/* --------------------------- Scenarier --------------------------- */

export const VENV_SCENARIOS: VenvScenario[] = [
  /* =========================================================
   * VENV — lag og aktiver
   * ========================================================= */
  {
    id: "v-create",
    topic: "venv",
    level: 0,
    title: "Lag et virtuelt miljø",
    prompt:
      "Du har en tom prosjektmappe og vil isolere Python-pakkene dine. Lag et virtuelt miljø som heter .venv.",
    setup: [],
    hint: "Bruk Pythons innebygde venv-modul: `python -m venv <navn>`.",
    solution: ["python -m venv .venv"],
    explanation:
      "Et virtuelt miljø er en mappe med egen python-binær og egen `site-packages`. Det betyr at `pip install` der ikke forurenser system-Python.",
    check: (repo) =>
      ".venv" in repo.venvs
        ? { ok: true }
        : { ok: false, missing: "Ingen venv kalt '.venv' eksisterer ennå." },
  },

  {
    id: "v-activate",
    topic: "venv",
    level: 0,
    title: "Aktiver et eksisterende venv",
    prompt:
      "Det finnes allerede et venv kalt .venv i mappa. Aktiver det så pakker du installerer havner der.",
    setup: ["python -m venv .venv"],
    hint: "Source-er activate-skriptet: `source .venv/bin/activate`. (Eller bare `. .venv/bin/activate`.)",
    solution: ["source .venv/bin/activate"],
    explanation:
      "Source-ing av activate-skriptet endrer PATH og setter VIRTUAL_ENV. Etterpå peker `python` og `pip` til venv-binærene i stedet for system.",
    check: (repo) =>
      repo.activatedVenv === ".venv"
        ? { ok: true }
        : { ok: false, missing: ".venv er ikke aktivt." },
  },

  {
    id: "v-deactivate",
    topic: "venv",
    level: 0,
    title: "Deaktiver det aktive venv",
    prompt:
      ".venv er aktivt. Forlat det så `python` igjen peker på system-Python.",
    setup: ["python -m venv .venv", "source .venv/bin/activate"],
    hint: "Kommandoen er én funksjon som ble lastet inn da du aktiverte.",
    solution: ["deactivate"],
    explanation:
      "`deactivate` reverserer det `source activate` gjorde — gjenoppretter original PATH og fjerner VIRTUAL_ENV.",
    check: (repo) =>
      repo.activatedVenv === null
        ? { ok: true }
        : { ok: false, missing: "Du står fortsatt i et venv." },
  },

  {
    id: "v-which",
    topic: "venv",
    level: 1,
    title: "Sjekk hvilken python som er aktiv",
    prompt:
      "Du vet ikke om du står i et venv. Finn ut hvilken python `python` peker på akkurat nå.",
    context:
      "Tips: hvis stien starter på `/usr/bin/` er du på system-python; starter den med `/proj/<venv>/bin/` er du i et venv.",
    setup: ["python -m venv mlproj", "source mlproj/bin/activate"],
    hint: "Et bash-builtin viser hvor en kommando ligger på PATH.",
    solution: ["which python"],
    explanation:
      "`which python` er den raskeste måten å bekrefte hvilket miljø som er aktivt. Sjekk dette FØRST når 'pip install funket men import feiler'.",
    // Trygg: vi kan ikke se hva studenten skrev, så vi godtar når de har kjørt
    // ANY kommando — målet er pedagogisk å bruke `which`. Vi sjekker bare at
    // venv fortsatt er aktivt (de skal ikke ha endret state).
    check: (repo) =>
      repo.activatedVenv === "mlproj"
        ? { ok: true }
        : { ok: false, missing: "Hold deg i mlproj — bare kjør `which python`." },
  },

  /* =========================================================
   * PIP — install / list / uninstall
   * ========================================================= */
  {
    id: "p-install",
    topic: "pip",
    level: 1,
    title: "Installer en pakke i et aktivt venv",
    prompt:
      "Du står i et aktivt venv. Installer numpy.",
    setup: ["python -m venv .venv", "source .venv/bin/activate"],
    hint: "Den helt vanlige pip-kommandoen.",
    solution: ["pip install numpy"],
    explanation:
      "Med venv aktivt installerer `pip install` til venv sin `site-packages` — ikke system-Python.",
    check: (repo) =>
      pkgInstalled(repo, "numpy") && repo.activatedVenv === ".venv"
        ? { ok: true }
        : { ok: false, missing: "numpy er ikke installert i det aktive venv." },
  },

  {
    id: "p-install-version",
    topic: "pip",
    level: 1,
    title: "Pin en spesifikk versjon",
    prompt:
      "Reproducerbarhet er viktig. Installer pandas i versjon 2.1.4 (ikke nyeste, akkurat 2.1.4).",
    setup: ["python -m venv .venv", "source .venv/bin/activate"],
    hint: "Bruk `==` for å pinne versjon: `pakke==versjon`.",
    solution: ["pip install pandas==2.1.4"],
    explanation:
      "Pinning av versjoner gir deterministiske bygg. Uten det får ulike teammedlemmer ulike numpy/pandas-versjoner og koden kan oppføre seg ulikt.",
    check: (repo) => {
      const env = activeEnv(repo);
      if (env.packages["pandas"] === "2.1.4") return { ok: true };
      if ("pandas" in env.packages)
        return { ok: false, missing: `pandas er installert, men feil versjon (${env.packages["pandas"]}).` };
      return { ok: false, missing: "pandas er ikke installert ennå." };
    },
  },

  {
    id: "p-list",
    topic: "pip",
    level: 1,
    title: "List installerte pakker",
    prompt:
      "Du har akkurat installert noen pakker. Vis hva som er installert i det aktive venv.",
    setup: [
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install numpy",
      "pip install requests",
    ],
    hint: "Subkommandoen heter det den gjør.",
    solution: ["pip list"],
    explanation:
      "`pip list` viser alt i aktivt miljø inkludert pip/setuptools selv. For en ren prosjekt-rapport, bruk `pip freeze` (utelater pip/setuptools).",
    check: (repo) =>
      pkgInstalled(repo, "numpy") && pkgInstalled(repo, "requests")
        ? { ok: true }
        : { ok: false, missing: "Pakkene må fortsatt være installert når du sjekker." },
  },

  {
    id: "p-uninstall",
    topic: "pip",
    level: 1,
    title: "Avinstaller en pakke",
    prompt:
      "requests er installert og du trenger den ikke lenger. Fjern den.",
    setup: [
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install requests",
    ],
    hint: "Motsatt av install. -y hopper over bekreftelses-prompten.",
    solution: ["pip uninstall -y requests"],
    explanation:
      "Bruk -y i scripts og CI så pip ikke venter på y/N-bekreftelse. I terminalen kan du droppe -y.",
    check: (repo) =>
      !pkgInstalled(repo, "requests")
        ? { ok: true }
        : { ok: false, missing: "requests er fortsatt installert." },
  },

  /* =========================================================
   * REQUIREMENTS.TXT
   * ========================================================= */
  {
    id: "r-freeze",
    topic: "requirements",
    level: 2,
    title: "Lag requirements.txt fra installerte pakker",
    prompt:
      "Du har installert noen pakker. Skriv ned hva som er installert til en requirements.txt-fil — så andre kan reprodusere miljøet ditt.",
    setup: [
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install numpy==1.26.4",
      "pip install requests==2.31.0",
    ],
    hint: "`pip freeze` printer pakker i requirements-format. Send til fil med `>`.",
    solution: ["pip freeze > requirements.txt"],
    explanation:
      "`pip freeze` skriver `name==version` for hver installerte pakke (utelater pip/setuptools). Redirect til requirements.txt så commit fila.",
    check: (repo) => {
      if (!fileExists(repo, "requirements.txt"))
        return { ok: false, missing: "requirements.txt er ikke laget ennå." };
      const content = readFile(repo, "requirements.txt") ?? "";
      const reqs = parseRequirements(content);
      const names = new Set(reqs.map((r) => r.name.toLowerCase()));
      if (!names.has("numpy") || !names.has("requests"))
        return { ok: false, missing: "Fila mangler numpy og/eller requests." };
      return { ok: true };
    },
  },

  {
    id: "r-install",
    topic: "requirements",
    level: 2,
    title: "Installer alt fra en requirements.txt",
    prompt:
      "Du har klonet et prosjekt med en requirements.txt. Du har allerede aktivert et tomt venv. Installer alle pakkene fila lister.",
    setup: [
      "python -m venv .venv",
      "source .venv/bin/activate",
      "echo 'flask==3.0.0' > requirements.txt",
      "echo 'requests==2.31.0' >> requirements.txt",
      "echo 'pytest==7.4.4' >> requirements.txt",
    ],
    hint: "`pip install` har en flagg for å lese fra fil.",
    solution: ["pip install -r requirements.txt"],
    explanation:
      "`-r` (eller `--requirement`) leser fila linje for linje og installerer hver pakke. Dette er den standard 'sett opp prosjektet'-kommandoen.",
    check: (repo) => {
      const missing: string[] = [];
      for (const p of ["flask", "requests", "pytest"]) {
        if (!pkgInstalled(repo, p)) missing.push(p);
      }
      return missing.length === 0
        ? { ok: true }
        : { ok: false, missing: `Mangler: ${missing.join(", ")}` };
    },
  },

  {
    id: "r-full-flow",
    topic: "requirements",
    level: 2,
    title: "Full setup-flyt: venv → install → freeze",
    prompt:
      "Du starter på et nytt prosjekt fra null. 1) lag venv `env`, 2) aktiver det, 3) installer scikit-learn, 4) skriv requirements.txt.",
    setup: [],
    hint: "Fire kommandoer på rad. scikit-learn er pakkenavnet (import er `sklearn`).",
    solution: [
      "python -m venv env",
      "source env/bin/activate",
      "pip install scikit-learn",
      "pip freeze > requirements.txt",
    ],
    explanation:
      "Dette er den klassiske 'new ML project'-oppstarten. Husk: pakkenavnet i pip er ofte forskjellig fra import-navnet (scikit-learn → sklearn).",
    check: (repo) => {
      if (!("env" in repo.venvs)) return { ok: false, missing: "venv 'env' er ikke laget." };
      if (repo.activatedVenv !== "env") return { ok: false, missing: "env er ikke aktivt." };
      if (!pkgInstalled(repo, "scikit-learn"))
        return { ok: false, missing: "scikit-learn er ikke installert." };
      if (!fileExists(repo, "requirements.txt"))
        return { ok: false, missing: "requirements.txt er ikke skrevet." };
      const reqs = parseRequirements(readFile(repo, "requirements.txt") ?? "");
      if (!reqs.find((r) => r.name === "scikit-learn"))
        return { ok: false, missing: "requirements.txt mangler scikit-learn." };
      return { ok: true };
    },
  },

  /* =========================================================
   * FEILSØKING
   * ========================================================= */
  {
    id: "f-no-venv-warning",
    topic: "feilsoking",
    level: 2,
    title: "Du installerte uten å aktivere — fiks det",
    prompt:
      "Du kjørte `pip install numpy` uten å aktivere noe venv først. Pakken havnet på system-python. Du har allerede laget .venv. Aktiver det og installer numpy DER i stedet.",
    setup: [
      "python -m venv .venv",
      "pip install numpy",
    ],
    hint: "To kommandoer: aktiver venv, så `pip install`.",
    solution: ["source .venv/bin/activate", "pip install numpy"],
    explanation:
      "Klassisk feil. Sjekk alltid med `which python` før du installerer. Pakker på system-python kan kollidere med distroens egne avhengigheter.",
    check: (repo) => {
      if (repo.activatedVenv !== ".venv")
        return { ok: false, missing: ".venv er ikke aktivt." };
      if (!venvHasPkg(repo, ".venv", "numpy"))
        return { ok: false, missing: "numpy er ikke i .venv ennå." };
      return { ok: true };
    },
  },

  {
    id: "f-module-not-found",
    topic: "feilsoking",
    level: 3,
    title: "ModuleNotFoundError — finn årsaken",
    prompt:
      "Du kjører `python script.py` og får ModuleNotFoundError for pandas. Det finnes to venv: data-env (har pandas) og web-env (har flask). Bytt til riktig venv og kjør scriptet på nytt.",
    context:
      "Tip: scriptet inneholder bare `import pandas; print('ok')`. Sjekk hvilket venv som er aktivt, sjekk hvor pandas faktisk er installert.",
    setup: [
      "python -m venv web-env",
      "source web-env/bin/activate",
      "pip install flask",
      "deactivate",
      "python -m venv data-env",
      "source data-env/bin/activate",
      "pip install pandas",
      "deactivate",
      "source web-env/bin/activate",
      "echo 'import pandas' > script.py",
      "echo 'print(\"ok\")' >> script.py",
    ],
    hint: "Du står i web-env (har flask, ikke pandas). Du må deaktivere og aktivere data-env.",
    solution: [
      "deactivate",
      "source data-env/bin/activate",
      "python script.py",
    ],
    explanation:
      "Vanlig 'jeg har jo installert det!'-fellen: pakken er installert, men i et ANNET venv enn det som er aktivt nå. `which python` og `pip list` er førstehjelp.",
    check: (repo) => {
      if (repo.activatedVenv !== "data-env")
        return { ok: false, missing: "data-env må være aktivt for at scriptet skal finne pandas." };
      // Sjekk at de faktisk kjørte scriptet — vi krever at lastRun er satt og ikke har ModuleNotFoundError
      if (!repo.lastRun) return { ok: false, missing: "Kjør `python script.py` for å bekrefte at det virker." };
      if (repo.lastRun.includes("ModuleNotFoundError"))
        return { ok: false, missing: "Scriptet feiler fortsatt — du står i feil venv." };
      return { ok: true };
    },
  },

  {
    id: "f-rebuild",
    topic: "feilsoking",
    level: 3,
    title: "Rebuild fra requirements.txt",
    prompt:
      "Venvet `.venv` er korrupt og pakkene er rotete. Slett hele .venv-mappa, lag en ny, aktiver den, og reinstaller alt fra requirements.txt.",
    setup: [
      "echo 'numpy==1.26.4' > requirements.txt",
      "echo 'requests==2.31.0' >> requirements.txt",
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install pillow",
      "pip install matplotlib",
    ],
    hint: "Fire steg: `rm -rf .venv`, lag ny, aktiver, `pip install -r ...`.",
    solution: [
      "rm -rf .venv",
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install -r requirements.txt",
    ],
    explanation:
      "Korrupte venv fikses sjelden — det er raskere å slette og rebuilde. Dette er kjernen i 'venv som disposable artefakt': requirements.txt er sannheten, venv er bare en byggemappe.",
    check: (repo) => {
      if (!(".venv" in repo.venvs))
        return { ok: false, missing: ".venv eksisterer ikke (du må lage det igjen etter rm)." };
      if (repo.activatedVenv !== ".venv")
        return { ok: false, missing: ".venv er ikke aktivt." };
      const env = activeEnv(repo);
      // Skal ha numpy + requests fra requirements, IKKE pillow eller matplotlib
      if (!("numpy" in env.packages) || !("requests" in env.packages))
        return { ok: false, missing: "numpy og requests må være reinstallert fra requirements.txt." };
      if ("pillow" in env.packages || "matplotlib" in env.packages)
        return {
          ok: false,
          missing: "Pillow/matplotlib henger fortsatt med — du slettet ikke det gamle .venv først.",
        };
      return { ok: true };
    },
  },

  {
    id: "f-pip-show",
    topic: "feilsoking",
    level: 3,
    title: "Sjekk hvor en pakke faktisk ligger",
    prompt:
      "Du lurer på om numpy ligger i venvet eller på system-python. Bruk pip-subkommandoen som viser pakke-metadata inkl. Location.",
    setup: [
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install numpy",
    ],
    hint: "Subkommandoen heter det den gjør med en pakke.",
    solution: ["pip show numpy"],
    explanation:
      "`pip show <pkg>` viser Name, Version og — viktigst — Location. Hvis Location er /usr/lib/... er den på system-python; hvis /proj/.venv/lib/... er den i venvet.",
    check: (repo) =>
      pkgInstalled(repo, "numpy") && repo.activatedVenv === ".venv"
        ? { ok: true }
        : { ok: false, missing: "Hold deg i .venv med numpy installert mens du sjekker." },
  },
];

export const VENV_SCENARIO_COUNT = VENV_SCENARIOS.length;
