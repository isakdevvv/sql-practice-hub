import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarClock, Hammer } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import {
  CANVAS_MODULER,
  dagerTil,
  formatFrist,
  totalPoeng,
  type Oblig as CanvasOblig,
} from "@/lib/dte2505/canvasModuler";

/**
 * Speil-versjoner av de obligatoriske innleveringene i DTE-2505.
 *
 * Nummereringen her var tidligere oppdiktet («1 Installasjon, 2 Filsystem-
 * navigasjon, 3 apt, 4 rettigheter, 5 bash») og hadde ingen frister. Den følger
 * nå Canvas: 1.1, 1.2, 2, 3, 4, 5 — se `src/lib/dte2505/canvasModuler.ts`, som er
 * eneste kilde til titler, poeng og frister. Innholdet fra den gamle versjonen er
 * beholdt, men flyttet til den obligen det faktisk hører hjemme under.
 */

interface Step {
  prompt: string;
  expectedExact?: string;
  expectedAnyOf?: string[];
  hint?: string;
}

interface ObligOving {
  /** Må matche `ovingId` i canvasModuler.ts. */
  id: string;
  intro: string;
  steps: Step[];
}

const OVINGER: ObligOving[] = [
  {
    id: "o1-1-installasjon",
    intro:
      "Modul 1b. Sjekk at du forstår oppsettet av Linux i en virtuell maskin — en datamaskin simulert i programvare oppå din vanlige maskin.",
    steps: [
      {
        prompt: "Hvilken hypervisor-type er VirtualBox? (En hypervisor er programvaren som kjører virtuelle maskiner.)",
        expectedAnyOf: ["type 2", "type-2", "type2", "Type 2"],
        hint: "Type 1 kjører rett på maskinvaren; type 2 kjører oppå et vanlig operativsystem.",
      },
      {
        prompt: "Kommando for å se hvilken Ubuntu-versjon du har, fra terminalen (én linje):",
        expectedAnyOf: ["lsb_release -a", "lsb_release -d", "cat /etc/os-release"],
      },
      {
        prompt: "Hvilken fil holder maskinnavnet (hostname)?",
        expectedExact: "/etc/hostname",
      },
      {
        prompt: "Etter installasjon får den første vanlige brukeren hvilket bruker-ID-nummer (UID)?",
        expectedExact: "1000",
        hint: "0 er root. Systembrukere ligger under 1000.",
      },
    ],
  },
  {
    id: "o1-2-programmer",
    intro:
      "Modul 1b. Pakkeverktøyet apt (Advanced Package Tool) — installere, oppdatere og fjerne programmer på Ubuntu og Debian.",
    steps: [
      {
        prompt: "Hent ned ny pakkeliste (uten å oppgradere noe):",
        expectedAnyOf: ["sudo apt update", "apt update"],
        hint: "update henter lista over hva som finnes. Det er ikke det samme som å oppgradere.",
      },
      {
        prompt: "Oppgrader alle installerte pakker til nyeste versjon:",
        expectedAnyOf: ["sudo apt upgrade", "apt upgrade", "sudo apt upgrade -y", "sudo apt full-upgrade"],
      },
      {
        prompt: "Installer pakken htop:",
        expectedAnyOf: ["sudo apt install htop", "apt install htop", "sudo apt install -y htop"],
      },
      {
        prompt: "Søk i pakkelista etter «nginx»:",
        expectedAnyOf: ["apt search nginx", "apt-cache search nginx"],
      },
      {
        prompt: "Fjern en pakke sammen med oppsettsfilene den la igjen:",
        expectedAnyOf: ["sudo apt purge nginx", "apt purge nginx"],
        hint: "purge er ikke det samme som remove. remove beholder oppsettet i /etc, purge sletter det også.",
      },
    ],
  },
  {
    id: "o2-kommandobasert",
    intro:
      "Modul 2. Hjelpesystemene: å finne svaret selv i stedet for å google. Den fulle modulen er under bygging — dette er bare svar-sjekken.",
    steps: [
      {
        prompt: "Vis manualsiden for kommandoen ls:",
        expectedAnyOf: ["man ls"],
      },
      {
        prompt: "Hvilket manualseksjonsnummer inneholder systemkall?",
        expectedExact: "2",
        hint: "Seksjon 1 er brukerkommandoer, 5 er filformater, 8 er administratorkommandoer.",
      },
      {
        prompt: "Søk i alle manualsidenes korte beskrivelser etter ordet «copy»:",
        expectedAnyOf: ["apropos copy", "man -k copy"],
      },
      {
        prompt: "Vis kun énlinjes-beskrivelsen av kommandoen cp:",
        expectedAnyOf: ["whatis cp", "man -f cp"],
      },
      {
        prompt: "Raskeste måte å se flaggene til de fleste kommandoer, uten å åpne manualen (bruk kommandoen tar som eksempel):",
        expectedAnyOf: ["tar --help", "tar -h"],
      },
    ],
  },
  {
    id: "o3-prosesser",
    intro:
      "Modul 3. Et program som kjører er en prosess. Her øver du på å finne dem, stoppe dem og styre hvor mye prosessortid de får.",
    steps: [
      {
        prompt: "Vis alle prosesser på maskinen, også andre brukeres, i det brede formatet:",
        expectedAnyOf: ["ps aux", "ps -aux", "ps -ef"],
      },
      {
        prompt: "Hvilket signal ber en prosess pent om å avslutte, og kan avvises av prosessen?",
        expectedAnyOf: ["SIGTERM", "sigterm", "15", "SIGTERM (15)"],
        hint: "Det er standardsignalet kill sender når du ikke oppgir noe.",
      },
      {
        prompt: "Hvilket signal kan en prosess IKKE avvise eller fange opp?",
        expectedAnyOf: ["SIGKILL", "sigkill", "9", "SIGKILL (9)"],
      },
      {
        prompt: "Drep prosessen med prosess-ID 4321 slik at den ikke får mulighet til å nekte:",
        expectedAnyOf: ["kill -9 4321", "kill -KILL 4321", "kill -s KILL 4321", "kill -SIGKILL 4321"],
      },
      {
        prompt: "Start programmet backup.sh med lavest mulig prioritet (høyest nice-verdi):",
        expectedAnyOf: ["nice -n 19 ./backup.sh", "nice -n 19 backup.sh", "nice -19 ./backup.sh"],
        hint: "nice-skalaen går fra -20 (høyest prioritet) til 19 (lavest).",
      },
      {
        prompt: "Send jobben som kjører i forgrunnen til bakgrunnen (to steg — skriv kommandoen for steg to):",
        expectedAnyOf: ["bg", "bg %1"],
        hint: "Steg én er Ctrl+Z, som stopper jobben midlertidig.",
      },
    ],
  },
  {
    id: "o4-skall-filsystem",
    intro:
      "Modul 4. Navigasjon i filsystemet, og skallets to kjernemekanismer: omdirigering av inn- og utdata, og rør mellom kommandoer.",
    steps: [
      {
        prompt: "Gå til hjemmekatalogen din (uten å bruke ~ eller $HOME):",
        expectedAnyOf: ["cd", "cd /home/isak", "cd /home/$USER"],
      },
      {
        prompt: "Vis filer, også de skjulte:",
        expectedAnyOf: ["ls -a", "ls -la", "ls -al", "ls -A"],
      },
      {
        prompt: "Vis hvilken katalog du står i, som full sti:",
        expectedExact: "pwd",
      },
      {
        prompt: "Finn alle filer som slutter på .conf under /etc:",
        expectedAnyOf: [
          "find /etc -name *.conf",
          "find /etc -name '*.conf'",
          'find /etc -name "*.conf"',
          "find /etc -type f -name '*.conf'",
        ],
      },
      {
        prompt: "Send utdata fra ls til fila liste.txt, slik at eksisterende innhold overskrives:",
        expectedAnyOf: ["ls > liste.txt"],
        hint: "Ett tegn overskriver, to tegn legger til på slutten.",
      },
      {
        prompt: "Legg utdata fra date til på slutten av logg.txt uten å slette det som står der:",
        expectedAnyOf: ["date >> logg.txt"],
      },
      {
        prompt: "Send utdata fra ps aux videre inn i grep for å lete etter «bash» (bruk rør):",
        expectedAnyOf: ["ps aux | grep bash", "ps -ef | grep bash", 'ps aux | grep "bash"'],
      },
      {
        prompt: "Kast feilmeldingene fra en kommando, men behold vanlig utdata (fyll inn etter kommandoen: find / -name x ___):",
        expectedAnyOf: ["2>/dev/null", "2> /dev/null"],
        hint: "Kanal 1 er vanlig utdata, kanal 2 er feilmeldinger.",
      },
    ],
  },
  {
    id: "o5-rettigheter-skallprogram",
    intro:
      "Modul 5. To temaer i én innlevering: hvem som får lov til hva, og hvordan du automatiserer med et skallskript.",
    steps: [
      {
        prompt: "Gi eier og gruppe lese- og skriverett, alle andre bare leserett, på fila notater.txt (som tall):",
        expectedExact: "chmod 664 notater.txt",
      },
      {
        prompt: "Samme rettigheter, men skrevet med bokstaver i stedet for tall:",
        expectedAnyOf: [
          "chmod ug=rw,o=r notater.txt",
          "chmod u=rw,g=rw,o=r notater.txt",
          "chmod u=rw,go=r notater.txt",
        ],
      },
      {
        prompt: "Endre eier til isak og gruppe til dev på fila «fil»:",
        expectedAnyOf: ["chown isak:dev fil", "sudo chown isak:dev fil"],
      },
      {
        prompt: "Hvilken fil holder brukerinformasjon — bruker-ID, hjemmekatalog og skall?",
        expectedExact: "/etc/passwd",
      },
      {
        prompt: "Hvilken fil holder de krypterte passordene?",
        expectedExact: "/etc/shadow",
      },
      {
        prompt: "Hva er hovedforskjellen på su og sudo, i én linje?",
        expectedAnyOf: [
          "su bytter bruker, sudo kjører enkelt-kommando som en annen bruker",
          "su skifter bruker (helt), sudo kjører én kommando",
          "su gir shell som annen bruker, sudo kjører som annen bruker for én kommando",
        ],
        hint: "Det handler om omfang: hele økta mot én enkelt kommando.",
      },
      {
        prompt: "Første linje i et bash-skript, som forteller hvilket program som skal kjøre det:",
        expectedExact: "#!/bin/bash",
      },
      {
        prompt: "Sett variabelen navn til Per (én linje, nøyaktig):",
        expectedExact: "navn=Per",
      },
      {
        prompt: "Skriv ut variabelen navn:",
        expectedAnyOf: ['echo "$navn"', "echo $navn", "echo ${navn}", 'echo "${navn}"'],
      },
      {
        prompt: "Start på en if-test som sjekker at /etc/hosts finnes som vanlig fil:",
        expectedAnyOf: ["if [ -f /etc/hosts ]", "if [ -f /etc/hosts ]; then", "if [[ -f /etc/hosts ]]"],
      },
      {
        prompt: "Hvilken spesialvariabel inneholder avslutningskoden til forrige kommando?",
        expectedExact: "$?",
      },
      {
        prompt: "Avslutt skriptet med avslutningskode 0 (som betyr «gikk bra»):",
        expectedExact: "exit 0",
      },
    ],
  },
];

