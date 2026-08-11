import { useState } from "react";
import {
  Play,
  RotateCcw,
  ChevronRight,
  Terminal,
  GraduationCap,
  FlaskConical,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initialState, runApt, type AptState, type KjoreResultat } from "@/lib/dte2505/pakkekilderEngine";
import { SystemPanel } from "./SystemPanel";

// ---------------------------------------------------------------------------
// Oppgavetype 2 — GUIDET SIMULERING.
//
// Null prestasjonskrav. Studenten trykker seg gjennom en ferdig kjede og ser
// tilstanden endre seg rute for rute. Hvert steg har en setning om HVA man skal
// se etter — det er forskjellen på en demo og en simulering man lærer av.
//
// «Lekegrind»-fanen er den samme motoren uten manus, for den som vil prøve selv
// (lær-først, så test-deg-selv).
// ---------------------------------------------------------------------------

interface Steg {
  cmd: string;
  /** Hva studenten skal legge merke til i panelet etter dette steget. */
  seEtter: string;
}

const MANUS: Steg[] = [
  {
    cmd: "cat /etc/apt/sources.list",
    seEtter:
      "Kildelista er ren tekst. To linjer, to arkiver — begge hos Ubuntu. Ingenting er installert fra noe annet sted ennå.",
  },
  {
    cmd: "sudo apt install obs-studio",
    seEtter:
      "«Unable to locate package». Indeksen er tom: apt har aldri hentet en pakkeliste, og apt leter aldri direkte på nettet.",
  },
  {
    cmd: "sudo apt update",
    seEtter:
      "Se indeksruta fylles. Det er dette update gjør — henter LISTA over hva som finnes. Ingenting er installert av den grunn.",
  },
  {
    cmd: "sudo apt install obs-studio",
    seEtter:
      "Nå går det. Men merk versjonen: 30.0.2, den Ubuntu tilbyr. Prosjektet selv er på 31.",
  },
  {
    cmd: "sudo add-apt-repository ppa:obsproject/obs-studio",
    seEtter:
      "To ruter endret seg samtidig: en ny kilde OG en ny nøkkel. add-apt-repository gjør begge jobbene. Indeksen er nå merket UTDATERT.",
  },
  {
    cmd: "sudo apt update",
    seEtter:
      "Indeksen er bygget på nytt. obs-studio peker nå på PPA-versjonen, fordi høyeste versjonsnummer vinner — uansett hvilket arkiv det kommer fra.",
  },
  {
    cmd: "sudo apt install obs-studio",
    seEtter:
      "Oppgradert til 31.0.1, og merkelappen på pakken har skiftet fra «standardarkiv» til «PPA». Systemet ditt henter nå programvare fra en fremmed.",
  },
  {
    cmd: 'echo "deb https://download.docker.com/linux/ubuntu noble stable" | sudo tee /etc/apt/sources.list.d/docker.list',
    seEtter:
      "Kilden er lagt til for hånd — men se: den står med rød advarsel, fordi ingen nøkkel i nøkkelringen passer til den.",
  },
  {
    cmd: "sudo apt update",
    seEtter:
      "NO_PUBKEY. apt hopper over hele arkivet. Innholdet finnes ikke for apt i det hele tatt — og feilen vil senere vise seg som «Unable to locate package», langt fra årsaken.",
  },
  {
    cmd: "sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc",
    seEtter: "Nøkkelen er inne. Advarselen på kilden forsvant.",
  },
  {
    cmd: "sudo apt update",
    seEtter: "Ingen feil denne gangen, og docker-ce dukker opp i indeksen.",
  },
  {
    cmd: "sudo dpkg -i ~/Nedlastinger/slack-desktop.deb",
    seEtter:
      "Her går det galt med vilje. Pakken er «iU» — pakket ut, men ikke satt opp. dpkg kjenner ingen arkiver og kan ikke hente det som mangler.",
  },
  {
    cmd: "sudo apt install -f",
    seEtter:
      "apt rydder opp: henter libappindicator3-1 fra arkivet og fullfører oppsettet. Det er hele arbeidsdelingen mellom dpkg og apt i to steg.",
  },
  {
    cmd: "sudo snap install code --classic",
    seEtter:
      "Ingen kilde, ingen nøkkel, ingen indeks ble rørt. Snap er et helt parallelt system som apt ikke vet om — og motsatt.",
  },
];

type Fane = "guidet" | "fri";

