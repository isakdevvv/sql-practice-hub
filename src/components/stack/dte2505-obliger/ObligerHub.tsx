import { useState } from "react";
import { StackPageShell } from "@/components/stack/StackPageShell";

interface Step {
  prompt: string;
  expectedExact?: string;
  expectedAnyOf?: string[];
  hint?: string;
}

interface Oblig {
  id: string;
  title: string;
  intro: string;
  steps: Step[];
}

const OBLIGS: Oblig[] = [
  {
    id: "o1-install",
    title: "Oblig 1 — Installasjon og VM",
    intro:
      "Skjekk at du forstår oppsett av Linux i en virtuell maskin. Skriv det korrekte svaret i hver boks.",
    steps: [
      {
        prompt: "Hvilken hypervisor-type er VirtualBox?",
        expectedAnyOf: ["type 2", "type-2", "type2", "Type 2"],
        hint: "Type 1 kjører på bare metal; type 2 oppå et vanlig OS.",
      },
      {
        prompt: "Kommando for å sjekke Ubuntu-versjon fra terminalen (én linje):",
        expectedAnyOf: ["lsb_release -a", "lsb_release -d", "cat /etc/os-release"],
      },
      {
        prompt: "Hvilken fil holder hostname?",
        expectedExact: "/etc/hostname",
      },
      {
        prompt: "Etter installasjon ligger første vanlige bruker med UID:",
        expectedExact: "1000",
        hint: "0 = root. Daemon-brukere har lave UID-er under 1000.",
      },
    ],
  },
  {
    id: "o2-navigasjon",
    title: "Oblig 2 — Filsystem-navigasjon",
    intro: "Riktig kommando for å navigere og se rundt på en Linux-maskin.",
    steps: [
      {
        prompt: "Gå til hjemmekatalogen din (uten å bruke ~ eller $HOME):",
        expectedAnyOf: ["cd", "cd /home/isak", "cd /home/$USER"],
      },
      {
        prompt: "Vis filer inkludert skjulte:",
        expectedAnyOf: ["ls -a", "ls -la", "ls -al", "ls -A"],
      },
      {
        prompt: "Vis nåværende katalog (absolutt sti):",
        expectedExact: "pwd",
      },
      {
        prompt: "Søk etter alle .conf-filer under /etc:",
        expectedAnyOf: [
          "find /etc -name *.conf",
          "find /etc -name '*.conf'",
          'find /etc -name "*.conf"',
          "find /etc -type f -name '*.conf'",
        ],
      },
    ],
  },
  {
    id: "o3-pakker",
    title: "Oblig 3 — Pakkesystem (apt)",
    intro: "Sjekk at du behersker apt-pakkebehandling på Ubuntu/Debian.",
    steps: [
      {
        prompt: "Oppdater pakkelisten (ikke selve pakkene):",
        expectedAnyOf: ["sudo apt update", "apt update"],
      },
      {
        prompt: "Installer pakken htop:",
        expectedAnyOf: ["sudo apt install htop", "apt install htop", "sudo apt install -y htop"],
      },
      {
        prompt: "Søk i pakkelisten etter «nginx»:",
        expectedAnyOf: ["apt search nginx", "apt-cache search nginx"],
      },
      {
        prompt: "Fjern en pakke MED config-filene:",
        expectedAnyOf: ["sudo apt purge nginx", "apt purge nginx"],
        hint: "purge ≠ remove. remove beholder config, purge sletter også /etc-filer.",
      },
    ],
  },
  {
    id: "o4-rettigheter",
    title: "Oblig 4 — Rettigheter og brukere",
    intro: "Vis at du behersker chmod, chown, og bruker/gruppe-konsepter.",
    steps: [
      {
        prompt: "Gi eier+gruppe lese/skrive, andre bare lese — på fil notater.txt (oktal):",
        expectedExact: "chmod 664 notater.txt",
      },
      {
        prompt: "Endre eier av fil til isak og gruppe til dev:",
        expectedAnyOf: ["chown isak:dev fil", "sudo chown isak:dev fil"],
      },
      {
        prompt: "Hvilken fil holder bruker-info (UID, hjemmekatalog, shell)?",
        expectedExact: "/etc/passwd",
      },
      {
        prompt: "Hvilken fil holder hashede passord?",
        expectedExact: "/etc/shadow",
      },
      {
        prompt: "Forskjell mellom su og sudo — hva er hovedforskjellen i én linje?",
        expectedAnyOf: [
          "su bytter bruker, sudo kjører enkelt-kommando som en annen bruker",
          "su skifter bruker (helt), sudo kjører én kommando",
          "su gir shell som annen bruker, sudo kjører som annen bruker for én kommando",
        ],
        hint: "Det handler om scope: hel sesjon vs enkelt-kommando.",
      },
    ],
  },
  {
    id: "o5-bash",
    title: "Oblig 5 — Bash-skript",
    intro: "Skriv riktig bash-syntaks. Bash er små biter — én feil og det stopper.",
    steps: [
      {
        prompt: "Korrekt shebang-linje for bash (én linje, akkurat slik den skal stå):",
        expectedExact: "#!/bin/bash",
      },
      {
        prompt: "Sett variabel navn til Per (én linje, eksakt):",
        expectedExact: "navn=Per",
      },
      {
        prompt: "Skriv ut variabelen $navn (én linje):",
        expectedAnyOf: ['echo "$navn"', "echo $navn", "echo ${navn}", 'echo "${navn}"'],
      },
      {
        prompt: "Start linje av en if-test som sjekker at /etc/hosts finnes:",
        expectedAnyOf: ["if [ -f /etc/hosts ]", "if [ -f /etc/hosts ]; then", "if [[ -f /etc/hosts ]]"],
      },
      {
        prompt: "Hvilket spesielle variabel inneholder exit-koden av forrige kommando?",
        expectedExact: "$?",
      },
      {
        prompt: "Avslutt skriptet med exit-kode 0:",
        expectedExact: "exit 0",
      },
    ],
  },
];

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function checkStep(input: string, step: Step): boolean {
  const ans = normalize(input);
  if (step.expectedExact && normalize(step.expectedExact) === ans) return true;
  if (step.expectedAnyOf) {
    return step.expectedAnyOf.some((e) => normalize(e).toLowerCase() === ans.toLowerCase());
  }
  return false;
}