/** Canvas-obligene i rekkefølge, koblet til øvingen som speiler dem. */
const OBLIGER: { oblig: CanvasOblig; modulId: string; oving: ObligOving }[] =
  CANVAS_MODULER.flatMap((modul) =>
    modul.obliger.map((oblig) => {
      const oving = OVINGER.find((o) => o.id === oblig.ovingId);
      return oving ? [{ oblig, modulId: modul.id, oving }] : [];
    }).flat(),
  );

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

function ObligView({
  oblig,
  modulId,
  oving,
}: {
  oblig: CanvasOblig;
  modulId: string;
  oving: ObligOving;
}) {
  const [answers, setAnswers] = useState<string[]>(() => oving.steps.map(() => ""));
  const [checked, setChecked] = useState<(boolean | null)[]>(() => oving.steps.map(() => null));
  const [revealed, setRevealed] = useState<boolean[]>(() => oving.steps.map(() => false));

  function update(i: number, v: string) {
    setAnswers((a) => a.map((x, idx) => (idx === i ? v : x)));
    setChecked((c) => c.map((x, idx) => (idx === i ? null : x)));
  }

  function check(i: number) {
    setChecked((c) => c.map((x, idx) => (idx === i ? checkStep(answers[i], oving.steps[i]) : x)));
  }

  function reveal(i: number) {
    setRevealed((r) => r.map((x, idx) => (idx === i ? true : x)));
  }

  const correct = checked.filter((x) => x === true).length;
  const dager = dagerTil(oblig.frist);
  const passert = dager < 0;

  return (
    <div id={oving.id} className="scroll-mt-24 rounded-xl border border-border bg-card p-5 space-y-4">
      <header>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="rounded-md bg-brand/10 text-brand border border-brand/30 px-2 py-0.5 text-[11px] font-semibold">
            Modul {modulId}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] ${
              passert
                ? "border-border bg-muted text-muted-foreground"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}
          >
            <CalendarClock className="h-3 w-3" />
            Frist {formatFrist(oblig.frist)} kl. 23:59
            {!passert && <span className="font-semibold">· {dager} dager igjen</span>}
          </span>
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {oblig.poeng} poeng
          </span>
        </div>
        <h3 className="font-semibold text-lg">
          Oblig {oblig.nummer} — {oblig.tittel}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{oving.intro}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          Riktig:{" "}
          <span className="font-mono">
            {correct}/{oving.steps.length}
          </span>
        </div>
      </header>
      <ol className="space-y-3 list-decimal pl-5">
        {oving.steps.map((s, i) => {
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
  const [active, setActive] = useState<string>(OBLIGER[0].oblig.nummer);
  const current = OBLIGER.find((o) => o.oblig.nummer === active)!;

  return (
    <StackPageShell title="DTE-2505 obliger" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Obligatoriske innleveringer — speil-versjoner
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Obligatoriske innleveringer</h1>
          <p className="mt-3 text-muted-foreground">
            Seks obligatoriske innleveringer, {totalPoeng()} poeng til sammen. Numre, titler, poeng og
            frister følger UiTs Canvas (verifisert 16.08.2026). Dette er øve-versjoner med
            automatisk svar-sjekk — den ekte innleveringen gjør du på din egen virtuelle
            maskin og leverer i Canvas.
          </p>
        </header>

        <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
          <Hammer className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[12px] text-muted-foreground leading-snug">
            Canvas oppgir at <strong className="text-foreground">oblig 1.3 ikke gis i år</strong>.
            Punktet — å installere programmer fra andre kilder enn standard-pakkelageret — er
            fortsatt pensum, men gir ingen innlevering. Derfor hopper nummereringen fra 1.2 til 2.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2 mb-6">
          {OBLIGER.map(({ oblig }) => {
            const dager = dagerTil(oblig.frist);
            return (
              <button
                key={oblig.nummer}
                onClick={() => setActive(oblig.nummer)}
                className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                  active === oblig.nummer
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border hover:border-brand/40"
                }`}
                title={`${oblig.tittel} — frist ${formatFrist(oblig.frist)}, ${oblig.poeng} poeng`}
              >
                Oblig {oblig.nummer}
                <span
                  className={`ml-1.5 ${active === oblig.nummer ? "opacity-80" : "text-muted-foreground"}`}
                >
                  {formatFrist(oblig.frist).slice(0, 5)}
                  {dager >= 0 ? "" : " ✓"}
                </span>
              </button>
            );
          })}
        </nav>

        <ObligView oblig={current.oblig} modulId={current.modulId} oving={current.oving} />

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte2505-moduler" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            Se hele modulplanen
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2505" }}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2505-huben
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}