export function KildeSimulering() {
  const [fane, setFane] = useState<Fane>("guidet");

  // guidet
  const [steg, setSteg] = useState(0);
  const [gState, setGState] = useState<AptState>(initialState);
  const [gUt, setGUt] = useState<KjoreResultat | null>(null);

  // fri
  const [fState, setFState] = useState<AptState>(initialState);
  const [input, setInput] = useState("");
  const [logg, setLogg] = useState<KjoreResultat[]>([]);

  function nesteSteg() {
    if (steg >= MANUS.length) return;
    const r = runApt(gState, MANUS[steg].cmd);
    setGState(r.state);
    setGUt(r);
    setSteg((s) => s + 1);
  }

  function nullstillGuidet() {
    setSteg(0);
    setGState(initialState());
    setGUt(null);
  }

  function kjorFri(cmd?: string) {
    const linje = (cmd ?? input).trim();
    if (!linje) return;
    const r = runApt(fState, linje);
    setFState(r.state);
    setLogg((l) => [...l.slice(-14), r]);
    setInput("");
  }

  const forrigeSteg = steg > 0 ? MANUS[steg - 1] : null;
  const ferdig = steg >= MANUS.length;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Terminal className="h-4 w-4 text-brand" /> Kildene, live
        </div>
        <div role="tablist" aria-label="Modus" className="inline-flex rounded-lg border bg-muted/30 p-0.5">
          <button
            role="tab"
            aria-selected={fane === "guidet"}
            onClick={() => setFane("guidet")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
              fane === "guidet" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <GraduationCap className="h-3.5 w-3.5" /> Guidet gjennomgang
          </button>
          <button
            role="tab"
            aria-selected={fane === "fri"}
            onClick={() => setFane("fri")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
              fane === "fri" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FlaskConical className="h-3.5 w-3.5" /> Lekegrind
          </button>
        </div>
      </div>

      {fane === "guidet" ? (
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              Steg {Math.min(steg, MANUS.length)} av {MANUS.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={nullstillGuidet}
                className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
              >
                <RotateCcw className="h-3 w-3" /> Start på nytt
              </button>
              <button
                onClick={nesteSteg}
                disabled={ferdig}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium",
                  ferdig
                    ? "cursor-not-allowed border bg-muted text-muted-foreground"
                    : "bg-brand text-brand-foreground hover:bg-brand/90",
                )}
              >
                {ferdig ? "Ferdig" : steg === 0 ? "Start" : "Neste steg"} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${(Math.min(steg, MANUS.length) / MANUS.length) * 100}%` }}
            />
          </div>

          {!ferdig && (
            <div className="mt-3 rounded-lg border bg-muted/30 p-2.5 text-xs">
              <span className="text-muted-foreground">Neste kommando:</span>{" "}
              <code className="break-all font-mono">{MANUS[steg].cmd}</code>
            </div>
          )}

          {gUt && (
            <>
              <div className="mt-3 overflow-hidden rounded-lg border">
                <div className="flex items-center gap-1.5 border-b bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
                  <Terminal className="h-3 w-3" /> terminal
                </div>
                <div className="max-h-56 overflow-y-auto bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
                  <div className="break-all text-emerald-400">
                    <span className="text-zinc-500">student@linux:~$ </span>
                    {gUt.cmd}
                  </div>
                  {gUt.lines.map((l, i) => (
                    <div
                      key={i}
                      className={cn(
                        "whitespace-pre-wrap break-all",
                        l.trimStart().startsWith("(") && "text-zinc-400",
                        /^(E:|Err:|dpkg: error)/.test(l) && "text-rose-400",
                        /^W:/.test(l) && "text-amber-400",
                      )}
                    >
                      {l || " "}
                    </div>
                  ))}
                </div>
              </div>

              {forrigeSteg && (
                <div className="mt-2 rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm leading-relaxed">
                  <span className="font-semibold">Se etter:</span> {forrigeSteg.seEtter}
                </div>
              )}
            </>
          )}

          <div className="mt-3">
            <SystemPanel state={gState} />
          </div>

          {ferdig && (
            <div className="mt-3 rounded-lg border border-emerald-500/50 bg-emerald-500/5 p-3 text-sm leading-relaxed">
              Du har nå sett alle fire kildetypene i punkt 1.3: standardarkivet, et PPA (Personal
              Package Archive), et tredjepartsarkiv med egen nøkkel, en løs .deb-fil, og et helt
              parallelt pakkesystem. Bytt til lekegrinda og prøv å brekke det selv — det er
              billigere her enn på din egen maskin.
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-2 font-mono text-sm">
              <span className="text-brand">$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && kjorFri()}
                spellCheck={false}
                placeholder="prøv en kommando"
                aria-label="Kommando"
                className="w-full bg-transparent outline-none"
              />
            </div>
            <button
              onClick={() => kjorFri()}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm text-brand-foreground hover:bg-brand/90"
            >
              <Play className="h-3.5 w-3.5" /> Kjør
            </button>
            <button
              onClick={() => {
                setFState(initialState());
                setLogg([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nullstill
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "cat /etc/apt/sources.list",
              "ls /etc/apt/sources.list.d/",
              "sudo apt update",
              "apt policy obs-studio",
              "sudo add-apt-repository ppa:obsproject/obs-studio",
              "ls ~/Nedlastinger",
              "dpkg -l",
              "sudo apt-key add -",
            ].map((c) => (
              <button
                key={c}
                onClick={() => kjorFri(c)}
                className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 font-mono text-[11px] hover:bg-accent"
              >
                <CornerDownLeft className="h-2.5 w-2.5 text-brand" /> {c}
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
            {logg.length === 0 ? (
              <div className="text-zinc-500">
                Mock-system i nettleseren. Ingen ekte arkiver kontaktes, ingenting installeres på
                maskinen din.
              </div>
            ) : (
              logg.map((r, i) => (
                <div key={i} className={cn(i > 0 && "mt-2")}>
                  <div className="break-all text-emerald-400">
                    <span className="text-zinc-500">student@linux:~$ </span>
                    {r.cmd}
                  </div>
                  {r.lines.map((l, j) => (
                    <div
                      key={j}
                      className={cn(
                        "whitespace-pre-wrap break-all",
                        l.trimStart().startsWith("(") && "text-zinc-400",
                        /^(E:|Err:|dpkg: error|error:)/.test(l) && "text-rose-400",
                        /^W:|^Warning:/.test(l) && "text-amber-400",
                      )}
                    >
                      {l || " "}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="mt-3">
            <SystemPanel state={fState} />
          </div>
        </div>
      )}
    </div>
  );
}