function ObligView({ oblig }: { oblig: Oblig }) {
  const [answers, setAnswers] = useState<string[]>(() => oblig.steps.map(() => ""));
  const [checked, setChecked] = useState<(boolean | null)[]>(() => oblig.steps.map(() => null));
  const [revealed, setRevealed] = useState<boolean[]>(() => oblig.steps.map(() => false));

  function update(i: number, v: string) {
    setAnswers((a) => a.map((x, idx) => (idx === i ? v : x)));
    setChecked((c) => c.map((x, idx) => (idx === i ? null : x)));
  }

  function check(i: number) {
    setChecked((c) => c.map((x, idx) => (idx === i ? checkStep(answers[i], oblig.steps[i]) : x)));
  }

  function reveal(i: number) {
    setRevealed((r) => r.map((x, idx) => (idx === i ? true : x)));
  }

  const correct = checked.filter((x) => x === true).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <header>
        <h3 className="font-semibold">{oblig.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{oblig.intro}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          Riktig: <span className="font-mono">{correct}/{oblig.steps.length}</span>
        </div>
      </header>
      <ol className="space-y-3 list-decimal pl-5">
        {oblig.steps.map((s, i) => {
          const c = checked[i];
          return (
            <li key={i} className="space-y-1.5">
              <div className="text-sm">{s.prompt}</div>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  value={answers[i]}
                  onChange={(e) => update(i, e.target.value)}
                  spellCheck={false}
                  className="font-mono text-xs flex-1 min-w-[16rem] bg-background border border-border rounded-md px-2 py-1.5"
                  placeholder="ditt svar..."
                />
                <button
                  onClick={() => check(i)}
                  className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-brand/40"
                >
                  Sjekk
                </button>
                {!revealed[i] && (
                  <button
                    onClick={() => reveal(i)}
                    className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-brand/40 text-muted-foreground"
                  >
                    Vis svar
                  </button>
                )}
                {c === true && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    Riktig
                  </span>
                )}
                {c === false && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300">
                    Nei
                  </span>
                )}
              </div>
              {s.hint && (
                <div className="text-[11px] text-muted-foreground italic">Hint: {s.hint}</div>
              )}
              {revealed[i] && (
                <div className="text-[11px] font-mono text-brand">
                  Fasit: {s.expectedExact ?? (s.expectedAnyOf ? s.expectedAnyOf[0] : "")}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ObligerHub() {
  const [active, setActive] = useState<string>(OBLIGS[0].id);
  const current = OBLIGS.find((o) => o.id === active)!;
  return (
    <StackPageShell title="DTE-2505 obliger" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Obligatoriske øvinger (mock)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Obligatoriske øvinger</h1>
          <p className="mt-3 text-muted-foreground">
            Speil-versjoner av UiTs obligatoriske innleveringer for DTE-2505. Steg-for-steg
            spørsmål med automatisk svar-sjekk. Bruk fritt før du gjør den ekte oblig-en på
            en VM.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2 mb-6">
          {OBLIGS.map((o) => (
            <button
              key={o.id}
              onClick={() => setActive(o.id)}
              className={`text-xs px-2.5 py-1 rounded-md border ${
                active === o.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:border-brand/40"
              }`}
            >
              {o.title.split("—")[0].trim()}
            </button>
          ))}
        </nav>

        <ObligView oblig={current} />
      </div>
    </StackPageShell>
  );
}
